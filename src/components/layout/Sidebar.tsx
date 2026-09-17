import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenSquare, 
  CalendarDays, 
  KanbanSquare, 
  Files, 
  Image as ImageIcon, 
  BarChart3, 
  Beaker, 
  Users, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'home', label: 'Home', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'CREATE',
    items: [
      { id: 'create', label: 'Create Post', icon: PenSquare, path: '/create' },
    ]
  },
  {
    label: 'CONTENT',
    items: [
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/calendar' },
      { id: 'pipeline', label: 'Content Pipeline', icon: KanbanSquare, path: '/pipeline' },
      { id: 'posts', label: 'Posts', icon: Files, path: '/posts' },
      { id: 'media', label: 'Media Library', icon: ImageIcon, path: '/media' },
    ]
  },
  {
    label: 'GROWTH',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { id: 'experiments', label: 'A/B Lab', icon: Beaker, path: '/experiments' },
    ]
  },
  {
    label: 'MANAGE',
    items: [
      { id: 'accounts', label: 'Social Accounts', icon: Users, path: '/accounts' },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800 h-full">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="font-semibold text-zinc-100 tracking-wide text-lg">
          Creator Lab
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <h3 className="px-3 text-xs font-semibold text-zinc-500 tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={cn(
                      'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 mr-3 shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            'w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
            isActive
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
          )}
        >
          <Settings className="w-5 h-5 mr-3 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
