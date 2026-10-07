import {
  ContentItem,
  PipelineStage,
  Post,
} from '../types';

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

function sortByOrder(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeOrder(items: ContentItem[]): ContentItem[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function movePipelineItem(
  items: ContentItem[],
  itemId: string,
  targetStage: PipelineStage,
  targetIndex: number,
): ContentItem[] {
  const dragged = items.find((item) => item.id === itemId);
  if (!dragged) return items;

  const sourceStage = dragged.stage;

  if (sourceStage === targetStage) {
    const column = sortByOrder(
      items.filter((item) => item.stage === sourceStage),
    );
    const oldIndex = column.findIndex((item) => item.id === itemId);
    if (oldIndex === -1) return items;

    const [moved] = column.splice(oldIndex, 1);
    column.splice(clampIndex(targetIndex, column.length), 0, moved);
    const normalized = normalizeOrder(column);
    const replacements = new Map(normalized.map((item) => [item.id, item]));

    return items.map((item) => replacements.get(item.id) || item);
  }

  const normalizedSource = normalizeOrder(
    sortByOrder(
      items.filter(
        (item) => item.stage === sourceStage && item.id !== itemId,
      ),
    ),
  );

  const targetColumn = sortByOrder(
    items.filter(
      (item) => item.stage === targetStage && item.id !== itemId,
    ),
  );

  targetColumn.splice(
    clampIndex(targetIndex, targetColumn.length),
    0,
    { ...dragged, stage: targetStage },
  );

  const normalizedTarget = normalizeOrder(targetColumn);
  const replacements = new Map(
    [...normalizedSource, ...normalizedTarget].map((item) => [item.id, item]),
  );

  return items.map((item) => replacements.get(item.id) || item);
}

export function syncPipelineStageFromPost(
  items: ContentItem[],
  post: Post,
): ContentItem[] {
  if (!post.sourceContentItemId) return items;

  const targetStage: PipelineStage | undefined =
    post.status === 'scheduled'
      ? 'scheduled'
      : post.status === 'published'
        ? 'published'
        : undefined;

  if (!targetStage) return items;

  const sourceItem = items.find(
    (item) =>
      item.id === post.sourceContentItemId &&
      item.workspaceId === post.workspaceId,
  );

  if (!sourceItem || sourceItem.stage === targetStage) {
    return items;
  }

  const targetLength = items.filter(
    (item) =>
      item.workspaceId === post.workspaceId &&
      item.stage === targetStage,
  ).length;

  return movePipelineItem(
    items,
    sourceItem.id,
    targetStage,
    targetLength,
  );
}

export function removeMediaReferenceFromPost(
  post: Post,
  mediaAssetId: string,
): Post {
  const baseMediaIds = post.originalContent.mediaIds.filter(
    (id) => id !== mediaAssetId,
  );
  const platformContent = post.platformContent.map((entry) => ({
    ...entry,
    content: {
      ...entry.content,
      mediaIds: entry.content.mediaIds.filter(
        (id) => id !== mediaAssetId,
      ),
    },
  }));

  const baseChanged =
    baseMediaIds.length !== post.originalContent.mediaIds.length;
  const platformChanged = platformContent.some(
    (entry, index) =>
      entry.content.mediaIds.length !==
      post.platformContent[index].content.mediaIds.length,
  );

  if (!baseChanged && !platformChanged) return post;

  return {
    ...post,
    originalContent: {
      ...post.originalContent,
      mediaIds: baseMediaIds,
    },
    platformContent,
  };
}
