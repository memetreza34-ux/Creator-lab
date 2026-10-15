import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, PenTool, CalendarDays, Files, Image as ImageIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

const mobileLinks = [
  { path: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { path: '/pipeline', label: 'Ideas', icon: KanbanSquare },
  { path: '/create', label: 'Create', icon: PenTool },
  { path: '/calendar', label: 'Plan', icon: CalendarDays },
  { path: '/posts', label: 'Posts', icon: Files },
  { path: '/media', label: 'Media', icon: ImageIcon },
];

export function AppLayout() {
  return (
    <div className="flex h-dvh bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
        <nav aria-label="Mobile navigation" className="md:hidden grid grid-cols-6 bg-white border-t border-zinc-200 shrink-0">
          {mobileLinks.map(({ path, label, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} className={({ isActive }) =>
              'min-w-0 py-2 flex flex-col items-center gap-1 text-[10px] ' +
              (isActive ? 'text-brand-700 font-semibold' : 'text-zinc-500')
            }>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
