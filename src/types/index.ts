export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'threads';

export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  timezone: string;
  createdAt: string;
  color?: string;
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'needs_review';

export interface PostContent {
  caption: string;
  mediaIds: string[];
}

export interface PlatformSpecificContent {
  platform: Platform;
  content: PostContent;
  enabled: boolean;
}

export interface Post {
  id: string;
  workspaceId: string;
  title: string;
  destinationAccountIds: string[];
  originalContent: PostContent;
  platformContent: PlatformSpecificContent[];
  status: PostStatus;
  scheduledAt?: string;
  createdAt: string;
  publishedAt?: string;
  sourceContentItemId?: string;
}

export interface MediaFolder {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  name: string;
  size: number; // bytes
  createdAt: string;
  folderId?: string;
}

export type PipelineStage = 'ideas' | 'research' | 'script' | 'recording' | 'editing' | 'ready' | 'scheduled' | 'published';

export interface ContentItem {
  id: string;
  workspaceId: string;
  title: string;
  stage: PipelineStage;
  platforms: Platform[];
  format: 'short' | 'long' | 'image' | 'carousel' | 'text';
  owner: string;
  targetDate?: string;
  tags: string[];
  notes?: string;
  order: number;
}

export interface AnalyticsMetric {
  id: string;
  workspaceId?: string;
  label: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface PostPerformance {
  postId: string;
  workspaceId: string;
  platform: Platform;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  ctr: number;
  engagementRate: number;
  followersGained: number;
  watchTime?: number;
  publishedAt: string;
}

export type ExperimentType = 'hook' | 'title' | 'caption' | 'thumbnail' | 'cta' | 'posting_time';
export type ExperimentStatus = 'draft' | 'running' | 'concluded';

export interface ExperimentVariant {
  label: string;
  metric: number;
  image?: string;
  content?: string;
}

export interface Experiment {
  id: string;
  workspaceId: string;
  name: string;
  type: ExperimentType;
  sourcePostId?: string;
  sourceContentItemId?: string;
  hypothesis: string;
  primaryMetric: string;
  variantA: ExperimentVariant;
  variantB: ExperimentVariant;
  status: ExperimentStatus;
  winner?: 'A' | 'B';
  aiInterpretation?: string;
  createdAt?: string;
}

export interface ContentScoreBreakdown {
  hookStrength: number;
  clarity: number;
  ctaStrength: number;
  platformFit: number;
  engagementPotential: number;
}

export interface ContentAnalysis {
  overallScore: number;
  scores: ContentScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendedChanges: string[];
  assessedAt: string;
}

export interface ContentVariation {
  strategy: string;
  title: string;
  content: string;
  explanation: string;
}

export interface AppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  socialAccounts: SocialAccount[];
  posts: Post[];
  mediaAssets: MediaAsset[];
  mediaFolders: MediaFolder[];
  pipelineItems: ContentItem[];
  experiments: Experiment[];
  analytics: AnalyticsMetric[];
  postPerformances?: PostPerformance[];
}
