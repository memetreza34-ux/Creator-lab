import type { Database } from '../backend/database.types';

type Tables = Database['public']['Tables'];
export type CloudWorkspace = Tables['creator_workspaces']['Row'];
export type CloudContentItem = Tables['creator_content_items']['Row'];
export type CloudPost = Tables['creator_posts']['Row'];

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

function requireAuthenticatedUserToken(token: string): void {
  // Defense in depth only. The Supabase API verifies the JWT signature/expiry.
  // This prevents accidentally sending a service_role JWT from frontend code.
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT shape');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload)) as {
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
    method: 'GET' | 'POST', path: string, body?: object, returnRows = false,
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

    async createContentItem(workspaceId: string, title: string): Promise<CloudContentItem> {
      const id = requireUuid(workspaceId, 'workspace ID');
      if (!title.trim() || title.trim().length > 240) {
        throw new Error('Content title must be between 1 and 240 characters');
      }
      const rows = await request<CloudContentItem[]>('POST',
        '/rest/v1/creator_content_items?select=*',
        { workspace_id: id, title: title.trim() }, true);
      if (rows.length !== 1) {
        throw new Error('Cloud content write was not confirmed by the server');
      }
      return rows[0];
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
