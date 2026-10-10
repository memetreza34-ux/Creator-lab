import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCloudDraftPayload, isEditableTextDraft, readCloudDraft, type CloudDraftInput } from './cloudDrafts';

const sourceId = 'a2278121-80d3-4696-a655-bd02188bcb3f';
const draft: CloudDraftInput = {
  title: '  Focus video  ',
  caption: 'Base caption',
  sourceContentItemId: sourceId,
  variants: [
    { platform: 'youtube', caption: 'Long description' },
    { platform: 'instagram', caption: 'Short reels caption' },
  ],
};

test('draft is converted to trusted text-only schema without media or status flags', () => {
  const data = buildCloudDraftPayload(draft);
  assert.deepEqual(data, {
    title: 'Focus video',
    original_content: { caption: 'Base caption', mediaIds: [] },
    platform_content: [
      { platform: 'youtube', content: { caption: 'Long description', mediaIds: [] }, enabled: true },
      { platform: 'instagram', content: { caption: 'Short reels caption', mediaIds: [] }, enabled: true },
    ],
    source_content_item_id: sourceId,
  });
  assert.ok(!('status' in data));
  assert.ok(!('scheduled_at' in data));
  assert.ok(!('published_at' in data));
  assert.ok(!('provider_post_id' in data));
});

test('composer refuses forged privileged, provider or media fields', () => {
  const invalidInputs = [
    { ...draft, status: 'published' },
    { ...draft, scheduled_at: '2026-10-10T12:00:00Z' },
    { ...draft, published_at: '2026-10-10T12:00:00Z' },
    { ...draft, workspace_id: 'someone-else' },
    { ...draft, variants: [{ platform: 'youtube', caption: 'a', mediaIds: ['external-media'] }] },
    { ...draft, variants: [{ platform: 'youtube', caption: 'a', providerAccountId: 'external' }] },
  ];
  for (const bad of invalidInputs) {
    assert.throws(() => buildCloudDraftPayload(bad as CloudDraftInput),
      /Invalid draft fields|Invalid or duplicate/);
  }
});

test('composer validates bounds, source IDs, and distinct platform variants', () => {
  const cases: Array<Partial<CloudDraftInput>> = [
    { title: '  ' }, { title: 'x'.repeat(241) },
    { caption: 'x'.repeat(6001) },
    { sourceContentItemId: 'foreign-not-uuid' },
    { variants: [{ platform: 'youtube', caption: 'one' }, { platform: 'youtube', caption: 'two' }] },
    { variants: [{ platform: 'twitch' as never, caption: 'invalid' }] },
    { variants: [{ platform: 'youtube', caption: 'x'.repeat(6001) }] },
  ];
  for (const override of cases) {
    assert.throws(() => buildCloudDraftPayload({ ...draft, ...override }), /Draft|Invalid|Too many/);
  }
});

test('empty text and zero destination variants are valid draft-only content', () => {
  const value = buildCloudDraftPayload({
    title: 'Empty script idea', caption: '', sourceContentItemId: null, variants: [],
  });
  assert.equal(value.original_content.caption, '');
  assert.deepEqual(value.platform_content, []);
  assert.equal(value.source_content_item_id, null);
});

test('safely loads legacy/malformed server JSON without trusting media or provider IDs', () => {
  const parsed = readCloudDraft({
    title: 'Existing idea',
    source_content_item_id: sourceId,
    original_content: { caption: 'written only', mediaIds: ['legacy'] },
    platform_content: [
      { platform: 'youtube', enabled: false, content: { caption: 'YT', mediaIds: ['legacy'] } },
      { platform: 'youtube', content: { caption: 'duplicate' } },
      { platform: 'impossible', content: { caption: 'external' } },
      null, {}, { platform: 'instagram', content: { caption: 22 } },
    ],
  });
  assert.deepEqual(parsed, {
    title: 'Existing idea', caption: 'written only', sourceContentItemId: sourceId,
    variants: [{ platform: 'youtube', caption: 'YT' }],
  });
  assert.deepEqual(readCloudDraft({
    title: 'Untouched', source_content_item_id: null,
    original_content: null, platform_content: 'corrupted',
  }), { title: 'Untouched', caption: '', sourceContentItemId: null, variants: [] });
});


test('text-only draft editability rejects media-bearing, disabled and malformed variants', () => {
  const clean = {
    status: 'draft',
    title: 'A real cloud draft',
    source_content_item_id: null,
    original_content: { caption: 'text', mediaIds: [] },
    platform_content: [{ platform: 'youtube', enabled: true,
      content: { caption: 'youtube', mediaIds: [] } }],
  };
  assert.equal(isEditableTextDraft(clean), true);
  const unsafe = [
    { ...clean, status: 'published' },
    { ...clean, original_content: { caption: 'text', mediaIds: ['asset.jpg'] } },
    { ...clean, platform_content: [{ platform: 'youtube', enabled: false,
      content: { caption: 'youtube', mediaIds: [] } }] },
    { ...clean, platform_content: [{ platform: 'youtube', enabled: true,
      content: { caption: 'youtube', mediaIds: ['asset.jpg'] } }] },
    { ...clean, platform_content: [
      { platform: 'youtube', enabled: true, content: { caption: 'first', mediaIds: [] } },
      { platform: 'youtube', enabled: true, content: { caption: 'second', mediaIds: [] } },
    ] },
    { ...clean, original_content: {} },
  ];
  for (const record of unsafe) assert.equal(isEditableTextDraft(record), false);
});
