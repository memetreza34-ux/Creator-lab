import assert from 'node:assert/strict';
import test from 'node:test';
import { createCreatorAuth, CreatorAuthError, validateCreatorAuthSettings } from './creatorAuth';

const url = 'https://aoyrijspyygqoyeajxpf.supabase.co';
const publishableKey = 'sb_publishable_fake_unit_test_key';
const uid = '5d552def-cd5e-49d1-89be-4e216a105280';

function makeJwt(id = uid, role = 'authenticated') {
  return [
    'eyJhbGciOiJIUzI1NiJ9',
    Buffer.from(JSON.stringify({ sub: id, role, is_anonymous: false })).toString('base64url'),
    'unit-test-signature',
  ].join('.');
}
function fakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
    data,
  };
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function response(id = uid) {
  return { access_token: makeJwt(id), refresh_token: 'rotated-refresh',
    expires_in: 3600, user: { id, email: 'creator@example.test' } };
}

test('only the dedicated project and browser publishable keys can be used', () => {
  assert.equal(validateCreatorAuthSettings(url, publishableKey), url);
  for (const bad of ['https://other.supabase.co', 'http://aoyrijspyygqoyeajxpf.supabase.co',
    'https://aoyrijspyygqoyeajxpf.supabase.co.evil.test']) {
    assert.throws(() => validateCreatorAuthSettings(bad, publishableKey), CreatorAuthError);
  }
  assert.throws(() => validateCreatorAuthSettings(url, 'sb_secret_bad'), CreatorAuthError);
});

test('sign-in confirms user against Supabase and keeps tokens out of the URL', async () => {
  const storage = fakeStorage();
  const observed: string[] = [];
  const auth = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input, init) => {
      observed.push(String(input));
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers.apikey, publishableKey);
      if (String(input).includes('/auth/v1/user')) {
        assert.equal(headers.Authorization, 'Bearer ' + makeJwt());
        return json({ id: uid, email: 'creator@example.test' });
      }
      assert.equal(String(input), url + '/auth/v1/token?grant_type=password');
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: 'creator@example.test', password: 'a-password',
      });
      return json(response());
    }) as typeof fetch,
  });
  const identity = await auth.signIn('  creator@example.test ', 'a-password');
  assert.equal(identity.id, uid);
  assert.equal(await auth.getAccessToken(), makeJwt());
  assert.equal(observed.length, 2);
  assert.ok(observed.every((link) => !link.includes('a-password') && !link.includes(makeJwt())));
  assert.ok([...storage.data.keys()].every((key) => key.startsWith('creator-lab:cloud-auth:')));
});

test('restore verifies a stored tab session with Auth, not just decoded claims', async () => {
  const storage = fakeStorage();
  const make = (id: string) => createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => String(input).endsWith('/auth/v1/user')
      ? json({ id, email: 'creator@example.test' })
      : json(response())) as typeof fetch,
  });
  await make(uid).signIn('creator@example.test', 'test');
  const verified = await make(uid).restore();
  assert.equal(verified?.id, uid);
  const tampered = await make('2e224be8-0c4c-4a17-8934-48c84977dcc3').restore();
  assert.equal(tampered, null, 'different backend user must never restore a session');
  assert.equal(storage.data.size, 0);
});

test('refresh rotates expired credentials before returning the token', async () => {
  const storage = fakeStorage();
  let clock = 1000;
  let refreshes = 0;
  const auth = createCreatorAuth({ url, publishableKey, storage, now: () => clock,
    fetchImpl: (async (input) => {
      const path = String(input);
      if (path.includes('grant_type=refresh_token')) {
        refreshes++;
        return json({ ...response(), refresh_token: 'new-rotated-token' });
      }
      if (path.endsWith('/auth/v1/user')) return json({ id: uid, email: 'creator@example.test' });
      return json(response());
    }) as typeof fetch,
  });
  await auth.signIn('creator@example.test', 'pwd');
  clock = 4000000;
  assert.equal(await auth.getAccessToken(), makeJwt());
  assert.equal(refreshes, 1);
});

test('signup and recovery do not claim an account exists or sign in without a session', async () => {
  const storage = fakeStorage();
  const paths: string[] = [];
  const auth = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => {
      paths.push(String(input));
      if (String(input).includes('/auth/v1/signup')) return json({ user: { id: uid } });
      return json({});
    }) as typeof fetch,
  });
  assert.equal(await auth.signUp('creator@example.test', 'strong-password',
    'https://app.example/cloud'), 'confirmation-required');
  await auth.requestPasswordReset('creator@example.test', 'https://app.example/cloud');
  assert.equal(auth.identity(), null);
  assert.equal(paths.length, 2);
  assert.ok(paths[0].includes('/signup?redirect_to='));
  assert.ok(paths[1].includes('/recover?redirect_to='));
  assert.equal(storage.data.size, 0);
});

test('signing out is final even when a refresh returns later', async () => {
  const storage = fakeStorage();
  let releaseRefresh: ((response: Response) => void) | undefined;
  const auth = createCreatorAuth({ url, publishableKey, storage, now: () => 4000000,
    fetchImpl: (async (input) => {
      if (String(input).includes('grant_type=refresh_token')) {
        return new Promise<Response>((resolve) => { releaseRefresh = resolve; });
      }
      if (String(input).endsWith('/auth/v1/user')) {
        return json({ id: uid, email: 'creator@example.test' });
      }
      if (String(input).endsWith('/auth/v1/logout')) return json({});
      return json(response());
    }) as typeof fetch,
  });
  await auth.signIn('creator@example.test', 'test');
  // Simulate expiration after an initially successful login.
  const saved = JSON.parse([...storage.data.values()][0]);
  saved.expiresAt = 1000;
  storage.setItem([...storage.data.keys()][0], JSON.stringify(saved));
  await auth.signOut();
  assert.equal(auth.identity(), null);
  assert.equal(storage.data.size, 0);
  // A late network reply must not re-create the local session.
  assert.equal(await auth.getAccessToken(), null);
  assert.equal(releaseRefresh, undefined);
});

test('authentication errors never surface raw server secrets', async () => {
  const auth = createCreatorAuth({ url, publishableKey, storage: fakeStorage(),
    fetchImpl: (async () => json({ sensitive: 'private account metadata' }, 403)) as typeof fetch,
  });
  await assert.rejects(auth.signIn('x@example.test', 'bad'), (err: unknown) => {
    assert.ok(err instanceof CreatorAuthError);
    assert.ok(!err.message.includes('private account metadata'));
    assert.ok(!err.message.includes('x@example.test'));
    return true;
  });
});
