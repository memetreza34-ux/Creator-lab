import {
  Platform,
  Post,
  PostDestination,
  SocialAccount,
} from '../types';

const PLATFORMS: Platform[] = [
  'youtube', 'instagram', 'tiktok', 'twitter',
  'linkedin', 'facebook', 'pinterest', 'threads',
];

export function destinationId(postId: string, accountId: string): string {
  return `destination:${JSON.stringify([postId, accountId])}`;
}

export function createPostDestination(
  post: Post,
  account: SocialAccount,
): PostDestination {
  return {
    id: destinationId(post.id, account.id),
    workspaceId: post.workspaceId,
    postId: post.id,
    socialAccountId: account.id,
    platform: account.platform,
    accountLabel: account.displayName,
    accountHandle: account.username,
    connectionMode: account.connectionMode,
    status: post.status,
    scheduledAt: post.status === 'scheduled' ? post.scheduledAt : undefined,
    publishedAt: post.status === 'published' ? post.publishedAt : undefined,
  };
}

/**
 * Synchronize active destinations with the Post's current selection.
 * A published destination is historical and is never discarded by editing
 * destination selection. Detached needs_review rows remain for transparency.
 */
export function syncPostDestinations(
  all: PostDestination[],
  post: Post,
  accounts: SocialAccount[],
): PostDestination[] {
  const samePost = all.filter(
    (destination) =>
      destination.postId === post.id &&
      destination.workspaceId === post.workspaceId,
  );
  const otherPosts = all.filter(
    (destination) =>
      destination.postId !== post.id ||
      destination.workspaceId !== post.workspaceId,
  );
  const selected = [...new Set(post.destinationAccountIds)];
  const active: PostDestination[] = [];

  for (const accountId of selected) {
    const account = accounts.find(
      (candidate) =>
        candidate.id === accountId &&
        candidate.workspaceId === post.workspaceId,
    );
    if (!account) continue;

    const old = samePost.find(
      (destination) => destination.socialAccountId === accountId,
    );

    // A previously published destination is a historical event, not a
    // fresh schedule or draft just because the parent Post was edited.
    if (old?.status === 'published') {
      active.push(old);
      continue;
    }

    active.push({
      ...createPostDestination(post, account),
      id: old?.id || destinationId(post.id, account.id),
      providerPostId: old?.providerPostId,
      lastError: old?.lastError,
    });
  }

  const activeIds = new Set(active.map((destination) => destination.id));
  const preservedHistory = samePost.filter(
    (destination) =>
      !activeIds.has(destination.id) &&
      (destination.status === 'published' ||
        (destination.status === 'needs_review' &&
          !destination.socialAccountId)),
  );

  return [...otherPosts, ...active, ...preservedHistory];
}

/** Remove an account while keeping published history and review records. */
export function detachSocialAccount(
  all: PostDestination[],
  accountId: string,
): PostDestination[] {
  return all.flatMap((destination) => {
    if (destination.socialAccountId !== accountId) return [destination];

    if (destination.status === 'draft') return [];

    if (destination.status === 'published') {
      return [{ ...destination, socialAccountId: undefined }];
    }

    return [{
      ...destination,
      socialAccountId: undefined,
      status: 'needs_review' as const,
      scheduledAt: undefined,
      lastError: 'Destination account was removed. Reconnect and review before publishing.',
    }];
  });
}

/** Normalize persisted destination snapshots, enforcing parent workspace. */
export function hydratePostDestinations(
  posts: Post[],
  accounts: SocialAccount[],
  raw: unknown,
): PostDestination[] {
  const postById = new Map(posts.map((post) => [post.id, post]));
  const restored: PostDestination[] = [];
  const seenIds = new Set<string>();

  if (Array.isArray(raw)) {
    for (const candidate of raw) {
      if (!candidate || typeof candidate !== 'object') continue;
      const value = candidate as Partial<PostDestination>;
      const post = typeof value.postId === 'string'
        ? postById.get(value.postId)
        : undefined;

      if (
        !post ||
        value.workspaceId !== post.workspaceId ||
        typeof value.id !== 'string' ||
        seenIds.has(value.id) ||
        !PLATFORMS.includes(value.platform as Platform) ||
        typeof value.accountLabel !== 'string' ||
        typeof value.accountHandle !== 'string' ||
        !['draft', 'scheduled', 'published', 'failed', 'needs_review'].includes(value.status || '')
      ) {
        continue;
      }

      const account = accounts.find(
        (item) =>
          item.id === value.socialAccountId &&
          item.workspaceId === post.workspaceId &&
          item.platform === value.platform,
      );

      seenIds.add(value.id);
      restored.push({
        id: value.id,
        workspaceId: post.workspaceId,
        postId: post.id,
        socialAccountId: account?.id,
        platform: value.platform as Platform,
        accountLabel: value.accountLabel,
        accountHandle: value.accountHandle,
        connectionMode: value.connectionMode === 'oauth' ? 'oauth' : 'demo',
        status: value.status as PostDestination['status'],
        scheduledAt: typeof value.scheduledAt === 'string' ? value.scheduledAt : undefined,
        publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : undefined,
        providerPostId: typeof value.providerPostId === 'string' ? value.providerPostId : undefined,
        lastError: typeof value.lastError === 'string' ? value.lastError : undefined,
      });
    }
  }

  return posts.reduce(
    (destinations, post) =>
      syncPostDestinations(destinations, post, accounts),
    restored,
  );
}
