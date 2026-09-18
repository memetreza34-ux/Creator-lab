import { Post, SocialAccount, Platform } from '../types';

export const getWorkspacePosts = (state: any) => 
  state.posts.filter((p: any) => p.workspaceId === state.activeWorkspaceId);

export const getWorkspaceMedia = (state: any) => 
  state.mediaAssets.filter((m: any) => m.workspaceId === state.activeWorkspaceId);

export const getWorkspaceAccounts = (state: any) => 
  state.socialAccounts.filter((a: any) => a.workspaceId === state.activeWorkspaceId);

export const getWorkspacePipelineItems = (state: any) => 
  state.pipelineItems.filter((i: any) => i.workspaceId === state.activeWorkspaceId);

export const getWorkspaceExperiments = (state: any) => 
  state.experiments.filter((e: any) => e.workspaceId === state.activeWorkspaceId);

export const getWorkspaceAnalytics = (state: any) => 
  state.analytics; 

export const getPostDestinationAccounts = (post: Post, socialAccounts: SocialAccount[]) => {
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

export const getWorkspaceMediaFolders = (state: any) => 
  (state.mediaFolders || []).filter((f: any) => f.workspaceId === state.activeWorkspaceId);
