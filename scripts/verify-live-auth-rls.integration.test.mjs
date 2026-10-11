import assert from 'node:assert/strict';
import test from 'node:test';
import { runLiveAcceptance } from './verify-live-auth-rls.mjs';

const base = 'https://aoyrijspyygqoyeajxpf.supabase.co';
const wa = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const wb = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const pid = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const mid = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const cid = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const userA = '11111111-1111-4111-8111-111111111111';
const userB = '22222222-2222-4222-8222-222222222222';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9UlyzC4AAAAASUVORK5CYII=', 'base64');
const env = {
  CREATOR_LAB_LIVE_TESTS: 'YES',
  SUPABASE_URL: base + '/',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fake_test_only',
  RLS_TEST_A_EMAIL: 'a@example.test', RLS_TEST_A_PASSWORD: 'fixture-password-A',
  RLS_TEST_B_EMAIL: 'b@example.test', RLS_TEST_B_PASSWORD: 'fixture-password-B',
};

function fixture({ allowFakeSchedule = false, leakForeignLink = false } = {}) {
  const state = {
    workspaces: new Set(),
    files: new Map(),
    attachment: null,
    media: null,
    post: null,
    content: null,
    calls: [],
  };
  function reply(value, status = 200, binary = false) {
    return new Response(binary ? value : JSON.stringify(value), {
      status, headers: { 'Content-Type': binary ? 'image/png' : 'application/json' },
    });
  }
  const denied = (status = 403) => reply({ error: 'insufficient privilege' }, status);
  const fakeFetch = async (input, options = {}) => {
    const u = new URL(String(input));
    assert.equal(u.origin, base, 'must use only dedicated Creator Lab project');
    const method = options.method || 'GET';
    const headers = options.headers || {};
    assert.equal(headers.apikey, env.SUPABASE_PUBLISHABLE_KEY);
    const token = headers.Authorization;
    const owner = token === 'Bearer session-a' ? 'A' :
      token === 'Bearer session-b' ? 'B' : null;
    const body = options.body instanceof Uint8Array ? options.body
      : options.body ? JSON.parse(options.body) : null;
    state.calls.push({ method, pathname: u.pathname, owner });
    const parts = u.pathname;
    if (parts === '/auth/v1/token') {
      const who = body.email === env.RLS_TEST_A_EMAIL ? 'A' : 'B';
      return reply({ access_token: 'session-' + who.toLowerCase(),
        user: { id: who === 'A' ? userA : userB } });
    }
    if (parts === '/auth/v1/user') {
      return reply({ id: owner === 'A' ? userA : userB });
    }
    if (parts === '/rest/v1/rpc/creator_create_workspace') {
      if (!owner) return denied(401);
      const id = owner === 'A' ? wa : wb;
      state.workspaces.add(id);
      return reply(id);
    }
    if (parts === '/rest/v1/creator_workspaces') {
      const item = u.searchParams.get('id')?.slice(3);
      if (method === 'GET') return reply(state.workspaces.has(item) &&
        item === (owner === 'A' ? wa : wb) ? [{ id: item }] : []);
      if (method === 'DELETE') {
        if (item !== (owner === 'A' ? wa : wb)) return reply([]);
        state.workspaces.delete(item);
        return reply([{ id: item }]);
      }
    }
    if (parts === '/rest/v1/creator_content_items') {
      if (method === 'POST') {
        if (owner !== 'A' || body.workspace_id !== wa) return denied();
        state.content = { id: cid, workspace_id: wa, title: body.title };
        return reply([state.content], 201);
      }
      if (method === 'GET') return reply(owner === 'A' && state.content ? [state.content] : []);
      if (method === 'PATCH' || method === 'DELETE') return reply([]);
    }
    if (parts.startsWith('/storage/v1/object/creator-media/')) {
      const path = decodeURIComponent(parts.slice('/storage/v1/object/creator-media/'.length));
      if (method !== 'POST' || owner !== 'A' || !path.startsWith(wa + '/')) return denied();
      state.files.set(path, Buffer.from(options.body));
      return reply({ Key: path }, 201);
    }
    if (parts.startsWith('/storage/v1/object/authenticated/creator-media/')) {
      const path = decodeURIComponent(parts.slice('/storage/v1/object/authenticated/creator-media/'.length));
      if (owner !== 'A' || !state.files.has(path)) return denied(404);
      return reply(state.files.get(path), 200, true);
    }
    if (parts === '/storage/v1/object/creator-media' && method === 'DELETE') {
      const path = body.prefixes[0];
      if (owner !== 'A') return denied();
      if (state.attachment?.media_asset_id === mid &&
          state.media?.object_path === path) return reply([], 200);
      state.files.delete(path);
      return reply([{ name: path }]);
    }
    if (parts === '/rest/v1/creator_posts' && method === 'POST') {
      if (owner !== 'A') return denied();
      if (body.status !== 'draft' && !allowFakeSchedule) return denied();
      state.post = { id: pid, workspace_id: wa, status: body.status };
      return reply([state.post], 201);
    }
    if (parts === '/rest/v1/creator_media_assets') {
      if (method === 'POST') {
        if (owner !== 'A') return denied();
        state.media = { ...body, id: mid };
        return reply([state.media], 201);
      }
      if (method === 'GET') return reply(owner === 'A' && state.media ?
        [{ id: mid, ...state.media }] : []);
      if (method === 'DELETE') return state.attachment ? denied(409) : reply([state.media]);
    }
    if (parts === '/rest/v1/creator_post_media') {
      if (method === 'POST') {
        if (owner !== 'A') return denied();
        state.attachment = { ...body };
        return reply([state.attachment], 201);
      }
      if (method === 'GET') {
        if (owner === 'B') return reply(leakForeignLink && state.attachment ?
          [state.attachment] : []);
        return reply(state.attachment ? [state.attachment] : []);
      }
      if (method === 'DELETE') {
        if (owner !== 'A') return reply([]);
        const old = state.attachment;
        state.attachment = null;
        return reply(old ? [old] : []);
      }
    }
    if (parts === '/rest/v1/creator_social_accounts' && method === 'POST') {
      return denied();
    }
    throw new Error('Unexpected mock request: ' + method + ' ' + parts);
  };
  return { fakeFetch, state };
}

test('offline full-response fixture proves correct private endpoint, link authorization and cleanup', async () => {
  const { fakeFetch, state } = fixture();
  const messages = [];
  await runLiveAcceptance(env, fakeFetch, (line) => messages.push(line));
  assert.ok(messages.some((m) => m.includes('PASS real two-user JWT / cross-workspace')));
  assert.ok(messages.some((m) => m.includes('PASS owner can attach private media')));
  assert.ok(messages.some((m) => m.includes('PASS linked private object cannot be removed')));
  assert.ok(state.calls.some((call) =>
    call.pathname.startsWith('/storage/v1/object/authenticated/creator-media/')));
  assert.equal(state.workspaces.size, 0, 'all temporary workspaces cleaned up');
  assert.equal(state.files.size, 0, 'all temporary Storage objects cleaned up');
  assert.equal(state.attachment, null, 'all relationships detached');
});

test('acceptance fails closed if server lets clients forge scheduled posts', async () => {
  const { fakeFetch } = fixture({ allowFakeSchedule: true });
  const messages = [];
  await assert.rejects(runLiveAcceptance(env, fakeFetch, (line) => messages.push(line)),
    /Live acceptance failed/);
  assert.ok(messages.some((line) => line.includes('FAIL')));
});

test('acceptance fails closed if foreign workspace sees private attachments', async () => {
  const { fakeFetch } = fixture({ leakForeignLink: true });
  const messages = [];
  await assert.rejects(runLiveAcceptance(env, fakeFetch, (line) => messages.push(line)),
    /Live acceptance failed/);
  assert.ok(messages.some((line) => line.includes('FAIL')));
});
