import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync('.github/workflows/live-auth-rls.yml', 'utf8');

test('live Auth acceptance is manual-only, main-branch-only, never PR-triggered', () => {
  assert.match(workflow, /\bworkflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s+pull_request(?:_target)?:/m);
  assert.doesNotMatch(workflow, /^\s+push:/m);
  assert.doesNotMatch(workflow, /^\s+schedule:/m);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /inputs\.confirm == 'RUN_LIVE_RLS'/);
  assert.match(workflow, /\n\s+ref: main\n/);
});

test('live job uses only minimal token permissions and explicit separate secrets', () => {
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /secrets\.CREATOR_LAB_RLS_PUBLISHABLE_KEY/);
  for (const suffix of ['A_EMAIL', 'A_PASSWORD', 'B_EMAIL', 'B_PASSWORD']) {
    assert.ok(workflow.includes('secrets.CREATOR_LAB_RLS_' + suffix));
  }
  assert.doesNotMatch(workflow, /service_role|sb_secret_/i);
});

test('real-user credentials belong only to the final Node built-ins test step', () => {
  assert.match(workflow, /CREATOR_LAB_LIVE_TESTS: 'YES'/);
  assert.match(workflow, /node --test scripts\/verify-live-auth-rls\.test\.mjs scripts\/verify-live-auth-rls\.integration\.test\.mjs/);
  assert.match(workflow, /node scripts\/verify-live-auth-rls\.mjs/);
  const nonCommentLines = workflow.split('\n').filter((line) => !line.trimStart().startsWith('#')).join('\n');
  assert.doesNotMatch(nonCommentLines, /\bnpm\s+(?:ci|install)\b/);
  assert.doesNotMatch(workflow, /\bnpx\b/);
  assert.doesNotMatch(workflow, /\b(upload-artifact|pull_request_target)\b/);
});
