import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CloudAuthenticationRequired,
  CloudRequestError,
  createCreatorCloudClient,
} from './creatorCloudClient';

const host = 'https://aoyrijspyygqoyeajxpf.supabase.co';
const userId = '5d552def-cd5e-49d1-89be-4e216a105280';
const workspaceId = '5989ecaa-6d72-4b88-b6fb-8052273c5b3a';
const sampleToken = [
  'eyJhbGciOiJIUzI1NiJ9',
  btoa(JSON.stringify({ role: 'authenticated', sub: userId, is_anonymous: false })),
  'dummy-unit-test-signature',
].join('.');

const opts = {
  url: host,
  publishableKey: 'sb_publishable_test_not_secret',
  getAccessToken: () => sampleToken,
};

test('cloud adapter refuses wrong host, insecure schemes, secrets', () => {
  for (const url of [
    'https://unrelated.supabase.co',
    'http://aoyrijspyygqoyeajxpf.supabase.co',
    'https://aoyrijspyygqoyeajxpf.supabase.co.evil.test',
  ]) {
    assert.throws(() => createCreatorCloudClient({ ...opts, url }), /dedicated/);
  }
  assert.throws(() => createCreatorCloudClient({
    ...opts, publishableKey: 'sb_secret_do_not_use',
  }), /publishable/);
});

test('missing, anonymous and service-role JWTs fail before fetch', async () => {
  let networkCalls = 0;
  const fakeFetch = async () => {
    networkCalls++;
    throw new Error('Network must never be invoked');
  };
  for (const token of [null, 'not-a-jwt', [
    'e30', btoa(JSON.stringify({ role: 'service_role', sub: userId })), 'sig',
  ].join('.'), [
    'e30', btoa(JSON.stringify({ role: 'authenticated', sub: userId, is_anonymous: true })), 'sig',
  ].join('.')]) {
    const client = createCreatorCloudClient({
      ...opts, getAccessToken: () => token, fetchImpl: fakeFetch as typeof fetch,
    });
    await assert.rejects(client.listWorkspaces(), CloudAuthenticationRequired);
  }
  assert.equal(networkCalls, 0);
});

test('listWorkspaces sends scoped JWT in header to the correct URL', async () => {
  const client = createCreatorCloudClient({
    ...opts,
    fetchImpl: async (input, init) => {
      assert.match(String(input), /^https:\/\/aoyrijspyygqoyeajxpf\.supabase\.co\/rest\/v1\/creator_workspaces\?/);
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers.apikey, opts.publishableKey);
      assert.equal(headers.Authorization, 'Bearer ' + sampleToken);
      assert.ok(!String(input).includes(sampleToken), 'Token must never appear in URL');
      return new Response(JSON.stringify([{ id: workspaceId, name: 'Mine' }]), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  const result = await client.listWorkspaces();
  assert.equal(result[0].id, workspaceId);
});

test('createWorkspace only calls authenticated owner-creation RPC', async () => {
  const client = createCreatorCloudClient({
    ...opts,
    fetchImpl: async (input, init) => {
      assert.equal(String(input), host + '/rest/v1/rpc/creator_create_workspace');
      assert.deepEqual(JSON.parse(String(init?.body)), {
        workspace_name: 'Personal Creator Space',
        workspace_timezone: 'Europe/Berlin',
      });
      return new Response(JSON.stringify(workspaceId), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  assert.equal(await client.createWorkspace('  Personal Creator Space  ', 'Europe/Berlin'), workspaceId);
  assert.throws(() => client.createWorkspace(' '), /between 2 and 100/);
});

test('content queries require valid workspace UUIDs and stay workspace scoped', async () => {
  let requests = 0;
  const client = createCreatorCloudClient({
    ...opts,
    fetchImpl: async (input) => {
      requests++;
      const url = String(input);
      assert.ok(url.includes('creator_content_items?select='));
      assert.ok(url.includes('workspace_id=eq.' + workspaceId));
      return new Response('[]', {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  assert.throws(() => client.listContentItems('not-a-workspace-id'), /Invalid workspace ID/);
  assert.equal(requests, 0);
  assert.deepEqual(await client.listContentItems(workspaceId), []);
  assert.equal(requests, 1);
});

test('content INSERT requires a server-confirmed returned row', async () => {
  const item = { id: userId, workspace_id: workspaceId, title: 'My idea' };
  const client = createCreatorCloudClient({
    ...opts,
    fetchImpl: async (input, init) => {
      assert.match(String(input), /\/creator_content_items\?select=/);
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers.Prefer, 'return=representation');
      assert.deepEqual(JSON.parse(String(init?.body)), {
        workspace_id: workspaceId, title: 'My idea',
      });
      return new Response(JSON.stringify([item]), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  assert.deepEqual(await client.createContentItem(workspaceId, ' My idea '), item);
});

test('cloud requests never disclose raw response bodies or JWTs in errors', async () => {
  const client = createCreatorCloudClient({
    ...opts,
    fetchImpl: async () => new Response(JSON.stringify({
      error: 'Sensitive SQL schema or customer text',
    }), { status: 403, headers: { 'Content-Type': 'application/json' } }),
  });
  await assert.rejects(client.listWorkspaces(), (error: unknown) => {
    assert.ok(error instanceof CloudRequestError);
    assert.equal(error.status, 403);
    assert.ok(!error.message.includes(sampleToken));
    assert.ok(!error.message.includes('Sensitive SQL'));
    return true;
  });
});

test('user JWT payloads containing non-ASCII metadata remain valid UTF-8', async () => {
  const claims = {
    role: 'authenticated',
    sub: userId,
    user_metadata: { display_name: 'München — 東京' },
  };
  const token = 'e30.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.test';
  const client = createCreatorCloudClient({
    ...opts,
    getAccessToken: () => token,
    fetchImpl: async () => new Response('[]', {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }),
  });
  assert.deepEqual(await client.listWorkspaces(), []);
});
