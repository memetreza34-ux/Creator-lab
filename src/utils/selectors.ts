import {
  AnalyticsMetric,
  AppState,
  ContentItem,
  Experiment,
  MediaAsset,
  MediaFolder,
  Platform,
  Post,
  PostContent,
  PostDestination,
  PostPerformance,
  SocialAccount,
} from '../types';

export const getWorkspacePosts = (state: AppState): Post[] =>
  state.posts.filter((post) => post.workspaceId === state.activeWorkspaceId);

export const getWorkspaceMedia = (state: AppState): MediaAsset[] =>
  state.mediaAssets.filter((asset) => asset.workspaceId === state.activeWorkspaceId);

export const getWorkspaceAccounts = (state: AppState): SocialAccount[] =>
  state.socialAccounts.filter((account) => account.workspaceId === state.activeWorkspaceId);

export const getWorkspacePipelineItems = (state: AppState): ContentItem[] =>
  state.pipelineItems
    .filter((item) => item.workspaceId === state.activeWorkspaceId)
    .sort((a, b) => a.order - b.order);

export const getWorkspaceExperiments = (state: AppState): Experiment[] =>
  state.experiments.filter(
    (experiment) => experiment.workspaceId === state.activeWorkspaceId,
  );

export const getWorkspaceAnalytics = (state: AppState): AnalyticsMetric[] => {
  const scopedAnalytics = state.analytics.filter(
    (metric) => metric.workspaceId === state.activeWorkspaceId,
  );

  if (scopedAnalytics.length > 0) return scopedAnalytics;

  const posts = getWorkspacePosts(state);
  const performances = state.postPerformances.filter(
    (performance) => performance.workspaceId === state.activeWorkspaceId,
  );
  const publishedCount = posts.filter((post) => post.status === 'published').length;

  if (performances.length === 0) {
    return [
      { id: 'm-empty-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: 0, change: 0, trend: 'neutral', source: 'derived' },
      { id: 'm-empty-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: 0, change: 0, trend: 'neutral', source: 'derived' },
      { id: 'm-empty-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: 0, change: 0, trend: 'neutral', source: 'derived' },
      { id: 'm-empty-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: publishedCount, change: 0, trend: 'neutral', source: 'derived' },
    ];
  }

  const totalReach = performances.reduce(
    (total, performance) => total + performance.reach,
    0,
  );
  const engagementRate =
    performances.reduce(
      (total, performance) => total + performance.engagementRate,
      0,
    ) / performances.length;
  const followerGrowth = performances.reduce(
    (total, performance) => total + performance.followersGained,
    0,
  );

  const source: AnalyticsMetric['source'] = performances.some(
    (performance) => performance.source === 'demo',
  )
    ? 'demo'
    : performances.every((performance) => performance.source === 'provider')
      ? 'provider'
      : 'derived';

  return [
    { id: 'm-derived-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: totalReach, change: 0, trend: 'neutral', source },
    { id: 'm-derived-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: Number(engagementRate.toFixed(1)), change: 0, trend: 'neutral', source },
    { id: 'm-derived-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: followerGrowth, change: 0, trend: 'neutral', source },
    { id: 'm-derived-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: publishedCount, change: 0, trend: 'neutral', source },
  ];
};

export const getWorkspaceMediaFolders = (state: AppState): MediaFolder[] =>
  state.mediaFolders.filter((folder) => folder.workspaceId === state.activeWorkspaceId);

export const getWorkspacePerformance = (state: AppState): PostPerformance[] =>
  state.postPerformances.filter(
    (performance) => performance.workspaceId === state.activeWorkspaceId,
  );

export const getPostDestinationAccounts = (
  post: Post,
  socialAccounts: SocialAccount[],
): SocialAccount[] =>
  socialAccounts.filter((account) => post.destinationAccountIds.includes(account.id));

export const getPostPlatforms = (
  post: Post,
  socialAccounts: SocialAccount[],
  destinationSnapshots: PostDestination[] = [],
): Platform[] => {
  const accounts = getPostDestinationAccounts(post, socialAccounts);
  const snapshots = destinationSnapshots.filter(
    (destination) =>
      destination.postId === post.id &&
      destination.workspaceId === post.workspaceId,
  );
  return Array.from(new Set<Platform>([
    ...(post.planningPlatforms || []),
    ...accounts.map((account) => account.platform),
    ...snapshots.map((destination) => destination.platform),
  ]));
};

export const getPostDestinationHistory = (
  state: AppState,
  postId: string,
): PostDestination[] => state.postDestinations.filter(
  (destination) =>
    destination.postId === postId &&
    destination.workspaceId === state.activeWorkspaceId &&
    state.posts.some(
      (post) =>
        post.id === postId &&
        post.workspaceId === state.activeWorkspaceId,
    ),
);

export const getContentForPlatform = (
  post: Post,
  platform: Platform,
): PostContent => {
  const platformContent = post.platformContent.find(
    (content) => content.platform === platform && content.enabled,
  );
  return platformContent?.content || post.originalContent;
};


export const getPostsForContentItem = (
  state: AppState,
  contentItemId: string,
): Post[] =>
  getWorkspacePosts(state).filter(
    (post) => post.sourceContentItemId === contentItemId,
  );

export const getSourceContentItemForPost = (
  state: AppState,
  post: Post,
): ContentItem | undefined => {
  if (!post.sourceContentItemId) return undefined;

  return state.pipelineItems.find(
    (item) =>
      item.workspaceId === state.activeWorkspaceId &&
      item.id === post.sourceContentItemId,
  );
};

export const getPostsUsingMedia = (
  state: AppState,
  mediaAssetId: string,
): Post[] =>
  getWorkspacePosts(state).filter((post) => {
    if (post.originalContent.mediaIds.includes(mediaAssetId)) return true;

    return post.platformContent.some((entry) =>
      entry.content.mediaIds.includes(mediaAssetId),
    );
  });

export const getPostsUsingAccount = (
  state: AppState,
  socialAccountId: string,
): Post[] =>
  getWorkspacePosts(state).filter((post) =>
    post.destinationAccountIds.includes(socialAccountId),
  );
