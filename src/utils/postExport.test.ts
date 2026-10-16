import assert from 'node:assert/strict';
import test from 'node:test';
import { Post } from '../types';
import { formatPostForManualExport, safePostExportFilename } from './postExport';

const sample: Post = {
  id: 'post-1', workspaceId: 'workspace-1', title: 'My example',
  destinationAccountIds: [], status: 'draft', createdAt: '2026-10-15T12:00:00Z',
  originalContent: { caption: 'Hello everyone', mediaIds: [] },
  planningPlatforms: ['youtube'],
  platformContent: [{ platform: 'youtube', enabled: true, content: { caption: 'Hello YouTube', mediaIds: [] } }],
};

test('manual export includes actual text and an explicit not-published statement', () => {
  const result = formatPostForManualExport(sample);
  assert.match(result, /Hello everyone/);
  assert.match(result, /Hello YouTube/);
  assert.match(result, /NOT been sent/);
  assert.doesNotMatch(result, /LOCAL PLAN/);
});

test('manual planned date is labeled as reminder, not publication', () => {
  const result = formatPostForManualExport({ ...sample, status: 'scheduled', scheduledAt: '2026-11-01T18:00:00Z' });
  assert.match(result, /This is a reminder, not an automatic publish job/);
});

test('export filename strips unsafe characters and handles blank titles', () => {
  assert.equal(safePostExportFilename('../../Bad:Name?'), 'Bad-Name.txt');
  assert.equal(safePostExportFilename('...'), 'creator-lab-post.txt');
  assert.equal(safePostExportFilename(' My Post '), 'My Post.txt');
});

test('a manual target without an override inherits the base caption', () => {
  const result = formatPostForManualExport({
    ...sample,
    planningPlatforms: ['instagram'],
    platformContent: [],
  });
  assert.match(result, /INSTAGRAM VERSION\nHello everyone/);
});
