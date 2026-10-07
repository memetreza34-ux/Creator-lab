import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PERSISTED_STATE_SCHEMA_VERSION,
  deserializePersistedState,
  migratePersistedState,
  serializePersistedState,
} from './persistence';

const options = {
  now: '2026-10-07T12:00:00.000Z',
  defaultTimezone: 'Europe/Berlin',
};

function createLegacyState() {
  return {
    workspaces: [
      {
        id: 'workspace-a',
        name: 'Legacy Workspace',
        plan: 'pro',
      },
    ],
    activeWorkspaceId: 'missing-workspace',
    socialAccounts: [
      {
        id: 'account-a',
        platform: 'youtube',
        username: 'legacy',
        displayName: 'Legacy YouTube',
        status: 'connected',
      },
    ],
    posts: [
      {
        id: 'post-a',
        title: 'Legacy Post',
        destinationAccountIds: ['account-a'],
        originalContent: {
          caption: 'Legacy caption',
          mediaIds: [],
        },
        platformContent: [
          {
            platform: 'youtube',
            content: {
              caption: 'YouTube caption',
              mediaIds: [],
            },
          },
        ],
        status: 'draft',
      },
    ],
    mediaAssets: [
      {
        id: 'media-a',
        url: 'blob:legacy',
        type: 'image',
        name: 'Legacy asset',
        size: 10,
      },
    ],
    mediaFolders: [
      {
        id: 'folder-a',
        name: 'Legacy folder',
      },
    ],
    pipelineItems: [
      {
        id: 'item-a',
        title: 'Legacy item',
        stage: 'ideas',
        platforms: ['youtube'],
        format: 'video',
      },
    ],
    experiments: [
      {
        id: 'experiment-a',
        name: 'Legacy test',
        type: 'caption',
        hypothesis: 'B performs better',
        primaryMetric: 'Engagement Rate',
        variantA: { label: 'A', metric: 0 },
        variantB: { label: 'B', metric: 0 },
        status: 'draft',
      },
    ],
    analytics: [
      {
        id: 'metric-a',
        label: 'Reach',
        value: 10,
        change: 0,
        trend: 'neutral',
      },
    ],
    postPerformances: [
      {
        postId: 'post-a',
        platform: 'youtube',
        views: 10,
        reach: 10,
        likes: 1,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        ctr: 0,
        engagementRate: 10,
        followersGained: 0,
        publishedAt: '2026-10-01T10:00:00.000Z',
      },
    ],
  };
}

test('migrates an unversioned legacy state into schema version 1', () => {
  const migrated = migratePersistedState(createLegacyState(), options);

  assert.ok(migrated);
  assert.equal(migrated.schemaVersion, PERSISTED_STATE_SCHEMA_VERSION);
  assert.equal(migrated.state.activeWorkspaceId, 'workspace-a');
  assert.equal(migrated.state.workspaces[0].timezone, 'Europe/Berlin');
  assert.equal(
    migrated.state.workspaces[0].createdAt,
    '2026-10-07T12:00:00.000Z',
  );
});

test('normalizes workspace ownership for every legacy workspace-owned collection', () => {
  const migrated = migratePersistedState(createLegacyState(), options);
  assert.ok(migrated);

  const state = migrated.state;
  assert.equal(state.socialAccounts[0].workspaceId, 'workspace-a');
  assert.equal(state.posts[0].workspaceId, 'workspace-a');
  assert.equal(state.mediaAssets[0].workspaceId, 'workspace-a');
  assert.equal(state.mediaFolders[0].workspaceId, 'workspace-a');
  assert.equal(state.pipelineItems[0].workspaceId, 'workspace-a');
  assert.equal(state.experiments[0].workspaceId, 'workspace-a');
  assert.equal(state.analytics[0].workspaceId, 'workspace-a');
  assert.equal(state.postPerformances[0].workspaceId, 'workspace-a');
});

test('normalizes legacy platform content and pipeline defaults without replacing user data', () => {
  const migrated = migratePersistedState(createLegacyState(), options);
  assert.ok(migrated);

  assert.equal(migrated.state.posts[0].originalContent.caption, 'Legacy caption');
  assert.equal(migrated.state.posts[0].platformContent[0].enabled, true);
  assert.deepEqual(migrated.state.pipelineItems[0].tags, []);
  assert.equal(migrated.state.pipelineItems[0].notes, '');
  assert.equal(migrated.state.pipelineItems[0].order, 0);
});

test('serializes a versioned envelope and round-trips current state', () => {
  const migrated = migratePersistedState(createLegacyState(), options);
  assert.ok(migrated);

  const serialized = serializePersistedState(migrated.state);
  const envelope = JSON.parse(serialized);

  assert.equal(envelope.schemaVersion, PERSISTED_STATE_SCHEMA_VERSION);
  assert.deepEqual(deserializePersistedState(serialized, options), migrated.state);
});

test('preserves an explicit valid workspace owner during migration', () => {
  const legacy = createLegacyState();
  legacy.workspaces.push({
    id: 'workspace-b',
    name: 'Second Workspace',
    plan: 'pro',
  });
  legacy.mediaAssets[0].workspaceId = 'workspace-b';

  const migrated = migratePersistedState(legacy, options);
  assert.ok(migrated);
  assert.equal(migrated.state.mediaAssets[0].workspaceId, 'workspace-b');
});

test('rejects unsupported future schemas and malformed payloads', () => {
  assert.equal(
    migratePersistedState(
      {
        schemaVersion: PERSISTED_STATE_SCHEMA_VERSION + 1,
        state: createLegacyState(),
      },
      options,
    ),
    null,
  );

  assert.equal(deserializePersistedState('{broken json', options), null);
  assert.equal(migratePersistedState({ workspaces: [] }, options), null);
});
