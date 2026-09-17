export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'threads';

export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
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
}

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface Experiment {
  id: string;
  workspaceId: string;
  name: string;
  variantA: { label: string; metric: number; image?: string };
  variantB: { label: string; metric: number; image?: string };
  metricName: string;
  status: 'running' | 'concluded';
  winner?: 'A' | 'B';
}
