import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings, ChevronDown, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pages = [
  { path: '/', label: 'Overview' },
  { path: '/pipeline', label: 'Ideas' },
  { path: '/create', label: 'Create Post' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/posts', label: 'Posts' },
  { path: '/media', label: 'Media Library' },
  { path: '/settings', label: 'Settings' },
];

export function TopHeader() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const active = state.workspaces.find(w => w.id === state.activeWorkspaceId);
  const page = pages.find(p => p.path === location.pathname)?.label || 'Creator Lab';
  const matches = pages.filter(p => p.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(value => !value);
      } else if (event.key === 'Escape') {
        setSearchOpen(false);
        setWorkspaceOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="h-[68px] shrink-0 sticky top-0 z-20 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-zinc-400 md:hidden">Creator Lab</p>
        <h2 className="font-semibold text-lg text-zinc-900 truncate">{page}</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label="Search pages" onClick={() => setSearchOpen(true)}
          className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600">
          <Search className="w-4 h-4" />
        </button>
        <div className="relative">
          <button type="button" aria-expanded={workspaceOpen} onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="max-w-[170px] flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 text-sm hover:bg-zinc-50">
            <span className="truncate">{active?.name || 'Workspace'}</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
          {workspaceOpen && <div className="absolute right-0 mt-2 min-w-56 bg-white border border-zinc-200 shadow-xl rounded-xl p-2 z-30">
            {state.workspaces.map(w => <button key={w.id} type="button" onClick={() => {
              dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: w.id });
              setWorkspaceOpen(false);
            }} className="w-full text-left flex gap-2 justify-between items-center text-sm px-3 py-2 rounded-lg hover:bg-zinc-50">
              <span className="truncate">{w.name}</span>{w.id === state.activeWorkspaceId && <Check className="w-4 h-4 text-brand-600" />}
            </button>)}
            <Link to="/settings" onClick={() => setWorkspaceOpen(false)} className="border-t border-zinc-100 flex items-center gap-2 px-3 py-2 mt-2 text-sm hover:bg-zinc-50 rounded-lg">
              <Settings className="w-4 h-4" /> Manage workspaces
            </Link>
          </div>}
        </div>
      </div>
      {searchOpen && <div className="fixed inset-0 z-50 bg-zinc-950/40 flex justify-center items-start pt-[12vh] px-4" onClick={() => setSearchOpen(false)}>
        <div role="dialog" aria-modal="true" aria-label="Quick navigation" className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b p-3">
            <Search className="w-4 h-4 text-zinc-500" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a page..."
              className="flex-1 min-w-0 text-sm outline-none" onKeyDown={e => {
                if (e.key === 'Enter' && matches[0]) {
                  navigate(matches[0].path); setSearchOpen(false); setQuery('');
                }
              }} />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <nav className="p-2 max-h-80 overflow-y-auto">
            {matches.map(p => <button key={p.path} className="block w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-zinc-100" onClick={() => {
              navigate(p.path); setSearchOpen(false); setQuery('');
            }}>{p.label}</button>)}
            {matches.length === 0 && <p className="p-3 text-sm text-zinc-500">No page found</p>}
          </nav>
        </div>
      </div>}
    </header>
  );
}
