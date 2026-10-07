import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countInvalidMediaReferences,
  sanitizeComposerContent,
  sanitizeMediaIds,
} from './composerContent';

test('removes duplicate and foreign media ids while preserving order', () => {
  const result = sanitizeMediaIds(
    ['a', 'a', 'foreign', 'b'],
    new Set(['a', 'b']),
  );

  assert.deepEqual(result.mediaIds, ['a', 'b']);
  assert.equal(result.removedCount, 2);
});

test('sanitizes base and selected platform content only', () => {
  const result = sanitizeComposerContent(
    { caption: 'Base', mediaIds: ['a', 'foreign'] },
    [
      {
        platform: 'instagram',
        enabled: true,
        content: { caption: 'IG', mediaIds: ['b', 'b'] },
      },
      {
        platform: 'youtube',
        enabled: true,
        content: { caption: 'YT', mediaIds: ['a'] },
      },
    ],
    new Set(['a', 'b']),
    new Set(['instagram']),
  );

  assert.deepEqual(result.baseContent.mediaIds, ['a']);
  assert.deepEqual(result.platformContent, [
    {
      platform: 'instagram',
      enabled: true,
      content: { caption: 'IG', mediaIds: ['b'] },
    },
  ]);
  assert.equal(result.removedMediaReferenceCount, 2);
});

test('counts invalid media references without mutating content', () => {
  const base = { caption: 'Base', mediaIds: ['a', 'missing'] };
  const platform = [
    {
      platform: 'instagram' as const,
      enabled: true,
      content: { caption: 'IG', mediaIds: ['a', 'a'] },
    },
  ];

  const count = countInvalidMediaReferences(
    base,
    platform,
    new Set(['a']),
  );

  assert.equal(count, 2);
  assert.deepEqual(base.mediaIds, ['a', 'missing']);
});
