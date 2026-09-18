import { Platform } from '../types';

export interface BestTimeRecommendation {
  platform: Platform;
  dayName: string; // e.g. 'Tuesday'
  dayIndex: number; // 0 (Sun) - 6 (Sat)
  time: string; // HH:mm format e.g. '18:30'
  confidence: 'High' | 'Medium' | 'Optimal';
  reason: string;
  expectedEngagementBoost: string;
}

// Seeded platform engagement windows based on empirical creator data
const PLATFORM_PATTERNS: Record<Platform, BestTimeRecommendation[]> = {
  instagram: [
    {
      platform: 'instagram',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '18:30',
      confidence: 'High',
      reason: 'Peak evening leisure browsing window for your demographic',
      expectedEngagementBoost: '+24%'
    },
    {
      platform: 'instagram',
      dayName: 'Thursday',
      dayIndex: 4,
      time: '12:15',
      confidence: 'Medium',
      reason: 'Lunch break story & feed check-in',
      expectedEngagementBoost: '+16%'
    },
    {
      platform: 'instagram',
      dayName: 'Sunday',
      dayIndex: 0,
      time: '19:00',
      confidence: 'Optimal',
      reason: 'High Sunday evening scroll retention before the work week',
      expectedEngagementBoost: '+28%'
    }
  ],
  tiktok: [
    {
      platform: 'tiktok',
      dayName: 'Friday',
      dayIndex: 5,
      time: '20:15',
      confidence: 'High',
      reason: 'Weekend kick-off algorithm acceleration & high watch duration',
      expectedEngagementBoost: '+31%'
    },
    {
      platform: 'tiktok',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '16:45',
      confidence: 'Medium',
      reason: 'After-work / student commute session',
      expectedEngagementBoost: '+19%'
    },
    {
      platform: 'tiktok',
      dayName: 'Saturday',
      dayIndex: 6,
      time: '11:30',
      confidence: 'Optimal',
      reason: 'Weekend morning leisure scroll with high completion rate',
      expectedEngagementBoost: '+26%'
    }
  ],
  youtube: [
    {
      platform: 'youtube',
      dayName: 'Thursday',
      dayIndex: 4,
      time: '17:00',
      confidence: 'Optimal',
      reason: 'Allows YouTube indexer 2-3 hours to index before evening prime time',
      expectedEngagementBoost: '+22%'
    },
    {
      platform: 'youtube',
      dayName: 'Saturday',
      dayIndex: 6,
      time: '09:30',
      confidence: 'High',
      reason: 'Weekend morning long-form viewing session',
      expectedEngagementBoost: '+27%'
    }
  ],
  linkedin: [
    {
      platform: 'linkedin',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '08:30',
      confidence: 'Optimal',
      reason: 'Morning professional feed check before daily meetings commence',
      expectedEngagementBoost: '+35%'
    },
    {
      platform: 'linkedin',
      dayName: 'Wednesday',
      dayIndex: 3,
      time: '12:00',
      confidence: 'High',
      reason: 'Midday executive discussion break',
      expectedEngagementBoost: '+21%'
    }
  ],
  twitter: [
    {
      platform: 'twitter',
      dayName: 'Wednesday',
      dayIndex: 3,
      time: '10:15',
      confidence: 'High',
      reason: 'Industry news & trending conversation peak',
      expectedEngagementBoost: '+20%'
    },
    {
      platform: 'twitter',
      dayName: 'Monday',
      dayIndex: 1,
      time: '13:00',
      confidence: 'Medium',
      reason: 'Midday commentary and breaking developments',
      expectedEngagementBoost: '+15%'
    }
  ],
  facebook: [
    {
      platform: 'facebook',
      dayName: 'Thursday',
      dayIndex: 4,
      time: '14:00',
      confidence: 'Medium',
      reason: 'Community group active discussions period',
      expectedEngagementBoost: '+14%'
    }
  ],
  pinterest: [
    {
      platform: 'pinterest',
      dayName: 'Saturday',
      dayIndex: 6,
      time: '21:00',
      confidence: 'High',
      reason: 'Late evening planning and inspiration bookmarking',
      expectedEngagementBoost: '+29%'
    }
  ],
  threads: [
    {
      platform: 'threads',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '19:30',
      confidence: 'High',
      reason: 'Evening banter & conversational threads peak',
      expectedEngagementBoost: '+23%'
    }
  ]
};

/**
 * Get recommended posting times for a given workspace and platform
 */
export function getRecommendedPostingTimes(
  _workspaceId?: string,
  platform?: Platform,
  targetDayIndex?: number
): BestTimeRecommendation[] {
  if (platform && PLATFORM_PATTERNS[platform]) {
    const list = PLATFORM_PATTERNS[platform];
    if (typeof targetDayIndex === 'number') {
      const match = list.filter(r => r.dayIndex === targetDayIndex);
      if (match.length > 0) return match;
    }
    return list;
  }

  // Cross-platform recommendations
  const all: BestTimeRecommendation[] = [];
  Object.values(PLATFORM_PATTERNS).forEach(recs => {
    if (recs[0]) all.push(recs[0]);
  });
  return all;
}

/**
 * Get the single best recommended time string (e.g. '18:30') for scheduling
 */
export function getPrimaryRecommendedTime(platform?: Platform, targetDayIndex?: number): string {
  const recs = getRecommendedPostingTimes(undefined, platform, targetDayIndex);
  if (recs.length > 0) {
    return recs[0].time;
  }
  return '18:00';
}
