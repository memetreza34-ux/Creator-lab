import { Platform } from '../types';

export interface PlatformConfig {
  id: Platform;
  displayName: string;
  prototypeCaptionLimit: number; // Prototype limit indicator
  supportedFormats: ('short' | 'long' | 'image' | 'carousel' | 'text')[];
  recommendedAspectRatios: string[];
  hashtagGuidance: string;
  bestPractices: string;
  toneRecommendation: string;
  placeholderText: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    displayName: 'Instagram',
    prototypeCaptionLimit: 2200,
    supportedFormats: ['short', 'image', 'carousel'],
    recommendedAspectRatios: ['1:1', '4:5', '9:16'],
    hashtagGuidance: '3-5 hyper-targeted niche hashtags in caption or first comment',
    bestPractices: 'Strong visual hook in first slide/frame. Put main CTA above the fold or in last slide.',
    toneRecommendation: 'Aesthetic, personal, high visual storytelling',
    placeholderText: 'Write an engaging Instagram caption with storytelling and clean spacing...'
  },
  tiktok: {
    id: 'tiktok',
    displayName: 'TikTok',
    prototypeCaptionLimit: 2200,
    supportedFormats: ['short'],
    recommendedAspectRatios: ['9:16'],
    hashtagGuidance: '3-5 trending category hashtags (#fyp, #learnontiktok)',
    bestPractices: 'First 1.5 seconds make or break watch time. Punchy on-screen text and fast audio cue.',
    toneRecommendation: 'Conversational, energetic, authentic and candid',
    placeholderText: 'Drop a punchy TikTok caption with curiosity and hooks...'
  },
  youtube: {
    id: 'youtube',
    displayName: 'YouTube',
    prototypeCaptionLimit: 5000,
    supportedFormats: ['long', 'short'],
    recommendedAspectRatios: ['16:9', '9:16'],
    hashtagGuidance: '2-3 broad tags in description, detailed SEO keywords in description body',
    bestPractices: 'Front-load keywords in first 100 characters. Include timestamps and relevant links.',
    toneRecommendation: 'Informative, searchable, authoritative yet warm',
    placeholderText: 'Write a comprehensive video title and searchable description with timestamps...'
  },
  twitter: {
    id: 'twitter',
    displayName: 'X (Twitter)',
    prototypeCaptionLimit: 280,
    supportedFormats: ['text', 'image', 'short'],
    recommendedAspectRatios: ['16:9', '1:1'],
    hashtagGuidance: '1-2 maximum. Natural keywords perform better than keyword stuffing.',
    bestPractices: 'Single bold thesis statement or question. Thread hooks need clear promise.',
    toneRecommendation: 'Sharp, concise, thought-provoking, debate-starting',
    placeholderText: 'What is your contrarian take or high-signal insight?'
  },
  linkedin: {
    id: 'linkedin',
    displayName: 'LinkedIn',
    prototypeCaptionLimit: 3000,
    supportedFormats: ['text', 'carousel', 'image', 'short'],
    recommendedAspectRatios: ['1:1', '4:5', '16:9'],
    hashtagGuidance: '3-5 industry-specific tags (#CreatorEconomy, #TechLeadership)',
    bestPractices: 'High-contrast headline hook before "...see more". Generous line breaks. Actionable takeaway.',
    toneRecommendation: 'Professional, insightful, framework-oriented, vulnerable growth story',
    placeholderText: 'Share a professional breakthrough, breakdown, or industry perspective...'
  },
  facebook: {
    id: 'facebook',
    displayName: 'Facebook',
    prototypeCaptionLimit: 2000,
    supportedFormats: ['text', 'image', 'short', 'long'],
    recommendedAspectRatios: ['1:1', '16:9', '9:16'],
    hashtagGuidance: 'Minimal. Focus on community conversation starters.',
    bestPractices: 'Ask direct questions that prompt community replies in the comments.',
    toneRecommendation: 'Community-centric, relatable, conversational',
    placeholderText: 'Ask your community a question or share a relatable update...'
  },
  pinterest: {
    id: 'pinterest',
    displayName: 'Pinterest',
    prototypeCaptionLimit: 500,
    supportedFormats: ['image', 'short'],
    recommendedAspectRatios: ['2:3', '9:16'],
    hashtagGuidance: 'Keywords in pin title and description matter more than hashtag symbols.',
    bestPractices: 'Inspirational, intent-driven imagery with clear overlaid title text.',
    toneRecommendation: 'Aspirational, actionable, step-by-step',
    placeholderText: 'Describe this pin with searchable keywords and actionable inspiration...'
  },
  threads: {
    id: 'threads',
    displayName: 'Threads',
    prototypeCaptionLimit: 500,
    supportedFormats: ['text', 'image', 'short'],
    recommendedAspectRatios: ['1:1', '9:16'],
    hashtagGuidance: '1 topic tag topic link per post is standard.',
    bestPractices: 'Casual conversational thoughts, fast responses, behind-the-scenes.',
    toneRecommendation: 'Casual, witty, open-ended, real-time',
    placeholderText: 'Share a candid thought, observation, or work-in-progress...'
  }
};

export const ALL_PLATFORMS: Platform[] = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'linkedin',
  'facebook',
  'pinterest',
  'threads'
];
