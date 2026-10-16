import { useNavigate } from 'react-router-dom';
import { CalendarDays, FileText, KanbanSquare, PenTool, ArrowRight, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWorkspacePosts } from '../utils/selectors';
import { getScheduledLocalDateTime } from '../utils/scheduling';

export function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const posts = getWorkspacePosts(state);
  const ideas = state.pipelineItems.filter(item => item.workspaceId === state.activeWorkspaceId);
  const workspace = state.workspaces.find(item => item.id === state.activeWorkspaceId);
  const timezone = workspace?.timezone || 'UTC';
  const planned = posts.filter(post => post.status === 'scheduled' && post.scheduledAt)
    .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''));

  const stats = [
    { label: 'Ideas in pipeline', value: ideas.length, icon: KanbanSquare, path: '/pipeline' },
    { label: 'Saved drafts', value: posts.filter(post => post.status === 'draft').length, icon: FileText, path: '/posts' },
    { label: 'Locally planned', value: planned.length, icon: CalendarDays, path: '/calendar' },
  ];
  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Creator workspace</p>
          <h1 className="text-3xl font-semibold text-zinc-900">{workspace?.name || 'Your workspace'}</h1>
          <p className="text-sm text-zinc-500 mt-2">From an idea to a finished, ready-to-share post.</p>
        </div>
        <button onClick={() => navigate('/create')} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">
          <PenTool className="w-4 h-4" /> Create a post
        </button>
      </header>
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Local beta preview</p>
          <p className="text-xs text-amber-800 mt-1">This version saves work in your current browser only. Calendar dates are local plans, not automatic social-media publications. Cloud accounts and real publishing are still being integrated.</p>
        </div>
      </div>
      <section aria-label="Your content overview" className="grid sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, path }) => (
          <button key={label} onClick={() => navigate(path)} className="text-left bg-white border border-zinc-200 rounded-xl p-5 hover:border-brand-400 transition-colors">
            <Icon className="w-4 h-4 text-zinc-500" />
            <p className="text-3xl font-semibold mt-4">{value}</p>
            <p className="text-sm text-zinc-500 mt-1">{label}</p>
          </button>
        ))}
      </section>
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Start with one idea</h2>
          <p className="text-sm text-zinc-600 mb-5">Keep your next video, short or post organized from the first thought to the final draft.</p>
          <button onClick={() => navigate('/pipeline')} className="text-sm inline-flex items-center gap-2 text-brand-700 font-semibold">
            Open ideas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming local plans</h2>
          {planned.length === 0 ? (
            <p className="text-sm text-zinc-500 mb-4">No planned posts yet. Create a draft and choose a date.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {planned.slice(0, 3).map(post => {
                const date = getScheduledLocalDateTime(post.scheduledAt!, timezone);
                return <li key={post.id} className="flex justify-between gap-4 text-sm border-b border-zinc-100 pb-2">
                  <span className="font-medium truncate">{post.title}</span>
                  <span className="text-zinc-500 whitespace-nowrap">{date.date} · {date.time}</span>
                </li>;
              })}
            </ul>
          )}
          <button onClick={() => navigate('/calendar')} className="text-sm inline-flex items-center gap-2 text-brand-700 font-semibold">
            Open calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
