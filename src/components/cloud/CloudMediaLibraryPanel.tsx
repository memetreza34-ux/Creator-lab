import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createCreatorMediaClient, isSupportedMediaAsset, CloudMediaReconciliationRequired,
  type CloudMediaAsset,
} from '../../cloud/creatorMediaClient';

type MediaClient = ReturnType<typeof createCreatorMediaClient>;
const action = 'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium disabled:opacity-50 hover:bg-zinc-50';

function safeMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Private media request failed';
}

/** Private, authenticated view. Object URLs are temporary and never public. */
export function CloudMediaLibraryPanel({ media, workspaceId }: {
  media: MediaClient;
  workspaceId: string;
}) {
  const [assets, setAssets] = useState<CloudMediaAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsReconciliation, setNeedsReconciliation] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<{
    id: string; url: string; mime: string; name: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const previewUrl = useRef<string | null>(null);
  const mounted = useRef(true);

  function clearPreview() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
  }

  useEffect(() => {
    let active = true;
    mounted.current = true;
    setLoading(true);
    setAssets([]);
    void media.listMedia(workspaceId).then((items) => {
      if (active) { setAssets(items); setLoading(false); }
    }).catch((err: unknown) => {
      if (active) { setError(safeMessage(err)); setLoading(false); }
    });
    return () => {
      active = false;
      mounted.current = false;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    };
  }, [media, workspaceId]);

  async function reload() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    clearPreview();
    try {
      const fresh = await media.listMedia(workspaceId);
      setAssets(fresh);
      setNeedsReconciliation(false);
      setNotice('Private media metadata reloaded from the server.');
    } catch (err) {
      setError(safeMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy || needsReconciliation) return;
    setBusy(true);
    setError('');
    setNotice('');
    let writeConfirmed = false;
    try {
      const saved = await media.uploadMedia(workspaceId, file);
      writeConfirmed = true;
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      const fresh = await media.listMedia(workspaceId);
      setAssets(fresh);
      setNotice('Private file saved in Storage and confirmed in your cloud media index.');
      if (!fresh.some((asset) => asset.id === saved.id)) {
        throw new CloudMediaReconciliationRequired();
      }
    } catch (err) {
      if (writeConfirmed || err instanceof CloudMediaReconciliationRequired) setNeedsReconciliation(true);
      setError('Upload not confirmed. Check the cloud media list before retrying. ' +
        safeMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function showPrivatePreview(asset: CloudMediaAsset) {
    if (busy || needsReconciliation) return;
    setBusy(true);
    setError('');
    clearPreview();
    try {
      const blob = await media.loadPrivateBlob(workspaceId, asset);
      if (!mounted.current) return;
      const url = URL.createObjectURL(blob);
      previewUrl.current = url;
      setPreview({ id: asset.id, url, mime: asset.mime_type, name: asset.file_name });
    } catch (err) {
      setError(safeMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(asset: CloudMediaAsset) {
    if (busy || needsReconciliation ||
        !window.confirm('Permanently delete "' + asset.file_name + '"? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    setNotice('');
    if (preview?.id === asset.id) clearPreview();
    let writeConfirmed = false;
    try {
      await media.deleteMedia(workspaceId, asset);
      writeConfirmed = true;
      const fresh = await media.listMedia(workspaceId);
      setAssets(fresh);
      if (fresh.some((entry) => entry.id === asset.id)) {
        throw new CloudMediaReconciliationRequired();
      }
      setNotice('Storage object and cloud media record were both deleted.');
    } catch (err) {
      if (writeConfirmed || err instanceof CloudMediaReconciliationRequired) setNeedsReconciliation(true);
      setError('Deletion failed or may be incomplete. If the file is attached to a draft, detach it first. Avoid retrying until you reconcile the server state. ' +
        safeMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Private cloud media library"
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Private cloud media library</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Workspace-only files. Images and small videos up to 6 MiB. No public links or automatic draft attachments.
          </p>
        </div>
        <button type="button" disabled={busy || loading} className={action}
          onClick={() => { void reload(); }}>Reload media index</button>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-zinc-200 p-3 text-xs">{notice}</p>}
      {needsReconciliation && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
          Storage and database metadata may be out of sync. Retry only after checking the server state.
          If a file is missing or an unindexed file remains, an administrator must reconcile it.
        </p>
      )}

      <form onSubmit={upload} className="flex flex-wrap items-end gap-3 rounded-lg bg-zinc-50 p-4">
        <label className="min-w-48 flex-1 text-xs font-medium">
          Choose an image or small video
          <input ref={fileInput} type="file" className="mt-2 block w-full text-xs"
            accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            aria-describedby="cloud-upload-limit"/>
        </label>
        <button type="submit" disabled={!file || busy || loading || needsReconciliation}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {busy ? 'Processing…' : 'Upload privately'}
        </button>
        <p id="cloud-upload-limit" className="w-full text-xs text-zinc-500">
          Maximum 6 MiB per file. Content and extension are validated locally; server-side scanning is required before general release.
        </p>
      </form>
      {loading ? <p role="status" className="text-sm text-zinc-500">Loading private media…</p> :
        assets.length === 0 ? <p className="text-sm text-zinc-500">No uploaded cloud files yet.</p> :
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const supported = isSupportedMediaAsset(workspaceId, asset);
              return (
                <li key={asset.id} className="min-w-0 rounded-lg border border-zinc-200 p-3">
                  <p className="break-all text-sm font-medium">{asset.file_name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {asset.mime_type} · {(asset.size_bytes / 1024 / 1024).toFixed(2)} MiB
                  </p>
                  {!supported && <p className="mt-2 text-xs text-amber-800">
                    This record has an unsupported type, size or path and is protected from preview/deletion.
                  </p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busy || needsReconciliation || !supported}
                      className={action} onClick={() => { void showPrivatePreview(asset); }}>
                      Preview privately
                    </button>
                    <button type="button" disabled={busy || needsReconciliation || !supported}
                      className={action + ' text-red-700'} onClick={() => { void remove(asset); }}>
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
      }

      {preview && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="break-all text-xs font-medium">Authenticated preview: {preview.name}</p>
            <button type="button" className={action} onClick={clearPreview}>Close preview</button>
          </div>
          {preview.mime.startsWith('image/') ?
            <img src={preview.url} alt={'Private media: ' + preview.name}
              className="max-h-72 max-w-full rounded object-contain"/> :
            <video src={preview.url} controls preload="metadata"
              className="max-h-72 max-w-full rounded" aria-label={'Private video: ' + preview.name}/>}
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Files are in a private Supabase bucket. Temporary browser previews are revoked when closed.
        To use a file in a draft, save your draft and attach it there. Detach files from every draft before deleting them here. Provider publishing is not enabled.
      </p>
    </section>
  );
}
