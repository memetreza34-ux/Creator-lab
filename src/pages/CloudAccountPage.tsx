import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createCreatorAuth, type AuthIdentity } from '../auth/creatorAuth';
import { createCreatorCloudClient, type CloudWorkspace, type CloudContentItem } from '../cloud/creatorCloudClient';

type View = 'login' | 'register' | 'forgot' | 'recover';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

function safeMessage(error: unknown): string {
  // The Auth/Cloud layers sanitize service responses; never render a raw backend payload.
  return error instanceof Error ? error.message : 'The request could not be completed';
}

export function CloudAccountPage() {
  const clients = useMemo(() => {
    try {
      const auth = createCreatorAuth({ url, publishableKey });
      const cloud = createCreatorCloudClient({
        url, publishableKey, getAccessToken: auth.getAccessToken,
      });
      return { auth, cloud, configError: '' };
    } catch {
      return { auth: null, cloud: null,
        configError: 'Cloud sign-in is not configured on this installation.' };
    }
  }, []);
  const [booting, setBooting] = useState(true);
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [view, setView] = useState<View>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaces, setWorkspaces] = useState<CloudWorkspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [ideas, setIdeas] = useState<CloudContentItem[]>([]);
  const [ideaTitle, setIdeaTitle] = useState('');

  useEffect(() => {
    if (!clients.auth) {
      setBooting(false);
      return;
    }
    const auth = clients.auth;
    let active = true;
    const unsubscribe = auth.subscribe((next) => {
      if (active) setIdentity(next);
    });

    async function initialize() {
      try {
        // Remove credentials from address bar/history before network requests.
        const hash = window.location.hash;
        if (hash.includes('access_token=') || hash.includes('refresh_token=')) {
          window.history.replaceState(window.history.state, '', window.location.pathname);
          const purpose = await auth.acceptRedirect(hash);
          if (active && purpose === 'recovery') {
            setView('recover');
            setMessage('Choose a new password for your account.');
          } else if (active && purpose === 'signup') {
            setMessage('Your email address has been confirmed.');
          }
        } else {
          await auth.restore();
        }
      } catch (err) {
        if (active) setError(safeMessage(err));
      } finally {
        if (active) setBooting(false);
      }
    }
    void initialize();
    return () => { active = false; unsubscribe(); };
  }, [clients.auth]);

  useEffect(() => {
    if (!clients.auth || !identity) {
      setWorkspaces([]);
      setSelectedWorkspace('');
      setIdeas([]);
      return;
    }
    const auth = clients.auth;
    const interval = window.setInterval(() => { void auth.getAccessToken(); }, 60000);
    return () => window.clearInterval(interval);
  }, [clients.auth, identity?.id]);

  useEffect(() => {
    if (!clients.cloud || !identity || view === 'recover') return;
    let active = true;
    setError('');
    void clients.cloud.listWorkspaces().then((items) => {
      if (active) {
        setWorkspaces(items);
        setSelectedWorkspace((previous) =>
          items.some((entry) => entry.id === previous) ? previous : (items[0]?.id ?? ''));
      }
    }).catch((err: unknown) => {
      if (active) setError(safeMessage(err));
    });
    return () => { active = false; };
  }, [clients.cloud, identity?.id, view]);

  useEffect(() => {
    if (!clients.cloud || !identity || !selectedWorkspace || view === 'recover') {
      setIdeas([]);
      return;
    }
    let active = true;
    setIdeas([]);
    void clients.cloud.listContentItems(selectedWorkspace).then((items) => {
      if (active) setIdeas(items);
    }).catch((err: unknown) => {
      if (active) setError(safeMessage(err));
    });
    return () => { active = false; };
  }, [clients.cloud, identity?.id, selectedWorkspace, view]);

  const resetNotice = () => { setMessage(''); setError(''); };
  const redirectTo = () => window.location.origin + '/cloud';

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clients.auth || busy) return;
    resetNotice();
    if (view === 'register' || view === 'recover') {
      if (password.length < 12) {
        setError('Choose a password containing at least 12 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }
    }
    setBusy(true);
    try {
      if (view === 'login') {
        await clients.auth.signIn(email, password);
        setPassword('');
      } else if (view === 'register') {
        const result = await clients.auth.signUp(email, password, redirectTo());
        setPassword('');
        setConfirmPassword('');
        if (result === 'confirmation-required') {
          setMessage('Check your email for a confirmation link. A message may not arrive immediately.');
        } else {
          setMessage('Account created. Your personal cloud area is available.');
        }
      } else if (view === 'forgot') {
        await clients.auth.requestPasswordReset(email, redirectTo());
        setMessage('If the account exists, password recovery instructions will be emailed.');
      } else if (view === 'recover') {
        await clients.auth.changePassword(password);
        // A recovery link creates a live Auth session. Do not leave the user
        // authenticated while the UI falsely displays the sign-in view.
        await clients.auth.signOut();
        setPassword('');
        setConfirmPassword('');
        setView('login');
        setMessage('Password updated. Sign in with your new password.');
      }
    } catch (err) {
      setError(safeMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clients.cloud || busy) return;
    resetNotice();
    setBusy(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const id = await clients.cloud.createWorkspace(workspaceName, timezone);
      const items = await clients.cloud.listWorkspaces();
      setWorkspaces(items);
      setSelectedWorkspace(id);
      setWorkspaceName('');
      setMessage('Workspace created and saved in your Cloud account.');
    } catch (err) { setError(safeMessage(err)); }
    finally { setBusy(false); }
  }

  async function createIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clients.cloud || !selectedWorkspace || busy) return;
    resetNotice();
    setBusy(true);
    try {
      await clients.cloud.createContentItem(selectedWorkspace, ideaTitle);
      const updated = await clients.cloud.listContentItems(selectedWorkspace);
      setIdeas(updated);
      setIdeaTitle('');
      setMessage('Content idea saved in your cloud workspace.');
    } catch (err) { setError(safeMessage(err)); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (!clients.auth) return;
    resetNotice();
    setBusy(true);
    try {
      await clients.auth.signOut();
      setView('login');
      setPassword('');
      setConfirmPassword('');
      setMessage('Signed out on this device.');
    } finally { setBusy(false); }
  }

  const field = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const button = 'rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-zinc-700';
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Creator Lab Cloud</h1>
            <p className="mt-1 text-sm text-zinc-600">Personal cloud account · Separate from local demo</p>
          </div>
          <Link to="/" className="text-sm font-medium text-indigo-700 underline">
            Open local demo
          </Link>
        </header>

        {clients.configError && (
          <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
            {clients.configError} The existing local demo is still accessible.
          </p>
        )}
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-lg border border-zinc-300 bg-white p-3 text-sm">{message}</p>}

        {booting && !clients.configError && <p role="status">Checking your Cloud session…</p>}

        {!booting && clients.auth && (!identity || view === 'recover') && (
          <section className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">
              {view === 'login' ? 'Sign in' : view === 'register' ? 'Create an account' :
                view === 'forgot' ? 'Reset your password' : 'Set a new password'}
            </h2>
            <p className="mb-5 text-xs text-zinc-600">
              {view === 'register' ? 'You may need to confirm your email before signing in.' :
                'Your cloud account does not import local demo content automatically.'}
            </p>
            <form onSubmit={submitCredentials} className="space-y-3">
              {view !== 'recover' && (
                <label className="block text-xs font-medium">
                  Email address
                  <input className={field + ' mt-1'} type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    maxLength={254} />
                </label>
              )}
              {view !== 'forgot' && (
                <label className="block text-xs font-medium">
                  {view === 'recover' ? 'New password' : 'Password'}
                  <input className={field + ' mt-1'} type="password" required
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    minLength={view === 'login' ? 1 : 12} />
                </label>
              )}
              {(view === 'register' || view === 'recover') && (
                <label className="block text-xs font-medium">
                  Confirm password
                  <input className={field + ' mt-1'} type="password" required
                    autoComplete="new-password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} minLength={12} />
                </label>
              )}
              <button className={button + ' w-full'} type="submit" disabled={busy}>
                {busy ? 'Processing…' : view === 'login' ? 'Sign in' : view === 'register' ?
                  'Create account' : view === 'forgot' ? 'Send recovery email' : 'Update password'}
              </button>
            </form>
            {view !== 'recover' && (
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <button type="button" className="text-indigo-700 underline" onClick={() => { resetNotice(); setView(view === 'login' ? 'register' : 'login'); }}>
                  {view === 'login' ? 'Create an account' : 'Back to sign in'}
                </button>
                {view !== 'forgot' && (
                  <button type="button" className="text-indigo-700 underline" onClick={() => { resetNotice(); setView('forgot'); }}>
                    Forgot password?
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {!booting && identity && view !== 'recover' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Authenticated cloud user</p>
                <p className="mt-1 font-medium">{identity.email || identity.id}</p>
              </div>
              <button type="button" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm" onClick={() => { void logout(); }} disabled={busy}>
                Sign out
              </button>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold">Your cloud workspaces</h2>
              <p className="mb-4 text-xs text-zinc-600">Only workspaces authorized by server-side Row Level Security appear here.</p>
              <div className="mb-4">
                {workspaces.length === 0 ? (
                  <p className="text-sm text-zinc-600">No cloud workspaces yet. Create your first one.</p>
                ) : (
                  <label className="block max-w-sm text-xs font-medium">
                    Select workspace
                    <select className={field + ' mt-1'} value={selectedWorkspace}
                      onChange={(e) => setSelectedWorkspace(e.target.value)}>
                      {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <form onSubmit={createWorkspace} className="flex flex-wrap gap-2">
                <label className="flex-1 min-w-48 text-xs font-medium">
                  New workspace name
                  <input className={field + ' mt-1'} required minLength={2} maxLength={100}
                    value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="My Creator Workspace" />
                </label>
                <button type="submit" className={button + ' self-end'} disabled={busy}>Create workspace</button>
              </form>
            </div>

            {selectedWorkspace && (
              <div className="rounded-xl border bg-white p-5">
                <h2 className="mb-2 text-lg font-semibold">Cloud content ideas</h2>
                <p className="mb-4 text-xs text-zinc-600">These are saved on the server, not in the local demo.</p>
                <form onSubmit={createIdea} className="mb-4 flex flex-wrap gap-2">
                  <input className={field + ' min-w-48 flex-1'} required maxLength={240}
                    value={ideaTitle} onChange={(e) => setIdeaTitle(e.target.value)}
                    placeholder="New idea title" aria-label="New cloud idea title"/>
                  <button className={button} type="submit" disabled={busy}>Save idea</button>
                </form>
                {ideas.length === 0 ? <p className="text-sm text-zinc-500">No saved ideas yet.</p> : (
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {ideas.map((idea) => <li key={idea.id}>{idea.title}</li>)}
                  </ul>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-600">The Composer, Calendar, social accounts and media library remain local-only in this implementation stage. No publishing is enabled.</p>
          </section>
        )}
      </div>
    </main>
  );
}
