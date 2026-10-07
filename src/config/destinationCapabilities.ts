import { Platform, PostContent, SocialAccount } from '../types';
import { PLATFORM_CONFIGS } from './platformConfig';

export type ComposerIntent = 'draft' | 'schedule' | 'publish';

export interface PlatformPublishingCapability {
  platform: Platform;
  livePublishing: boolean;
  liveScheduling: boolean;
  notes: string;
}

/**
 * Product capability registry.
 *
 * These flags represent capabilities that Creator Lab itself has implemented
 * and verified end-to-end. They are intentionally independent from whether a
 * platform API could theoretically support an action.
 *
 * Phase 5 will enable individual capabilities only after OAuth, provider
 * publishing, confirmation, retries, and policy requirements are verified.
 */
export const PLATFORM_PUBLISHING_CAPABILITIES: Record<
  Platform,
  PlatformPublishingCapability
> = {
  youtube: {
    platform: 'youtube',
    livePublishing: false,
    liveScheduling: false,
    notes: 'YouTube adapter is planned for Phase 5 and is not live yet.',
  },
  instagram: {
    platform: 'instagram',
    livePublishing: false,
    liveScheduling: false,
    notes: 'Instagram adapter requires the Phase 5 API feasibility gate.',
  },
  tiktok: {
    platform: 'tiktok',
    livePublishing: false,
    liveScheduling: false,
    notes: 'TikTok publishing requires audit/access validation before activation.',
  },
  linkedin: {
    platform: 'linkedin',
    livePublishing: false,
    liveScheduling: false,
    notes: 'LinkedIn is not a V1 production integration yet.',
  },
  twitter: {
    platform: 'twitter',
    livePublishing: false,
    liveScheduling: false,
    notes: 'X publishing is not a V1 production integration yet.',
  },
  facebook: {
    platform: 'facebook',
    livePublishing: false,
    liveScheduling: false,
    notes: 'Facebook publishing is not a V1 production integration yet.',
  },
  pinterest: {
    platform: 'pinterest',
    livePublishing: false,
    liveScheduling: false,
    notes: 'Pinterest publishing is not a V1 production integration yet.',
  },
  threads: {
    platform: 'threads',
    livePublishing: false,
    liveScheduling: false,
    notes: 'Threads publishing is not a V1 production integration yet.',
  },
};

export interface DestinationCapability {
  accountId: string;
  platform: Platform;
  isDemo: boolean;
  canSaveDraft: boolean;
  canScheduleLocally: boolean;
  canPublishLive: boolean;
  canScheduleLive: boolean;
  publishBlockReason?: string;
}

export function getDestinationCapability(
  account: SocialAccount,
): DestinationCapability {
  const platformCapability = PLATFORM_PUBLISHING_CAPABILITIES[account.platform];
  const accountConnected = account.status === 'connected';
  const isDemo = account.connectionMode === 'demo';

  let publishBlockReason: string | undefined;
  if (isDemo) {
    publishBlockReason = 'Demo accounts do not have a real OAuth connection.';
  } else if (!accountConnected) {
    publishBlockReason = 'This account is not currently connected.';
  } else if (!platformCapability.livePublishing) {
    publishBlockReason = platformCapability.notes;
  }

  return {
    accountId: account.id,
    platform: account.platform,
    isDemo,
    canSaveDraft: true,
    canScheduleLocally: account.status !== 'error',
    canPublishLive:
      !isDemo && accountConnected && platformCapability.livePublishing,
    canScheduleLive:
      !isDemo && accountConnected && platformCapability.liveScheduling,
    publishBlockReason,
  };
}

export interface ComposerValidationIssue {
  code:
    | 'no_destination'
    | 'empty_content'
    | 'caption_limit'
    | 'destination_error'
    | 'live_publish_unavailable';
  message: string;
  platform?: Platform;
  accountId?: string;
}

export interface ComposerValidationInput {
  intent: ComposerIntent;
  accounts: SocialAccount[];
  baseContent: PostContent;
  platformContent: Partial<Record<Platform, PostContent>>;
}

export function validateComposerDestinations(
  input: ComposerValidationInput,
): ComposerValidationIssue[] {
  const issues: ComposerValidationIssue[] = [];

  if (input.accounts.length === 0) {
    issues.push({
      code: 'no_destination',
      message: 'Select at least one destination account.',
    });
    return issues;
  }

  if (
    !input.baseContent.caption.trim() &&
    input.baseContent.mediaIds.length === 0
  ) {
    issues.push({
      code: 'empty_content',
      message: 'Post content cannot be empty.',
    });
  }

  const seenPlatforms = new Set<Platform>();

  for (const account of input.accounts) {
    const capability = getDestinationCapability(account);

    if (account.status === 'error') {
      issues.push({
        code: 'destination_error',
        message: `${account.displayName} has a connection error.`,
        platform: account.platform,
        accountId: account.id,
      });
    }

    if (input.intent === 'publish' && !capability.canPublishLive) {
      issues.push({
        code: 'live_publish_unavailable',
        message:
          capability.publishBlockReason ||
          `Live publishing is unavailable for ${account.displayName}.`,
        platform: account.platform,
        accountId: account.id,
      });
    }

    if (seenPlatforms.has(account.platform)) continue;
    seenPlatforms.add(account.platform);

    const content = input.platformContent[account.platform] || input.baseContent;
    const limit = PLATFORM_CONFIGS[account.platform].prototypeCaptionLimit;
    if (content.caption.length > limit) {
      issues.push({
        code: 'caption_limit',
        message: `${PLATFORM_CONFIGS[account.platform].displayName} content exceeds the current ${limit}-character prototype limit.`,
        platform: account.platform,
      });
    }
  }

  return issues;
}

export function getFirstBlockingIssue(
  issues: ComposerValidationIssue[],
): ComposerValidationIssue | undefined {
  return issues[0];
}
