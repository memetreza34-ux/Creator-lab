import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, CalendarDays, KanbanSquare, Files, Image as ImageIcon, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

// M1 scope: advanced experiments, demo accounts and unsourced analytics stay in code,
// but are deliberately not part of the first creator workflow.
const links = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/pipeline', label: 'Ideas', icon: KanbanSquare },
  { path: '/create', label: 'Create', icon: PenTool },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/posts', label: 'Posts', icon: Files },
  { path: '/media', label: 'Media', icon: ImageIcon },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[210px] lg:w-[234px] shrink-0 flex-col bg-[#050505] text-zinc-400 border-r border-zinc-900">
      <NavLink to="/" className="h-[68px] px-5 flex items-center gap-2.5 border-b border-zinc-900">
        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-black" /></span>
        <span className="text-sm font-semibold tracking-wide text-white">Creator Lab</span>
      </NavLink>
      <div className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Your workflow</div>
      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {links.map(({ path, label, icon: Icon, end }) => (
          <NavLink key={path} to={path} end={end} className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors',
            isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
          )}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-900">
        <NavLink to="/settings" className={({ isActive }) => cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium',
          isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
        )}>
          <Settings className="w-4 h-4" /> Settings
        </NavLink>
        <p className="px-3 pt-3 text-[10px] leading-relaxed text-zinc-500">Beta preview · Data in this browser only</p>
      </div>
    </aside>
  );
}
