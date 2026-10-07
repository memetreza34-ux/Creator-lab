import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Upload, Folder, Image as ImageIcon, FileVideo, Search, 
  Trash2, Plus, Grid, List, ChevronRight, Edit2, 
  ArrowRight, FolderInput, Check, X, MoveRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWorkspaceMedia, getWorkspaceMediaFolders } from '../utils/selectors';
import { deleteMediaBlob, resolveMediaUrl, saveMediaBlob } from '../utils/mediaStorage';
import { MediaAsset, MediaFolder } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function MediaLibraryPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  // Folder management states
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Move asset modal state
  const [assetToMove, setAssetToMove] = useState<MediaAsset | null>(null);

  const allWorkspaceMedia = getWorkspaceMedia(state);
  const mediaFolders = getWorkspaceMediaFolders(state);

  const mediaAssets = allWorkspaceMedia
    .filter((m: MediaAsset) => selectedFolderId ? m.folderId === selectedFolderId : true)
    .filter((m: MediaAsset) => activeTab === 'all' || m.type === activeTab)
    .filter((m: MediaAsset) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    let cancelled = false;

    const resolveUrls = async () => {
      const entries = await Promise.all(
        allWorkspaceMedia.map(async (asset) => {
          const url = await resolveMediaUrl(asset.id, asset.url);
          return [asset.id, url] as const;
        }),
      );

      if (!cancelled) {
        setResolvedUrls(Object.fromEntries(entries));
      }
    };

    void resolveUrls();

    return () => {
      cancelled = true;
    };
  }, [allWorkspaceMedia]);

  const selectedFolderName = selectedFolderId 
    ? mediaFolders.find((f: MediaFolder) => f.id === selectedFolderId)?.name 
    : 'All Media';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files: File[] = Array.from(e.target.files);
    const loadingToast = toast.loading(`Uploading ${files.length} asset(s)...`);
    let savedCount = 0;
    let failedCount = 0;

    for (const file of files) {
      const id = uuidv4();

      try {
        await saveMediaBlob(id, file);

        const newAsset: MediaAsset = {
          id,
          workspaceId: state.activeWorkspaceId,
          folderId: selectedFolderId || undefined,
          url: '',
          storageType: 'indexeddb',
          type: file.type.startsWith('video/') ? 'video' : 'image',
          name: file.name,
          size: file.size,
          createdAt: new Date().toISOString(),
        };

        dispatch({
          type: 'ADD_MEDIA_ASSET',
          payload: newAsset,
        });
        savedCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error('Failed to persist uploaded media', error);
      }
    }

    if (savedCount > 0 && failedCount === 0) {
      toast.success(`Successfully uploaded ${savedCount} asset(s)`, { id: loadingToast });
    } else if (savedCount > 0) {
      toast.error(`${savedCount} saved, ${failedCount} failed to store locally`, { id: loadingToast });
    } else {
      toast.error('Upload failed. Media could not be stored in this browser.', { id: loadingToast });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAsset = async (asset: MediaAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${asset.name}"?`)) return;

    try {
      if (asset.storageType === 'indexeddb') {
        await deleteMediaBlob(asset.id);
      }
      dispatch({ type: 'REMOVE_MEDIA_ASSET', payload: asset.id });
      setResolvedUrls((previous) => {
        const next = { ...previous };
        delete next[asset.id];
        return next;
      });
      toast.success('Asset removed');
    } catch (error) {
      console.error('Failed to delete media asset', error);
      toast.error('Could not remove the stored media file');
    }
  };

  const handleUseInPost = (asset: MediaAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/create?mediaId=${asset.id}`);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    dispatch({
      type: 'ADD_MEDIA_FOLDER',
      payload: {
        id: uuidv4(),
        workspaceId: state.activeWorkspaceId,
        name: newFolderName.trim(),
        createdAt: new Date().toISOString()
      }
    });
    setNewFolderName('');
    setIsCreatingFolder(false);
    toast.success('Folder created');
  };

  const handleRenameFolder = (folderId: string) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    const folder = mediaFolders.find(f => f.id === folderId);
    if (folder) {
      dispatch({
        type: 'UPDATE_MEDIA_FOLDER',
        payload: { ...folder, name: editingFolderName.trim() }
      });
      toast.success('Folder renamed');
    }
    setEditingFolderId(null);
  };

  const handleDeleteFolder = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete folder "${name}"? Assets inside will be moved to root "All Media".`)) {
      if (selectedFolderId === id) setSelectedFolderId(null);
      dispatch({ type: 'DELETE_MEDIA_FOLDER', payload: id });
      toast.success('Folder deleted, assets preserved in library');
    }
  };

  const handleMoveAssetToFolder = (targetFolderId: string | null) => {
    if (!assetToMove) return;
    dispatch({
      type: 'UPDATE_MEDIA_ASSET',
      payload: {
        ...assetToMove,
        folderId: targetFolderId || undefined
      }
    });
    toast.success(`Moved "${assetToMove.name}"`);
    setAssetToMove(null);
  };

  return (
    <div className="flex h-full bg-[#FAFAF9] overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-64 border-r border-[#EBEBE9] bg-white shrink-0 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#EBEBE9]">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </button>
        </div>
        
        <div className="p-4 flex items-center justify-between group">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Folders</h3>
          <button 
            onClick={() => setIsCreatingFolder(true)} 
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-800 transition-all"
            title="Create new folder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreatingFolder && (
          <div className="px-3 mb-2">
            <form onSubmit={handleCreateFolder} className="flex items-center space-x-1">
              <input 
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (!newFolderName.trim()) setIsCreatingFolder(false);
                }}
                className="flex-1 w-full px-2.5 py-1 border border-brand-500 text-[12px] rounded-md focus:outline-none"
                placeholder="Folder name"
              />
              <button 
                type="submit" 
                className="p-1 bg-brand-600 text-white rounded-md hover:bg-brand-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        <div className="px-2 space-y-0.5 flex-1 overflow-y-auto">
          {/* All Media Option */}
          <button 
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              selectedFolderId === null 
                ? 'bg-brand-50 text-brand-800 font-semibold' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center truncate">
              <Folder className={`w-4 h-4 mr-2 ${selectedFolderId === null ? 'text-brand-600' : 'text-zinc-400'}`} />
              <span className="truncate">All Media</span>
            </div>
            <span className="text-[11px] text-zinc-400">{allWorkspaceMedia.length}</span>
          </button>

          {/* User Folders */}
          {mediaFolders.map((folder: MediaFolder) => {
            const folderCount = allWorkspaceMedia.filter(m => m.folderId === folder.id).length;
            const isEditing = editingFolderId === folder.id;

            if (isEditing) {
              return (
                <div key={folder.id} className="px-2 py-1 flex items-center space-x-1">
                  <input
                    autoFocus
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameFolder(folder.id);
                      if (e.key === 'Escape') setEditingFolderId(null);
                    }}
                    className="flex-1 px-2 py-0.5 border border-brand-500 rounded text-[12px]"
                  />
                  <button onClick={() => handleRenameFolder(folder.id)} className="p-1 text-brand-600 hover:text-brand-800">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingFolderId(null)} className="p-1 text-zinc-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div 
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  selectedFolderId === folder.id 
                    ? 'bg-brand-50 text-brand-800 font-semibold' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center truncate">
                  <Folder className={`w-4 h-4 mr-2 shrink-0 ${selectedFolderId === folder.id ? 'text-brand-600' : 'text-zinc-400'}`} />
                  <span className="truncate">{folder.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-zinc-400 group-hover:hidden">{folderCount}</span>
                  <div className="hidden group-hover:flex items-center space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }} 
                      className="p-1 hover:bg-zinc-200/60 rounded text-zinc-400 hover:text-zinc-700"
                      title="Rename folder"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)} 
                      className="p-1 hover:bg-rose-100 text-zinc-400 hover:text-rose-600 rounded"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <div className="flex items-center text-[12px] font-medium text-zinc-500 mb-0.5">
              <Folder className="w-3.5 h-3.5 mr-1" />
              <span>Library</span>
              <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-zinc-400" />
              <span className="text-zinc-900 font-semibold">{selectedFolderName}</span>
            </div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">{selectedFolderName}</h1>
          </div>
          
          <div className="flex items-center space-x-2.5">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 shadow-xs transition-all"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Assets
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            multiple 
            accept="image/*,video/*" 
            className="hidden" 
          />
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3 shrink-0">
          <div className="flex items-center space-x-4 border-b border-[#EBEBE9] w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === 'all' ? 'border-brand-600 text-brand-800 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All Assets ({allWorkspaceMedia.length})
            </button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === 'image' ? 'border-brand-600 text-brand-800 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Images
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === 'video' ? 'border-brand-600 text-brand-800 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Videos
            </button>
          </div>
          
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[#EBEBE9] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-56 bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center bg-white border border-[#EBEBE9] rounded-lg p-0.5 shadow-2xs shrink-0">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400 hover:text-zinc-900'}`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400 hover:text-zinc-900'}`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid / List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-8">
              {/* Upload Tile */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-white rounded-xl border-2 border-dashed border-[#DCDCD8] flex flex-col items-center justify-center text-zinc-400 hover:bg-brand-50/40 hover:text-brand-600 hover:border-brand-300 transition-all cursor-pointer group"
              >
                <Upload className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[12px] font-semibold">Upload Media</span>
              </div>
              
              {mediaAssets.map((asset: MediaAsset) => (
                <div key={asset.id} className="group flex flex-col bg-white rounded-xl border border-[#EBEBE9] overflow-hidden hover:border-brand-300 hover:shadow-xs transition-all">
                  <div className="aspect-square bg-zinc-100 overflow-hidden relative group/thumb">
                    {asset.type === 'image' ? (
                      <img 
                        src={resolvedUrls[asset.id] || asset.url} 
                        alt={asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 duration-200 transition-transform" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-300">
                        <FileVideo className="w-8 h-8 mb-1 opacity-60" />
                        <span className="font-semibold text-[10px] uppercase tracking-wider">Video</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] font-bold text-white uppercase tracking-wider">
                        {asset.type}
                      </span>
                      {asset.storageType === 'demo_remote' && (
                        <span className="px-1.5 py-0.5 bg-amber-500/90 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                          Demo
                        </span>
                      )}
                      {asset.storageType === 'indexeddb' && (
                        <span className="px-1.5 py-0.5 bg-zinc-900/80 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                          Local
                        </span>
                      )}
                    </div>

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetToMove(asset);
                          }}
                          className="p-1.5 bg-white/90 hover:bg-white text-zinc-800 rounded-md text-[11px] shadow-sm flex items-center space-x-1"
                          title="Move to folder"
                        >
                          <FolderInput className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={(e) => handleDeleteAsset(asset, e)}
                          className="p-1.5 bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 rounded-md shadow-sm transition-colors"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={(e) => handleUseInPost(asset, e)}
                        className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-sm transition-colors"
                      >
                        <span>Use in Post</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold text-zinc-900 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                      <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                      {asset.folderId && (
                        <span className="text-zinc-500 truncate max-w-[80px]">
                          📁 {mediaFolders.find(f => f.id === asset.folderId)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#EBEBE9] rounded-xl shadow-2xs overflow-hidden pb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EBEBE9] bg-[#FAFAF9]">
                    <th className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Asset</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Folder</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F0]">
                  {mediaAssets.map((asset: MediaAsset) => (
                    <tr key={asset.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-[#EBEBE9]">
                            {asset.type === 'image' ? (
                              <img src={resolvedUrls[asset.id] || asset.url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-400 bg-zinc-800 text-white">
                                VID
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-zinc-900 truncate max-w-xs" title={asset.name}>
                            {asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-[#F2F2F0] text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-zinc-500">
                        {asset.folderId 
                          ? mediaFolders.find(f => f.id === asset.folderId)?.name || 'Root' 
                          : 'All Media'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-zinc-500">
                        {(asset.size / 1024 / 1024).toFixed(1)} MB
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => handleUseInPost(asset, e)}
                            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <span>Use in Post</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setAssetToMove(asset)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md"
                            title="Move folder"
                          >
                            <FolderInput className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteAsset(asset, e)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Move Asset to Folder Modal */}
      {assetToMove && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9]">
              <div>
                <h3 className="text-[14px] font-semibold text-zinc-900">Move Asset</h3>
                <p className="text-[11px] text-zinc-500 truncate max-w-[240px]">{assetToMove.name}</p>
              </div>
              <button 
                onClick={() => setAssetToMove(null)}
                className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-1 max-h-60 overflow-y-auto text-[13px]">
              <button
                onClick={() => handleMoveAssetToFolder(null)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                  !assetToMove.folderId 
                    ? 'border-brand-500 bg-brand-50/50 text-brand-800 font-semibold' 
                    : 'border-[#EBEBE9] hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="flex items-center">
                  <Folder className="w-4 h-4 mr-2 text-zinc-400" />
                  <span>Root (All Media)</span>
                </div>
                {!assetToMove.folderId && <Check className="w-4 h-4 text-brand-600" />}
              </button>

              {mediaFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveAssetToFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                    assetToMove.folderId === folder.id 
                      ? 'border-brand-500 bg-brand-50/50 text-brand-800 font-semibold' 
                      : 'border-[#EBEBE9] hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 mr-2 text-brand-500" />
                    <span>{folder.name}</span>
                  </div>
                  {assetToMove.folderId === folder.id && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              ))}
            </div>

            <div className="p-3 bg-[#FAFAF9] border-t border-[#EBEBE9] flex justify-end">
              <button
                onClick={() => setAssetToMove(null)}
                className="px-3 py-1.5 text-[12px] text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
