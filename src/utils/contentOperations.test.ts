import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentItem, Post } from '../types';
import {
  movePipelineItem,
  removeMediaReferenceFromPost,
  syncPipelineStageFromPost,
} from './contentOperations';

const items: ContentItem[] = [
  {
    id: 'a',
    workspaceId: 'w',
    title: 'A',
    stage: 'ready',
    platforms: ['instagram'],
    format: 'short',
    owner: 'Creator',
    tags: [],
    order: 0,
  },
  {
    id: 'b',
    workspaceId: 'w',
    title: 'B',
    stage: 'ready',
    platforms: ['instagram'],
    format: 'short',
    owner: 'Creator',
    tags: [],
    order: 1,
  },
  {
    id: 'c',
    workspaceId: 'w',
    title: 'C',
    stage: 'scheduled',
    platforms: ['youtube'],
    format: 'long',
    owner: 'Creator',
    tags: [],
    order: 0,
  },
];

test('moving between pipeline stages normalizes both source and target order', () => {
  const result = movePipelineItem(items, 'a', 'scheduled', 1);

  const ready = result
    .filter((item) => item.stage === 'ready')
    .sort((a, b) => a.order - b.order);
  const scheduled = result
    .filter((item) => item.stage === 'scheduled')
    .sort((a, b) => a.order - b.order);

  assert.deepEqual(ready.map((item) => [item.id, item.order]), [['b', 0]]);
  assert.deepEqual(
    scheduled.map((item) => [item.id, item.order]),
    [['c', 0], ['a', 1]],
  );
});

test('reordering within a stage produces contiguous deterministic order', () => {
  const result = movePipelineItem(items, 'b', 'ready', 0);
  const ready = result
    .filter((item) => item.stage === 'ready')
    .sort((a, b) => a.order - b.order);

  assert.deepEqual(
    ready.map((item) => [item.id, item.order]),
    [['b', 0], ['a', 1]],
  );
});

test('scheduled posts move their source content item to scheduled', () => {
  const post: Post = {
    id: 'post',
    workspaceId: 'w',
    title: 'Post',
    destinationAccountIds: [],
    originalContent: { caption: 'x', mediaIds: [] },
    platformContent: [],
    status: 'scheduled',
    scheduledAt: '2026-10-08T12:00:00.000Z',
    createdAt: '2026-10-07T12:00:00.000Z',
    sourceContentItemId: 'a',
  };

  const result = syncPipelineStageFromPost(items, post);
  const source = result.find((item) => item.id === 'a');

  assert.equal(source?.stage, 'scheduled');
});

test('draft posts do not move their source pipeline item', () => {
  const post: Post = {
    id: 'post',
    workspaceId: 'w',
    title: 'Post',
    destinationAccountIds: [],
    originalContent: { caption: 'x', mediaIds: [] },
    platformContent: [],
    status: 'draft',
    createdAt: '2026-10-07T12:00:00.000Z',
    sourceContentItemId: 'a',
  };

  const result = syncPipelineStageFromPost(items, post);
  assert.equal(result, items);
});

test('removing a media asset clears base and platform references', () => {
  const post: Post = {
    id: 'post',
    workspaceId: 'w',
    title: 'Post',
    destinationAccountIds: [],
    originalContent: { caption: 'x', mediaIds: ['a', 'b'] },
    platformContent: [
      {
        platform: 'instagram',
        enabled: true,
        content: { caption: 'ig', mediaIds: ['b', 'c'] },
      },
    ],
    status: 'draft',
    createdAt: '',
  };

  const result = removeMediaReferenceFromPost(post, 'b');

  assert.deepEqual(result.originalContent.mediaIds, ['a']);
  assert.deepEqual(result.platformContent[0].content.mediaIds, ['c']);
});
