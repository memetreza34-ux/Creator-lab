export type Tab = 'dashboard' | 'planner' | 'experiments' | 'analytics';

export interface ContentIdea {
  id: string;
  title: string;
  status: 'idea' | 'planning' | 'production' | 'published';
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  targetDate: string;
}

export interface Experiment {
  id: string;
  name: string;
  variantA: { label: string; metric: number; image?: string };
  variantB: { label: string; metric: number; image?: string };
  metricName: string;
  status: 'running' | 'concluded';
  winner?: 'A' | 'B';
}
