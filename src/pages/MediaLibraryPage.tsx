import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MediaAsset } from '../types';
import { Upload, Search, Filter, Trash2, Grid, List, Folder, FileImage, FileVideo, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function MediaLibraryPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All Media');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaAssets = state.mediaAssets
    .filter(m => m.workspaceId === state.activeWorkspaceId)
    .filter(m => activeTab === 'all' || m.type === activeTab)
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const mockFolders = ['All Media', 'Social Graphics', 'Video Edits', 'Campaign 2024', 'Brand Assets'];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    Array.from(e.target.files).forEach((file: File) => {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      
      const newAsset: MediaAsset = {
        id: uuidv4(),
        workspaceId: state.activeWorkspaceId,
        url,
        type,
        name: file.name,
        size: file.size,
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MEDIA_ASSET', payload: newAsset });
    });
    
    toast.success('Media uploaded successfully');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this media asset?')) {
      dispatch({ type: 'REMOVE_MEDIA_ASSET', payload: id });
      toast.success('Asset deleted');
    }
  };

  return (
    <div className="flex h-full bg-surface-bg">
      {/* Folder Navigation Sidebar */}
      <div className="w-[220px] shrink-0 border-r border-border-subtle bg-white/50 hidden md:flex flex-col">
        <div className="p-4 border-b border-border-subtle shrink-0">
          <h3 className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Folders</h3>
        </div>
        <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {mockFolders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full flex items-center px-3 py-2 text-[13px] font-medium rounded-[8px] transition-colors ${
                selectedFolder === folder 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
              }`}
            >
              <Folder className={`w-4 h-4 mr-2 ${selectedFolder === folder ? 'text-brand-500' : 'text-zinc-400'}`} />
              <span className="truncate">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <div className="flex items-center text-[12px] font-medium text-zinc-500 mb-1">
              <Folder className="w-3.5 h-3.5 mr-1" />
              <span>Library</span>
              <ChevronRight className="w-3.5 h-3.5 mx-0.5" />
              <span className="text-zinc-900">{selectedFolder}</span>
            </div>
            <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">{selectedFolder}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center px-4 py-1.5 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              multiple 
              accept="image/*,video/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 shrink-0">
          <div className="flex items-center space-x-6 border-b border-border-subtle w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-brand-500 text-brand-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >All Media</button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'image' ? 'border-brand-500 text-brand-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >Images</button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'video' ? 'border-brand-500 text-brand-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >Videos</button>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search media..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-64 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-center bg-white border border-zinc-200 rounded-[8px] p-0.5 shadow-sm shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1 rounded-[6px] transition-colors ${viewMode === 'grid' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400 hover:text-zinc-900'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1 rounded-[6px] transition-colors ${viewMode === 'list' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400 hover:text-zinc-900'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-zinc-50/50 rounded-[8px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-colors cursor-pointer group"
              >
                <Upload className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium">Upload Media</span>
              </div>
              
              {mediaAssets.map(asset => (
                <div key={asset.id} className="group cursor-pointer flex flex-col">
                  <div className="aspect-square bg-zinc-100 rounded-[8px] border border-border-subtle overflow-hidden relative mb-2 group-hover:border-brand-300 group-hover:shadow-sm transition-all">
                    {asset.type === 'image' ? (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-300">
                        <FileVideo className="w-8 h-8 mb-2 opacity-50" />
                        <span className="font-medium text-[11px] uppercase tracking-wider">Video</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-[4px] text-[9px] font-bold text-white uppercase tracking-wider">
                      {asset.type}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(asset.id, e)}
                      className="absolute top-2 left-2 p-1.5 bg-zinc-900/80 hover:bg-status-danger text-white rounded-[6px] opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[13px] font-medium text-zinc-900 truncate px-0.5" title={asset.name}>{asset.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 px-0.5">{(asset.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm overflow-hidden pb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-zinc-50/50">
                    <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Size</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {mediaAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                            {asset.type === 'image' ? (
                              <img src={asset.url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500 bg-zinc-800 text-white">
                                VID
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-zinc-900 truncate max-w-[300px]" title={asset.name}>{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-zinc-500 font-medium">
                        {(asset.size / 1024 / 1024).toFixed(1)} MB
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={(e) => handleDelete(asset.id, e)}
                          className="p-1.5 text-zinc-400 hover:text-status-danger hover:bg-status-danger/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
