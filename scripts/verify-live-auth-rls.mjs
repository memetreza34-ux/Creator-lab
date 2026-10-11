#!/usr/bin/env node
/**
 * Creator Lab Phase 4 live RLS + Storage acceptance with two REAL Supabase Auth JWTs.
 *
 * This is deliberately opt-in and needs two already-confirmed test accounts.
 * NO service-role key, direct admin access, generated JWTs or fake SQL claims.
 * Creates only unique temporary workspaces, tests them, and cleans them up.
 * Never print credentials, JWTs, auth response bodies or test passwords.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const PROJECT_REF = 'aoyrijspyygqoyeajxpf';
const BUCKET = 'creator-media';
// One genuine, transparent, 1x1 PNG. No person/customer data uploaded.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9UlyzC4AAAAASUVORK5CYII=',
  'base64',
);

export function assertSafeConfig(env) {
  if (env.CREATOR_LAB_LIVE_TESTS !== 'YES') {
    throw new Error('Opt in with CREATOR_LAB_LIVE_TESTS=YES before creating temporary test data');
  }
  const keys = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'RLS_TEST_A_EMAIL',
    'RLS_TEST_A_PASSWORD', 'RLS_TEST_B_EMAIL', 'RLS_TEST_B_PASSWORD'];
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error('Missing required environment variables: ' + missing.join(', '));

  const url = new URL(env.SUPABASE_URL);
  if (url.protocol !== 'https:' || url.hostname !== PROJECT_REF + '.supabase.co' ||
      url.username || url.password || url.port || url.pathname !== '/' ||
      url.search || url.hash) {
    throw new Error('Refusing to test a different project or an unsafe Supabase URL');
  }
  if (env.RLS_TEST_A_EMAIL.trim().toLowerCase() === env.RLS_TEST_B_EMAIL.trim().toLowerCase()) {
    throw new Error('Real A/B accounts must use different email addresses');
  }
  if (env.SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
    let role;
    try {
      const payload = env.SUPABASE_PUBLISHABLE_KEY.split('.')[1];
      role = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).role;
    } catch {
      throw new Error('Invalid legacy key; use a publishable key or an anon-role JWT');
    }
    if (role !== 'anon') throw new Error('Legacy JWT must have the anon role, never service_role');
  } else if (!env.SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    throw new Error('Use a publishable/legacy anon key, NEVER a service-role or secret key');
  }
  return { origin: url.origin, key: env.SUPABASE_PUBLISHABLE_KEY };
}

export function mustBeDenied(response, context) {
  assert.ok([400, 401, 403, 404].includes(response.status),
    context + ': expected authorization rejection (400/401/403/404), got HTTP ' + response.status);
}

export function mustBeEmptyRows(response, context) {
  assert.ok(response.status >= 200 && response.status < 300, context + ' HTTP ' + response.status);
  assert.deepEqual(response.body, [], context + ': foreign user could read or change rows');
}

export async function runLiveAcceptance(env, request = fetch, report = console.log) {
  const { origin, key } = assertSafeConfig(env);
  const run = randomUUID();
  const created = [];
  const uploaded = [];
  let failures = 0;

  async function api(method, path, token, body, headers = {}) {
    const h = { apikey: key, ...headers };
    if (token) h.Authorization = 'Bearer ' + token;
    if (body !== undefined && !(body instanceof Uint8Array)) {
      h['Content-Type'] = 'application/json';
    }
    const response = await request(origin + path, {
      method,
      headers: h,
      body: body === undefined ? undefined
        : body instanceof Uint8Array ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    const raw = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';
    let data = Buffer.from(raw);
    if (contentType.includes('json') || path.startsWith('/rest/v1/')) {
      try { data = JSON.parse(data.toString('utf8')); } catch { /* return raw */ }
    }
    return { status: response.status, body: data };
  }

  async function signIn(email, password) {
    const res = await api('POST', '/auth/v1/token?grant_type=password', null,
      { email, password });
    assert.equal(res.status, 200, 'Auth sign-in failed (check email confirmation/password)');
    assert.ok(res.body.access_token && res.body.user?.id, 'Auth response has no issued session');
    const user = await api('GET', '/auth/v1/user', res.body.access_token);
    assert.equal(user.status, 200, 'Supabase Auth did not accept issued token');
    assert.equal(user.body.id, res.body.user.id, 'Mismatched session user');
    return { token: res.body.access_token, id: res.body.user.id };
  }

  async function workspace(user, label) {
    const res = await api('POST', '/rest/v1/rpc/creator_create_workspace',
      user.token, { workspace_name: 'RLS temporary ' + label + ' ' + run.slice(0, 8),
        workspace_timezone: 'UTC' });
    assert.equal(res.status, 200, 'Could not create temporary workspace via Auth JWT');
    assert.match(res.body, /^[0-9a-f-]{36}$/i);
    created.push({ id: res.body, token: user.token });
    return res.body;
  }

  async function check(name, callback) {
    await callback();
    report('PASS ' + name);
  }

  let thrown;
  try {
    const a = await signIn(env.RLS_TEST_A_EMAIL, env.RLS_TEST_A_PASSWORD);
    const b = await signIn(env.RLS_TEST_B_EMAIL, env.RLS_TEST_B_PASSWORD);
    assert.notEqual(a.id, b.id, 'Both test credentials resolved to the same Auth user');
    report('PASS two distinct verified Supabase Auth sessions');

    const anonymousRpc = await api('POST', '/rest/v1/rpc/creator_create_workspace',
      null, { workspace_name: 'Must Not Exist', workspace_timezone: 'UTC' });
    mustBeDenied(anonymousRpc, 'Anonymous workspace creation');
    report('PASS anonymous workspace creation denied');

    const wa = await workspace(a, 'A');
    const wb = await workspace(b, 'B');
    report('PASS workspaces owned by separate issued-JWT identities');

    const selection = '/rest/v1/creator_workspaces?select=id&id=eq.' + wa;
    await check('owner can read own workspace', async () => {
      const r = await api('GET', selection, a.token);
      assert.equal(r.status, 200);
      assert.equal(r.body.length, 1);
      assert.equal(r.body[0].id, wa);
    });
    await check('user B cannot see user A workspace', async () =>
      mustBeEmptyRows(await api('GET', selection, b.token), 'Workspace SELECT'));

    const inserts = '/rest/v1/creator_content_items?select=id,workspace_id,title';
    const createdItem = await api('POST', inserts, a.token,
      { workspace_id: wa, title: 'Automated temporary RLS probe ' + run },
      { Prefer: 'return=representation' });
    assert.equal(createdItem.status, 201, 'Owner could not create workspace content');
    assert.equal(createdItem.body.length, 1);
    const itemId = createdItem.body[0].id;
    const itemPath = '/rest/v1/creator_content_items?select=id&workspace_id=eq.' +
      wa + '&id=eq.' + itemId;

    await check('member A reads own content', async () => {
      const r = await api('GET', itemPath, a.token);
      assert.equal(r.status, 200);
      assert.equal(r.body.length, 1);
    });
    await check('user B cannot read workspace A content', async () =>
      mustBeEmptyRows(await api('GET', itemPath, b.token), 'Content SELECT'));

    await check('user B cannot insert content into workspace A', async () => {
      const r = await api('POST', inserts, b.token,
        { workspace_id: wa, title: 'Forbidden cross-workspace insert' },
        { Prefer: 'return=representation' });
      mustBeDenied(r, 'Content INSERT');
    });
    await check('user B cannot update workspace A content', async () => {
      const r = await api('PATCH', itemPath, b.token,
        { title: 'Forbidden cross-workspace update' },
        { Prefer: 'return=representation' });
      mustBeEmptyRows(r, 'Content UPDATE');
    });
    await check('user B cannot delete workspace A content', async () => {
      const r = await api('DELETE', itemPath, b.token, undefined,
        { Prefer: 'return=representation' });
      mustBeEmptyRows(r, 'Content DELETE');
    });
    await check('owner B does not see workspace A via own workspace', async () => {
      const r = await api('GET', '/rest/v1/creator_workspaces?select=id&id=eq.' + wb, b.token);
      assert.equal(r.status, 200);
      assert.equal(r.body[0]?.id, wb);
    });

    const objectPath = wa + '/' + randomUUID() + '/probe.png';
    const objectUrl = '/storage/v1/object/' + BUCKET + '/' + objectPath;
    // Supabase private objects use the authenticated download endpoint.
    // The object upload/delete URLs deliberately use a different Storage route.
    const privateDownload = '/storage/v1/object/authenticated/' + BUCKET + '/' + objectPath;
    const storageUpload = await api('POST', objectUrl, a.token, PNG,
      { 'Content-Type': 'image/png', 'x-upsert': 'false' });
    assert.ok([200, 201].includes(storageUpload.status),
      'Owner failed to upload private Storage test asset: ' + storageUpload.status);
    uploaded.push({ token: a.token, path: objectPath });
    report('PASS owner can upload scoped private media');

    await check('owner can download private media', async () => {
      const r = await api('GET', privateDownload, a.token);
      assert.equal(r.status, 200);
      assert.deepEqual(r.body, PNG);
    });
    await check('another workspace user cannot download private media', async () =>
      mustBeDenied(await api('GET', privateDownload, b.token), 'Storage cross-workspace GET'));
    await check('anonymous caller cannot download private media', async () =>
      mustBeDenied(await api('GET', privateDownload, null), 'Storage anonymous GET'));
    await check('another workspace user cannot upload under workspace A', async () => {
      const forbiddenPath = wa + '/' + randomUUID() + '/forbidden.png';
      const forbiddenUrl = '/storage/v1/object/' + BUCKET + '/' + forbiddenPath;
      const attempted = await api('POST', forbiddenUrl, b.token, PNG,
        { 'Content-Type': 'image/png', 'x-upsert': 'false' });
      // If RLS is broken and the foreign write succeeds, clean it up as owner A.
      if (attempted.status >= 200 && attempted.status < 300) {
        uploaded.push({ token: a.token, path: forbiddenPath });
      }
      mustBeDenied(attempted, 'Storage foreign INSERT');
    });

    // B-07: validated relational media attachment permissions on actual JWTs.
    // Prerequisite: applied DB migrations 20261011140325 + 20261011140925.
    const postTable = '/rest/v1/creator_posts?select=id,workspace_id,status';
    const post = await api('POST', postTable, a.token,
      { workspace_id: wa, title: 'Temporary JWT media draft ' + run, status: 'draft' },
      { Prefer: 'return=representation' });
    assert.equal(post.status, 201, 'Owner failed to save a real draft (B-07 schema)');
    assert.equal(post.body?.length, 1, 'Draft insertion was not confirmed');
    const pid = post.body[0].id;
    report('PASS owner created a real Cloud draft');

    const assetPath = '/rest/v1/creator_media_assets?select=id,workspace_id,object_path';
    const newAsset = await api('POST', assetPath, a.token, {
      workspace_id: wa, object_path: objectPath, file_name: 'probe.png',
      mime_type: 'image/png', size_bytes: PNG.length,
    }, { Prefer: 'return=representation' });
    assert.equal(newAsset.status, 201, 'Owner failed to register uploaded Storage object');
    assert.equal(newAsset.body?.length, 1, 'Media metadata insertion was not confirmed');
    const mid = newAsset.body[0].id;
    report('PASS uploaded private object has workspace-owned metadata');

    await check('user B cannot read workspace A media metadata', async () =>
      mustBeEmptyRows(await api('GET',
        '/rest/v1/creator_media_assets?select=id&workspace_id=eq.' + wa +
        '&id=eq.' + mid, b.token), 'Foreign media metadata'));

    const linkPath = '/rest/v1/creator_post_media?select=workspace_id,post_id,media_asset_id';
    const pairFilter = '&workspace_id=eq.' + wa + '&post_id=eq.' + pid;
    const linkFilter = pairFilter + '&media_asset_id=eq.' + mid;
    const owned = { workspace_id: wa, post_id: pid, media_asset_id: mid };
    await check('owner can attach private media to own draft', async () => {
      const res = await api('POST', linkPath, a.token, owned,
        { Prefer: 'return=representation' });
      assert.equal(res.status, 201, 'Owner draft-media INSERT denied');
      assert.equal(res.body?.length, 1, 'Media attachment confirmation missing');
      assert.deepEqual({
        workspace_id: res.body[0].workspace_id,
        post_id: res.body[0].post_id,
        media_asset_id: res.body[0].media_asset_id,
      }, owned);
    });

    await check('cross-workspace JWT cannot read draft media links', async () =>
      mustBeEmptyRows(await api('GET', linkPath + pairFilter, b.token),
        'Cross-workspace draft media SELECT'));
    await check('cross-workspace JWT cannot attach media', async () => {
      const res = await api('POST', linkPath, b.token, owned,
        { Prefer: 'return=representation' });
      mustBeDenied(res, 'Cross-workspace attachment INSERT');
    });

    await check('client cannot forge a scheduled post', async () => {
      const res = await api('POST', postTable, a.token, {
        workspace_id: wa, title: 'Forged schedule', status: 'scheduled',
        scheduled_at: '2030-01-01T12:00:00Z',
      }, { Prefer: 'return=representation' });
      mustBeDenied(res, 'Direct scheduled INSERT without a server job');
    });

    await check('client cannot forge connected OAuth/demo account', async () => {
      const res = await api('POST',
        '/rest/v1/creator_social_accounts?select=id', a.token, {
          workspace_id: wa, platform: 'youtube',
          display_name: 'Forged connected account', username: 'forged',
          connection_mode: 'demo', connection_status: 'connected',
        }, { Prefer: 'return=representation' });
      mustBeDenied(res, 'Fake demo connected account');
    });

    await check('linked private object cannot be removed through Storage API', async () => {
      const deletion = await api('DELETE',
        '/storage/v1/object/' + BUCKET, a.token,
        { prefixes: [objectPath] });
      assert.ok(deletion.status < 500,
        'Storage cannot assess linked-object deletion (server failure)');
      const stillPresent = await api('GET', privateDownload, a.token);
      assert.equal(stillPresent.status, 200,
        'Attached Storage object was removed despite link deletion guard');
      assert.deepEqual(stillPresent.body, PNG);
    });

    await check('linked asset metadata cannot be deleted through PostgREST', async () => {
      const deletion = await api('DELETE',
        '/rest/v1/creator_media_assets?workspace_id=eq.' + wa + '&id=eq.' + mid,
        a.token, undefined, { Prefer: 'return=representation' });
      assert.ok([400, 409].includes(deletion.status),
        'Expected referential integrity denial, got ' + deletion.status);
      const stillPresent = await api('GET',
        '/rest/v1/creator_media_assets?select=id&workspace_id=eq.' +
        wa + '&id=eq.' + mid, a.token);
      assert.equal(stillPresent.body?.[0]?.id, mid, 'Media metadata was deleted while linked');
    });

    await check('owner can detach without deleting media', async () => {
      const deleted = await api('DELETE',
        '/rest/v1/creator_post_media?workspace_id=eq.' + wa +
        '&post_id=eq.' + pid + '&media_asset_id=eq.' + mid +
        '&select=workspace_id,post_id,media_asset_id',
        a.token, undefined, { Prefer: 'return=representation' });
      assert.equal(deleted.status, 200, 'Media detach failed');
      assert.equal(deleted.body?.length, 1, 'Detached link was not confirmed');
      assert.equal(deleted.body[0]?.media_asset_id, mid, 'Wrong attachment detached');
      mustBeEmptyRows(await api('GET',
        linkPath + linkFilter, a.token), 'Link still present after detach');
      const fileStillPresent = await api('GET', privateDownload, a.token);
      assert.equal(fileStillPresent.status, 200, 'Detaching accidentally deleted private file');
    });

  } catch (err) {
    thrown = err;
    report('FAIL ' + (err instanceof Error ? err.message : 'Unknown test failure'));
  } finally {
    // Delete Storage objects through the Storage API (not SQL, which orphans blobs).
    for (const item of uploaded.reverse()) {
      try {
        const r = await api('DELETE', '/storage/v1/object/' + BUCKET,
          item.token, { prefixes: [item.path] });
        if (r.status < 200 || r.status >= 300) throw new Error('HTTP ' + r.status);
        const check = await api('GET',
          '/storage/v1/object/authenticated/' + BUCKET + '/' + item.path, item.token);
        if (check.status >= 200 && check.status < 300) {
          throw new Error('Storage object remains accessible after cleanup');
        }
        report('CLEANUP storage asset removed');
      } catch {
        failures++;
        report('CLEANUP FAILED storage; locate the temporary RLS probe object by its workspace');
      }
    }
    // Only workspaces created by this run are deleted, never existing user data.
    for (const item of created.reverse()) {
      try {
        const r = await api('DELETE',
          '/rest/v1/creator_workspaces?id=eq.' + item.id,
          item.token, undefined, { Prefer: 'return=representation' });
        if (r.status < 200 || r.status >= 300 ||
            r.body?.[0]?.id !== item.id) throw new Error('owner deletion not confirmed');
        report('CLEANUP temporary workspace removed');
      } catch {
        failures++;
        report('CLEANUP FAILED temporary workspace ' + item.id + ' (manual owner cleanup required)');
      }
    }
  }

  if (thrown || failures) throw new Error(
    'Live acceptance failed or left temporary data; review FAIL/CLEANUP messages. No production gate passed.');
  report('PASS real two-user JWT / cross-workspace / private Storage acceptance');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runLiveAcceptance(process.env).catch(() => { process.exitCode = 1; });
}
