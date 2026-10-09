import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../../supabase/migrations/20261009163035_creator_core_initial.sql', import.meta.url),
  'utf8',
);

const workspaceTables = [
  'creator_workspaces',
  'creator_workspace_members',
  'creator_content_items',
  'creator_posts',
  'creator_social_accounts',
  'creator_post_destinations',
  'creator_media_folders',
  'creator_media_assets',
];

test('migration explicitly enables RLS for all browser-facing tables', () => {
  for (const table of workspaceTables) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security;`, 'i'),
      `Missing RLS for ${table}`,
    );
  }
});

test('membership writes are not directly exposed to authenticated browsers', () => {
  assert.doesNotMatch(
    migration,
    /create policy \w+ on public\.creator_workspace_members\s+for\s+(insert|update|delete|all)\b/i,
  );
  assert.match(migration, /security definer set search_path = ''/i);
  assert.match(migration, /grant execute on function public\.creator_create_workspace\(text,text\) to authenticated/i);
});

test('social OAuth state and provider outcomes cannot be forged via demo write policies', () => {
  assert.match(migration, /connection_mode = 'demo' and provider_account_id is null/i);
  assert.match(migration, /published_at is null and provider_post_id is null/i);
  assert.match(migration, /status in \('draft','scheduled','needs_review'\)/i);
});

test('media bucket is private and storage upload is workspace-authorized', () => {
  assert.match(migration, /'creator-media', 'creator-media', false,/);
  assert.match(migration, /creator_storage_insert on storage\.objects/);
  assert.match(migration, /creator_can_edit\(public\.creator_storage_workspace\(name\)\)/);
  assert.match(migration, /split_part\(object_path, '\/', 1\) = workspace_id::text/);
});

test('ownership helper never takes a caller-supplied user ID', () => {
  for (const fn of ['creator_is_member', 'creator_can_edit', 'creator_is_owner']) {
    assert.match(
      migration,
      new RegExp(`create function public\\.${fn}\\(target_workspace uuid\\)`, 'i'),
    );
  }
  assert.match(migration, /m\.user_id = \(select auth\.uid\(\)\)/);
});

test('workspaces reject invalid IANA timezone updates outside the RPC', () => {
  assert.match(migration, /create function public\.creator_guard_workspace_timezone\(\)/i);
  assert.match(migration, /before insert or update of timezone on public\.creator_workspaces/i);
  assert.match(migration, /from pg_catalog\.pg_timezone_names[\s\S]*?name = new\.timezone/i);
});

test('a destination cannot disguise a real account as demo or change platform', () => {
  assert.match(migration, /create function public\.creator_guard_destination_identity\(\)/i);
  assert.match(
    migration,
    /a\.workspace_id = new\.workspace_id[\s\S]*?a\.platform = new\.platform[\s\S]*?a\.connection_mode = new\.connection_mode/i,
  );
  assert.match(
    migration,
    /before insert or update of social_account_id, workspace_id, platform, connection_mode\s+on public\.creator_post_destinations/i,
  );
});
