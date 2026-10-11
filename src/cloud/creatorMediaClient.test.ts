import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLOUD_MEDIA_MIME, CloudMediaReconciliationRequired,
  createCreatorMediaClient, isSupportedMediaAsset, prepareMediaUpload,
  type CloudMediaAsset,
} from './creatorMediaClient';
import { CloudAuthenticationRequired } from './creatorCloudClient';

const project = 'https://aoyrijspyygqoyeajxpf.supabase.co';
const wid = '5989ecaa-6d72-4b88-b6fb-8052273c5b3a';
const aid = '5d552def-cd5e-49d1-89be-4e216a105280';
const token = ['e30', Buffer.from(JSON.stringify({
  role: 'authenticated', sub: aid, is_anonymous: false,
})).toString('base64url'), 'test-signature'].join('.');
const options = {
  url: project,
  publishableKey: 'sb_publishable_unit_test_only',
  getAccessToken: () => token,
};
const png = Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0,0,0,0,0]);
const file = () => new File([png], 'My-image.png', { type: 'image/png' });
const asset = (): CloudMediaAsset => ({
  id: aid, workspace_id: wid, folder_id: null,
  object_path: wid + '/' + aid + '/My-image.png',
  file_name: 'My-image.png', mime_type: 'image/png', size_bytes: 16,
  created_at: '2026-10-11T08:00:00Z',
});
function json(input: unknown, status = 200): Response {
  return new Response(JSON.stringify(input), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

test('project and publishable key hard fail before any media operation', () => {
  assert.throws(() => createCreatorMediaClient({
    ...options, url: 'https://other.supabase.co',
  }), /dedicated Creator Lab/);
  assert.throws(() => createCreatorMediaClient({
    ...options, publishableKey: 'sb_secret_bad',
  }), /browser-safe/);
});

test('prepared upload is path-safe, MIME-aligned and within standard limit', async () => {
  const prepared = await prepareMediaUpload(file(), wid);
  assert.equal(prepared.mimeType, 'image/png');
  assert.equal(prepared.size, 16);
  assert.match(prepared.mediaId, /^[\da-f-]{36}$/);
  assert.match(prepared.path, new RegExp('^' + wid + '/' + prepared.mediaId + '/My-image.png$'));
  assert.equal(Object.keys(CLOUD_MEDIA_MIME).length, 6);
  await assert.rejects(prepareMediaUpload(file(), 'other-workspace'), /Invalid workspace ID/);
  await assert.rejects(prepareMediaUpload(
    new File([png], 'asset.jpg', { type: 'image/png' }), wid), /extension and content type/);
  await assert.rejects(prepareMediaUpload(
    new File([Uint8Array.from([1,2,3])], 'fake.png', { type: 'image/png' }), wid), /contents do not match/);
  await assert.rejects(prepareMediaUpload(
    new File([png], 'run.svg', { type: 'image/svg+xml' }), wid), /Only JPG/);
  await assert.rejects(prepareMediaUpload(
    new File([], 'empty.png', { type: 'image/png' }), wid), /Choose a file/);
  await assert.rejects(prepareMediaUpload(
    new File([new Uint8Array(6 * 1024 * 1024 + 1)], 'huge.png',
      { type: 'image/png' }), wid), /Choose a file/);
});

test('auth guard rejects missing token and service-role JWT before network', async () => {
  let count = 0;
  const badJwt = ['e30', Buffer.from(JSON.stringify({
    role: 'service_role', sub: aid,
  })).toString('base64url'), 'fake'].join('.');
  for (const value of [null, 'invalid', badJwt]) {
    const media = createCreatorMediaClient({
      ...options, getAccessToken: () => value,
      fetchImpl: async () => { count++; return json([]); },
    });
    await assert.rejects(media.listMedia(wid), CloudAuthenticationRequired);
  }
  assert.equal(count, 0);
});

test('media GET is workspace-filtered; foreign returned rows are not trusted', async () => {
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      assert.equal(init?.method, 'GET');
      assert.match(String(url), /\/rest\/v1\/creator_media_assets\?select=\*/);
      assert.ok(String(url).includes('workspace_id=eq.' + wid));
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer ' + token);
      return json([asset()]);
    },
  });
  assert.equal((await media.listMedia(wid))[0].object_path, asset().object_path);
  const badMedia = createCreatorMediaClient({
    ...options,
    fetchImpl: async () => json([{ ...asset(), workspace_id: aid }]),
  });
  await assert.rejects(badMedia.listMedia(wid), CloudMediaReconciliationRequired);
});

test('upload is Storage POST then one metadata INSERT, no service-role and no public link', async () => {
  const paths: string[] = [];
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      const endpoint = new URL(String(url));
      paths.push(endpoint.pathname);
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer ' + token);
      assert.equal((init?.headers as Record<string, string>).apikey, options.publishableKey);
      if (endpoint.pathname.startsWith('/storage/v1/object/creator-media/')) {
        assert.equal(init?.method, 'POST');
        assert.equal((init?.headers as Record<string, string>)['x-upsert'], 'false');
        assert.equal((init?.headers as Record<string, string>)['Content-Type'], 'image/png');
        assert.ok(init?.body instanceof File);
        return json({ Key: endpoint.pathname.slice('/storage/v1/object/'.length) });
      }
      assert.equal(endpoint.pathname, '/rest/v1/creator_media_assets');
      assert.equal(init?.method, 'POST');
      assert.equal((init?.headers as Record<string, string>).Prefer, 'return=representation');
      const value = JSON.parse(String(init?.body));
      assert.equal(value.workspace_id, wid);
      assert.equal(value.mime_type, 'image/png');
      assert.equal(value.size_bytes, 16);
      assert.match(value.object_path, new RegExp('^' + wid + '/[\\da-f-]{36}/'));
      return json([{ ...value, created_at: '2026-10-11T08:00:00Z', folder_id: null }], 201);
    },
  });
  const saved = await media.uploadMedia(wid, file());
  assert.equal(saved.workspace_id, wid);
  assert.equal(paths.length, 2);
  assert.ok(paths.every((p) => !p.includes(token) && !p.includes('public')));
});

test('failed metadata insert triggers readback and compensating Storage deletion', async () => {
  let uploaded = '';
  const operations: string[] = [];
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      const parsed = new URL(String(url));
      operations.push(String(init?.method) + ' ' + parsed.pathname);
      if (parsed.pathname.startsWith('/storage/v1/object/creator-media/')) {
        uploaded = decodeURIComponent(parsed.pathname.slice('/storage/v1/object/creator-media/'.length));
        return json({ Key: uploaded });
      }
      if (parsed.pathname === '/rest/v1/creator_media_assets' && init?.method === 'POST') {
        return json({ error: 'RLS rejection' }, 403);
      }
      if (parsed.pathname === '/rest/v1/creator_media_assets' && init?.method === 'GET') {
        return json([]);
      }
      assert.equal(parsed.pathname, '/storage/v1/object/creator-media');
      assert.equal(init?.method, 'DELETE');
      assert.deepEqual(JSON.parse(String(init?.body)), { prefixes: [uploaded] });
      return json([{ name: uploaded }]);
    },
  });
  await assert.rejects(media.uploadMedia(wid, file()), /temporary file was cleaned up/);
  assert.equal(operations.length, 4);
});

test('ambiguous metadata write accepts only confirmed matching readback', async () => {
  let row: CloudMediaAsset | null = null;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      const address = new URL(String(url));
      if (address.pathname.startsWith('/storage/v1/object/creator-media/')) return json({ Key: 'OK' });
      if (init?.method === 'POST') {
        const posted = JSON.parse(String(init?.body));
        row = { ...asset(), ...posted };
        throw new Error('Simulated response lost after server committed');
      }
      assert.equal(init?.method, 'GET');
      return json([row]);
    },
  });
  const saved = await media.uploadMedia(wid, file());
  assert.ok(saved.object_path.startsWith(wid + '/'));
  assert.equal(saved.id.length, 36);
});

test('unknown upload/storage reconciliation does not silently claim success', async () => {
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (_url, init) => {
      if (init?.method === 'POST' && String(_url).includes('/storage/v1/')) return json({ Key: 'OK' });
      if (init?.method === 'POST') return json({ error: 'invalid' }, 400);
      if (init?.method === 'GET') return json([]);
      return json([], 200); // not a verified removal
    },
  });
  await assert.rejects(media.uploadMedia(wid, file()), CloudMediaReconciliationRequired);
});

test('private preview authenticates GET and refuses public/foreign path', async () => {
  let requests = 0;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      requests++;
      assert.equal(String(url),
        project + '/storage/v1/object/authenticated/creator-media/' + asset().object_path);
      assert.equal(init?.method, 'GET');
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer ' + token);
      return new Response(new Blob([png], { type: 'image/png' }), {
        status: 200, headers: { 'Content-Type': 'image/png' },
      });
    },
  });
  const blob = await media.loadPrivateBlob(wid, asset());
  assert.equal(blob.type, 'image/png');
  assert.equal(blob.size, 16);
  assert.ok(isSupportedMediaAsset(wid, asset()));
  await assert.rejects(media.loadPrivateBlob(wid,
    { ...asset(), object_path: aid + '/' + aid + '/malicious.png' }), /Unsupported/);
  assert.equal(requests, 1);
});

test('Storage delete is confirmed before RLS-scoped metadata delete', async () => {
  const calls: string[] = [];
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      const path = new URL(String(url));
      calls.push(String(init?.method) + ' ' + path.pathname);
      if (path.pathname === '/storage/v1/object/creator-media') {
        assert.equal(init?.method, 'DELETE');
        assert.deepEqual(JSON.parse(String(init?.body)), { prefixes: [asset().object_path] });
        return json([{ name: asset().object_path }]);
      }
      assert.equal(init?.method, 'DELETE');
      assert.equal(path.searchParams.get('workspace_id'), 'eq.' + wid);
      assert.equal(path.searchParams.get('id'), 'eq.' + aid);
      assert.equal(path.searchParams.get('object_path'), 'eq.' + asset().object_path);
      assert.equal((init?.headers as Record<string, string>).Prefer, 'return=representation');
      return json([{ id: aid, workspace_id: wid }]);
    },
  });
  await media.deleteMedia(wid, asset());
  assert.equal(calls.length, 2);
  assert.match(calls[0], /storage\/v1\/object/);
  assert.match(calls[1], /rest\/v1\/creator_media_assets/);
});

test('missing Storage deletion never starts metadata deletion', async () => {
  let calls = 0;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async () => { calls++; return json([]); },
  });
  await assert.rejects(media.deleteMedia(wid, asset()), CloudMediaReconciliationRequired);
  assert.equal(calls, 1);
});

test('deleted blob but failed metadata removal requires reconciliation', async () => {
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url) => String(url).includes('/storage/v1/')
      ? json([{ name: asset().object_path }]) : json([]),
  });
  await assert.rejects(media.deleteMedia(wid, asset()), CloudMediaReconciliationRequired);
});

test('malformed metadata paths are never used as Storage endpoints', async () => {
  let calls = 0;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async () => { calls++; return json([]); },
  });
  const tainted = { ...asset(), object_path: wid + '/../../outside' };
  await assert.rejects(media.deleteMedia(wid, tainted), /path/);
  await assert.rejects(media.loadPrivateBlob(wid, tainted), /Unsupported/);
  assert.equal(calls, 0);
});


test('lost upload response is reconciled with authenticated HEAD before metadata insert', async () => {
  let calls = 0;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (url, init) => {
      calls++;
      const path = new URL(String(url)).pathname;
      if (init?.method === 'POST' && path.includes('/storage/v1/')) {
        throw new Error('Connection dropped after Storage committed');
      }
      if (init?.method === 'HEAD') {
        assert.match(path, /^\/storage\/v1\/object\/authenticated\/creator-media\//);
        assert.equal((init.headers as Record<string, string>).Authorization, 'Bearer ' + token);
        return new Response(null, { status: 200 });
      }
      assert.equal(init?.method, 'POST');
      const posted = JSON.parse(String(init?.body));
      return json([{ ...asset(), ...posted }], 201);
    },
  });
  assert.equal((await media.uploadMedia(wid, file())).workspace_id, wid);
  assert.equal(calls, 3);
});

test('definitive 404 after lost upload response prevents metadata creation', async () => {
  let requests = 0;
  const media = createCreatorMediaClient({
    ...options,
    fetchImpl: async (_url, init) => {
      requests++;
      if (init?.method === 'POST') throw new Error('Lost upload response');
      assert.equal(init?.method, 'HEAD');
      return new Response(null, { status: 404 });
    },
  });
  await assert.rejects(media.uploadMedia(wid, file()), /no private Storage object was found/);
  assert.equal(requests, 2);
});
