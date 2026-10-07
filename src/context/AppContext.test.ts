import assert from 'node:assert/strict';
import test from 'node:test';
import { appReducer } from './AppContext';
import { AppState } from '../types';

const baseState: AppState = {
  workspaces: [
    { id: 'a', name: 'A', plan: 'free', timezone: 'UTC', createdAt: '', dataMode: 'standard' },
    { id: 'b', name: 'B', plan: 'free', timezone: 'UTC', createdAt: '', dataMode: 'standard' },
  ],
  activeWorkspaceId: 'a',
  socialAccounts: [
    { id: 'account-a', workspaceId: 'a', platform: 'youtube', username: 'a', displayName: 'A', status: 'connected', connectionKind: 'provider', lastSync: '' },
    { id: 'account-b', workspaceId: 'b', platform: 'youtube', username: 'b', displayName: 'B', status: 'connected', connectionKind: 'provider', lastSync: '' },
  ],
  posts: [
    { id: 'post-a', workspaceId: 'a', title: 'A', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '', storageKind: 'remote' },
    { id: 'post-b', workspaceId: 'b', title: 'B', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '', storageKind: 'remote' },
  ],
  mediaAssets: [
    { id: 'media-a', workspaceId: 'a', url: '', type: 'image', name: 'A', size: 1, createdAt: '', storageKind: 'remote' },
    { id: 'media-b', workspaceId: 'b', url: '', type: 'image', name: 'B', size: 1, createdAt: '', storageKind: 'remote' },
  ],
  mediaFolders: [
    { id: 'folder-a', workspaceId: 'a', name: 'A', createdAt: '', storageKind: 'remote' },
    { id: 'folder-b', workspaceId: 'b', name: 'B', createdAt: '', storageKind: 'remote' },
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
    { id: 'metric-a', workspaceId: 'a', label: 'A', value: 0, change: 0, trend: 'neutral', source: 'local' },
    { id: 'metric-b', workspaceId: 'b', label: 'B', value: 0, change: 0, trend: 'neutral', source: 'local' },
  ],
  postPerformances: [
    { postId: 'post-a', workspaceId: 'a', platform: 'youtube', views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'local' },
    { postId: 'post-b', workspaceId: 'b', platform: 'youtube', views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'local' },
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
