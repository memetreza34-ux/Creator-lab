import type { Database } from '../backend/database.types';
import {
  CloudAuthenticationRequired, CloudRequestError, createCreatorCloudClient,
  requireAuthenticatedUserToken, type AccessTokenProvider,
} from './creatorCloudClient';

export type CloudMediaAsset = Database['public']['Tables']['creator_media_assets']['Row'];

const BUCKET = 'creator-media';
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const SAFE_FILE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/;

export const CLOUD_MEDIA_MIME: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

export class CloudMediaReconciliationRequired extends Error {
  constructor() {
    super('Cloud upload/delete state could not be confirmed. Do not retry automatically; ask an administrator to reconcile Storage and asset metadata.');
    this.name = 'CloudMediaReconciliationRequired';
  }
}

function requireId(id: string, what: string): string {
  if (typeof id !== 'string' || !UUID.test(id)) throw new Error('Invalid ' + what);
  return id;
}

function verifyStoredPath(workspaceId: string, asset: CloudMediaAsset): string {
  const id = requireId(asset.id, 'media ID');
  if (asset.workspace_id !== workspaceId ||
      !asset.object_path.startsWith(workspaceId + '/' + id + '/')) {
    throw new Error('Media asset path does not belong to this workspace');
  }
  const name = asset.object_path.slice((workspaceId + '/' + id + '/').length);
  if (!SAFE_FILE_NAME.test(name) || name === '.' || name === '..') {
    throw new Error('Media asset path is not safe to request');
  }
  return asset.object_path;
}

export function isSupportedMediaAsset(workspaceId: string, asset: CloudMediaAsset): boolean {
  try {
    verifyStoredPath(workspaceId, asset);
    return typeof asset.mime_type === 'string' &&
      Object.hasOwn(CLOUD_MEDIA_MIME, asset.mime_type) &&
      typeof asset.size_bytes === 'number' &&
      asset.size_bytes > 0 && asset.size_bytes <= MAX_UPLOAD_BYTES;
  } catch {
    return false;
  }
}

function contentExtension(type: string): string {
  const result = CLOUD_MEDIA_MIME[type];
  if (!result) throw new Error('Only JPG, PNG, WEBP, GIF, MP4 and MOV are supported');
  return result;
}

function mediaSignatureValid(type: string, data: Uint8Array): boolean {
  const bytes = [...data];
  const ascii = (begin: number, value: string) => value.split('').every(
    (character, i) => bytes[begin + i] === character.charCodeAt(0),
  );
  switch (type) {
    case 'image/jpeg': return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case 'image/png': return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
    case 'image/webp': return ascii(0, 'RIFF') && ascii(8, 'WEBP');
    case 'image/gif': return ascii(0, 'GIF87a') || ascii(0, 'GIF89a');
    case 'video/mp4': return ascii(4, 'ftyp');
    case 'video/quicktime':
      return ['ftyp', 'moov', 'mdat', 'wide', 'free'].some((atom) => ascii(4, atom));
    default: return false;
  }
}

/**
 * Format and magic-byte checks are UX/accidental misuse defenses, NOT malware
 * scanning. A trusted server-side media pipeline is required before launch.
 */
export async function prepareMediaUpload(file: File, workspaceId: string): Promise<{
  fileName: string; mediaId: string; path: string; mimeType: string; size: number;
}> {
  const wid = requireId(workspaceId, 'workspace ID');
  if (!file || typeof file.name !== 'string' ||
      typeof file.size !== 'number' || typeof file.type !== 'string' ||
      file.size < 1 || file.size > MAX_UPLOAD_BYTES ||
      file.name.length > 160 || file.name.length === 0) {
    throw new Error('Choose a file between 1 byte and 6 MiB with a name under 160 characters');
  }
  const suffix = contentExtension(file.type);
  const actualExtension = file.name.split('.').pop()?.toLowerCase();
  if (actualExtension !== suffix && !(suffix === 'jpg' && actualExtension === 'jpeg')) {
    throw new Error('File extension and content type do not match');
  }
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!mediaSignatureValid(file.type, header)) {
    throw new Error('File contents do not match the selected media format');
  }
  const mediaId = crypto.randomUUID();
  const cleanStem = file.name.slice(0, file.name.lastIndexOf('.'))
    .normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[^a-zA-Z0-9]+/, '').slice(0, 80) || 'asset';
  const normalized = cleanStem + '.' + suffix;
  return { fileName: file.name, mediaId, path: wid + '/' + mediaId + '/' + normalized,
    mimeType: file.type, size: file.size };
}

export function createCreatorMediaClient(options: {
  url: string;
  publishableKey: string;
  getAccessToken: AccessTokenProvider;
  fetchImpl?: typeof fetch;
}) {
  // Reuses the exact cloud origin, key and initial security configuration.
  createCreatorCloudClient(options);
  const origin = new URL(options.url).origin;
  const send = options.fetchImpl ?? fetch;

  async function authorized(
    path: string, method: 'GET' | 'POST' | 'DELETE' | 'HEAD',
    body?: BodyInit, headers: Record<string, string> = {},
  ): Promise<Response> {
    const jwt = await options.getAccessToken();
    if (!jwt) throw new CloudAuthenticationRequired();
    requireAuthenticatedUserToken(jwt);
    let response: Response;
    try {
      response = await send(origin + path, {
        method,
        headers: {
          apikey: options.publishableKey,
          Authorization: 'Bearer ' + jwt,
          ...headers,
        },
        ...(body === undefined ? {} : { body }),
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw new CloudMediaReconciliationRequired();
    }
    if (!response.ok) throw new CloudRequestError(response.status);
    return response;
  }

  async function restRows<T>(path: string, method: 'GET' | 'POST' | 'DELETE',
    body?: object, returnRows = false): Promise<T[]> {
    const response = await authorized('/rest/v1/' + path, method,
      body === undefined ? undefined : JSON.stringify(body),
      {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(returnRows ? { Prefer: 'return=representation' } : {}),
      });
    try {
      const rows: unknown = await response.json();
      if (!Array.isArray(rows)) throw new Error('Not an array');
      return rows as T[];
    } catch {
      throw new CloudMediaReconciliationRequired();
    }
  }

  async function listMedia(workspaceId: string): Promise<CloudMediaAsset[]> {
    const wid = requireId(workspaceId, 'workspace ID');
    const rows = await restRows<CloudMediaAsset>(
      'creator_media_assets?select=*&workspace_id=eq.' + wid + '&order=created_at.desc',
      'GET');
    if (!rows.every((row) => row.workspace_id === wid)) {
      throw new CloudMediaReconciliationRequired();
    }
    return rows;
  }

  async function getByObjectPath(workspaceId: string, path: string): Promise<CloudMediaAsset | null> {
    const wid = requireId(workspaceId, 'workspace ID');
    if (!path.startsWith(wid + '/')) throw new Error('Invalid media recovery path');
    const rows = await restRows<CloudMediaAsset>(
      'creator_media_assets?select=*&workspace_id=eq.' + wid +
      '&object_path=eq.' + encodeURIComponent(path) + '&limit=2', 'GET');
    if (rows.length > 1) throw new CloudMediaReconciliationRequired();
    return rows[0] ?? null;
  }

  async function uploadedObjectExists(path: string): Promise<boolean> {
    try {
      await authorized('/storage/v1/object/authenticated/' + BUCKET + '/' +
        path.split('/').map(encodeURIComponent).join('/'), 'HEAD');
      return true;
    } catch (err) {
      // Only a definitive "not found" is safe evidence that no object exists.
      if (err instanceof CloudRequestError && err.status === 404) return false;
      throw new CloudMediaReconciliationRequired();
    }
  }

  async function removeObject(path: string): Promise<boolean> {
    const result = await authorized('/storage/v1/object/' + BUCKET, 'DELETE',
      JSON.stringify({ prefixes: [path] }), { 'Content-Type': 'application/json' });
    const rows: unknown = await result.json().catch(() => null);
    return Array.isArray(rows) && rows.some((entry) =>
      entry && typeof entry === 'object' && (entry as { name?: unknown }).name === path);
  }

  /**
   * Storage and PostgREST are two services, not one SQL transaction.
   * Upload object first; if metadata creation fails, READ back to disambiguate
   * an unknown network outcome, then try to compensate by deleting the blob.
   * Any uncertainty becomes a visible reconciliation state — never success.
   */
  async function uploadMedia(workspaceId: string, file: File): Promise<CloudMediaAsset> {
    const info = await prepareMediaUpload(file, workspaceId);
    try {
      await authorized(
        '/storage/v1/object/' + BUCKET + '/' + info.path.split('/').map(encodeURIComponent).join('/'),
        'POST', file, { 'Content-Type': info.mimeType, 'x-upsert': 'false', 'cache-control': '3600' });
    } catch (err) {
      if (!(err instanceof CloudMediaReconciliationRequired)) throw err;
      // The connection may drop AFTER Storage commits. Check the unique path
      // before creating metadata or asking the user to upload again.
      if (!await uploadedObjectExists(info.path)) {
        throw new Error('Upload did not complete and no private Storage object was found');
      }
    }
    const row = {
      id: info.mediaId,
      workspace_id: workspaceId,
      object_path: info.path,
      file_name: info.fileName,
      mime_type: info.mimeType,
      size_bytes: info.size,
    };
    try {
      const rows = await restRows<CloudMediaAsset>('creator_media_assets?select=*',
        'POST', row, true);
      if (rows.length !== 1 || rows[0].id !== row.id ||
          rows[0].workspace_id !== workspaceId ||
          rows[0].object_path !== info.path) {
        throw new CloudMediaReconciliationRequired();
      }
      return rows[0];
    } catch {
      // An HTTP timeout after metadata INSERT does NOT prove that it failed.
      let existing: CloudMediaAsset | null;
      try { existing = await getByObjectPath(workspaceId, info.path); }
      catch { throw new CloudMediaReconciliationRequired(); }
      if (existing && existing.id === info.mediaId) return existing;
      if (existing) throw new CloudMediaReconciliationRequired();
      try {
        if (!await removeObject(info.path)) throw new CloudMediaReconciliationRequired();
      } catch {
        throw new CloudMediaReconciliationRequired();
      }
      throw new Error('The upload was not saved in the media library. Its temporary file was cleaned up.');
    }
  }

  async function loadPrivateBlob(workspaceId: string, asset: CloudMediaAsset): Promise<Blob> {
    const wid = requireId(workspaceId, 'workspace ID');
    if (!isSupportedMediaAsset(wid, asset)) {
      throw new Error('Unsupported or malformed cloud media');
    }
    const path = verifyStoredPath(wid, asset);
    const response = await authorized('/storage/v1/object/authenticated/' +
      BUCKET + '/' + path.split('/').map(encodeURIComponent).join('/'), 'GET');
    const length = Number(response.headers.get('content-length'));
    if (length > MAX_UPLOAD_BYTES) throw new Error('Media preview exceeds the size limit');
    const blob = await response.blob();
    if (blob.size > MAX_UPLOAD_BYTES || blob.size === 0 ||
        blob.type !== asset.mime_type) {
      throw new Error('Downloaded media differs from the registered metadata');
    }
    return blob;
  }

  /**
   * Delete Storage FIRST, then metadata. On a failed second step, leave the
   * metadata row visible for reconciliation rather than hiding an orphan blob.
   * No direct DELETE against storage.objects; always use Storage API.
   */
  async function deleteMedia(workspaceId: string, asset: CloudMediaAsset): Promise<void> {
    const wid = requireId(workspaceId, 'workspace ID');
    const path = verifyStoredPath(wid, asset);
    const removed = await removeObject(path);
    if (!removed) throw new CloudMediaReconciliationRequired();
    try {
      const rows = await restRows<Pick<CloudMediaAsset, 'id' | 'workspace_id'>>(
        'creator_media_assets?workspace_id=eq.' + wid +
        '&id=eq.' + asset.id + '&object_path=eq.' +
        encodeURIComponent(path) + '&select=id,workspace_id',
        'DELETE', undefined, true);
      if (rows.length !== 1 || rows[0].id !== asset.id ||
          rows[0].workspace_id !== wid) {
        throw new CloudMediaReconciliationRequired();
      }
    } catch {
      throw new CloudMediaReconciliationRequired();
    }
  }

  return { listMedia, uploadMedia, loadPrivateBlob, deleteMedia };
}
