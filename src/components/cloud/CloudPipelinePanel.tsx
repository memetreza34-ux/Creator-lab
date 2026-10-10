import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  CLOUD_PIPELINE_STAGES,
  CLOUD_CONTENT_FORMATS,
  CLOUD_CONTENT_PLATFORMS,
  type CloudContentChanges,
  type CloudContentFormat,
  type CloudContentItem,
  type CloudContentPlatform,
  type CloudPipelineStage,
  createCreatorCloudClient,
} from '../cloud/creatorCloudClient';

type CloudClient = ReturnType<typeof createCreatorCloudClient>;

const stageTitles: Record<CloudPipelineStage, string> = {
  ideas: 'Ideas', research: 'Research', script: 'Script', recording: 'Recording',
  editing: 'Editing', ready: 'Ready', scheduled: 'Planned', published: 'Published',
};

const inputStyle = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const actionStyle = 'rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium disabled:opacity-50 hover:bg-zinc-50';

function describeError(err: unknown) {
  // Underlying client already removes response body and sensitive content.
  return err instanceof Error ? err.message : 'Cloud operation failed';
}

/**
 * Entirely remote-backed workflow. This component never reads the local
 * prototype/AppContext. Each mutation is confirmed by PostgREST before UI
 * reflects success. The server enforces workspace membership and RLS roles.
 */
export function CloudPipelinePanel({ cloud, workspaceId }: {
  cloud: CloudClient;
  workspaceId: string;
}) {
  const [items, setItems] = useState<CloudContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [format, setFormat] = useState<CloudContentFormat>('short');
  const [platforms, setPlatforms] = useState<CloudContentPlatform[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editFormat, setEditFormat] = useState<CloudContentFormat>('short');
  const [editDate, setEditDate] = useState('');
  const [editPlatforms, setEditPlatforms] = useState<CloudContentPlatform[]>([]);

  const load = useCallback(async () => {
    return cloud.listContentItems(workspaceId);
  }, [cloud, workspaceId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setItems([]);
    setError('');
    void load().then((rows) => {
      if (active) { setItems(rows); setLoading(false); }
    }).catch((err: unknown) => {
      if (active) { setError(describeError(err)); setLoading(false); }
    });
    return () => { active = false; };
  }, [load]);

  async function reload() {
    if (busyId) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      setItems(await load());
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function perform(label: string, op: () => Promise<unknown>) {
    if (busyId) return;
    setBusyId(label);
    setError('');
    setNotice('');
    try {
      await op();
      const current = await load();
      setItems(current);
      setNotice('Changes confirmed and saved in your cloud workspace.');
    } catch (err) {
      // A write can succeed while a follow-up read fails: never claim it did
      // not reach the server. Reload from the server before retrying a write.
      setError('Unable to confirm the current server state. Reload before retrying a write. ' +
        describeError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || busyId) return;
    await perform('creating', async () => {
      await cloud.createContentItem(workspaceId, title, {
        notes, format, platforms, target_date: dueDate || null,
      });
      setTitle('');
      setNotes('');
      setFormat('short');
      setPlatforms([]);
      setDueDate('');
    });
  }

  function startEditing(item: CloudContentItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditNotes(item.notes);
    setEditFormat(CLOUD_CONTENT_FORMATS.includes(item.format as CloudContentFormat) ?
      item.format as CloudContentFormat : 'short');
    setEditDate(item.target_date ?? '');
    setEditPlatforms(item.platforms.filter((p): p is CloudContentPlatform =>
      (CLOUD_CONTENT_PLATFORMS as readonly string[]).includes(p)));
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || busyId) return;
    const changes: CloudContentChanges = {
      title: editTitle, notes: editNotes, format: editFormat,
      platforms: editPlatforms, target_date: editDate || null,
    };
    await perform(editingId, async () => {
      await cloud.updateContentItem(workspaceId, editingId, changes);
      setEditingId(null);
    });
  }

  async function setStage(item: CloudContentItem, stage: CloudPipelineStage) {
    if (item.stage === stage) return;
    await perform(item.id, () => cloud.updateContentItem(workspaceId, item.id, { stage }));
  }

  async function deleteItem(item: CloudContentItem) {
    if (busyId || !window.confirm('Permanently delete "' + item.title + '" from this cloud workspace?')) return;
    await perform(item.id, async () => {
      await cloud.deleteContentItem(workspaceId, item.id);
      if (editingId === item.id) setEditingId(null);
    });
  }

  const platformFields = (current: CloudContentPlatform[], update: (value: CloudContentPlatform[]) => void) =>
    <fieldset className="mt-2">
      <legend className="text-xs font-medium text-zinc-600">Planned platforms (not connected for publishing)</legend>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-2">
        {CLOUD_CONTENT_PLATFORMS.map((platform) =>
          <label key={platform} className="inline-flex items-center gap-1 text-xs capitalize text-zinc-700">
            <input type="checkbox" checked={current.includes(platform)}
              onChange={(event) => update(event.target.checked ?
                [...current, platform] : current.filter((value) => value !== platform))} />
            {platform}
          </label>,
        )}
      </div>
    </fieldset>;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5" aria-label="Cloud content pipeline">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Cloud content pipeline</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Ideas → Research → Script → Recording → Editing → Ready → Planned → Published.
            These are manual workflow stages, not provider-confirmed publishing statuses.
          </p>
        </div>
        <button type="button" disabled={busyId !== null || loading}
          onClick={() => { void reload(); }} className={actionStyle}>
          Reload from cloud
        </button>
      </div>
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}
      <form onSubmit={createItem} className="mb-6 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold">New content idea</h3>
        <label className="block text-xs font-medium">
          Title
          <input required maxLength={240} className={inputStyle + ' mt-1'} value={title}
            onChange={(event) => setTitle(event.target.value)} placeholder="Video, post or script idea"/>
        </label>
        <label className="block text-xs font-medium">
          Notes / outline
          <textarea maxLength={10000} rows={2} className={inputStyle + ' mt-1'}
            value={notes} onChange={(event) => setNotes(event.target.value)}
            placeholder="The angle, key points or research"/>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium">
            Content format
            <select className={inputStyle + ' mt-1'} value={format}
              onChange={(event) => setFormat(event.target.value as CloudContentFormat)}>
              {CLOUD_CONTENT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium">
            Target date (optional)
            <input type="date" className={inputStyle + ' mt-1'} value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}/>
          </label>
        </div>
        {platformFields(platforms, setPlatforms)}
        <button disabled={busyId !== null} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busyId === 'creating' ? 'Saving…' : 'Save new idea'}
        </button>
      </form>

      {loading ? <p role="status" className="text-sm text-zinc-600">Loading saved pipeline…</p> :
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {CLOUD_PIPELINE_STAGES.map((stage) => {
            const entries = items.filter((item) => item.stage === stage);
            return (
              <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3" key={stage}>
                <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
                  {stageTitles[stage]}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-500">{entries.length}</span>
                </h3>
                {entries.length === 0 && <p className="text-xs text-zinc-400">Nothing here yet</p>}
                <div className="space-y-3">
                  {entries.map((item) =>
                    <article key={item.id} className="break-words rounded-lg border border-zinc-200 bg-white p-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.notes && <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-600">{item.notes}</p>}
                      <p className="mt-2 text-xs text-zinc-500">
                        {item.format}{item.target_date ? ' · Due ' + item.target_date : ''}
                        {item.platforms.length ? ' · ' + item.platforms.join(', ') : ''}
                      </p>
                      <label className="mt-3 block text-xs font-medium">
                        Stage
                        <select className={inputStyle + ' mt-1'} value={item.stage}
                          disabled={busyId !== null} onChange={(event) =>
                            void setStage(item, event.target.value as CloudPipelineStage)}>
                          {CLOUD_PIPELINE_STAGES.map((target) =>
                            <option key={target} value={target}>{stageTitles[target]}</option>)}
                        </select>
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" disabled={busyId !== null} className={actionStyle}
                          onClick={() => startEditing(item)}>Edit</button>
                        <button type="button" disabled={busyId !== null}
                          className={actionStyle + ' text-red-700'} onClick={() => void deleteItem(item)}>Delete</button>
                      </div>
                      {editingId === item.id && (
                        <form onSubmit={saveEdit} className="mt-3 space-y-2 border-t pt-3">
                          <label className="block text-xs font-medium">Title
                            <input required maxLength={240} className={inputStyle + ' mt-1'} value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}/>
                          </label>
                          <label className="block text-xs font-medium">Notes
                            <textarea rows={3} maxLength={10000} className={inputStyle + ' mt-1'} value={editNotes}
                              onChange={(event) => setEditNotes(event.target.value)}/>
                          </label>
                          <label className="block text-xs font-medium">Format
                            <select className={inputStyle + ' mt-1'} value={editFormat}
                              onChange={(event) => setEditFormat(event.target.value as CloudContentFormat)}>
                              {CLOUD_CONTENT_FORMATS.map((entry) => <option key={entry}>{entry}</option>)}
                            </select>
                          </label>
                          <label className="block text-xs font-medium">Target date
                            <input type="date" className={inputStyle + ' mt-1'} value={editDate}
                              onChange={(event) => setEditDate(event.target.value)}/>
                          </label>
                          {platformFields(editPlatforms, setEditPlatforms)}
                          <div className="flex gap-2">
                            <button disabled={busyId !== null} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Save</button>
                            <button type="button" className={actionStyle} onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </article>,
                  )}
                </div>
              </div>
            );
          })}
        </div>
      }
    </section>
  );
}
