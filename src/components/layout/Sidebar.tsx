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
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    label: 'HOME',
    items: [
      { id: 'home', label: 'Overview', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'CONTENT',
    items: [
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/calendar' },
      { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare, path: '/pipeline' },
      { id: 'posts', label: 'Posts', icon: Files, path: '/posts' },
      { id: 'media', label: 'Media', icon: ImageIcon, path: '/media' },
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { id: 'experiments', label: 'Experiments', icon: Beaker, path: '/experiments' },
    ]
  },
  {
    label: 'WORKSPACE',
    items: [
      { id: 'accounts', label: 'Accounts', icon: Users, path: '/accounts' },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Collapse automatically on small screens, handle manually otherwise
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return true;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  return (
    <div className={cn(
      "bg-[#18181B] text-zinc-300 flex flex-col border-r border-zinc-800 h-full transition-all duration-300 ease-in-out shrink-0 relative",
      isCollapsed ? "w-[68px]" : "w-[232px]"
    )}>
      <div className={cn("h-16 flex items-center border-b border-zinc-800/50 shrink-0", isCollapsed ? "justify-center px-0" : "px-5")}>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand-500", !isCollapsed && "mr-3")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="12" />
            <line x1="22" y1="8.5" x2="12" y2="12" />
            <line x1="2" y1="8.5" x2="12" y2="12" />
          </svg>
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-white tracking-wide text-lg whitespace-nowrap overflow-hidden">
            Creator Lab
          </span>
        )}
      </div>

      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-10 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full hidden lg:flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 z-50 transition-colors cursor-pointer shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("pt-6 pb-2", isCollapsed ? "px-3" : "px-5")}>
        <button 
          onClick={() => navigate('/create')}
          className={cn(
            "w-full flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-sm transition-colors",
            isCollapsed ? "h-10 px-0" : "h-10 px-4"
          )}
          title={isCollapsed ? "Create Post" : undefined}
        >
          <Plus className={cn("w-5 h-5", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="font-semibold text-sm">Create</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 space-y-6 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className={cn("px-3", !isCollapsed && "px-4")}>
            {!isCollapsed ? (
              <h3 className="px-3 text-[11px] font-bold text-zinc-500 tracking-wider mb-2">
                {group.label}
              </h3>
            ) : (
              <div className="h-4 mb-2 flex justify-center items-center">
                <div className="w-6 border-b border-zinc-800/80"></div>
              </div>
            )}
            <div className="space-y-0.5">
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
                      isCollapsed ? 'justify-center p-2.5' : 'w-full px-3 py-2',
                      isActive
                        ? 'bg-brand-500/10 text-brand-500'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      !isCollapsed && "mr-3",
                      isActive ? "text-brand-500" : "text-zinc-400 group-hover:text-zinc-300"
                    )} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("p-4 border-t border-zinc-800/50", isCollapsed && "px-3")}>
        <NavLink 
          to="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center rounded-lg text-[13px] font-medium transition-all group',
            isCollapsed ? 'justify-center p-2.5' : 'w-full px-3 py-2',
            location.pathname.startsWith('/settings')
              ? 'bg-brand-500/10 text-brand-500'
              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          )}
        >
          <Settings className={cn("w-4 h-4 shrink-0", !isCollapsed && "mr-3", location.pathname.startsWith('/settings') ? "text-brand-500" : "text-zinc-400 group-hover:text-zinc-300")} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </div>
  );
}
