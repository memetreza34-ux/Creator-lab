import React, { useState } from 'react';
import { Bell, HelpCircle, ChevronDown, Check, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/create': 'Create Post',
  '/calendar': 'Calendar',
  '/pipeline': 'Content Pipeline',
  '/posts': 'Posts',
  '/media': 'Media Library',
  '/analytics': 'Analytics',
  '/experiments': 'A/B Lab',
  '/accounts': 'Social Accounts',
  '/settings': 'Settings'
};

export function TopHeader() {
  const location = useLocation();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const { state, dispatch } = useApp();
  
  const currentPath = location.pathname;
  let title = 'Creator Lab';
  for (const [key, value] of Object.entries(pageTitles)) {
    if (currentPath === key || (key !== '/' && currentPath.startsWith(key))) {
      title = value;
      break;
    }
  }

  const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId) || state.workspaces[0];
  const activeSocialAccounts = state.socialAccounts.filter(a => a.workspaceId === activeWorkspace?.id);

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Workspace Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-zinc-900 leading-none">{activeWorkspace?.name || 'Workspace'}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{activeSocialAccounts.length} Accounts Connected</div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
          
          {isWorkspaceOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspaces</p>
              </div>
              {state.workspaces.map(ws => (
                <button 
                  key={ws.id}
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: ws.id });
                    setIsWorkspaceOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${ws.id === activeWorkspace?.id ? 'bg-indigo-50/50 text-indigo-700' : 'text-zinc-700 hover:bg-zinc-50'}`}
                >
                  <span className={ws.id === activeWorkspace?.id ? 'font-medium' : ''}>{ws.name}</span>
                  {ws.id === activeWorkspace?.id && <Check className="w-4 h-4" />}
                </button>
              ))}
              <div className="border-t border-zinc-100 mt-2 pt-2">
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center" onClick={() => setIsWorkspaceOpen(false)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-200"></div>

        <button className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=User&background=e0e7ff&color=4338ca" alt="User" />
        </button>
      </div>
    </header>
  );
}
