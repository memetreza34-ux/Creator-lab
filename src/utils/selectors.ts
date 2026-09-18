import { 
  AppState, Post, SocialAccount, Platform, MediaAsset, 
  ContentItem, Experiment, AnalyticsMetric, MediaFolder, PostPerformance 
} from '../types';

export const getWorkspacePosts = (state: AppState): Post[] => 
  state.posts.filter((p: Post) => p.workspaceId === state.activeWorkspaceId);

export const getWorkspaceMedia = (state: AppState): MediaAsset[] => 
  state.mediaAssets.filter((m: MediaAsset) => m.workspaceId === state.activeWorkspaceId);

export const getWorkspaceAccounts = (state: AppState): SocialAccount[] => 
  state.socialAccounts.filter((a: SocialAccount) => a.workspaceId === state.activeWorkspaceId);

export const getWorkspacePipelineItems = (state: AppState): ContentItem[] => 
  state.pipelineItems
    .filter((i: ContentItem) => i.workspaceId === state.activeWorkspaceId)
    .sort((a: ContentItem, b: ContentItem) => a.order - b.order);

export const getWorkspaceExperiments = (state: AppState): Experiment[] => 
  state.experiments.filter((e: Experiment) => e.workspaceId === state.activeWorkspaceId);

export const getWorkspaceAnalytics = (state: AppState): AnalyticsMetric[] => {
  // If workspace has no posts and no accounts, return clean empty/zero metrics
  const posts = getWorkspacePosts(state);
  const accounts = getWorkspaceAccounts(state);
  
  if (posts.length === 0 && accounts.length === 0) {
    return [
      { id: 'm-empty-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: 0, change: 0, trend: 'neutral' },
      { id: 'm-empty-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: 0, change: 0, trend: 'neutral' },
    ];
  }

  // Filter scoped analytics for active workspace
  const scoped = state.analytics.filter((a: AnalyticsMetric) => a.workspaceId === state.activeWorkspaceId);
  if (scoped.length > 0) {
    return scoped;
  }

  // Otherwise calculate from actual workspace posts
  const publishedCount = posts.filter(p => p.status === 'published').length;
  return [
    { id: 'm-calc-1', workspaceId: state.activeWorkspaceId, label: 'Total Reach', value: publishedCount * 12500, change: 8.4, trend: 'up' },
    { id: 'm-calc-2', workspaceId: state.activeWorkspaceId, label: 'Engagement Rate', value: 5.1, change: 0.6, trend: 'up' },
    { id: 'm-calc-3', workspaceId: state.activeWorkspaceId, label: 'Follower Growth', value: accounts.length * 450, change: 4.2, trend: 'up' },
    { id: 'm-calc-4', workspaceId: state.activeWorkspaceId, label: 'Published Posts', value: publishedCount, change: 2.0, trend: 'up' },
  ];
};

export const getWorkspaceMediaFolders = (state: AppState): MediaFolder[] => 
  (state.mediaFolders || []).filter((f: MediaFolder) => f.workspaceId === state.activeWorkspaceId);

export const getWorkspacePerformance = (state: AppState): PostPerformance[] => 
  (state.postPerformances || []).filter((p: PostPerformance) => p.workspaceId === state.activeWorkspaceId);

export const getPostDestinationAccounts = (post: Post, socialAccounts: SocialAccount[]): SocialAccount[] => {
  return socialAccounts.filter(acc => post.destinationAccountIds.includes(acc.id));
};

export const getPostPlatforms = (post: Post, socialAccounts: SocialAccount[]): Platform[] => {
  const accounts = getPostDestinationAccounts(post, socialAccounts);
  const platforms = new Set<Platform>(accounts.map(acc => acc.platform));
  return Array.from(platforms);
};

export const getContentForPlatform = (post: Post, platform: Platform) => {
  const platformContent = post.platformContent.find(pc => pc.platform === platform && pc.enabled);
  if (platformContent) {
    return platformContent.content;
  }
  return post.originalContent;
};
