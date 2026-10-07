import { Platform } from '../types';

export interface BestTimeRecommendation {
  platform: Platform;
  dayName: string;
  dayIndex: number;
  time: string;
  confidence: 'Prototype';
  reason: string;
  expectedEngagementBoost: 'Not estimated';
}

/**
 * Generic prototype planning slots.
 *
 * These are NOT derived from the active creator's analytics and must never be
 * presented as measured best times or expected performance. Phase 6 replaces
 * this placeholder layer with evidence-based recommendations when sufficient
 * provider-synced history exists.
 */
const PROTOTYPE_PLANNING_SLOTS: Record<Platform, BestTimeRecommendation[]> = {
  instagram: [
    {
      platform: 'instagram',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '18:30',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  tiktok: [
    {
      platform: 'tiktok',
      dayName: 'Friday',
      dayIndex: 5,
      time: '20:00',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  youtube: [
    {
      platform: 'youtube',
      dayName: 'Thursday',
      dayIndex: 4,
      time: '17:00',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  linkedin: [
    {
      platform: 'linkedin',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '08:30',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  twitter: [
    {
      platform: 'twitter',
      dayName: 'Wednesday',
      dayIndex: 3,
      time: '10:15',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  facebook: [
    {
      platform: 'facebook',
      dayName: 'Thursday',
      dayIndex: 4,
      time: '14:00',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  pinterest: [
    {
      platform: 'pinterest',
      dayName: 'Saturday',
      dayIndex: 6,
      time: '20:00',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
  threads: [
    {
      platform: 'threads',
      dayName: 'Tuesday',
      dayIndex: 2,
      time: '19:30',
      confidence: 'Prototype',
      reason: 'Generic planning placeholder — not based on workspace analytics.',
      expectedEngagementBoost: 'Not estimated',
    },
  ],
};

export function getRecommendedPostingTimes(
  _workspaceId?: string,
  platform?: Platform,
  targetDayIndex?: number,
): BestTimeRecommendation[] {
  if (platform) {
    const list = PROTOTYPE_PLANNING_SLOTS[platform];
    if (typeof targetDayIndex === 'number') {
      const matchingDay = list.filter(
        (recommendation) => recommendation.dayIndex === targetDayIndex,
      );
      if (matchingDay.length > 0) return matchingDay;
    }
    return list;
  }

  return Object.values(PROTOTYPE_PLANNING_SLOTS)
    .map((recommendations) => recommendations[0])
    .filter(
      (recommendation): recommendation is BestTimeRecommendation =>
        Boolean(recommendation),
    );
}

export function getPrimaryRecommendedTime(
  platform?: Platform,
  targetDayIndex?: number,
): string {
  const recommendations = getRecommendedPostingTimes(
    undefined,
    platform,
    targetDayIndex,
  );
  return recommendations[0]?.time || '18:00';
}
