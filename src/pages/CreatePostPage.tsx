import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Platform, Post, PostContent, PlatformSpecificContent, MediaAsset } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ImageIcon, X, Send, Save, Clock, Sparkles, Smile, Hash, AlertCircle } from 'lucide-react';
import { PlatformIcon } from '../components/ui/PlatformIcon';

export function CreatePostPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const dateParam = searchParams.get('date');
  
  const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId) || state.workspaces[0];
  const availableAccounts = state.socialAccounts.filter(a => a.workspaceId === activeWorkspace?.id);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<'original' | Platform>('original');
  const [isScheduling, setIsScheduling] = useState(!!dateParam);
  const [scheduleDate, setScheduleDate] = useState(dateParam || '');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [originalContent, setOriginalContent] = useState<PostContent>({ caption: '', mediaIds: [] });
  const [platformContents, setPlatformContents] = useState<Record<Platform, PlatformSpecificContent>>({} as any);

  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    if (editId) {
      const existing = state.posts.find(p => p.id === editId);
      if (existing) {
        setSelectedAccountIds(existing.destinationAccountIds);
        setOriginalContent(existing.originalContent);
        
        const pContents: any = {};
        existing.platformContent.forEach(pc => {
          pContents[pc.platform] = pc;
        });
        setPlatformContents(pContents);

        if (existing.scheduledAt) {
          setIsScheduling(true);
          const d = new Date(existing.scheduledAt);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setScheduleDate(`${yyyy}-${mm}-${dd}`);
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setScheduleTime(`${hh}:${min}`);
        }
      }
    }
  }, [editId, state.posts]);

  // Derived state
  const selectedPlatforms = new Set<Platform>(
    availableAccounts.filter(a => selectedAccountIds.includes(a.id)).map(a => a.platform)
  );

  const currentContentObj = activePreviewTab === 'original' 
    ? originalContent 
    : (platformContents[activePreviewTab]?.content || originalContent);
    
  const currentContentText = currentContentObj.caption;
  const currentMediaIds = currentContentObj.mediaIds;

  const toggleAccount = (id: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleContentChange = (text: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, caption: text }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          content: { ...currentContentObj, caption: text }
        }
      }));
    }
  };

  const addMediaToCurrent = (assetId: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, mediaIds: [...prev.mediaIds, assetId] }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          content: { ...currentContentObj, mediaIds: [...currentContentObj.mediaIds, assetId] }
        }
      }));
    }
    setShowMediaModal(false);
  };

  const removeMediaFromCurrent = (assetId: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, mediaIds: prev.mediaIds.filter(id => id !== assetId) }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          content: { ...currentContentObj, mediaIds: currentContentObj.mediaIds.filter(id => id !== assetId) }
        }
      }));
    }
  };

  const handleSaveDraft = () => {
    if (selectedAccountIds.length === 0) {
      toast.error('Select at least one social account');
      return;
    }
    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: activeWorkspace.id,
      title: originalContent.caption.slice(0, 40) || 'Untitled Draft',
      status: 'draft',
      originalContent,
      platformContent: Object.values(platformContents),
      destinationAccountIds: selectedAccountIds,
      createdAt: new Date().toISOString()
    };
    
    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
      toast.success('Draft updated');
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
      toast.success('Draft saved');
      navigate(`/create?edit=${post.id}`, { replace: true });
    }
  };

  const handleScheduleOrPublish = (status: 'scheduled' | 'published') => {
    if (selectedAccountIds.length === 0) {
      toast.error('Select at least one social account');
      return;
    }
    if (!originalContent.caption && originalContent.mediaIds.length === 0) {
      toast.error('Post content cannot be empty');
      return;
    }
    if (status === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      toast.error('Select a date and time for scheduling');
      return;
    }

    let scheduledAt = undefined;
    if (status === 'scheduled') {
      const d = new Date(`${scheduleDate}T${scheduleTime}`);
      scheduledAt = d.toISOString();
    }

    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: activeWorkspace.id,
      title: originalContent.caption.slice(0, 40) || 'Untitled Post',
      status,
      scheduledAt,
      originalContent,
      platformContent: Object.values(platformContents),
      destinationAccountIds: selectedAccountIds,
      createdAt: new Date().toISOString()
    };
    
    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
    }
    
    toast.success(status === 'scheduled' ? 'Post scheduled!' : 'Post published!');
    navigate('/calendar');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* Composer Section (approx 60-65%) */}
      <div className="flex-1 lg:max-w-[65%] flex flex-col h-full border-r border-zinc-200 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8 flex-1">
          
          <div>
            <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Create Post</h1>
          </div>

          {/* Destinations */}
          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider">Destinations</label>
            <div className="flex flex-wrap gap-2">
              {availableAccounts.map(account => {
                const isSelected = selectedAccountIds.includes(account.id);
                return (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center px-3 py-2 rounded-[8px] border text-sm font-medium transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500/20' 
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <PlatformIcon platform={account.platform} className="w-4 h-4 mr-2" />
                    <img src={account.avatarUrl} alt="" className="w-5 h-5 rounded-full mr-2 border border-zinc-200" />
                    <span className="mr-1">{account.displayName}</span>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-1.5" />}
                  </button>
                );
              })}
              {availableAccounts.length === 0 && (
                <div className="text-sm text-zinc-500 italic bg-zinc-50 p-3 rounded-lg border border-zinc-200 w-full">
                  No accounts connected. Go to Workspace Settings to add accounts.
                </div>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide border-b border-zinc-200">
              <button
                onClick={() => setActivePreviewTab('original')}
                className={`px-4 py-2 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activePreviewTab === 'original' 
                    ? 'border-brand-500 text-brand-700' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Original Base
              </button>
              {Array.from(selectedPlatforms).map(platform => {
                const isCustomized = !!platformContents[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => setActivePreviewTab(platform)}
                    className={`px-4 py-2 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${
                      activePreviewTab === platform 
                        ? 'border-brand-500 text-brand-700' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <PlatformIcon platform={platform} className="w-3.5 h-3.5 mr-1.5" />
                    <span className="capitalize">{platform}</span>
                    {isCustomized && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-1.5" title="Customized content" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-zinc-200 rounded-[10px] shadow-sm overflow-hidden focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
              <textarea
                value={currentContentText}
                onChange={e => handleContentChange(e.target.value)}
                placeholder="What do you want to share?"
                className="w-full min-h-[160px] p-4 text-[14px] text-zinc-900 resize-y focus:outline-none placeholder-zinc-400"
              />
              
              {/* Media Thumbnails */}
              {currentMediaIds.length > 0 && (
                <div className="px-4 pb-4 flex gap-3 overflow-x-auto">
                  {currentMediaIds.map(mid => {
                    const asset = state.mediaAssets.find(a => a.id === mid);
                    if (!asset) return null;
                    return (
                      <div key={mid} className="relative w-20 h-20 rounded-[8px] overflow-hidden border border-zinc-200 group shrink-0">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] font-medium text-zinc-500">Video</div>
                        )}
                        <button 
                          onClick={() => removeMediaFromCurrent(mid)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-50 border-t border-zinc-100">
                <div className="flex items-center space-x-1">
                  <button onClick={() => setShowMediaModal(true)} className="flex items-center px-2 py-1 text-zinc-600 hover:bg-zinc-200 rounded text-[13px] font-medium transition-colors">
                    <ImageIcon className="w-4 h-4 mr-1.5" />
                    Media
                  </button>
                  <button className="flex items-center px-2 py-1 text-zinc-400 cursor-not-allowed rounded text-[13px] font-medium tooltip" title="Coming soon">
                    <Smile className="w-4 h-4 mr-1.5" />
                    Emoji
                  </button>
                </div>
                <span className="text-[12px] text-zinc-400 font-medium">{currentContentText.length} chars</span>
              </div>
            </div>

            {/* Creator AI Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[12px] font-semibold text-brand-600 flex items-center mr-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI Assist
              </span>
              {['Improve', 'Hook', 'Rewrite', 'Shorten', 'Hashtags'].map(tool => (
                <button key={tool} className="px-2.5 py-1 text-[12px] font-medium text-zinc-600 bg-white border border-zinc-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 rounded-[6px] transition-colors shadow-sm">
                  {tool}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-zinc-200 bg-zinc-50 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex-1 max-w-sm">
              {isScheduling && (
                <div className="p-3.5 bg-white border border-zinc-200 rounded-[10px] shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] font-semibold text-zinc-700 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-zinc-400" />
                      Schedule Time
                    </h4>
                    <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" /> Best time: 18:45
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="flex-1 min-w-0 border border-zinc-200 rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-28 border border-zinc-200 rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                </div>
              )}
              
              <button onClick={handleSaveDraft} className="flex items-center px-4 py-2 text-zinc-600 font-medium text-[13px] hover:bg-zinc-200 rounded-lg transition-colors">
                <Save className="w-4 h-4 mr-1.5" />
                Save Draft
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsScheduling(!isScheduling)}
                className={`flex items-center px-4 py-2 font-medium text-[13px] rounded-[8px] transition-colors ${
                  isScheduling ? 'bg-brand-100 text-brand-700' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm'
                }`}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Schedule
              </button>
              <button 
                onClick={() => handleScheduleOrPublish(isScheduling ? 'scheduled' : 'published')}
                className="flex items-center px-5 py-2 bg-brand-500 text-white font-medium text-[13px] rounded-[8px] hover:bg-brand-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 mr-1.5" />
                {isScheduling ? 'Schedule Post' : 'Publish'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Preview Section (approx 35-40%) */}
      <div className="hidden lg:flex lg:w-[35%] bg-surface-bg flex-col overflow-y-auto">
        <div className="sticky top-0 p-4 border-b border-zinc-200/50 bg-surface-bg/80 backdrop-blur z-10">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center">
            {activePreviewTab === 'original' ? 'Base Preview' : `${activePreviewTab} Workspace Preview`}
          </h3>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center">
          {/* Workspace Panel Preview (not phone frame) */}
          <div className="w-full max-w-[340px] bg-white rounded-[12px] shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center">
              <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold shrink-0">
                CL
              </div>
              <div className="ml-3">
                <p className="text-[14px] font-semibold text-zinc-900 leading-tight">Creator Lab</p>
                <p className="text-[12px] text-zinc-500">Just now</p>
              </div>
              {activePreviewTab !== 'original' && (
                <div className="ml-auto text-zinc-400">
                  <PlatformIcon platform={activePreviewTab as Platform} className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="text-[14px] text-zinc-800 whitespace-pre-wrap mb-4">
                {currentContentText || <span className="text-zinc-400 italic">Your caption will appear here...</span>}
              </div>

              {currentMediaIds.length > 0 ? (
                <div className="w-full rounded-[8px] overflow-hidden border border-zinc-100 bg-zinc-50">
                   {(() => {
                      const firstAsset = state.mediaAssets.find(a => a.id === currentMediaIds[0]);
                      if (firstAsset?.type === 'image') {
                        return <img src={firstAsset.url} className="w-full h-auto max-h-[300px] object-cover" />;
                      }
                      return <div className="w-full h-40 flex items-center justify-center text-sm font-medium text-zinc-400">Video Content</div>;
                   })()}
                </div>
              ) : (
                <div className="w-full h-24 bg-zinc-50 rounded-[8px] flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">No media attached</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="font-semibold text-zinc-900">Select Media</h3>
              <button onClick={() => setShowMediaModal(false)} className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4 bg-white">
              {state.mediaAssets.map(asset => (
                <div 
                  key={asset.id} 
                  onClick={() => addMediaToCurrent(asset.id)}
                  className="aspect-square bg-zinc-100 rounded-[10px] overflow-hidden border border-zinc-200 cursor-pointer hover:border-brand-500 hover:ring-2 hover:ring-brand-200 group relative transition-all"
                >
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-zinc-500">Video</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
              {state.mediaAssets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-[14px] font-medium text-zinc-600 mb-1">No media available</p>
                  <p className="text-[13px] text-zinc-400">Upload assets in the Media Library first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
