import assert from 'node:assert/strict';
import test from 'node:test';
import { AppState } from '../types';
import {
  getWorkspaceAccounts,
  getWorkspaceAnalytics,
  getWorkspaceMedia,
  getContentForPlatform,
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


test('platform content inherits base content until an enabled override exists', () => {
  const post = {
    id: 'inheritance-post',
    workspaceId: 'a',
    title: 'Inheritance',
    destinationAccountIds: [],
    originalContent: { caption: 'Base caption', mediaIds: ['media-a'] },
    platformContent: [],
    status: 'draft' as const,
    createdAt: '',
  };

  assert.deepEqual(getContentForPlatform(post, 'instagram'), post.originalContent);

  const customized = {
    ...post,
    platformContent: [
      {
        platform: 'instagram' as const,
        enabled: true,
        content: { caption: 'Instagram override', mediaIds: [] },
      },
    ],
  };

  assert.deepEqual(getContentForPlatform(customized, 'instagram'), {
    caption: 'Instagram override',
    mediaIds: [],
  });
  assert.deepEqual(getContentForPlatform(customized, 'youtube'), post.originalContent);
});

test('disabled platform override falls back to base content', () => {
  const post = {
    id: 'disabled-override-post',
    workspaceId: 'a',
    title: 'Disabled override',
    destinationAccountIds: [],
    originalContent: { caption: 'Base caption', mediaIds: [] },
    platformContent: [
      {
        platform: 'instagram' as const,
        enabled: false,
        content: { caption: 'Stale override', mediaIds: [] },
      },
    ],
    status: 'draft' as const,
    createdAt: '',
  };

  assert.deepEqual(getContentForPlatform(post, 'instagram'), post.originalContent);
});
