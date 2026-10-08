import { Platform } from '../types';

export interface BestTimeRecommendation {
  platform: Platform;
  dayName: string;
  dayIndex: number;
  time: string;
  source: 'prototype';
  reason: string;
}

const PROTOTYPE_REASON =
  'Prototype planning slot only. It is not derived from this workspace\'s analytics.';

const PLATFORM_PATTERNS: Record<Platform, BestTimeRecommendation[]> = {
  instagram: [
    { platform: 'instagram', dayName: 'Tuesday', dayIndex: 2, time: '18:30', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'instagram', dayName: 'Thursday', dayIndex: 4, time: '12:15', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'instagram', dayName: 'Sunday', dayIndex: 0, time: '19:00', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  tiktok: [
    { platform: 'tiktok', dayName: 'Friday', dayIndex: 5, time: '20:15', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'tiktok', dayName: 'Tuesday', dayIndex: 2, time: '16:45', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'tiktok', dayName: 'Saturday', dayIndex: 6, time: '11:30', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  youtube: [
    { platform: 'youtube', dayName: 'Thursday', dayIndex: 4, time: '17:00', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'youtube', dayName: 'Saturday', dayIndex: 6, time: '09:30', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  linkedin: [
    { platform: 'linkedin', dayName: 'Tuesday', dayIndex: 2, time: '08:30', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'linkedin', dayName: 'Wednesday', dayIndex: 3, time: '12:00', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  twitter: [
    { platform: 'twitter', dayName: 'Wednesday', dayIndex: 3, time: '10:15', source: 'prototype', reason: PROTOTYPE_REASON },
    { platform: 'twitter', dayName: 'Monday', dayIndex: 1, time: '13:00', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  facebook: [
    { platform: 'facebook', dayName: 'Thursday', dayIndex: 4, time: '14:00', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  pinterest: [
    { platform: 'pinterest', dayName: 'Saturday', dayIndex: 6, time: '21:00', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
  threads: [
    { platform: 'threads', dayName: 'Tuesday', dayIndex: 2, time: '19:30', source: 'prototype', reason: PROTOTYPE_REASON },
  ],
};

export function getRecommendedPostingTimes(
  _workspaceId?: string,
  platform?: Platform,
  targetDayIndex?: number,
): BestTimeRecommendation[] {
  if (platform && PLATFORM_PATTERNS[platform]) {
    const list = PLATFORM_PATTERNS[platform];

    if (typeof targetDayIndex === 'number') {
      const matchingDay = list.filter(
        (recommendation) => recommendation.dayIndex === targetDayIndex,
      );
      if (matchingDay.length > 0) return matchingDay;
    }

    return list;
  }

  return Object.values(PLATFORM_PATTERNS)
    .map((recommendations) => recommendations[0])
    .filter((recommendation): recommendation is BestTimeRecommendation =>
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
