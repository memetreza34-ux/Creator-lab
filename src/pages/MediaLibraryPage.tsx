import React, { useState, useRef } from 'react';
import { Upload, Grid, List, Search, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MediaAsset } from '../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export function MediaLibraryPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaAssets = state.mediaAssets
    .filter(m => m.workspaceId === state.activeWorkspaceId)
    .filter(m => activeTab === 'all' || m.type === activeTab)
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process files sequentially
    Array.from(files).forEach((file: File) => {
      // Create a local object URL for preview
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      
      const asset: MediaAsset = {
        id: uuidv4(),
        workspaceId: state.activeWorkspaceId,
        url,
        type: isVideo ? 'video' : 'image',
        name: file.name,
        size: file.size,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_MEDIA_ASSET', payload: asset });
    });
    
    toast.success(`${files.length} asset${files.length > 1 ? 's' : ''} uploaded`);
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
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Media Library</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your images, videos, and assets.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
            <Upload className="w-4 h-4 mr-2" />
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2 border-b border-zinc-200 pb-px w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >All Media</button>
          <button 
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'image' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >Images</button>
          <button 
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'video' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >Videos</button>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search media..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 bg-white"
            />
          </div>
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer mb-3"
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Upload Media</span>
          </div>
          {mediaAssets.map(asset => (
            <div key={asset.id} className="group cursor-pointer">
              <div className="aspect-square bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden relative mb-3 group-hover:border-indigo-400 group-hover:shadow-md transition-all">
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-medium text-sm">Video</div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  {asset.type}
                </div>
                <button 
                  onClick={(e) => handleDelete(asset.id, e)}
                  className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-medium text-zinc-900 truncate" title={asset.name}>{asset.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{(asset.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {mediaAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        {asset.type === 'image' ? (
                          <img src={asset.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">VIDEO</div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {(asset.size / 1024 / 1024).toFixed(1)} MB
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => handleDelete(asset.id, e)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  );
}
