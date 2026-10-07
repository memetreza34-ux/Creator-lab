import { 
  Workspace, SocialAccount, Post, MediaAsset, ContentItem, 
  AnalyticsMetric, Experiment, MediaFolder, PostPerformance 
} from '../types';

export const mockWorkspaces: Workspace[] = [
  { 
    id: 'ws-1', 
    name: 'Personal Workspace', 
    plan: 'pro',
    timezone: 'America/New_York',
    createdAt: '2026-01-15T10:00:00Z',
    dataMode: 'demo'
  }
];

export const mockMediaFolders: MediaFolder[] = [
  { id: 'f-1', workspaceId: 'ws-1', name: 'Studio & Gear', createdAt: '2026-02-01T12:00:00Z' },
  { id: 'f-2', workspaceId: 'ws-1', name: 'Thumbnails & Covers', createdAt: '2026-02-15T14:30:00Z' },
  { id: 'f-3', workspaceId: 'ws-1', name: 'Raw B-Roll', createdAt: '2026-03-01T09:00:00Z' }
];

export const mockSocialAccounts: SocialAccount[] = [
  { id: 'acc-1', workspaceId: 'ws-1', platform: 'instagram', username: '@creatorlab', displayName: 'Creator Lab IG', status: 'connected', connectionKind: 'demo', lastSync: '10 mins ago' },
  { id: 'acc-2', workspaceId: 'ws-1', platform: 'tiktok', username: '@creatorlab', displayName: 'Creator Lab TikTok', status: 'connected', connectionKind: 'demo', lastSync: '12 mins ago' },
  { id: 'acc-3', workspaceId: 'ws-1', platform: 'youtube', username: 'Creator Lab', displayName: 'Creator Lab YT', status: 'connected', connectionKind: 'demo', lastSync: '1 hour ago' },
  { id: 'acc-4', workspaceId: 'ws-1', platform: 'linkedin', username: 'Creator Lab', displayName: 'Creator Lab LinkedIn', status: 'connected', connectionKind: 'demo', lastSync: '2 hours ago' },
];

export const mockMediaAssets: MediaAsset[] = [
  { id: 'm-1', workspaceId: 'ws-1', folderId: 'f-1', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', type: 'image', name: 'studio_setup.jpg', size: 1024000, createdAt: '2026-09-15T10:00:00Z', storageKind: 'demo-remote' },
  { id: 'm-2', workspaceId: 'ws-1', folderId: 'f-2', url: 'https://images.unsplash.com/photo-1516280440502-a270f20ceb68?w=800&q=80', type: 'image', name: 'thumbnail_draft.png', size: 2048000, createdAt: '2026-09-14T15:30:00Z', storageKind: 'demo-remote' },
  { id: 'm-3', workspaceId: 'ws-1', folderId: 'f-1', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80', type: 'image', name: 'camera_gear.jpg', size: 1536000, createdAt: '2026-09-10T09:15:00Z', storageKind: 'demo-remote' },
];

export const mockPosts: Post[] = [
  {
    id: 'p-1',
    workspaceId: 'ws-1',
    title: 'New Studio Setup Tour',
    destinationAccountIds: ['acc-1', 'acc-3'],
    originalContent: {
      caption: 'Finally showing off the new creator studio setup! 🎥✨ What do you guys think of the lighting?',
      mediaIds: ['m-1']
    },
    platformContent: [
      {
        platform: 'instagram',
        enabled: true,
        content: {
          caption: 'Finally showing off the new creator studio setup! 🎥✨ What do you guys think of the lighting? #creator #studio #setup',
          mediaIds: ['m-1']
        }
      },
      {
        platform: 'youtube',
        enabled: true,
        content: {
          caption: 'NEW STUDIO TOUR 2026 - My Ultimate Creator Setup',
          mediaIds: ['m-1']
        }
      }
    ],
    status: 'scheduled',
    scheduledAt: '2026-09-22T18:30:00Z',
    createdAt: '2026-09-15T14:20:00Z',
    sourceContentItemId: 'c-3'
  },
  {
    id: 'p-2',
    workspaceId: 'ws-1',
    title: 'Top 5 Editing Hooks for 2026',
    destinationAccountIds: ['acc-2'],
    originalContent: {
      caption: 'If your viewers are dropping off in the first 3 seconds, you need these 5 editing hooks.',
      mediaIds: ['m-2']
    },
    platformContent: [
      {
        platform: 'tiktok',
        enabled: true,
        content: {
          caption: 'Stop losing viewers! 🛑 Try these 5 editing hooks. #editingtips #contentcreator',
          mediaIds: ['m-2']
        }
      }
    ],
    status: 'published',
    publishedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-10T11:00:00Z',
    sourceContentItemId: 'c-1'
  },
  {
    id: 'p-3',
    workspaceId: 'ws-1',
    title: 'Why Most Creator Workflows Break Down',
    destinationAccountIds: ['acc-4'],
    originalContent: {
      caption: 'Most creators spend 80% of their energy on logistics and only 20% on actual creative storytelling. Here is how we flipped that ratio.',
      mediaIds: []
    },
    platformContent: [
      {
        platform: 'linkedin',
        enabled: true,
        content: {
          caption: 'Most creators spend 80% of their energy on logistics and only 20% on actual creative storytelling.\n\nHere is how we flipped that ratio in 2026.\n\n1. Async idea bank with strict triage\n2. Batching script drafts\n3. Pre-flight A/B testing on titles\n\n#CreatorEconomy #Productivity',
          mediaIds: []
        }
      }
    ],
    status: 'published',
    publishedAt: '2026-09-14T08:30:00Z',
    createdAt: '2026-09-11T09:00:00Z'
  },
  {
    id: 'p-4',
    workspaceId: 'ws-1',
    title: 'Camera Gear Checklist for Solo Shooters',
    destinationAccountIds: ['acc-1', 'acc-3'],
    originalContent: {
      caption: 'The minimal kit that never lets us down on location shoots.',
      mediaIds: ['m-3']
    },
    platformContent: [
      {
        platform: 'instagram',
        enabled: true,
        content: {
          caption: 'The minimal kit that never lets us down on location shoots. Swipe for the breakdown 👉 #cameragear #filmmaker',
          mediaIds: ['m-3']
        }
      }
    ],
    status: 'draft',
    createdAt: '2026-09-16T16:00:00Z'
  }
];

export const mockPipelineItems: ContentItem[] = [
  { id: 'c-1', workspaceId: 'ws-1', title: 'Why Hooks are Failing in 2026', stage: 'research', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-25', tags: ['strategy'], notes: 'Analyze viewer retention drop-offs and first-3-second retention', order: 0 },
  { id: 'c-2', workspaceId: 'ws-1', title: 'I Tried A/B Testing My Life for 30 Days', stage: 'editing', platforms: ['youtube', 'tiktok'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-20', tags: ['vlog', 'experiment'], notes: 'Final color grade and sound design polish in DaVinci', order: 0 },
  { id: 'c-3', workspaceId: 'ws-1', title: 'My Minimal Studio System Setup', stage: 'ideas', platforms: ['instagram', 'linkedin'], format: 'carousel', owner: 'Creator Lab', targetDate: '2026-09-22', tags: ['productivity'], notes: 'Show how key lights and overhead rig are connected via smart plugs', order: 0 },
  { id: 'c-4', workspaceId: 'ws-1', title: 'Quick tip: Edit 2x Faster with Proxies', stage: 'published', platforms: ['tiktok', 'instagram'], format: 'short', owner: 'Creator Lab', targetDate: '2026-09-10', tags: ['tips'], notes: 'ProRes proxy batch generation workflow', order: 0 },
  { id: 'c-5', workspaceId: 'ws-1', title: 'Gear Review: Lumix S5IIX in Real Productions', stage: 'script', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-28', tags: ['gear'], notes: 'Compare open gate 6K vs 4K ProRes RAW recording', order: 0 },
  { id: 'c-6', workspaceId: 'ws-1', title: 'Preventing Creator Burnout: My Operating Rules', stage: 'recording', platforms: ['youtube'], format: 'long', owner: 'Creator Lab', targetDate: '2026-09-21', tags: ['mental health'], notes: 'Script breakdown: boundaries, content quotas, sabbaticals', order: 0 },
];

export const mockAnalytics: AnalyticsMetric[] = [
  { id: 'am-1', workspaceId: 'ws-1', label: 'Total Reach', value: 145000, change: 12.5, trend: 'up', source: 'demo' },
  { id: 'am-2', workspaceId: 'ws-1', label: 'Engagement Rate', value: 4.2, change: 0.4, trend: 'up', source: 'demo' },
  { id: 'am-3', workspaceId: 'ws-1', label: 'Follower Growth', value: 3200, change: 8.1, trend: 'up', source: 'demo' },
  { id: 'am-4', workspaceId: 'ws-1', label: 'Published Posts', value: 24, change: 4.0, trend: 'up', source: 'demo' },
];

export const mockExperiments: Experiment[] = [
  {
    id: 'exp-1',
    workspaceId: 'ws-1',
    name: 'Thumbnail A/B: "I Tried" vs "I Failed"',
    type: 'thumbnail',
    sourcePostId: 'p-1',
    sourceContentItemId: 'c-2',
    hypothesis: 'High-contrast expression with "I Failed" triggers curiosity gap and increases CTR by >15%.',
    primaryMetric: 'Click-Through Rate (CTR)',
    status: 'running',
    variantA: { label: 'Thumbnail A (Blue Background, Neutral Smile)', metric: 5.2, content: 'Blue background with neutral expression' },
    variantB: { label: 'Thumbnail B (High-Contrast Red, Shocked Pose)', metric: 7.1, content: 'High contrast red alert border with curiosity expression' },
    winner: 'B',
    aiInterpretation: 'Variant B produced a 36.5% higher CTR across first 48 hours. Curiosity-driven visual framing outperformed passive smiling.',
    createdAt: '2026-09-12T10:00:00Z'
  },
  {
    id: 'exp-2',
    workspaceId: 'ws-1',
    name: 'Opening Hook: Direct Promise vs Question Gap',
    type: 'hook',
    sourcePostId: 'p-2',
    sourceContentItemId: 'c-1',
    hypothesis: 'Directly calling out viewer drop-off in first 2 seconds will lift 10s retention above 60%.',
    primaryMetric: '10-Second Retention Rate',
    status: 'concluded',
    variantA: { label: 'Variant A: "Top 5 editing hooks you should know"', metric: 42.0, content: 'Top 5 editing hooks you should know in 2026.' },
    variantB: { label: 'Variant B: "If your viewers drop off in 3s, you need this"', metric: 64.5, content: 'If your viewers are dropping off in the first 3 seconds, stop scrolling.' },
    winner: 'B',
    aiInterpretation: 'Problem-first hook captured +53% more retention. Audience resonates strongly with diagnosed pain points over numbered listicles.',
    createdAt: '2026-09-08T14:00:00Z'
  }
];

export const mockPostPerformance: PostPerformance[] = [
  {
    postId: 'p-2',
    workspaceId: 'ws-1',
    platform: 'tiktok',
    views: 84200,
    reach: 72100,
    likes: 6420,
    comments: 312,
    shares: 890,
    saves: 1420,
    clicks: 430,
    ctr: 5.4,
    engagementRate: 9.2,
    followersGained: 680,
    watchTime: 12.4,
    publishedAt: '2026-09-12T10:00:00Z',
    source: 'demo'
  },
  {
    postId: 'p-3',
    workspaceId: 'ws-1',
    platform: 'linkedin',
    views: 28400,
    reach: 22600,
    likes: 840,
    comments: 114,
    shares: 62,
    saves: 340,
    clicks: 980,
    ctr: 4.1,
    engagementRate: 4.8,
    followersGained: 210,
    publishedAt: '2026-09-14T08:30:00Z',
    source: 'demo'
  },
  {
    postId: 'p-1',
    workspaceId: 'ws-1',
    platform: 'instagram',
    views: 32000,
    reach: 28500,
    likes: 2100,
    comments: 142,
    shares: 110,
    saves: 480,
    clicks: 310,
    ctr: 3.2,
    engagementRate: 6.8,
    followersGained: 140,
    publishedAt: '2026-09-16T18:30:00Z',
    source: 'demo'
  }
];
