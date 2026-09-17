import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Platform, Post, PostContent, PlatformSpecificContent, MediaAsset } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ImageIcon, X, Send, Save, Clock, Wand2, Smile, Hash, Sparkles } from 'lucide-react';

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

  // Load existing post if edit
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
          const dateObj = new Date(existing.scheduledAt);
          // format local date/time string roughly
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          setScheduleDate(`${yyyy}-${mm}-${dd}`);
          const hh = String(dateObj.getHours()).padStart(2, '0');
          const m = String(dateObj.getMinutes()).padStart(2, '0');
          setScheduleTime(`${hh}:${m}`);
        }
      }
    }
  }, [editId, state.posts]);

  // Derived selected platforms
  const selectedPlatforms = Array.from(new Set(
    selectedAccountIds.map(id => availableAccounts.find(a => a.id === id)?.platform).filter(Boolean) as Platform[]
  ));

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleContentChange = (val: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, caption: val }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: { ...(prev[activePreviewTab]?.content || originalContent), caption: val }
        }
      }));
    }
  };

  const currentContentText = activePreviewTab === 'original' 
    ? originalContent.caption 
    : platformContents[activePreviewTab]?.content.caption ?? originalContent.caption;

  const currentMediaIds = activePreviewTab === 'original'
    ? originalContent.mediaIds
    : platformContents[activePreviewTab]?.content.mediaIds ?? originalContent.mediaIds;

  const handleSaveDraft = () => {
    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: activeWorkspace.id,
      title: originalContent.caption.slice(0, 30) || 'Untitled Draft',
      destinationAccountIds: selectedAccountIds,
      originalContent,
      platformContent: Object.values(platformContents),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
      toast.success('Draft updated');
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
      toast.success('Draft saved');
    }
    navigate('/posts');
  };

  const handleScheduleOrPublish = (status: 'scheduled' | 'published') => {
    if (selectedAccountIds.length === 0) {
      toast.error('Select at least one account');
      return;
    }
    if (!originalContent.caption && originalContent.mediaIds.length === 0) {
      toast.error('Add some content or media');
      return;
    }

    let scheduledAtStr = undefined;
    if (status === 'scheduled') {
      if (!scheduleDate || !scheduleTime) {
        toast.error('Select date and time');
        return;
      }
      const d = new Date(`${scheduleDate}T${scheduleTime}`);
      if (d < new Date()) {
        toast.error('Cannot schedule in the past');
        return;
      }
      scheduledAtStr = d.toISOString();
    }

    if (status === 'published') {
      if (!window.confirm("Social publishing APIs are not connected in this prototype.\n\nWould you like to Simulate Publish?")) {
        return;
      }
    }

    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: activeWorkspace.id,
      title: originalContent.caption.slice(0, 30) || 'Untitled Post',
      destinationAccountIds: selectedAccountIds,
      originalContent,
      platformContent: Object.values(platformContents),
      status,
      scheduledAt: scheduledAtStr,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
      toast.success(status === 'scheduled' ? 'Post rescheduled' : 'Post simulated published');
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
      toast.success(status === 'scheduled' ? 'Scheduled in Creator Lab' : 'Simulated Publish in Creator Lab');
    }
    
    if (status === 'scheduled') {
      navigate('/calendar');
    } else {
      navigate('/posts');
    }
  };

  const [showMediaModal, setShowMediaModal] = useState(false);

  const addMediaToCurrent = (mediaId: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, mediaIds: [...prev.mediaIds, mediaId] }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: { 
            ...(prev[activePreviewTab]?.content || originalContent), 
            mediaIds: [...(prev[activePreviewTab]?.content?.mediaIds || originalContent.mediaIds), mediaId] 
          }
        }
      }));
    }
    setShowMediaModal(false);
  };

  const removeMediaFromCurrent = (mediaId: string) => {
    if (activePreviewTab === 'original') {
      setOriginalContent(prev => ({ ...prev, mediaIds: prev.mediaIds.filter(id => id !== mediaId) }));
    } else {
      setPlatformContents(prev => ({
        ...prev,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: { 
            ...(prev[activePreviewTab]?.content || originalContent), 
            mediaIds: (prev[activePreviewTab]?.content?.mediaIds || originalContent.mediaIds).filter(id => id !== mediaId)
          }
        }
      }));
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Main Composer */}
      <div className="flex-1 flex flex-col border-r border-zinc-200">
        
        {/* Account Selector */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">Publish to</h2>
          <div className="flex flex-wrap gap-3">
            {availableAccounts.length === 0 && (
              <span className="text-sm text-zinc-500">No accounts connected. Go to Social Accounts to connect.</span>
            )}
            {availableAccounts.map(account => {
              const isSelected = selectedAccountIds.includes(account.id);
              return (
                <button
                  key={account.id}
                  onClick={() => toggleAccount(account.id)}
                  className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-200 mr-2 flex items-center justify-center overflow-hidden">
                    <span className="text-[10px] uppercase font-bold">{account.platform[0]}</span>
                  </div>
                  <span className="font-medium">{account.displayName || account.username}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedPlatforms.length > 0 && (
            <div className="mb-6 flex space-x-2 border-b border-zinc-200">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activePreviewTab === 'original' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => setActivePreviewTab('original')}
              >
                Original
              </button>
              {selectedPlatforms.map(platform => (
                <button
                  key={platform}
                  className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${activePreviewTab === platform ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  onClick={() => setActivePreviewTab(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          )}

          <div className="border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <textarea
              className="w-full min-h-[200px] p-4 outline-none resize-none text-zinc-900 placeholder:text-zinc-400"
              placeholder="What do you want to share?"
              value={currentContentText}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            
            {currentMediaIds.length > 0 && (
              <div className="p-4 flex gap-4 overflow-x-auto border-t border-zinc-100">
                {currentMediaIds.map(mid => {
                  const asset = state.mediaAssets.find(a => a.id === mid);
                  if (!asset) return null;
                  return (
                    <div key={mid} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-zinc-200 group">
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white text-xs">Video</div>
                      )}
                      <button 
                        onClick={() => removeMediaFromCurrent(mid)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-200">
              <div className="flex items-center space-x-1">
                <button onClick={() => setShowMediaModal(true)} className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-md transition-colors tooltip" title="Add Media">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-300 rounded-md cursor-not-allowed tooltip" title="Coming soon">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-300 rounded-md cursor-not-allowed tooltip" title="Coming soon">
                  <Hash className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-400 font-medium">{currentContentText.length} chars</span>
            </div>
          </div>

          {/* AI Tools */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled className="flex items-center px-3 py-1.5 bg-indigo-50/50 text-indigo-400 rounded-md text-sm font-medium cursor-not-allowed">
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              AI Improve (Soon)
            </button>
          </div>
        </div>

        {/* Publishing Footer */}
        <div className="p-6 border-t border-zinc-200 bg-zinc-50">
          {isScheduling && (
            <div className="mb-4 p-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-500 mb-1">Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border border-zinc-200 rounded-md px-3 py-1.5 text-sm" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-500 mb-1">Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="border border-zinc-200 rounded-md px-3 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={handleSaveDraft} className="flex items-center px-4 py-2 text-zinc-600 font-medium text-sm hover:bg-zinc-200 rounded-lg transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsScheduling(!isScheduling)}
                className={`flex items-center px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  isScheduling ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </button>
              <button 
                onClick={() => handleScheduleOrPublish(isScheduling ? 'scheduled' : 'published')}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isScheduling ? 'Schedule Post' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="w-[400px] bg-zinc-50 p-8 overflow-y-auto hidden md:block">
        <h3 className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-wider text-center">
          {activePreviewTab === 'original' ? 'Generic Preview' : `${activePreviewTab} Preview`}
        </h3>
        
        {/* Mock Phone Container */}
        <div className="w-full max-w-[320px] mx-auto bg-white rounded-[2.5rem] border-[8px] border-zinc-900 shadow-xl overflow-hidden h-[600px] flex flex-col relative">
          <div className="absolute top-0 inset-x-0 h-6 bg-white z-10 flex justify-center">
            <div className="w-1/3 h-4 bg-zinc-900 rounded-b-xl"></div>
          </div>
          
          <div className="pt-10 px-4 pb-4 flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-zinc-200 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 leading-none">creatorlab</p>
                <p className="text-xs text-zinc-500">Just now</p>
              </div>
            </div>
            
            {currentMediaIds.length > 0 ? (
              <div className="w-full rounded-xl mb-4 overflow-hidden border border-zinc-100">
                 {(() => {
                    const firstAsset = state.mediaAssets.find(a => a.id === currentMediaIds[0]);
                    if (firstAsset?.type === 'image') {
                      return <img src={firstAsset.url} className="w-full h-auto object-cover" />;
                    }
                    return <div className="w-full h-48 bg-zinc-200 flex items-center justify-center">Video</div>;
                 })()}
              </div>
            ) : (
              <div className="w-full h-32 bg-zinc-100 rounded-xl mb-4 flex items-center justify-center text-zinc-400">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            
            <div className="text-sm text-zinc-800 whitespace-pre-wrap">
              {currentContentText || 'Your caption will appear here...'}
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-900">Select Media</h3>
              <button onClick={() => setShowMediaModal(false)} className="p-1 hover:bg-zinc-100 rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4">
              {state.mediaAssets.map(asset => (
                <div 
                  key={asset.id} 
                  onClick={() => addMediaToCurrent(asset.id)}
                  className="aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer hover:border-indigo-500 group relative"
                >
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">Video</div>
                  )}
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors" />
                </div>
              ))}
              {state.mediaAssets.length === 0 && (
                <div className="col-span-full text-center py-8 text-zinc-500">
                  No media in library yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
