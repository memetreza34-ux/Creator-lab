import { CLOUD_CONTENT_PLATFORMS, type CloudContentPlatform } from './cloudPlatforms';

export type CloudDraftInput = {
  title: string;
  caption: string;
  sourceContentItemId: string | null;
  variants: Array<{ platform: CloudContentPlatform; caption: string }>;
};

/** Local preparation only; the server is the authority for permission and persistence. */
export type CloudDraftPayload = {
  title: string;
  original_content: { caption: string; mediaIds: [] };
  platform_content: Array<{
    platform: CloudContentPlatform;
    content: { caption: string; mediaIds: [] };
    enabled: true;
  }>;
  source_content_item_id: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CAPTION_CHARS = 6000;

export function buildCloudDraftPayload(input: CloudDraftInput): CloudDraftPayload {
  if (!input || typeof input !== 'object' ||
      Object.keys(input).sort().join(',') !== 'caption,sourceContentItemId,title,variants') {
    throw new Error('Invalid draft fields');
  }
  if (typeof input.title !== 'string' ||
      input.title.trim().length < 1 || input.title.trim().length > 240) {
    throw new Error('Draft title must contain 1 to 240 characters');
  }
  if (typeof input.caption !== 'string' || input.caption.length > MAX_CAPTION_CHARS) {
    throw new Error('Draft caption must contain at most 6000 characters');
  }
  if (input.sourceContentItemId !== null &&
      (typeof input.sourceContentItemId !== 'string' ||
       !UUID.test(input.sourceContentItemId))) {
    throw new Error('Invalid source pipeline item');
  }
  if (!Array.isArray(input.variants) || input.variants.length > CLOUD_CONTENT_PLATFORMS.length) {
    throw new Error('Too many platform variants');
  }
  const seen = new Set<CloudContentPlatform>();
  const variants = input.variants.map((variant) => {
    if (!variant || typeof variant !== 'object' ||
        Object.keys(variant).sort().join(',') !== 'caption,platform' ||
        !CLOUD_CONTENT_PLATFORMS.includes(variant.platform) || seen.has(variant.platform) ||
        typeof variant.caption !== 'string' || variant.caption.length > MAX_CAPTION_CHARS) {
      throw new Error('Invalid or duplicate draft platform variant');
    }
    seen.add(variant.platform);
    return {
      platform: variant.platform,
      content: { caption: variant.caption, mediaIds: [] as [] },
      enabled: true as const,
    };
  });
  return {
    title: input.title.trim(),
    original_content: { caption: input.caption, mediaIds: [] },
    platform_content: variants,
    source_content_item_id: input.sourceContentItemId,
  };
}


/** Refuse to edit/delete legacy drafts with media or unsupported JSON shapes.
 * Saving those through the text-only pilot would silently discard attachments.
 */
export function isEditableTextDraft(post: {
  status: string;
  title: string;
  original_content: unknown;
  platform_content: unknown;
  source_content_item_id: string | null;
}): boolean {
  if (post.status !== 'draft' || typeof post.title !== 'string' ||
      !post.title.trim() || post.title.length > 240 ||
      (post.source_content_item_id !== null &&
       !UUID.test(post.source_content_item_id))) return false;
  const raw = post.original_content;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const base = raw as Record<string, unknown>;
  if (typeof base.caption !== 'string' || base.caption.length > MAX_CAPTION_CHARS ||
      !Array.isArray(base.mediaIds) || base.mediaIds.length !== 0) return false;
  if (!Array.isArray(post.platform_content) ||
      post.platform_content.length > CLOUD_CONTENT_PLATFORMS.length) return false;
  const seen = new Set<string>();
  for (const item of post.platform_content) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const variant = item as Record<string, unknown>;
    if (typeof variant.platform !== 'string' ||
        !CLOUD_CONTENT_PLATFORMS.includes(variant.platform as CloudContentPlatform) ||
        variant.enabled !== true || seen.has(variant.platform)) return false;
    seen.add(variant.platform);
    const body = variant.content;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
    const data = body as Record<string, unknown>;
    if (typeof data.caption !== 'string' || data.caption.length > MAX_CAPTION_CHARS ||
        !Array.isArray(data.mediaIds) || data.mediaIds.length !== 0) return false;
  }
  return true;
}

/**
 * Defensive display parsing only. Never trusts arbitrary backend JSON to
 * contain supported media URLs or provider-published outcomes.
 */
export function readCloudDraft(post: {
  title: string;
  original_content: unknown;
  platform_content: unknown;
  source_content_item_id: string | null;
}): CloudDraftInput {
  const body = post.original_content;
  const original = body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown> : {};
  const variants: CloudDraftInput['variants'] = [];
  const entries = Array.isArray(post.platform_content) ? post.platform_content : [];
  for (const item of entries) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const content = record.content;
    const caption = content && typeof content === 'object' && !Array.isArray(content)
      ? (content as Record<string, unknown>).caption : '';
    const platform = record.platform;
    if (typeof platform !== 'string' ||
        !CLOUD_CONTENT_PLATFORMS.includes(platform as CloudContentPlatform) ||
        typeof caption !== 'string' || variants.some((entry) => entry.platform === platform)) {
      continue;
    }
    variants.push({ platform: platform as CloudContentPlatform, caption });
  }
  return {
    title: post.title,
    caption: typeof original.caption === 'string' ? original.caption : '',
    sourceContentItemId: post.source_content_item_id,
    variants,
  };
}
