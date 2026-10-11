import { useEffect, useRef, useState } from 'react';
import {
  createCreatorCloudClient, type CloudPostMedia,
} from '../../cloud/creatorCloudClient';
import {
  createCreatorMediaClient, isSupportedMediaAsset, type CloudMediaAsset,
} from '../../cloud/creatorMediaClient';

type Cloud = ReturnType<typeof createCreatorCloudClient>;
type Media = ReturnType<typeof createCreatorMediaClient>;
const field = 'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs';
const button = 'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium disabled:opacity-50';

function safeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud media request failed';
}

/**
 * First-class private draft attachments in creator_post_media (RLS + FKs).
 * Not JSON mediaIds, not public URLs and not provider publishing.
 * This panel is mounted only after a draft was saved and has a real post UUID.
 */
export function CloudDraftAttachmentsPanel({ cloud, media, workspaceId, postId }: {
  cloud: Cloud;
  media: Media;
  workspaceId: string;
  postId: string;
}) {
  const [assets, setAssets] = useState<CloudMediaAsset[]>([]);
  const [links, setLinks] = useState<CloudPostMedia[]>([]);
  const [choice, setChoice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<{ id: string; url: string; video: boolean } | null>(null);
  const previewUrl = useRef<string | null>(null);
  const active = useRef(true);

  function closePreview() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
  }

  async function fetchCurrent() {
    const [files, attached] = await Promise.all([
      media.listMedia(workspaceId), cloud.listDraftMedia(workspaceId, postId),
    ]);
    if (attached.some((row) =>
      !files.some((asset) => asset.id === row.media_asset_id))) {
      throw new Error('Some attachments have no readable media metadata; ask an administrator to reconcile them');
    }
    return { files, attached };
  }

  useEffect(() => {
    active.current = true;
    let current = true;
    setLoading(true);
    setNeedsReload(false);
    setError('');
    void fetchCurrent().then((data) => {
      if (!current) return;
      setAssets(data.files);
      setLinks(data.attached);
      setLoading(false);
    }).catch((err: unknown) => {
      if (!current) return;
      setError(safeError(err));
      setNeedsReload(true);
      setLoading(false);
    });
    return () => {
      current = false;
      active.current = false;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    };
  }, [cloud, media, workspaceId, postId]);

  async function refresh() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    closePreview();
    try {
      const data = await fetchCurrent();
      if (!active.current) return;
      setAssets(data.files);
      setLinks(data.attached);
      setNeedsReload(false);
      setNotice('Draft attachments reloaded from your private workspace.');
    } catch (err) {
      if (active.current) setError(safeError(err));
    } finally {
      if (active.current) setBusy(false);
    }
  }

  async function attach() {
    if (!choice || busy || loading || needsReload) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!assets.some((asset) => asset.id === choice && isSupportedMediaAsset(workspaceId, asset))) {
        throw new Error('Select an existing, supported file from this workspace');
      }
      await cloud.attachDraftMedia(workspaceId, postId, choice);
      const current = await fetchCurrent();
      if (!current.attached.some((entry) => entry.media_asset_id === choice)) {
        throw new Error('Attachment was not visible on server readback');
      }
      if (!active.current) return;
      setAssets(current.files);
      setLinks(current.attached);
      setChoice('');
      setNotice('The private file is linked to this saved draft.');
    } catch (err) {
      if (!active.current) return;
      setNeedsReload(true);
      setError('Attachment result may be incomplete. Reload before making another change. ' + safeError(err));
    } finally {
      if (active.current) setBusy(false);
    }
  }

  async function detach(assetId: string) {
    if (busy || needsReload) return;
    setBusy(true);
    setError('');
    setNotice('');
    closePreview();
    try {
      await cloud.detachDraftMedia(workspaceId, postId, assetId);
      const current = await fetchCurrent();
      if (current.attached.some((entry) => entry.media_asset_id === assetId)) {
        throw new Error('Attachment still exists on server readback');
      }
      if (!active.current) return;
      setAssets(current.files);
      setLinks(current.attached);
      setNotice('File detached. The original private media file was not deleted.');
    } catch (err) {
      if (!active.current) return;
      setNeedsReload(true);
      setError('Detachment result may be incomplete. Reload before making another change. ' + safeError(err));
    } finally {
      if (active.current) setBusy(false);
    }
  }

  async function showPreview(asset: CloudMediaAsset) {
    if (busy || needsReload) return;
    setBusy(true);
    setError('');
    closePreview();
    try {
      const blob = await media.loadPrivateBlob(workspaceId, asset);
      if (!active.current) return;
      const url = URL.createObjectURL(blob);
      previewUrl.current = url;
      setPreview({ id: asset.id, url, video: asset.mime_type.startsWith('video/') });
    } catch (err) {
      if (active.current) setError(safeError(err));
    } finally {
      if (active.current) setBusy(false);
    }
  }

  const linkedAssets = links.map((link) => assets.find((asset) => asset.id === link.media_asset_id))
    .filter((item): item is CloudMediaAsset => Boolean(item));
  const available = assets.filter((asset) =>
    isSupportedMediaAsset(workspaceId, asset) &&
    !links.some((link) => link.media_asset_id === asset.id));

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4" aria-label="Private draft attachments">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">Private media attachments ({links.length})</h4>
          <p className="mt-1 text-xs text-zinc-600">
            Choose files uploaded in this workspace. An attachment is not a public link or a published post.
          </p>
        </div>
        <button type="button" className={button} disabled={busy || loading}
          onClick={() => { void refresh(); }}>Reload media and links</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-zinc-50 p-2 text-xs">{notice}</p>}
      {loading ? <p role="status" className="text-xs text-zinc-500">Loading private attachments…</p> : (
        <>
          {links.length === 0 ? <p className="text-xs text-zinc-500">No files attached yet.</p> : (
            <ul className="space-y-2">
              {linkedAssets.map((asset) => (
                <li key={asset.id} className="rounded-lg border border-zinc-200 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 break-all text-xs font-medium">{asset.file_name}</span>
                    <div className="flex gap-2">
                      <button type="button" className={button}
                        disabled={busy || needsReload || !isSupportedMediaAsset(workspaceId, asset)}
                        onClick={() => { void showPreview(asset); }}>Preview</button>
                      <button type="button" className={button}
                        disabled={busy || needsReload}
                        onClick={() => { void detach(asset.id); }}>Detach</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-48 flex-1 text-xs font-medium">
              Available private files
              <select className={field + ' mt-1 w-full'} value={choice}
                onChange={(event) => setChoice(event.target.value)}
                disabled={busy || needsReload}>
                <option value="">Select a file…</option>
                {available.map((asset) =>
                  <option key={asset.id} value={asset.id}>{asset.file_name}</option>)}
              </select>
            </label>
            <button type="button" className={button}
              disabled={!choice || busy || needsReload} onClick={() => { void attach(); }}>
              Attach to draft
            </button>
          </div>
          {available.length === 0 && (
            <p className="text-xs text-zinc-500">
              Upload a supported file in the private media library below, then reload this list.
            </p>
          )}
        </>
      )}
      {preview && (
        <div className="rounded-lg bg-zinc-50 p-2">
          <button type="button" className={button} onClick={closePreview}>Close preview</button>
          {preview.video ?
            <video controls preload="metadata" src={preview.url}
              className="mt-2 max-h-72 max-w-full" aria-label="Private draft video"/> :
            <img src={preview.url} alt="Private draft image"
              className="mt-2 max-h-72 max-w-full object-contain"/>}
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Attached files cannot be deleted in Storage until detached from every draft.
      </p>
    </div>
  );
}
