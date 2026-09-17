import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown, Check, Command, X, Home, Calendar, Image as ImageIcon, BarChart3, Settings, PenTool, LayoutTemplate, Layers } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/create': 'Create Post',
  '/calendar': 'Calendar',
  '/pipeline': 'Pipeline',
  '/posts': 'Posts',
  '/media': 'Media',
  '/analytics': 'Analytics',
  '/experiments': 'Experiments',
  '/accounts': 'Accounts',
  '/settings': 'Settings'
};

const searchOptions = [
  { label: 'Go to Home', path: '/', icon: <Home className="w-4 h-4 text-zinc-500" /> },
  { label: 'Create New Post', path: '/create', icon: <PenTool className="w-4 h-4 text-zinc-500" /> },
  { label: 'View Calendar', path: '/calendar', icon: <Calendar className="w-4 h-4 text-zinc-500" /> },
  { label: 'Content Pipeline', path: '/pipeline', icon: <LayoutTemplate className="w-4 h-4 text-zinc-500" /> },
  { label: 'All Posts', path: '/posts', icon: <Layers className="w-4 h-4 text-zinc-500" /> },
  { label: 'Media Library', path: '/media', icon: <ImageIcon className="w-4 h-4 text-zinc-500" /> },
  { label: 'Analytics Dashboard', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-zinc-500" /> },
  { label: 'A/B Experiments', path: '/experiments', icon: <BarChart3 className="w-4 h-4 text-zinc-500" /> },
  { label: 'Social Accounts', path: '/accounts', icon: <Settings className="w-4 h-4 text-zinc-500" /> },
  { label: 'Workspace Settings', path: '/settings', icon: <Settings className="w-4 h-4 text-zinc-500" /> },
];

export function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const filteredOptions = searchOptions.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-14 bg-white border-b border-border-subtle flex items-center justify-between px-6 shrink-0 z-40 relative">
      <div className="flex items-center w-1/3">
        <h1 className="text-[16px] font-semibold text-zinc-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex-1 flex justify-center w-1/3">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center w-full max-w-md px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-[8px] text-[13px] text-zinc-500 transition-colors shadow-sm"
        >
          <Search className="w-4 h-4 mr-2" />
          <span className="flex-1 text-left">Search or jump to...</span>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded-[4px] text-[10px] font-medium text-zinc-500 flex items-center shadow-sm">
              <Command className="w-3 h-3 mr-0.5" /> K
            </kbd>
          </div>
        </button>
      </div>
      
      <div className="flex items-center justify-end space-x-3 w-1/3">
        <button className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-danger rounded-full border border-white"></span>
        </button>
        
        {/* Workspace Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-zinc-50 transition-colors border border-transparent"
          >
            <span className="text-[13px] font-medium text-zinc-700">{activeWorkspace?.name || 'Workspace'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          
          {isWorkspaceOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-[12px] shadow-lg border border-zinc-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-zinc-100 mb-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workspaces</p>
              </div>
              {state.workspaces.map(ws => (
                <button 
                  key={ws.id}
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: ws.id });
                    setIsWorkspaceOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between ${ws.id === activeWorkspace?.id ? 'bg-brand-50/50 text-brand-600' : 'text-zinc-700 hover:bg-zinc-50'}`}
                >
                  <span className={ws.id === activeWorkspace?.id ? 'font-semibold' : 'font-medium'}>{ws.name}</span>
                  {ws.id === activeWorkspace?.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center overflow-hidden border border-brand-200 ml-1">
          <img src="https://ui-avatars.com/api/?name=User&background=EEEAFE&color=635BFF&bold=true" alt="User" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* Command Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-start justify-center pt-24 z-[100] px-4">
          <div 
            className="bg-white rounded-[16px] shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-zinc-100">
              <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 text-[16px] bg-transparent focus:outline-none text-zinc-900 placeholder:text-zinc-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={opt.path}
                      onClick={() => {
                        navigate(opt.path);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2.5 rounded-[8px] hover:bg-brand-50 hover:text-brand-700 text-zinc-700 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-[6px] bg-zinc-100 group-hover:bg-brand-100 flex items-center justify-center mr-3 transition-colors">
                        {opt.icon}
                      </div>
                      <span className="text-[14px] font-medium">{opt.label}</span>
                      {i === 0 && searchQuery === '' && (
                        <span className="ml-auto text-[11px] font-medium text-zinc-400">Jump to</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-zinc-500 font-medium">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
            <div className="bg-zinc-50 p-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-zinc-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><kbd className="mr-1 font-sans font-bold text-zinc-500">↑↓</kbd> to navigate</span>
                <span className="flex items-center"><kbd className="mr-1 font-sans font-bold text-zinc-500">↵</kbd> to select</span>
              </div>
              <span className="flex items-center"><kbd className="mr-1 font-sans font-bold text-zinc-500">esc</kbd> to close</span>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
