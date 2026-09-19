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
  const posts = getWorkspacePosts(state);
  const accounts = getWorkspaceAccounts(state);
  const scopedAnalytics = state.analytics.filter(
    (metric) => metric.workspaceId === state.activeWorkspaceId,
  );

  if (scopedAnalytics.length > 0) return scopedAnalytics;

  if (posts.length === 0 && accounts.length === 0) {
    return [
      { id: 'm-empty-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: 0, change: 0, trend: 'neutral' },
    ];
  }

  const publishedCount = posts.filter((post) => post.status === 'published').length;
  return [
    { id: 'm-calc-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: publishedCount * 12500, change: 8.4, trend: 'up' },
    { id: 'm-calc-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: publishedCount > 0 ? 5.1 : 0, change: publishedCount > 0 ? 0.6 : 0, trend: publishedCount > 0 ? 'up' : 'neutral' },
    { id: 'm-calc-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: accounts.length * 450, change: accounts.length > 0 ? 4.2 : 0, trend: accounts.length > 0 ? 'up' : 'neutral' },
    { id: 'm-calc-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: publishedCount, change: publishedCount > 0 ? 2.0 : 0, trend: publishedCount > 0 ? 'up' : 'neutral' },
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
): Platform[] => {
  const accounts = getPostDestinationAccounts(post, socialAccounts);
  return Array.from(new Set<Platform>(accounts.map((account) => account.platform)));
};

export const getContentForPlatform = (
  post: Post,
  platform: Platform,
): PostContent => {
  const platformContent = post.platformContent.find(
    (content) => content.platform === platform && content.enabled,
  );
  return platformContent?.content || post.originalContent;
};
