import assert from 'node:assert/strict';
import test from 'node:test';
import { AppState } from '../types';
import {
  getWorkspaceAccounts,
  getWorkspaceAnalytics,
  getWorkspaceMedia,
  getWorkspacePerformance,
  getWorkspacePosts,
} from './selectors';

const state: AppState = {
  workspaces: [
    { id: 'a', name: 'A', plan: 'free', timezone: 'UTC', createdAt: '2026-01-01T00:00:00Z', dataMode: 'standard' },
    { id: 'b', name: 'B', plan: 'free', timezone: 'UTC', createdAt: '2026-01-01T00:00:00Z', dataMode: 'standard' },
  ],
  activeWorkspaceId: 'a',
  socialAccounts: [
    { id: 'account-a', workspaceId: 'a', platform: 'youtube', username: 'a', displayName: 'A', status: 'connected', connectionKind: 'provider', lastSync: '' },
    { id: 'account-b', workspaceId: 'b', platform: 'youtube', username: 'b', displayName: 'B', status: 'connected', connectionKind: 'provider', lastSync: '' },
  ],
  posts: [
    { id: 'post-a', workspaceId: 'a', title: 'A', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '' },
    { id: 'post-b', workspaceId: 'b', title: 'B', destinationAccountIds: [], originalContent: { caption: '', mediaIds: [] }, platformContent: [], status: 'draft', createdAt: '' },
  ],
  mediaAssets: [
    { id: 'media-a', workspaceId: 'a', url: '', type: 'image', name: 'A', size: 1, createdAt: '', storageKind: 'remote' },
    { id: 'media-b', workspaceId: 'b', url: '', type: 'image', name: 'B', size: 1, createdAt: '', storageKind: 'remote' },
  ],
  mediaFolders: [],
  pipelineItems: [],
  experiments: [],
  analytics: [
    { id: 'metric-a', workspaceId: 'a', label: 'Reach', value: 1, change: 0, trend: 'neutral', source: 'provider' },
    { id: 'metric-b', workspaceId: 'b', label: 'Reach', value: 2, change: 0, trend: 'neutral', source: 'provider' },
  ],
  postPerformances: [
    { postId: 'post-a', workspaceId: 'a', platform: 'youtube', views: 1, reach: 1, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'provider' },
    { postId: 'post-b', workspaceId: 'b', platform: 'youtube', views: 2, reach: 2, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, ctr: 0, engagementRate: 0, followersGained: 0, publishedAt: '', source: 'provider' },
  ],
};

test('workspace selectors never return records owned by another workspace', () => {
  assert.deepEqual(getWorkspacePosts(state).map((item) => item.id), ['post-a']);
  assert.deepEqual(getWorkspaceAccounts(state).map((item) => item.id), ['account-a']);
  assert.deepEqual(getWorkspaceMedia(state).map((item) => item.id), ['media-a']);
  assert.deepEqual(getWorkspaceAnalytics(state).map((item) => item.id), ['metric-a']);
  assert.deepEqual(getWorkspacePerformance(state).map((item) => item.postId), ['post-a']);
});

test('analytics fallback never invents reach, engagement, or follower growth', () => {
  const noAnalyticsState: AppState = {
    ...state,
    analytics: [],
    posts: state.posts.map((post) =>
      post.id === 'post-a' ? { ...post, status: 'published' } : post,
    ),
  };

  const metrics = getWorkspaceAnalytics(noAnalyticsState);
  const byLabel = new Map(metrics.map((metric) => [metric.label, metric]));

  assert.equal(byLabel.get('Total Reach')?.value, 0);
  assert.equal(byLabel.get('Engagement Rate')?.value, 0);
  assert.equal(byLabel.get('Follower Growth')?.value, 0);
  assert.equal(byLabel.get('Published Posts')?.value, 1);
  assert.ok(metrics.every((metric) => metric.change === 0));
  assert.ok(metrics.every((metric) => metric.source === 'local'));
});
