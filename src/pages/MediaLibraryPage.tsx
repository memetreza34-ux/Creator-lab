import React from 'react';
import { Upload, FolderPlus, Grid, List, Search } from 'lucide-react';
import { mockMediaAssets } from '../data/mockData';

export function MediaLibraryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Media Library</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your images, videos, and assets.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm transition-colors">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 border-b border-zinc-200 pb-px">
          <button className="px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">All Media</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 border-b-2 border-transparent">Images</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 border-b-2 border-transparent">Videos</button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search media..." 
              className="pl-9 pr-4 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 bg-white"
            />
          </div>
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
            <button className="p-1.5 text-zinc-900 bg-zinc-100 rounded-md"><Grid className="w-4 h-4" /></button>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-md"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockMediaAssets.map(asset => (
          <div key={asset.id} className="group cursor-pointer">
            <div className="aspect-square bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden relative mb-3 group-hover:border-indigo-400 group-hover:shadow-md transition-all">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase tracking-wider">
                {asset.type}
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-900 truncate">{asset.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{(asset.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        ))}
        
        {/* Empty upload slot */}
        <div className="aspect-square bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer mb-3">
          <Upload className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">Drag & drop files</span>
        </div>
      </div>
    </div>
  );
}
