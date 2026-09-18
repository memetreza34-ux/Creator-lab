const fs = require('fs');
const code = `
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown, Check, Command, X, Home, Calendar, Image as ImageIcon, BarChart3, Settings, PenTool, LayoutTemplate, Layers } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/create': 'Studio Composer',
  '/calendar': 'Editorial Calendar',
  '/pipeline': 'Content Pipeline',
  '/posts': 'All Publications',
  '/media': 'Media Library',
  '/analytics': 'Performance Analytics',
  '/experiments': 'Experiment Lab',
  '/accounts': 'Connected Accounts',
  '/settings': 'Workspace Settings'
};

const searchOptions = [
  { label: 'Go to Overview', path: '/', icon: <Home className="w-4 h-4 text-[#666661]" /> },
  { label: 'Create New Post', path: '/create', icon: <PenTool className="w-4 h-4 text-[#666661]" /> },
  { label: 'View Calendar', path: '/calendar', icon: <Calendar className="w-4 h-4 text-[#666661]" /> },
  { label: 'Content Pipeline', path: '/pipeline', icon: <LayoutTemplate className="w-4 h-4 text-[#666661]" /> },
  { label: 'Media Library', path: '/media', icon: <ImageIcon className="w-4 h-4 text-[#666661]" /> },
  { label: 'Performance Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-[#666661]" /> },
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
  let title = 'Creator OS';
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
    <header className="h-[68px] bg-white border-b border-[#EBEBE9] px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-[20px] font-serif text-[#0A0A0A] font-medium tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-5">
        
        {/* Search */}
        <div className="relative hidden sm:block w-[280px]">
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-between px-3 py-1.5 bg-[#F8F8F7] border border-[#EBEBE9] rounded-lg cursor-text hover:border-[#D1D1CE] transition-all group"
          >
            <div className="flex items-center text-[#999996]">
              <Search className="w-4 h-4 mr-2" />
              <span className="text-[13px] font-sans">Search...</span>
            </div>
            <div className="flex items-center space-x-1 text-[#999996]">
              <Command className="w-3 h-3" />
              <span className="text-[11px] font-medium font-sans">K</span>
            </div>
          </div>
        </div>

        <div className="w-px h-5 bg-[#EBEBE9] hidden sm:block"></div>

        {/* Workspace Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="px-3 py-1.5 flex items-center bg-white border border-[#EBEBE9] rounded-lg hover:border-[#D1D1CE] hover:bg-[#F8F8F7] transition-all"
          >
            <div className="w-5 h-5 rounded-md bg-[#F3F1FF] flex items-center justify-center text-brand-600 font-bold text-[11px] mr-2 shrink-0">
              {activeWorkspace?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] font-sans font-medium text-[#0A0A0A] mr-2 max-w-[120px] truncate">
              {activeWorkspace?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-[#999996]" />
          </button>

          {isWorkspaceOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#EBEBE9] py-1 z-50">
              <div className="px-3 py-2 border-b border-[#EBEBE9]">
                <p className="text-[11px] font-semibold text-[#999996] uppercase tracking-wider font-sans">Workspaces</p>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {state.workspaces.map(workspace => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: workspace.id });
                      setIsWorkspaceOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center rounded-lg hover:bg-[#F8F8F7] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#F3F1FF] flex items-center justify-center text-brand-600 font-bold text-[12px] mr-3 shrink-0">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-sans font-medium text-[#0A0A0A] flex-1 truncate">{workspace.name}</span>
                    {workspace.id === state.activeWorkspaceId && (
                      <Check className="w-4 h-4 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-[#EBEBE9]">
                <Link to="/settings" className="w-full text-left px-3 py-2 flex items-center rounded-lg hover:bg-[#F8F8F7] transition-colors text-[13px] font-medium text-[#666661]">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Workspaces
                </Link>
              </div>
            </div>
          )}
        </div>

        <button className="relative p-2 text-[#666661] hover:text-[#0A0A0A] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border border-white"></span>
        </button>

        <button className="w-8 h-8 rounded-full bg-[#EBEBE9] overflow-hidden border border-[#D1D1CE] hover:border-[#0A0A0A] transition-all">
          <img src="https://ui-avatars.com/api/?name=Creator+User&background=6236FF&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* Command Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] px-4" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#EBEBE9] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[#EBEBE9]">
              <Search className="w-5 h-5 text-[#999996] mr-3 shrink-0" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search commands, pages, or content..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-sans text-[#0A0A0A] placeholder:text-[#999996]"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-[#999996] hover:bg-[#F8F8F7] hover:text-[#0A0A0A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        navigate(opt.path);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-[#F8F8F7] transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#EBEBE9] flex items-center justify-center mr-3 shrink-0 group-hover:border-[#D1D1CE]">
                        {opt.icon}
                      </div>
                      <span className="text-[14px] font-sans font-medium text-[#0A0A0A]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Search className="w-8 h-8 text-[#EBEBE9] mb-3" />
                  <p className="text-[14px] font-medium text-[#0A0A0A]">No results found</p>
                  <p className="text-[13px] text-[#999996] mt-1">Try a different search term</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-[#F8F8F7] border-t border-[#EBEBE9] flex justify-between items-center text-[11px] font-sans text-[#999996]">
              <div className="flex items-center space-x-3">
                <span className="flex items-center"><Command className="w-3 h-3 mr-1" /> to navigate</span>
                <span className="flex items-center">↵ to select</span>
              </div>
              <span className="flex items-center">esc to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
`;
fs.writeFileSync('src/components/layout/TopHeader.tsx', code);
