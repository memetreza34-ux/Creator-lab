import React from 'react';
import {
  BarChart3,
  Beaker,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Tab } from '../types';

interface SidebarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Topic Planner', icon: CalendarDays },
  { id: 'experiments', label: 'A/B Lab', icon: Beaker },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
        <Beaker className="w-6 h-6 text-indigo-500 mr-3" />
        <span className="font-semibold text-zinc-100 tracking-wide text-lg">
          Creator Lab
        </span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'hover:bg-zinc-900 hover:text-zinc-100'
              )}
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-900 hover:text-zinc-100 transition-colors">
          <Settings className="w-5 h-5 mr-3 shrink-0" />
          Settings
        </button>
      </div>
    </div>
  );
}
