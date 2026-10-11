import type { Database } from '../backend/database.types';
import { buildCloudDraftPayload, type CloudDraftInput } from './cloudDrafts';
import { CLOUD_CONTENT_PLATFORMS, type CloudContentPlatform } from './cloudPlatforms';
export { CLOUD_CONTENT_PLATFORMS, type CloudContentPlatform } from './cloudPlatforms';

type Tables = Database['public']['Tables'];
export type CloudWorkspace = Tables['creator_workspaces']['Row'];
export type CloudContentItem = Tables['creator_content_items']['Row'];
export type CloudPost = Tables['creator_posts']['Row'];
export type CloudPostMedia = Tables['creator_post_media']['Row'];


export const CLOUD_PIPELINE_STAGES = [
  'ideas', 'research', 'script', 'recording', 'editing', 'ready', 'scheduled', 'published',
] as const;
export type CloudPipelineStage = typeof CLOUD_PIPELINE_STAGES[number];

export const CLOUD_CONTENT_FORMATS = ['short', 'long', 'image', 'carousel', 'text'] as const;
export type CloudContentFormat = typeof CLOUD_CONTENT_FORMATS[number];



/** Only browser-owned planning fields, never workspace ID, owner, or provider outcome. */
export type CloudContentChanges = {
  title?: string;
  notes?: string;
  stage?: CloudPipelineStage;
  format?: CloudContentFormat;
  platforms?: CloudContentPlatform[];
  target_date?: string | null;
};

function normalizeContentChanges(changes: CloudContentChanges): CloudContentChanges {
  const allowedKeys = new Set(['title', 'notes', 'stage', 'format', 'platforms', 'target_date']);
  if (Object.keys(changes).length === 0 || Object.keys(changes).some((key) => !allowedKeys.has(key))) {
    throw new Error('Invalid content update fields');
  }
  const clean: CloudContentChanges = {};
  if (changes.title !== undefined) {
    if (typeof changes.title !== 'string' || changes.title.trim().length < 1 ||
        changes.title.trim().length > 240) throw new Error('Content title must have 1–240 characters');
    clean.title = changes.title.trim();
  }
  if (changes.notes !== undefined) {
    if (typeof changes.notes !== 'string' || changes.notes.length > 10000) {
      throw new Error('Content notes must have at most 10000 characters');
    }
    clean.notes = changes.notes;
  }
  if (changes.stage !== undefined) {
    if (!CLOUD_PIPELINE_STAGES.includes(changes.stage)) throw new Error('Invalid pipeline stage');
    clean.stage = changes.stage;
  }
  if (changes.format !== undefined) {
    if (!CLOUD_CONTENT_FORMATS.includes(changes.format)) throw new Error('Invalid content format');
    clean.format = changes.format;
  }
  if (changes.platforms !== undefined) {
    if (!Array.isArray(changes.platforms) ||
        new Set(changes.platforms).size !== changes.platforms.length ||
        !changes.platforms.every((platform) => CLOUD_CONTENT_PLATFORMS.includes(platform))) {
      throw new Error('Invalid content platforms');
    }
    clean.platforms = [...changes.platforms];
  }
  if (changes.target_date !== undefined) {
    if (changes.target_date !== null &&
        (typeof changes.target_date !== 'string' ||
         !/^\d{4}-\d{2}-\d{2}$/.test(changes.target_date) ||
         !Number.isFinite(Date.parse(changes.target_date + 'T00:00:00Z')) ||
         new Date(changes.target_date + 'T00:00:00Z').toISOString().slice(0, 10) !== changes.target_date)) {
      throw new Error('Invalid target date');
    }
    clean.target_date = changes.target_date;
  }
  return clean;
}

export type AccessTokenProvider = () => string | null | Promise<string | null>;

export interface CreatorCloudOptions {
  url: string;
  publishableKey: string;
  getAccessToken: AccessTokenProvider;
  fetchImpl?: typeof fetch;
}

/** Only the existing dedicated Creator Lab project. No service role in browser. */
const PROJECT_HOST = 'aoyrijspyygqoyeajxpf.supabase.co';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CloudRequestError extends Error {
  constructor(public readonly status: number) {
    // No raw Supabase response body, SQL details, token or user data in UI errors.
    super('Creator Lab Cloud request failed (HTTP ' + status + ')');
    this.name = 'CloudRequestError';
  }
}

export class CloudAuthenticationRequired extends Error {
  constructor() {
    super('Sign in with a verified Creator Lab account before accessing cloud data');
    this.name = 'CloudAuthenticationRequired';
  }
}

export function requireAuthenticatedUserToken(token: string): void {
  // Defense in depth only. The Supabase API verifies the JWT signature/expiry.
  // This prevents accidentally sending a service_role JWT from frontend code.
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT shape');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const utf8 = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(utf8)) as {
      role?: string;
      sub?: string;
      is_anonymous?: boolean;
    };
    if (claims.role !== 'authenticated' || !claims.sub ||
        !UUID.test(claims.sub) || claims.is_anonymous === true) {
      throw new Error('Not an authenticated user JWT');
    }
  } catch {
    throw new CloudAuthenticationRequired();
  }
}

function requireUuid(value: string, label: string): string {
  if (!UUID.test(value)) throw new Error('Invalid ' + label);
  return value;
}

/**
 * Remote-only data adapter. Does NOT touch localStorage/AppContext demo records,
 * fabricate accounts, issue tokens or provide a fallback to unscoped records.
 *
 * A production Auth session manager must supply a fresh user JWT, and the
 * database RLS policies remain the authoritative workspace permission gate.
 */
export function createCreatorCloudClient(options: CreatorCloudOptions) {
  const url = new URL(options.url);
  if (url.protocol !== 'https:' || url.hostname !== PROJECT_HOST ||
      url.pathname !== '/' || url.search || url.hash || url.port ||
      url.username || url.password) {
    throw new Error('Cloud client must target the dedicated Creator Lab Supabase project');
  }
  if (!options.publishableKey.startsWith('sb_publishable_')) {
    throw new Error('Only browser-safe Supabase publishable keys are accepted');
  }
  const requestFetch = options.fetchImpl ?? fetch;

  async function request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: object, returnRows = false,
  ): Promise<T> {
    const token = await options.getAccessToken();
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new CloudAuthenticationRequired();
    }
    requireAuthenticatedUserToken(token);
    const response = await requestFetch(url.origin + path, {
      method,
      headers: {
        apikey: options.publishableKey,
        Authorization: 'Bearer ' + token,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(returnRows ? { Prefer: 'return=representation' } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new CloudRequestError(response.status);
    return await response.json() as T;
  }

  return {
    /** RLS returns only workspaces where the JWT user is an actual member. */
    listWorkspaces(): Promise<CloudWorkspace[]> {
      return request<CloudWorkspace[]>('GET',
        '/rest/v1/creator_workspaces?select=id,name,timezone,created_at,updated_at&order=created_at.asc');
    },

    /** Atomic owner + membership creation. Direct table INSERT is forbidden. */
    createWorkspace(name: string, timezone = 'UTC'): Promise<string> {
      if (name.trim().length < 2 || name.trim().length > 100) {
        throw new Error('Workspace name must be between 2 and 100 characters');
      }
      return request<string>('POST', '/rest/v1/rpc/creator_create_workspace',
        { workspace_name: name.trim(), workspace_timezone: timezone });
    },

    /** Server RLS enforces membership; client additionally constrains workspace. */
    listContentItems(workspaceId: string): Promise<CloudContentItem[]> {
      const id = requireUuid(workspaceId, 'workspace ID');
      return request<CloudContentItem[]>('GET',
        '/rest/v1/creator_content_items?select=*&workspace_id=eq.' +
        id + '&order=sort_order.asc,created_at.asc');
    },

    async createContentItem(
      workspaceId: string, title: string,
      details?: Omit<CloudContentChanges, 'title'>,
    ): Promise<CloudContentItem> {
      const id = requireUuid(workspaceId, 'workspace ID');
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 240) {
        throw new Error('Content title must be between 1 and 240 characters');
      }
      // One atomic INSERT, never an INSERT followed by a PATCH that could fail
      // halfway and leave an invisible/duplicated draft.
      const valid = details === undefined ? {} : normalizeContentChanges(details);
      const rows = await request<CloudContentItem[]>('POST',
        '/rest/v1/creator_content_items?select=*',
        { workspace_id: id, ...valid, title: title.trim() }, true);
      if (!Array.isArray(rows) || rows.length !== 1 || rows[0].workspace_id !== id) {
        throw new Error('Cloud content write was not confirmed by the server');
      }
      return rows[0];
    },

    /** Updates a SINGLE known workspace item. RLS is the server-side permission gate. */
    async updateContentItem(
      workspaceId: string, itemId: string, changes: CloudContentChanges,
    ): Promise<CloudContentItem> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const iid = requireUuid(itemId, 'content item ID');
      const valid = normalizeContentChanges(changes);
      const rows = await request<CloudContentItem[]>('PATCH',
        '/rest/v1/creator_content_items?workspace_id=eq.' + wid +
        '&id=eq.' + iid + '&select=*',
        valid, true);
      if (!Array.isArray(rows) || rows.length !== 1 || rows[0].workspace_id !== wid ||
          rows[0].id !== iid) {
        throw new Error('Content update was not confirmed. Check workspace permissions.');
      }
      return rows[0];
    },

    /** Delete returns the deleted row; a zero-row RLS result is NOT a success. */
    async deleteContentItem(workspaceId: string, itemId: string): Promise<void> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const iid = requireUuid(itemId, 'content item ID');
      const rows = await request<Array<Pick<CloudContentItem, 'id' | 'workspace_id'>>>(
        'DELETE', '/rest/v1/creator_content_items?workspace_id=eq.' + wid +
        '&id=eq.' + iid + '&select=id,workspace_id', undefined, true,
      );
      if (!Array.isArray(rows) || rows.length !== 1 || rows[0].workspace_id !== wid ||
          rows[0].id !== iid) {
        throw new Error('Content deletion was not confirmed. Check workspace permissions.');
      }
    },

    /**
     * Authenticated cloud drafts ONLY. No scheduled/published statuses, media
     * attachments, provider account IDs, analytics or OAuth connection claims.
     */
    async createDraft(workspaceId: string, input: CloudDraftInput): Promise<CloudPost> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const payload = buildCloudDraftPayload(input);
      const rows = await request<CloudPost[]>('POST',
        '/rest/v1/creator_posts?select=*',
        { workspace_id: wid, status: 'draft', ...payload }, true);
      if (!Array.isArray(rows) || rows.length !== 1 ||
          rows[0].workspace_id !== wid || rows[0].status !== 'draft') {
        throw new Error('Cloud draft creation was not confirmed by the server');
      }
      return rows[0];
    },

    /** Edits only drafts and fails rather than reporting a zero-row RLS success. */
    async updateDraft(
      workspaceId: string, postId: string, input: CloudDraftInput,
    ): Promise<CloudPost> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const pid = requireUuid(postId, 'post ID');
      const payload = buildCloudDraftPayload(input);
      const rows = await request<CloudPost[]>('PATCH',
        '/rest/v1/creator_posts?workspace_id=eq.' + wid +
        '&id=eq.' + pid + '&status=eq.draft&select=*', payload, true);
      if (!Array.isArray(rows) || rows.length !== 1 ||
          rows[0].workspace_id !== wid || rows[0].id !== pid ||
          rows[0].status !== 'draft') {
        throw new Error('Draft update was not confirmed. Check permissions and current status.');
      }
      return rows[0];
    },

    /** Delete only one draft; published and scheduled records cannot be deleted here. */
    async deleteDraft(workspaceId: string, postId: string): Promise<void> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const pid = requireUuid(postId, 'post ID');
      const rows = await request<Array<Pick<CloudPost, 'workspace_id' | 'id' | 'status'>>>(
        'DELETE', '/rest/v1/creator_posts?workspace_id=eq.' + wid +
        '&id=eq.' + pid + '&status=eq.draft&select=id,workspace_id,status', undefined, true);
      if (!Array.isArray(rows) || rows.length !== 1 ||
          rows[0].workspace_id !== wid || rows[0].id !== pid ||
          rows[0].status !== 'draft') {
        throw new Error('Draft deletion was not confirmed. Check permissions and current status.');
      }
    },

    /** Draft-media links have TWO composite server FKs, plus member/editor RLS. */
    async listDraftMedia(workspaceId: string, postId: string): Promise<CloudPostMedia[]> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const pid = requireUuid(postId, 'post ID');
      const rows = await request<CloudPostMedia[]>('GET',
        '/rest/v1/creator_post_media?select=*&workspace_id=eq.' + wid +
        '&post_id=eq.' + pid + '&order=sort_order.asc,created_at.asc');
      if (!Array.isArray(rows) || rows.some((r) => r.workspace_id !== wid || r.post_id !== pid)) {
        throw new Error('Cloud media links response could not be verified');
      }
      return rows;
    },

    async attachDraftMedia(
      workspaceId: string, postId: string, mediaAssetId: string,
    ): Promise<CloudPostMedia> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const pid = requireUuid(postId, 'post ID');
      const aid = requireUuid(mediaAssetId, 'media asset ID');
      const rows = await request<CloudPostMedia[]>('POST',
        '/rest/v1/creator_post_media?select=*',
        { workspace_id: wid, post_id: pid, media_asset_id: aid }, true);
      if (!Array.isArray(rows) || rows.length !== 1 ||
          rows[0].workspace_id !== wid || rows[0].post_id !== pid ||
          rows[0].media_asset_id !== aid) {
        throw new Error('Media attachment was not confirmed by the server');
      }
      return rows[0];
    },

    async detachDraftMedia(
      workspaceId: string, postId: string, mediaAssetId: string,
    ): Promise<void> {
      const wid = requireUuid(workspaceId, 'workspace ID');
      const pid = requireUuid(postId, 'post ID');
      const aid = requireUuid(mediaAssetId, 'media asset ID');
      const rows = await request<CloudPostMedia[]>('DELETE',
        '/rest/v1/creator_post_media?workspace_id=eq.' + wid +
        '&post_id=eq.' + pid + '&media_asset_id=eq.' + aid +
        '&select=workspace_id,post_id,media_asset_id', undefined, true);
      if (!Array.isArray(rows) || rows.length !== 1 ||
          rows[0].workspace_id !== wid || rows[0].post_id !== pid ||
          rows[0].media_asset_id !== aid) {
        throw new Error('Media removal from draft was not confirmed by the server');
      }
    },

    /** Read-only until backend-owned provider publishing is integrated. */
    listPosts(workspaceId: string): Promise<CloudPost[]> {
      const id = requireUuid(workspaceId, 'workspace ID');
      return request<CloudPost[]>('GET',
        '/rest/v1/creator_posts?select=*&workspace_id=eq.' +
        id + '&order=created_at.desc');
    },
  };
}
