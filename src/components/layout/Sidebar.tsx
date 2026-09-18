
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  KanbanSquare, 
  Files, 
  Image as ImageIcon, 
  BarChart3, 
  Beaker, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'home', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'Studio',
    items: [
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/calendar' },
      { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare, path: '/pipeline' },
      { id: 'posts', label: 'Posts', icon: Files, path: '/posts' },
      { id: 'media', label: 'Media Library', icon: ImageIcon, path: '/media' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { id: 'experiments', label: 'Experiment Lab', icon: Beaker, path: '/experiments' },
    ]
  }
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#050505] text-zinc-400 border-r border-zinc-900 transition-all duration-300 z-20 shrink-0",
      isCollapsed ? "w-[72px]" : "w-[260px]"
    )}>
      {/* Brand */}
      <div className={cn(
        "h-16 flex items-center border-b border-zinc-900/50 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-[14px] font-serif font-bold tracking-wide text-white uppercase mt-0.5">Creator OS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Sparkles className="w-4.5 h-4.5 text-black" />
          </div>
        )}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-8 no-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className={cn("px-3", isCollapsed && "px-2")}>
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-sans font-semibold text-zinc-600 tracking-[0.1em] uppercase mb-3">
                {group.label}
              </h3>
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
                      'flex items-center rounded-lg text-[13px] font-medium transition-all group',
                      isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'w-full px-3 py-2',
                      isActive 
                        ? 'bg-zinc-900 text-white' 
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      !isCollapsed && "mr-3",
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {!isCollapsed && <span className="whitespace-nowrap font-sans">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Settings */}
      <div className={cn("p-4 border-t border-zinc-900", isCollapsed && "px-2 flex justify-center")}>
        <NavLink 
          to="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center rounded-lg text-[13px] font-medium transition-all group',
            isCollapsed ? 'justify-center p-2.5 w-10 h-10' : 'w-full px-3 py-2',
            location.pathname.startsWith('/settings') 
              ? 'bg-zinc-900 text-white' 
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
          )}
        >
          <Settings className={cn("w-4 h-4 shrink-0", !isCollapsed && "mr-3", location.pathname.startsWith('/settings') ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
          {!isCollapsed && <span className="font-sans">Settings</span>}
        </NavLink>
      </div>
    </div>
  );
}
