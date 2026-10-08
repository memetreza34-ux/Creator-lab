import assert from 'node:assert/strict';
import test from 'node:test';
import { AppState } from '../types';
import {
  getPostsForContentItem,
  getPostsUsingAccount,
  getPostsUsingMedia,
  getSourceContentItemForPost,
  getWorkspaceAccounts,
  getWorkspaceAnalytics,
  getWorkspaceMedia,
  getWorkspacePerformance,
  getWorkspacePosts,
} from './selectors';

const state: AppState = {
  workspaces: [
    { id: 'a', name: 'A', plan: 'free', timezone: 'UTC', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'b', name: 'B', plan: 'free', timezone: 'UTC', createdAt: '2026-01-01T00:00:00Z' },
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
  mediaFolders: [],
  pipelineItems: [],
  experiments: [],
  analytics: [
    { id: 'metric-a', workspaceId: 'a', label: 'Reach', value: 1, change: 0, trend: 'neutral', source: 'demo' },
    { id: 'metric-b', workspaceId: 'b', label: 'Reach', value: 2, change: 0, trend: 'neutral', source: 'demo' },
  ],
  postPerformances: [
    { postId: 'post-a', workspaceId: 'a', platform: 'youtube', views: 1, reach: 1, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'demo' },
    { postId: 'post-b', workspaceId: 'b', platform: 'youtube', views: 2, reach: 2, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'demo' },
  ],
};

test('workspace selectors never return records owned by another workspace', () => {
  assert.deepEqual(getWorkspacePosts(state).map((item) => item.id), ['post-a']);
  assert.deepEqual(getWorkspaceAccounts(state).map((item) => item.id), ['account-a']);
  assert.deepEqual(getWorkspaceMedia(state).map((item) => item.id), ['media-a']);
  assert.deepEqual(getWorkspaceAnalytics(state).map((item) => item.id), ['metric-a']);
  assert.deepEqual(getWorkspacePerformance(state).map((item) => item.postId), ['post-a']);
});


test('content traceability selectors remain workspace-scoped', () => {
  const scopedState: AppState = {
    ...state,
    posts: [
      {
        ...state.posts[0],
        sourceContentItemId: 'item-a',
        destinationAccountIds: ['account-a'],
        originalContent: { caption: '', mediaIds: ['media-a'] },
      },
      {
        ...state.posts[1],
        sourceContentItemId: 'item-b',
        destinationAccountIds: ['account-b'],
        originalContent: { caption: '', mediaIds: ['media-b'] },
      },
    ],
    pipelineItems: [
      {
        id: 'item-a',
        workspaceId: 'a',
        title: 'Idea A',
        stage: 'ready',
        platforms: ['youtube'],
        format: 'long',
        owner: 'Creator',
        tags: [],
        order: 0,
      },
      {
        id: 'item-b',
        workspaceId: 'b',
        title: 'Idea B',
        stage: 'ready',
        platforms: ['youtube'],
        format: 'long',
        owner: 'Creator',
        tags: [],
        order: 0,
      },
    ],
  };

  assert.deepEqual(
    getPostsForContentItem(scopedState, 'item-a').map((post) => post.id),
    ['post-a'],
  );
  assert.equal(
    getSourceContentItemForPost(scopedState, scopedState.posts[0])?.id,
    'item-a',
  );
  assert.deepEqual(
    getPostsUsingMedia(scopedState, 'media-a').map((post) => post.id),
    ['post-a'],
  );
  assert.deepEqual(
    getPostsUsingAccount(scopedState, 'account-a').map((post) => post.id),
    ['post-a'],
  );

  assert.deepEqual(getPostsForContentItem(scopedState, 'item-b'), []);
  assert.deepEqual(getPostsUsingMedia(scopedState, 'media-b'), []);
  assert.deepEqual(getPostsUsingAccount(scopedState, 'account-b'), []);
});

test('media usage detects platform-specific references without duplicating a post', () => {
  const scopedState: AppState = {
    ...state,
    posts: [
      {
        ...state.posts[0],
        originalContent: {
          caption: '',
          mediaIds: ['media-a'],
        },
        platformContent: [
          {
            platform: 'youtube',
            enabled: true,
            content: {
              caption: 'YouTube',
              mediaIds: ['media-a'],
            },
          },
        ],
      },
    ],
  };

  assert.deepEqual(
    getPostsUsingMedia(scopedState, 'media-a').map((post) => post.id),
    ['post-a'],
  );
});
