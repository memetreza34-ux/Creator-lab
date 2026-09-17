import { 
  Workspace, 
  SocialAccount, 
  Post, 
  MediaAsset, 
  ContentItem, 
  AnalyticsMetric, 
  Experiment,
  Platform
} from '../types';

export const mockWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Personal Workspace',
  plan: 'pro'
};

export const mockSocialAccounts: SocialAccount[] = [
  { id: 'acc-1', platform: 'instagram', username: '@creatorlab', status: 'connected', lastSync: '10 mins ago' },
  { id: 'acc-2', platform: 'tiktok', username: '@creatorlab', status: 'connected', lastSync: '12 mins ago' },
  { id: 'acc-3', platform: 'youtube', username: 'Creator Lab', status: 'connected', lastSync: '1 hour ago' },
  { id: 'acc-4', platform: 'linkedin', username: 'Creator Lab', status: 'connected', lastSync: '2 hours ago' },
];

export const mockMediaAssets: MediaAsset[] = [
  { id: 'm-1', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', type: 'image', name: 'studio_setup.jpg', size: 1024000, createdAt: '2026-09-15T10:00:00Z' },
  { id: 'm-2', url: 'https://images.unsplash.com/photo-1516280440502-a270f20ceb68?w=800&q=80', type: 'image', name: 'thumbnail_draft.png', size: 2048000, createdAt: '2026-09-14T15:30:00Z' },
  { id: 'm-3', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80', type: 'image', name: 'camera_gear.jpg', size: 1536000, createdAt: '2026-09-10T09:15:00Z' },
];

export const mockPosts: Post[] = [
  {
    id: 'p-1',
    workspaceId: 'ws-1',
    title: 'New Studio Setup Tour',
    originalContent: {
      caption: 'Finally showing off the new creator studio setup! 🎥✨ What do you guys think of the lighting?',
      media: [mockMediaAssets[0]]
    },
    platformContent: [
      {
        platform: 'instagram',
        enabled: true,
        content: {
          caption: 'Finally showing off the new creator studio setup! 🎥✨ What do you guys think of the lighting? #creator #studio #setup',
          media: [mockMediaAssets[0]]
        }
      },
      {
        platform: 'youtube',
        enabled: true,
        content: {
          caption: 'NEW STUDIO TOUR 2026 - My Ultimate Creator Setup',
          media: [mockMediaAssets[0]]
        }
      }
    ],
    status: 'scheduled',
    scheduledAt: '2026-09-18T18:00:00Z',
    createdAt: '2026-09-15T14:20:00Z'
  },
  {
    id: 'p-2',
    workspaceId: 'ws-1',
    title: 'Top 5 Editing Hooks',
    originalContent: {
      caption: 'If your viewers are dropping off in the first 3 seconds, you need these 5 editing hooks.',
      media: [mockMediaAssets[1]]
    },
    platformContent: [
      {
        platform: 'tiktok',
        enabled: true,
        content: {
          caption: 'Stop losing viewers! 🛑 Try these 5 editing hooks. #editingtips #contentcreator',
          media: [mockMediaAssets[1]]
        }
      }
    ],
    status: 'published',
    publishedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-10T11:00:00Z'
  }
];

export const mockPipelineItems: ContentItem[] = [
  { id: 'c-1', title: 'Why Hooks are Failing in 2026', stage: 'research', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-25', tags: ['strategy'] },
  { id: 'c-2', title: 'I Tried A/B Testing My Life', stage: 'editing', platforms: ['youtube', 'tiktok'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-20', tags: ['vlog', 'experiment'] },
  { id: 'c-3', title: 'My Content System Setup', stage: 'ideas', platforms: ['instagram', 'linkedin'], format: 'carousel', owner: 'Creator Lab', targetDate: '2026-09-22', tags: ['productivity'] },
  { id: 'c-4', title: 'Quick tip: Edit faster', stage: 'published', platforms: ['tiktok', 'instagram'], format: 'short', owner: 'Creator Lab', targetDate: '2026-09-10', tags: ['tips'] },
  { id: 'c-5', title: 'Gear Review: Lumix S5IIX', stage: 'script', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-28', tags: ['gear'] },
  { id: 'c-6', title: 'Creator Burnout', stage: 'recording', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-21', tags: ['mental health'] },
];

export const mockAnalytics: AnalyticsMetric[] = [
  { id: 'am-1', label: 'Total Reach', value: 145000, change: 12.5, trend: 'up' },
  { id: 'am-2', label: 'Engagement Rate', value: 4.2, change: -0.4, trend: 'down' },
  { id: 'am-3', label: 'Follower Growth', value: 3200, change: 8.1, trend: 'up' },
  { id: 'am-4', label: 'Published Posts', value: 24, change: 4.0, trend: 'up' },
];

export const mockExperiments: Experiment[] = [
  {
    id: 'exp-1',
    name: 'Thumbnail A/B: "I Tried" vs "I Failed"',
    metricName: 'Click-Through Rate',
    status: 'running',
    variantA: { label: 'Thumbnail A (Blue)', metric: 5.2 },
    variantB: { label: 'Thumbnail B (Red)', metric: 6.8 },
  },
  {
    id: 'exp-2',
    name: 'Title A/B: Hook format vs Story format',
    metricName: 'Avg. View Duration (min)',
    status: 'concluded',
    winner: 'B',
    variantA: { label: 'Hook-first title', metric: 4.1 },
    variantB: { label: 'Story-focused title', metric: 5.6 },
  },
];
