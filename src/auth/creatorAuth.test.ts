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
  let clock = 1000;
  const auth = createCreatorAuth({ url, publishableKey, storage, now: () => clock,
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
  clock = 4000000;
  const inFlight = auth.getAccessToken();
  for (let attempt = 0; attempt < 10 && !releaseRefresh; attempt++) await Promise.resolve();
  assert.ok(releaseRefresh, 'expired token must trigger a refresh');
  await auth.signOut();
  assert.equal(auth.identity(), null);
  releaseRefresh(json(response()));
  assert.equal(await inFlight, null);
  assert.equal(auth.identity(), null);
  assert.equal(storage.data.size, 0, 'late refresh must not re-create a signed-out session');
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

test('refresh cannot silently switch to a different user even with a verified-looking response', async () => {
  const otherId = 'ec1406ab-c6e9-4ae6-9882-9d29809855cb';
  let clock = 1000;
  const auth = createCreatorAuth({ url, publishableKey, storage: fakeStorage(),
    now: () => clock,
    fetchImpl: (async (input) => {
      if (String(input).includes('grant_type=refresh_token')) return json(response(otherId));
      if (String(input).endsWith('/auth/v1/user')) {
        return json({ id: uid, email: 'creator@example.test' });
      }
      return json(response());
    }) as typeof fetch,
  });
  await auth.signIn('creator@example.test', 'password');
  clock = 4000000;
  assert.equal(await auth.getAccessToken(), null);
  assert.equal(auth.identity(), null, 'foreign-user refresh must terminate the old session');
});

test('cached bearer is unavailable until Supabase verifies the restored session', async () => {
  const storage = fakeStorage();
  const seed = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => String(input).endsWith('/auth/v1/user')
      ? json({ id: uid, email: 'creator@example.test' }) : json(response())) as typeof fetch,
  });
  await seed.signIn('creator@example.test', 'password');

  let releaseVerification: ((result: Response) => void) | undefined;
  const auth = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => {
      assert.ok(String(input).endsWith('/auth/v1/user'));
      return new Promise<Response>((resolve) => { releaseVerification = resolve; });
    }) as typeof fetch,
  });
  const loading = auth.restore();
  assert.ok(releaseVerification, 'restoration must first ask Supabase Auth');
  assert.equal(auth.identity(), null, 'unverified storage must not count as sign-in');
  assert.equal(await auth.getAccessToken(), null, 'no bearer before verification');
  releaseVerification(json({ id: uid, email: 'creator@example.test' }));
  assert.equal((await loading)?.id, uid);
  assert.equal(await auth.getAccessToken(), makeJwt());
});

test('old pending restore cannot resurrect a session after logout', async () => {
  const storage = fakeStorage();
  const seed = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => String(input).endsWith('/auth/v1/user')
      ? json({ id: uid, email: 'creator@example.test' }) : json(response())) as typeof fetch,
  });
  await seed.signIn('creator@example.test', 'password');

  let finishOldRequest: ((value: Response) => void) | undefined;
  const auth = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async () => new Promise<Response>((resolve) => { finishOldRequest = resolve; })) as typeof fetch,
  });
  const pending = auth.restore();
  assert.ok(finishOldRequest);
  await auth.signOut();
  finishOldRequest(json({ id: uid, email: 'creator@example.test' }));
  assert.equal(await pending, null);
  assert.equal(auth.identity(), null);
  assert.equal(await auth.getAccessToken(), null);
  assert.equal(storage.data.size, 0, 'logout cleared the original tab session');
});

test('pending old restore cannot overwrite a later fresh login', async () => {
  const otherId = 'ca8f5bcd-d3ad-4f1b-9466-87a7a1991d3a';
  const storage = fakeStorage();
  const seed = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input) => String(input).endsWith('/auth/v1/user')
      ? json({ id: uid, email: 'creator@example.test' }) : json(response())) as typeof fetch,
  });
  await seed.signIn('creator@example.test', 'password');

  let finishOldRequest: ((value: Response) => void) | undefined;
  const auth = createCreatorAuth({ url, publishableKey, storage,
    fetchImpl: (async (input, init) => {
      const target = String(input);
      if (target.includes('grant_type=password')) return json(response(otherId));
      if (target.endsWith('/auth/v1/user')) {
        const token = (init?.headers as Record<string, string>)?.Authorization;
        if (token === 'Bearer ' + makeJwt(otherId)) {
          return json({ id: otherId, email: 'another@example.test' });
        }
        return new Promise<Response>((resolve) => { finishOldRequest = resolve; });
      }
      return json({});
    }) as typeof fetch,
  });
  const stale = auth.restore();
  assert.ok(finishOldRequest);
  const fresh = await auth.signIn('another@example.test', 'new-password');
  assert.equal(fresh.id, otherId);
  finishOldRequest(json({ id: uid, email: 'creator@example.test' }));
  assert.equal(await stale, null);
  assert.equal(auth.identity()?.id, otherId, 'new verified login survives stale restore');
  assert.equal(await auth.getAccessToken(), makeJwt(otherId));
});
