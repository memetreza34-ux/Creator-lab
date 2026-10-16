import assert from 'node:assert/strict';
import test from 'node:test';
import { SocialAccount } from '../types';
import {
  getDestinationCapability,
  validateComposerDestinations,
} from './destinationCapabilities';

function account(
  overrides: Partial<SocialAccount> = {},
): SocialAccount {
  return {
    id: 'account-1',
    workspaceId: 'workspace-1',
    platform: 'youtube',
    username: 'creator',
    displayName: 'Creator YouTube',
    status: 'connected',
    connectionMode: 'demo',
    lastSync: '',
    ...overrides,
  };
}

test('demo accounts support drafts/local planning but never live publishing', () => {
  const capability = getDestinationCapability(account());

  assert.equal(capability.canSaveDraft, true);
  assert.equal(capability.canScheduleLocally, true);
  assert.equal(capability.canPublishLive, false);
  assert.match(capability.publishBlockReason || '', /Demo accounts/);
});

test('oauth account is still blocked until Creator Lab verifies a live adapter', () => {
  const capability = getDestinationCapability(
    account({ connectionMode: 'oauth' }),
  );

  assert.equal(capability.canPublishLive, false);
  assert.match(capability.publishBlockReason || '', /Phase 5/);
});

test('publish validation blocks demo destinations', () => {
  const issues = validateComposerDestinations({
    intent: 'publish',
    accounts: [account()],
    baseContent: { caption: 'Hello', mediaIds: [] },
    platformContent: {},
  });

  assert.equal(
    issues.some((issue) => issue.code === 'live_publish_unavailable'),
    true,
  );
});

test('draft validation allows demo destination with valid content', () => {
  const issues = validateComposerDestinations({
    intent: 'draft',
    accounts: [account()],
    baseContent: { caption: 'Hello', mediaIds: [] },
    platformContent: {},
  });

  assert.deepEqual(issues, []);
});

test('platform-specific content is validated against centralized limits', () => {
  const issues = validateComposerDestinations({
    intent: 'draft',
    accounts: [
      account({
        platform: 'twitter',
        displayName: 'Creator X',
      }),
    ],
    baseContent: { caption: 'Base', mediaIds: [] },
    platformContent: {
      twitter: {
        caption: 'x'.repeat(281),
        mediaIds: [],
      },
    },
  });

  assert.equal(
    issues.some(
      (issue) =>
        issue.code === 'caption_limit' && issue.platform === 'twitter',
    ),
    true,
  );
});

test('draft and local plan need no demo or connected account', () => {
  for (const intent of ['draft', 'schedule'] as const) {
    const issues = validateComposerDestinations({
      intent, accounts: [],
      baseContent: { caption: 'A real draft', mediaIds: [] },
      platformContent: {},
    });
    assert.deepEqual(issues, []);
  }
});

test('empty accountless drafts are still invalid', () => {
  const issues = validateComposerDestinations({
    intent: 'draft', accounts: [],
    baseContent: { caption: ' ', mediaIds: [] },
    platformContent: {},
  });
  assert.equal(issues.some(issue => issue.code === 'empty_content'), true);
});

test('live publishing without a verified account is blocked', () => {
  const issues = validateComposerDestinations({
    intent: 'publish', accounts: [],
    baseContent: { caption: 'Hello', mediaIds: [] },
    platformContent: {},
  });
  assert.equal(issues.some(issue => issue.code === 'no_destination'), true);
});
