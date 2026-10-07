import { Platform, PlatformSpecificContent, PostContent } from '../types';

export interface SanitizedComposerContent {
  baseContent: PostContent;
  platformContent: PlatformSpecificContent[];
  removedMediaReferenceCount: number;
}

export function sanitizeMediaIds(
  mediaIds: string[],
  allowedMediaIds: ReadonlySet<string>,
): { mediaIds: string[]; removedCount: number } {
  const seen = new Set<string>();
  const mediaIdsOut: string[] = [];
  let removedCount = 0;

  for (const mediaId of mediaIds) {
    if (!allowedMediaIds.has(mediaId) || seen.has(mediaId)) {
      removedCount += 1;
      continue;
    }

    seen.add(mediaId);
    mediaIdsOut.push(mediaId);
  }

  return { mediaIds: mediaIdsOut, removedCount };
}

export function sanitizePostContent(
  content: PostContent,
  allowedMediaIds: ReadonlySet<string>,
): { content: PostContent; removedCount: number } {
  const sanitized = sanitizeMediaIds(content.mediaIds, allowedMediaIds);

  return {
    content: {
      ...content,
      mediaIds: sanitized.mediaIds,
    },
    removedCount: sanitized.removedCount,
  };
}

export function sanitizeComposerContent(
  baseContent: PostContent,
  platformContent: PlatformSpecificContent[],
  allowedMediaIds: ReadonlySet<string>,
  selectedPlatforms: ReadonlySet<Platform>,
): SanitizedComposerContent {
  const sanitizedBase = sanitizePostContent(baseContent, allowedMediaIds);
  let removedMediaReferenceCount = sanitizedBase.removedCount;

  const sanitizedPlatformContent = platformContent
    .filter((entry) => selectedPlatforms.has(entry.platform))
    .map((entry) => {
      const sanitized = sanitizePostContent(entry.content, allowedMediaIds);
      removedMediaReferenceCount += sanitized.removedCount;

      return {
        ...entry,
        enabled: true,
        content: sanitized.content,
      };
    });

  return {
    baseContent: sanitizedBase.content,
    platformContent: sanitizedPlatformContent,
    removedMediaReferenceCount,
  };
}

export function countInvalidMediaReferences(
  baseContent: PostContent,
  platformContent: PlatformSpecificContent[],
  allowedMediaIds: ReadonlySet<string>,
): number {
  let invalidCount = sanitizeMediaIds(
    baseContent.mediaIds,
    allowedMediaIds,
  ).removedCount;

  for (const entry of platformContent) {
    invalidCount += sanitizeMediaIds(
      entry.content.mediaIds,
      allowedMediaIds,
    ).removedCount;
  }

  return invalidCount;
}
