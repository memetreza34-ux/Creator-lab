import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronLeft,
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  return (
    <div className={cn(
      "bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800 h-full transition-all duration-300 ease-in-out shrink-0 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("h-16 flex items-center border-b border-zinc-800 shrink-0", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className={cn("w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0", !isCollapsed && "mr-3")}>
          <span className="text-white font-bold text-lg">C</span>
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-zinc-100 tracking-wide text-lg whitespace-nowrap overflow-hidden">
            Creator Lab
          </span>
        )}
      </div>

      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 z-50 transition-colors cursor-pointer shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className={cn("px-4", isCollapsed && "px-3")}>
            {!isCollapsed ? (
              <h3 className="px-3 text-xs font-semibold text-zinc-500 tracking-wider mb-2">
                {group.label}
              </h3>
            ) : (
              <div className="h-4 mb-2 flex justify-center">
                <div className="w-4 border-b border-zinc-800"></div>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-colors group',
                      isCollapsed ? 'justify-center p-3' : 'w-full px-3 py-2',
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      !isCollapsed && "mr-3",
                      isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("p-4 border-t border-zinc-800", isCollapsed && "px-3")}>
        <NavLink 
          to="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={({ isActive }) => cn(
            'flex items-center rounded-lg text-sm font-medium transition-colors group',
            isCollapsed ? 'justify-center p-3' : 'w-full px-3 py-2.5',
            isActive
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
          )}
        >
          <Settings className={cn("w-5 h-5 shrink-0", !isCollapsed && "mr-3", "text-zinc-500 group-hover:text-zinc-300")} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </div>
  );
}
