import {
  AnalyticsMetric,
  AppState,
  ContentItem,
  Experiment,
  MediaAsset,
  MediaFolder,
  Platform,
  PlatformSpecificContent,
  Post,
  PostContent,
  PostPerformance,
  SocialAccount,
  Workspace,
} from '../types';

export const PERSISTED_STATE_KEY = 'creator_lab_state';
export const PERSISTED_STATE_SCHEMA_VERSION = 2 as const;

export interface PersistedStateEnvelopeV2 {
  schemaVersion: typeof PERSISTED_STATE_SCHEMA_VERSION;
  state: AppState;
}

interface PersistedStateEnvelope {
  schemaVersion: number;
  state: unknown;
}

export interface PersistenceNormalizationOptions {
  now?: string;
  defaultTimezone?: string;
}

type Migration = (
  envelope: PersistedStateEnvelope,
  options: PersistenceNormalizationOptions,
) => PersistedStateEnvelope | null;

const asArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value as T[] : [];

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function getDefaultTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone && isValidTimeZone(timezone) ? timezone : 'UTC';
  } catch {
    return 'UTC';
  }
}

function normalizePostContent(content: PostContent | undefined): PostContent {
  return {
    caption: typeof content?.caption === 'string' ? content.caption : '',
    mediaIds: asArray<string>(content?.mediaIds).filter(
      (mediaId) => typeof mediaId === 'string',
    ),
  };
}

export function normalizeAppState(
  raw: unknown,
  options: PersistenceNormalizationOptions = {},
): AppState | null {
  if (!raw || typeof raw !== 'object') return null;

  const parsed = raw as Partial<AppState>;
  const now = options.now || new Date().toISOString();
  const configuredDefaultTimezone = options.defaultTimezone || getDefaultTimezone();
  const defaultTimezone = isValidTimeZone(configuredDefaultTimezone)
    ? configuredDefaultTimezone
    : 'UTC';

  const workspaces: Workspace[] = asArray<Workspace>(parsed.workspaces)
    .filter(
      (workspace) =>
        Boolean(workspace) &&
        typeof workspace.id === 'string' &&
        workspace.id.trim().length > 0,
    )
    .map((workspace) => ({
      ...workspace,
      name:
        typeof workspace.name === 'string' && workspace.name.trim()
          ? workspace.name
          : 'Workspace',
      plan:
        workspace.plan === 'pro' || workspace.plan === 'enterprise'
          ? workspace.plan
          : 'free',
      timezone:
        typeof workspace.timezone === 'string' &&
        isValidTimeZone(workspace.timezone)
          ? workspace.timezone
          : defaultTimezone,
      createdAt:
        typeof workspace.createdAt === 'string' && workspace.createdAt
          ? workspace.createdAt
          : now,
    }));

  if (workspaces.length === 0) return null;

  const fallbackWorkspaceId = workspaces[0].id;
  const activeWorkspaceId =
    typeof parsed.activeWorkspaceId === 'string' &&
    workspaces.some((workspace) => workspace.id === parsed.activeWorkspaceId)
      ? parsed.activeWorkspaceId
      : fallbackWorkspaceId;

  const socialAccounts: SocialAccount[] = asArray<SocialAccount>(
    parsed.socialAccounts,
  ).map((account) => ({
    ...account,
    workspaceId: account.workspaceId || activeWorkspaceId,
    connectionMode: account.connectionMode === 'oauth' ? 'oauth' : 'demo',
    lastSync: typeof account.lastSync === 'string' ? account.lastSync : '',
  }));

  const posts: Post[] = asArray<Post>(parsed.posts).map((post) => ({
    ...post,
    workspaceId: post.workspaceId || activeWorkspaceId,
    title: typeof post.title === 'string' ? post.title : 'Untitled Post',
    destinationAccountIds: asArray<string>(post.destinationAccountIds).filter(
      (accountId) => typeof accountId === 'string',
    ),
    originalContent: normalizePostContent(post.originalContent),
    platformContent: asArray<PlatformSpecificContent>(post.platformContent).map(
      (platformContent): PlatformSpecificContent => ({
        ...platformContent,
        enabled: platformContent.enabled ?? true,
        content: normalizePostContent(platformContent.content),
      }),
    ),
    createdAt:
      typeof post.createdAt === 'string' && post.createdAt ? post.createdAt : now,
  }));

  const mediaAssets: MediaAsset[] = asArray<MediaAsset>(parsed.mediaAssets).map(
    (asset) => {
      const inferredStorageType =
        asset.storageType === 'remote' ||
        asset.storageType === 'indexeddb' ||
        asset.storageType === 'demo_remote'
          ? asset.storageType
          : asset.url?.startsWith('blob:')
            ? 'indexeddb'
            : asset.url?.startsWith('http://') || asset.url?.startsWith('https://')
              ? 'demo_remote'
              : 'indexeddb';

      return {
        ...asset,
        workspaceId: asset.workspaceId || activeWorkspaceId,
        url: inferredStorageType === 'indexeddb' ? '' : (asset.url || ''),
        storageType: inferredStorageType,
        createdAt:
          typeof asset.createdAt === 'string' && asset.createdAt
            ? asset.createdAt
            : now,
      };
    },
  );

  const mediaFolders: MediaFolder[] = asArray<MediaFolder>(
    parsed.mediaFolders,
  ).map((folder) => ({
    ...folder,
    workspaceId: folder.workspaceId || activeWorkspaceId,
    createdAt:
      typeof folder.createdAt === 'string' && folder.createdAt
        ? folder.createdAt
        : now,
  }));

  const pipelineItems: ContentItem[] = asArray<ContentItem>(
    parsed.pipelineItems,
  ).map((item, index) => ({
    ...item,
    workspaceId: item.workspaceId || activeWorkspaceId,
    platforms: asArray<Platform>(item.platforms),
    owner: typeof item.owner === 'string' ? item.owner : '',
    order: typeof item.order === 'number' ? item.order : index,
    notes: typeof item.notes === 'string' ? item.notes : '',
    tags: asArray<string>(item.tags).filter((tag) => typeof tag === 'string'),
  }));

  const experiments: Experiment[] = asArray<Experiment>(
    parsed.experiments,
  ).map((experiment) => ({
    ...experiment,
    workspaceId: experiment.workspaceId || activeWorkspaceId,
  }));

  const analytics: AnalyticsMetric[] = asArray<AnalyticsMetric>(
    parsed.analytics,
  ).map((metric) => ({
    ...metric,
    workspaceId: metric.workspaceId || activeWorkspaceId,
    source:
      metric.source === 'provider' ||
      metric.source === 'derived' ||
      metric.source === 'user'
        ? metric.source
        : 'demo',
  }));

  const postPerformances: PostPerformance[] = asArray<PostPerformance>(
    parsed.postPerformances,
  ).map((performance) => ({
    ...performance,
    workspaceId: performance.workspaceId || activeWorkspaceId,
    source:
      performance.source === 'provider' ||
      performance.source === 'derived' ||
      performance.source === 'user'
        ? performance.source
        : 'demo',
  }));

  return {
    workspaces,
    activeWorkspaceId,
    socialAccounts,
    posts,
    mediaAssets,
    mediaFolders,
    pipelineItems,
    experiments,
    analytics,
    postPerformances,
  };
}

function toVersionedEnvelope(raw: unknown): PersistedStateEnvelope | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Partial<PersistedStateEnvelope>;
  if ('schemaVersion' in candidate) {
    if (
      typeof candidate.schemaVersion !== 'number' ||
      !Number.isInteger(candidate.schemaVersion) ||
      candidate.schemaVersion < 0 ||
      !('state' in candidate)
    ) {
      return null;
    }

    return {
      schemaVersion: candidate.schemaVersion,
      state: candidate.state,
    };
  }

  return {
    schemaVersion: 0,
    state: raw,
  };
}

const migrations: Record<number, Migration> = {
  0: (envelope, options) => {
    const state = normalizeAppState(envelope.state, options);
    if (!state) return null;

    return {
      schemaVersion: 1,
      state,
    };
  },
  1: (envelope, options) => {
    const state = normalizeAppState(envelope.state, options);
    if (!state) return null;

    return {
      schemaVersion: 2,
      state,
    };
  },
};

export function migratePersistedState(
  raw: unknown,
  options: PersistenceNormalizationOptions = {},
): PersistedStateEnvelopeV2 | null {
  let envelope = toVersionedEnvelope(raw);
  if (!envelope) return null;

  if (envelope.schemaVersion > PERSISTED_STATE_SCHEMA_VERSION) {
    return null;
  }

  while (envelope.schemaVersion < PERSISTED_STATE_SCHEMA_VERSION) {
    const migration = migrations[envelope.schemaVersion];
    if (!migration) return null;

    envelope = migration(envelope, options);
    if (!envelope) return null;
  }

  const state = normalizeAppState(envelope.state, options);
  if (!state) return null;

  return {
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    state,
  };
}

export function deserializePersistedState(
  serialized: string,
  options: PersistenceNormalizationOptions = {},
): AppState | null {
  try {
    const migrated = migratePersistedState(JSON.parse(serialized), options);
    return migrated?.state || null;
  } catch {
    return null;
  }
}

export function serializePersistedState(state: AppState): string {
  const envelope: PersistedStateEnvelopeV2 = {
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    state,
  };

  return JSON.stringify(envelope);
}
