import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countInvalidMediaReferences,
  getEffectiveComposerContent,
  resetPlatformContentOverride,
  sanitizeComposerContent,
  sanitizeMediaIds,
  setPlatformContentOverride,
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


test('platform overrides stay independent when base content changes', () => {
  const base = { caption: 'Base v1', mediaIds: ['base-media'] };
  let overrides = {};

  overrides = setPlatformContentOverride(overrides, 'instagram', {
    caption: 'Instagram custom',
    mediaIds: ['ig-media'],
  });

  const updatedBase = { caption: 'Base v2', mediaIds: ['base-media-2'] };

  assert.deepEqual(
    getEffectiveComposerContent(updatedBase, overrides, 'instagram'),
    { caption: 'Instagram custom', mediaIds: ['ig-media'] },
  );
  assert.deepEqual(
    getEffectiveComposerContent(updatedBase, overrides, 'youtube'),
    updatedBase,
  );
});

test('resetting an override restores inheritance without mutating the previous map', () => {
  const original = setPlatformContentOverride({}, 'instagram', {
    caption: 'Custom',
    mediaIds: ['a'],
  });

  const reset = resetPlatformContentOverride(original, 'instagram');

  assert.equal(original.instagram?.content.caption, 'Custom');
  assert.equal(reset.instagram, undefined);
  assert.deepEqual(
    getEffectiveComposerContent({ caption: 'Base', mediaIds: [] }, reset, 'instagram'),
    { caption: 'Base', mediaIds: [] },
  );
});

test('setting an override clones media ids to avoid shared mutation with base content', () => {
  const base = { caption: 'Base', mediaIds: ['a'] };
  const overrides = setPlatformContentOverride({}, 'instagram', base);

  base.mediaIds.push('b');

  assert.deepEqual(overrides.instagram?.content.mediaIds, ['a']);
});
