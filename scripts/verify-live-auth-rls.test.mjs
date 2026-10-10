import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSafeConfig, mustBeDenied, mustBeEmptyRows } from './verify-live-auth-rls.mjs';

const valid = {
  CREATOR_LAB_LIVE_TESTS: 'YES',
  SUPABASE_URL: 'https://aoyrijspyygqoyeajxpf.supabase.co/',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key_NOT_A_SECRET',
  RLS_TEST_A_EMAIL: 'a@example.test',
  RLS_TEST_A_PASSWORD: 'example-only-password-a',
  RLS_TEST_B_EMAIL: 'b@example.test',
  RLS_TEST_B_PASSWORD: 'example-only-password-b',
};

test('real JWT probe is deliberately opt-in', () => {
  assert.throws(() => assertSafeConfig({ ...valid, CREATOR_LAB_LIVE_TESTS: undefined }), /Opt in/);
  assert.equal(assertSafeConfig(valid).origin, valid.SUPABASE_URL.slice(0, -1));
});

test('refuses wrong project, unsafe host, and URL credentials', () => {
  for (const url of [
    'https://unrelated.supabase.co/',
    'http://aoyrijspyygqoyeajxpf.supabase.co/',
    'https://aoyrijspyygqoyeajxpf.supabase.co.evil.example/',
    'https://user:pass@aoyrijspyygqoyeajxpf.supabase.co/',
    'https://aoyrijspyygqoyeajxpf.supabase.co/private',
  ]) {
    assert.throws(() => assertSafeConfig({ ...valid, SUPABASE_URL: url }), /different project|unsafe/);
  }
});

test('refuses one user masquerading as two', () => {
  assert.throws(() => assertSafeConfig({ ...valid, RLS_TEST_B_EMAIL: 'A@EXAMPLE.TEST' }), /different/);
});

test('refuses secret keys and service-role legacy JWTs', () => {
  assert.throws(() => assertSafeConfig({
    ...valid, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_do_not_use',
  }), /NEVER/);

  const payload = Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url');
  const fakeServiceJwt = 'eyJ.' + payload + '.signature';
  assert.throws(() => assertSafeConfig({
    ...valid, SUPABASE_PUBLISHABLE_KEY: fakeServiceJwt,
  }), /never service_role/);
});

test('a denied write must have non-2xx status', () => {
  mustBeDenied({ status: 403 }, 'forbidden write');
  assert.throws(() => mustBeDenied({ status: 201 }, 'forbidden write'), /unexpectedly succeeded/);
});

test('RLS reads and updates must return explicitly empty arrays', () => {
  mustBeEmptyRows({ status: 200, body: [] }, 'foreign workspace');
  assert.throws(() => mustBeEmptyRows({
    status: 200, body: [{ id: 'secret' }],
  }, 'foreign workspace'), /foreign user could read/);
  assert.throws(() => mustBeEmptyRows({
    status: 403, body: [],
  }, 'foreign workspace'), /HTTP 403/);
});
