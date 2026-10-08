import assert from 'node:assert/strict';
import test from 'node:test';
import { appReducer } from './AppContext';
import { AppState } from '../types';

const baseState: AppState = {
  workspaces: [
    { id: 'a', name: 'A', plan: 'free', timezone: 'UTC', createdAt: '' },
    { id: 'b', name: 'B', plan: 'free', timezone: 'UTC', createdAt: '' },
  ],
  activeWorkspaceId: 'a',
  socialAccounts: [
    { id: 'account-a', workspaceId: 'a', platform: 'youtube', username: 'a', displayName: 'A', status: 'connected', connectionMode: 'demo', lastSync: '' },
    { id: 'account-b', workspaceId: 'b', platform: 'youtube', username: 'b', displayName: 'B', status: 'connected', connectionMode: 'demo', lastSync: '' },
  ],
  postDestinations: [],
  posts: [
    { id: 'post-a', workspaceId: 'a', title: 'A', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '' },
    { id: 'post-b', workspaceId: 'b', title: 'B', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '' },
  ],
  mediaAssets: [
    { id: 'media-a', workspaceId: 'a', url: '', type: 'image', name: 'A', size: 1, createdAt: '', storageType: 'indexeddb' },
    { id: 'media-b', workspaceId: 'b', url: '', type: 'image', name: 'B', size: 1, createdAt: '', storageType: 'indexeddb' },
  ],
  mediaFolders: [
    { id: 'folder-a', workspaceId: 'a', name: 'A', createdAt: '' },
    { id: 'folder-b', workspaceId: 'b', name: 'B', createdAt: '' },
  ],
  pipelineItems: [
    { id: 'item-a', workspaceId: 'a', title: 'A', stage: 'ideas', platforms: [], format: 'text', owner: '', tags: [], order: 0 },
    { id: 'item-b', workspaceId: 'b', title: 'B', stage: 'ideas', platforms: [], format: 'text', owner: '', tags: [], order: 0 },
  ],
  experiments: [
    { id: 'exp-a', workspaceId: 'a', name: 'A', type: 'caption', hypothesis: '', primaryMetric: '', variantA: { label: 'A', metric: 0 }, variantB: { label: 'B', metric: 0 }, status: 'draft' },
    { id: 'exp-b', workspaceId: 'b', name: 'B', type: 'caption', hypothesis: '', primaryMetric: '', variantA: { label: 'A', metric: 0 }, variantB: { label: 'B', metric: 0 }, status: 'draft' },
  ],
  analytics: [
    { id: 'metric-a', workspaceId: 'a', label: 'A', value: 0, change: 0, trend: 'neutral', source: 'demo' },
    { id: 'metric-b', workspaceId: 'b', label: 'B', value: 0, change: 0, trend: 'neutral', source: 'demo' },
  ],
  postPerformances: [
    { postId: 'post-a', workspaceId: 'a', platform: 'youtube', views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'demo' },
    { postId: 'post-b', workspaceId: 'b', platform: 'youtube', views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'demo' },
  ],
};

test('deleting the active workspace cascades owned records and selects the remaining workspace', () => {
  const next = appReducer(baseState, { type: 'DELETE_WORKSPACE', payload: 'a' });

  assert.equal(next.activeWorkspaceId, 'b');
  assert.deepEqual(next.workspaces.map((item) => item.id), ['b']);
  assert.deepEqual(next.socialAccounts.map((item) => item.id), ['account-b']);
  assert.deepEqual(next.posts.map((item) => item.id), ['post-b']);
  assert.deepEqual(next.mediaAssets.map((item) => item.id), ['media-b']);
  assert.deepEqual(next.mediaFolders.map((item) => item.id), ['folder-b']);
  assert.deepEqual(next.pipelineItems.map((item) => item.id), ['item-b']);
  assert.deepEqual(next.experiments.map((item) => item.id), ['exp-b']);
  assert.deepEqual(next.analytics.map((item) => item.id), ['metric-b']);
  assert.deepEqual(next.postPerformances.map((item) => item.postId), ['post-b']);
});

test('the final workspace cannot be deleted', () => {
  const singleWorkspace = {
    ...baseState,
    workspaces: [baseState.workspaces[0]],
    activeWorkspaceId: 'a',
  };

  assert.equal(
    appReducer(singleWorkspace, { type: 'DELETE_WORKSPACE', payload: 'a' }),
    singleWorkspace,
  );
});


test('deleting a pipeline item clears source references without deleting posts or experiments', () => {
  const state: AppState = {
    ...baseState,
    posts: [
      {
        ...baseState.posts[0],
        sourceContentItemId: 'item-a',
      },
    ],
    experiments: [
      {
        ...baseState.experiments[0],
        sourceContentItemId: 'item-a',
      },
    ],
  };

  const next = appReducer(state, {
    type: 'DELETE_PIPELINE_ITEM',
    payload: 'item-a',
  });

  assert.equal(next.pipelineItems.some((item) => item.id === 'item-a'), false);
  assert.equal(next.posts[0].sourceContentItemId, undefined);
  assert.equal(next.experiments[0].sourceContentItemId, undefined);
});

test('deleting a post clears linked performance and experiment source reference', () => {
  const state: AppState = {
    ...baseState,
    experiments: [
      {
        ...baseState.experiments[0],
        sourcePostId: 'post-a',
      },
    ],
  };

  const next = appReducer(state, {
    type: 'DELETE_POST',
    payload: 'post-a',
  });

  assert.equal(next.posts.some((post) => post.id === 'post-a'), false);
  assert.equal(
    next.postPerformances.some((performance) => performance.postId === 'post-a'),
    false,
  );
  assert.equal(next.experiments[0].sourcePostId, undefined);
});

test('removing a media asset also removes every post reference to it', () => {
  const state: AppState = {
    ...baseState,
    posts: [
      {
        ...baseState.posts[0],
        originalContent: {
          caption: 'base',
          mediaIds: ['media-a'],
        },
        platformContent: [
          {
            platform: 'youtube',
            enabled: true,
            content: {
              caption: 'yt',
              mediaIds: ['media-a'],
            },
          },
        ],
      },
    ],
  };

  const next = appReducer(state, {
    type: 'REMOVE_MEDIA_ASSET',
    payload: 'media-a',
  });

  assert.equal(next.mediaAssets.some((asset) => asset.id === 'media-a'), false);
  assert.deepEqual(next.posts[0].originalContent.mediaIds, []);
  assert.deepEqual(next.posts[0].platformContent[0].content.mediaIds, []);
});

test('adding a scheduled linked post advances its source pipeline item', () => {
  const scheduledPost = {
    ...baseState.posts[0],
    id: 'scheduled-post',
    sourceContentItemId: 'item-a',
    status: 'scheduled' as const,
    scheduledAt: '2026-10-08T12:00:00.000Z',
  };

  const next = appReducer(baseState, {
    type: 'ADD_POST',
    payload: scheduledPost,
  });

  assert.equal(
    next.pipelineItems.find((item) => item.id === 'item-a')?.stage,
    'scheduled',
  );
});

test('removing the last destination from a scheduled post moves it to needs review', () => {
  const state: AppState = {
    ...baseState,
    posts: [
      {
        ...baseState.posts[0],
        destinationAccountIds: ['account-a'],
        status: 'scheduled',
        scheduledAt: '2026-10-08T12:00:00.000Z',
      },
    ],
  };

  const next = appReducer(state, {
    type: 'REMOVE_SOCIAL_ACCOUNT',
    payload: 'account-a',
  });

  assert.deepEqual(next.posts[0].destinationAccountIds, []);
  assert.equal(next.posts[0].status, 'needs_review');
  assert.equal(next.posts[0].scheduledAt, undefined);
});

test('the reducer keeps the published destination snapshot after account removal', () => {
  const publishedPost = {
    ...baseState.posts[0],
    destinationAccountIds: ['account-a'],
    status: 'published' as const,
    publishedAt: '2026-10-08T12:00:00.000Z',
  };
  const prepared = appReducer(
    { ...baseState, posts: [] },
    { type: 'ADD_POST', payload: publishedPost },
  );
  assert.equal(prepared.postDestinations.length, 1);

  const next = appReducer(prepared, {
    type: 'REMOVE_SOCIAL_ACCOUNT',
    payload: 'account-a',
  });

  assert.deepEqual(next.posts[0].destinationAccountIds, []);
  assert.equal(next.postDestinations.length, 1);
  assert.equal(next.postDestinations[0].accountLabel, 'A');
  assert.equal(next.postDestinations[0].platform, 'youtube');
  assert.equal(next.postDestinations[0].socialAccountId, undefined);
  assert.equal(next.postDestinations[0].status, 'published');
});

test('deleting a post removes its destinations without touching the other workspace', () => {
  const postA = { ...baseState.posts[0], destinationAccountIds: ['account-a'] };
  const postB = { ...baseState.posts[1], destinationAccountIds: ['account-b'] };
  let state = appReducer({ ...baseState, posts: [] }, { type: 'ADD_POST', payload: postA });
  state = appReducer(state, { type: 'ADD_POST', payload: postB });
  assert.equal(state.postDestinations.length, 2);

  const next = appReducer(state, { type: 'DELETE_POST', payload: 'post-a' });

  assert.deepEqual(next.postDestinations.map(d => d.postId), ['post-b']);
});

test('deleting a workspace removes owned destination snapshots only', () => {
  const postA = { ...baseState.posts[0], destinationAccountIds: ['account-a'] };
  const postB = { ...baseState.posts[1], destinationAccountIds: ['account-b'] };
  let state = appReducer({ ...baseState, posts: [] }, { type: 'ADD_POST', payload: postA });
  state = appReducer(state, { type: 'ADD_POST', payload: postB });
  const next = appReducer(state, { type: 'DELETE_WORKSPACE', payload: 'a' });

  assert.deepEqual(next.postDestinations.map(d => d.workspaceId), ['b']);
});
