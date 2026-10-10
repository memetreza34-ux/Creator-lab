import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  CLOUD_CONTENT_PLATFORMS,
  type CloudContentItem, type CloudContentPlatform, type CloudPost,
  createCreatorCloudClient,
} from '../../cloud/creatorCloudClient';
import { readCloudDraft, type CloudDraftInput } from '../../cloud/cloudDrafts';

type Cloud = ReturnType<typeof createCreatorCloudClient>;
const input = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const btn = 'rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium disabled:opacity-50 hover:bg-zinc-50';

const emptyDraft = (): CloudDraftInput => ({
  title: '', caption: '', sourceContentItemId: null, variants: [],
});

function safeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud request could not be completed';
}

/** Only cloud data; intentionally not the local demo Composer or provider publisher. */
export function CloudDraftComposerPanel({ cloud, workspaceId }: {
  cloud: Cloud;
  workspaceId: string;
}) {
  const [posts, setPosts] = useState<CloudPost[]>([]);
  const [items, setItems] = useState<CloudContentItem[]>([]);
  const [draft, setDraft] = useState<CloudDraftInput>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadNeeded, setReloadNeeded] = useState(false);

  const load = useCallback(async () => {
    const [allPosts, allItems] = await Promise.all([
      cloud.listPosts(workspaceId),
      cloud.listContentItems(workspaceId),
    ]);
    return {
      posts: allPosts.filter((post) => post.workspace_id === workspaceId && post.status === 'draft'),
      items: allItems.filter((item) => item.workspace_id === workspaceId),
    };
  }, [cloud, workspaceId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void load().then((data) => {
      if (active) {
        setPosts(data.posts);
        setItems(data.items);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (active) { setError(safeError(err)); setLoading(false); }
    });
    return () => { active = false; };
  }, [load]);

  async function reload() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await load();
      setPosts(data.posts);
      setItems(data.items);
      // Never silently overwrite unsaved text with server state. The user
      // explicitly chooses a saved draft after reloading.
      setReloadNeeded(false);
      setNotice('Server data reloaded. Select a saved draft to edit its latest version.');
    } catch (err) {
      setError(safeError(err));
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    if (busy) return;
    setEditingId(null);
    setDraft(emptyDraft());
    setError('');
    setNotice('');
  }

  function edit(post: CloudPost) {
    if (busy) return;
    setDraft(readCloudDraft(post));
    setEditingId(post.id);
    setError('');
    setNotice('');
  }

  function togglePlatform(platform: CloudContentPlatform, enabled: boolean) {
    setDraft((previous) => ({
      ...previous,
      variants: enabled
        ? [...previous.variants.filter((variant) => variant.platform !== platform),
          { platform, caption: previous.caption }]
        : previous.variants.filter((variant) => variant.platform !== platform),
    }));
  }

  function changeVariant(platform: CloudContentPlatform, caption: string) {
    setDraft((previous) => ({
      ...previous,
      variants: previous.variants.map((variant) =>
        variant.platform === platform ? { platform, caption } : variant),
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || reloadNeeded) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const saved = editingId
        ? await cloud.updateDraft(workspaceId, editingId, draft)
        : await cloud.createDraft(workspaceId, draft);
      const data = await load();
      setPosts(data.posts);
      setItems(data.items);
      setEditingId(saved.id);
      setDraft(readCloudDraft(saved));
      setNotice('Draft stored and confirmed by the server. No publication was started.');
    } catch (err) {
      setReloadNeeded(true);
      setError('Save result is uncertain. Reload the server state before trying again. ' +
        safeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(post: CloudPost) {
    if (busy || reloadNeeded ||
        !window.confirm('Delete draft "' + post.title + '" permanently from this workspace?')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await cloud.deleteDraft(workspaceId, post.id);
      const data = await load();
      setPosts(data.posts);
      setItems(data.items);
      if (editingId === post.id) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
      setNotice('Draft deletion confirmed by the server.');
    } catch (err) {
      setReloadNeeded(true);
      setError('Delete result is uncertain. Reload the server state before trying again. ' +
        safeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Cloud draft composer" className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Cloud draft composer</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Save written drafts and platform-specific caption variants. No uploads, scheduling or publishing yet.
          </p>
        </div>
        <button type="button" disabled={busy || loading}
          className={btn} onClick={() => { void reload(); }}>Reload server data</button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-zinc-200 p-3 text-xs">{notice}</p>}
      {reloadNeeded && (
        <p className="text-xs font-medium text-amber-800">
          Editing is temporarily paused until you reload. A timed-out request may already have saved.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Saved cloud drafts ({posts.length})</h3>
            <button type="button" className={btn} disabled={busy || reloadNeeded}
              onClick={startNew}>New draft</button>
          </div>
          {loading ? (
            <p role="status" className="text-sm text-zinc-600">Loading cloud drafts…</p>
          ) : posts.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
              No drafts yet. Save your first written draft.
            </p>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => (
                <li key={post.id} className="rounded-lg border border-zinc-200 p-3">
                  <button type="button" disabled={busy || reloadNeeded}
                    onClick={() => edit(post)}
                    aria-current={editingId === post.id ? 'true' : undefined}
                    className="w-full text-left text-sm font-medium hover:underline">
                    {post.title}
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-500">Draft only</span>
                    <button type="button" disabled={busy || reloadNeeded}
                      className="text-xs text-red-700 underline" onClick={() => { void remove(post); }}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={save} className="min-w-0 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold">{editingId ? 'Edit draft' : 'New draft'}</h3>
          <label className="block text-xs font-medium">
            Post title
            <input required maxLength={240} className={input + ' mt-1'} value={draft.title}
              onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))}
              placeholder="What is the post about?"/>
          </label>
          <label className="block text-xs font-medium">
            Source pipeline idea (optional)
            <select className={input + ' mt-1'}
              value={draft.sourceContentItemId ?? ''}
              onChange={(e) => setDraft((v) => ({
                ...v, sourceContentItemId: e.target.value || null,
              }))}>
              <option value="">No linked idea</option>
              {items.map((item) =>
                <option value={item.id} key={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium">
            Base caption / script
            <textarea rows={6} maxLength={6000} className={input + ' mt-1'} value={draft.caption}
              onChange={(e) => setDraft((v) => ({ ...v, caption: e.target.value }))}
              placeholder="Write your draft caption or video script here"/>
            <span className="mt-1 block text-right text-xs text-zinc-500">{draft.caption.length}/6000</span>
          </label>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold">Platform versions (drafts only)</legend>
            <p className="text-xs text-zinc-600">
              These texts are saved for future use. No social platform is connected by selecting it.
            </p>
            <div className="flex flex-wrap gap-3">
              {CLOUD_CONTENT_PLATFORMS.map((platform) => (
                <label className="flex items-center gap-1 text-xs capitalize" key={platform}>
                  <input type="checkbox"
                    checked={draft.variants.some((entry) => entry.platform === platform)}
                    onChange={(e) => togglePlatform(platform, e.target.checked)}/>
                  {platform}
                </label>
              ))}
            </div>
            {draft.variants.map((variant) => (
              <label key={variant.platform} className="block text-xs font-medium">
                <span className="capitalize">{variant.platform} caption</span>
                <textarea rows={3} maxLength={6000} className={input + ' mt-1'}
                  value={variant.caption}
                  onChange={(e) => changeVariant(variant.platform, e.target.value)}/>
              </label>
            ))}
          </fieldset>

          <button disabled={busy || loading || reloadNeeded}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Save draft changes' : 'Save cloud draft'}
          </button>
          <p className="text-xs text-zinc-600">
            This action only saves a draft in your selected cloud workspace.
          </p>
        </form>
      </div>
    </section>
  );
}
