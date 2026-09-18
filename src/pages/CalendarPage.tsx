import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, 
  startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO,
  addWeeks, subWeeks, addDays, subDays, setHours, startOfDay, addHours
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Filter, Clock, X, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Post, PostStatus } from '../types';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { getWorkspacePosts, getPostPlatforms, getWorkspaceMedia } from '../utils/selectors';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const getStatusColor = (status: PostStatus) => {
  switch (status) {
    case 'published': return 'bg-status-success';
    case 'scheduled': return 'bg-brand-500';
    case 'draft': return 'bg-zinc-400';
    case 'failed': return 'bg-status-danger';
    case 'needs_review': return 'bg-status-warning';
    default: return 'bg-zinc-400';
  }
};

const DraggablePost: React.FC<{ post: Post, onClick: () => void, mediaAssets: any[], socialAccounts: any[] }> = ({ post, onClick, mediaAssets, socialAccounts }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post }
  });

  const mediaAsset = post.originalContent.mediaIds[0] ? mediaAssets.find(m => m.id === post.originalContent.mediaIds[0]) : null;
  const platforms = getPostPlatforms(post, socialAccounts);

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click when dragging
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`p-1.5 border border-zinc-200 rounded-[6px] bg-white shadow-sm hover:border-brand-300 hover:shadow transition-all cursor-pointer group/card flex flex-col gap-1.5 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[10px] font-semibold text-zinc-600">
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor(post.status)}`} />
          {format(parseISO(post.scheduledAt || post.createdAt), 'HH:mm')}
        </div>
        <div className="flex -space-x-1">
          {platforms.map((platform: any) => (
            <div key={platform} className="w-4 h-4 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
              <PlatformIcon platform={platform} className="w-2.5 h-2.5" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-start gap-1.5">
        {mediaAsset && (
          <div className="w-6 h-6 rounded bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200/50 pointer-events-none">
            {mediaAsset.type === 'image' ? (
              <img src={mediaAsset.url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[8px] text-white">Vid</div>
            )}
          </div>
        )}
        <p className="text-[11px] font-medium text-zinc-800 line-clamp-2 leading-tight pointer-events-none">
          {post.title}
        </p>
      </div>
    </div>
  );
};

const DroppableCell: React.FC<{ id: string, className: string, children: React.ReactNode, onClick?: () => void }> = ({ id, className, children, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      onClick={onClick}
      className={`${className} ${isOver ? 'bg-brand-50/50 border-brand-300' : ''}`}
    >
      {children}
    </div>
  );
};

export function CalendarPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  
  const workspacePosts = getWorkspacePosts(state);
  const mediaAssets = getWorkspaceMedia(state);

  const [activeTab, setActiveTab] = useState<PostStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Best time recommendation simulation
  const recommendedTimes: Record<string, string> = {
    'instagram': '18:30',
    'tiktok': '20:15',
    'youtube': '17:00'
  };

  const next = () => {
    if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  
  const prev = () => {
    if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const getCalendarDays = () => {
    if (viewMode === 'Month') {
      const monthStart = startOfMonth(currentDate);
      return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
    } else if (viewMode === 'Week') {
      return eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
    } else {
      return [currentDate];
    }
  };

  const calendarDays = getCalendarDays();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const post = active.data.current?.post as Post;
    if (!post || post.status === 'published') {
      if (post && post.status === 'published') {
        toast.error('Published posts cannot be rescheduled');
      }
      return;
    }

    const dropData = over.id as string; 
    let newDate = new Date(dropData);

    if (isNaN(newDate.getTime())) return;

    // Keep the original time if moving between days in Month view, 
    // but the dropData will just have midnight unless we specifically added hours.
    if (viewMode === 'Month') {
      const existingDate = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
      newDate.setHours(existingDate.getHours());
      newDate.setMinutes(existingDate.getMinutes());
    }

    dispatch({
      type: 'UPDATE_POST',
      payload: { ...post, scheduledAt: newDate.toISOString() }
    });
    
    toast.success(`Post moved to ${format(newDate, 'MMM d, HH:mm')}`);
  };

  const handleCreateOnDate = (date: Date) => {
    navigate(`/create?date=${date.toISOString()}`);
  };

  const filteredPosts = workspacePosts
    .filter((p: any) => activeTab === 'all' || p.status === activeTab)
    .filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 p.originalContent.caption?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Post Actions
  const handleDuplicate = (post: Post) => {
    const duplicated: Post = {
      ...post,
      id: uuidv4(),
      title: `${post.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      scheduledAt: undefined,
      publishedAt: undefined
    };
    dispatch({ type: 'ADD_POST', payload: duplicated });
    toast.success('Post duplicated as draft');
    setSelectedPost(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_POST', payload: id });
      toast.success('Post deleted');
      setSelectedPost(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-bg overflow-hidden relative">
      <div className="flex-none p-6 pb-0 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Calendar</h1>
            <p className="text-[14px] text-zinc-500 mt-1">Schedule and manage your content.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-zinc-200 rounded-[8px] p-1 shadow-sm">
              <button onClick={() => setViewMode('Month')} className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${viewMode === 'Month' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>Month</button>
              <button onClick={() => setViewMode('Week')} className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${viewMode === 'Week' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>Week</button>
              <button onClick={() => setViewMode('Day')} className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${viewMode === 'Day' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>Day</button>
            </div>
            <button onClick={() => navigate('/create')} className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors">
              <Plus className="w-4 h-4 mr-1.5" />
              New Post
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-[12px] border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button onClick={prev} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
              <button onClick={next} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
              <button onClick={goToToday} className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">Today</button>
            </div>
            <h2 className="text-[16px] font-semibold text-zinc-900 min-w-[140px]">
              {viewMode === 'Month' ? format(currentDate, 'MMMM yyyy') : 
               viewMode === 'Week' ? `${format(calendarDays[0], 'MMM d')} - ${format(calendarDays[6], 'MMM d, yyyy')}` :
               format(currentDate, 'MMMM d, yyyy')}
            </h2>
          </div>
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="flex space-x-2 items-center text-[12px]">
              <span className="font-medium text-zinc-500 mr-2">Filter:</span>
              {(['all', 'draft', 'scheduled', 'published', 'needs_review'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-2 py-1 rounded-[6px] capitalize transition-colors ${
                    activeTab === status ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-2">
        <div className="bg-white rounded-[12px] border border-border-subtle shadow-sm h-full flex flex-col overflow-hidden">
          
          <DndContext onDragEnd={handleDragEnd}>
            {viewMode === 'Month' && (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-border-subtle shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2.5 text-center text-[12px] font-semibold text-zinc-500 tracking-wide uppercase bg-zinc-50/50">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                  {calendarDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayPosts = filteredPosts.filter((p: any) => p.scheduledAt && isSameDay(parseISO(p.scheduledAt), day));
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <DroppableCell 
                        key={dayStr} 
                        id={day.toISOString()}
                        className={`border-r border-b border-border-subtle p-1.5 relative group transition-colors min-h-[120px] ${!isCurrentMonth ? 'bg-zinc-50/40' : ''} ${isToday ? 'bg-brand-50/30' : ''}`}
                      >
                        <div className={`text-[12px] font-medium p-1 mb-1 ${isToday ? 'text-brand-600 font-bold bg-brand-100 rounded inline-block px-1.5 py-0.5' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'}`}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-28px)] scrollbar-hide pb-6 relative z-10">
                          {dayPosts.map((post: any) => (
                            <DraggablePost 
                              key={post.id} 
                              post={post} 
                              onClick={() => setSelectedPost(post)} 
                              mediaAssets={mediaAssets}
                              socialAccounts={state.socialAccounts}
                            />
                          ))}
                        </div>
                        
                        <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCreateOnDate(day); }}
                            className="w-8 h-8 bg-white border border-zinc-200 rounded-full shadow-md flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-brand-600 hover:border-brand-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </DroppableCell>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'Week' && (
              <div className="flex-1 flex flex-col overflow-auto min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-border-subtle shrink-0">
                  <div className="py-2.5 text-center text-[12px] font-semibold text-zinc-400 tracking-wide uppercase bg-zinc-50/50 border-r border-border-subtle">
                    Time
                  </div>
                  {calendarDays.map(day => (
                    <div key={day.toISOString()} className="py-2.5 text-center bg-zinc-50/50 border-r border-border-subtle">
                      <div className="text-[11px] font-semibold text-zinc-500 uppercase">{format(day, 'EEE')}</div>
                      <div className={`text-[15px] font-bold mt-0.5 ${isSameDay(day, new Date()) ? 'text-brand-600' : 'text-zinc-900'}`}>{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-border-subtle min-h-[80px]">
                      <div className="p-2 text-[11px] font-medium text-zinc-400 text-right border-r border-border-subtle bg-zinc-50/30">
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                      {calendarDays.map(day => {
                        const cellTime = setHours(startOfDay(day), hour);
                        const cellEnd = addHours(cellTime, 1);
                        const cellPosts = filteredPosts.filter((p: any) => {
                          if (!p.scheduledAt) return false;
                          const pTime = parseISO(p.scheduledAt);
                          return pTime >= cellTime && pTime < cellEnd;
                        });
                        
                        return (
                          <DroppableCell 
                            key={cellTime.toISOString()}
                            id={cellTime.toISOString()}
                            className="p-1 border-r border-border-subtle relative group"
                          >
                            <div className="space-y-1 h-full">
                              {cellPosts.map((post: any) => (
                                <DraggablePost 
                                  key={post.id} 
                                  post={post} 
                                  onClick={() => setSelectedPost(post)} 
                                  mediaAssets={mediaAssets}
                                  socialAccounts={state.socialAccounts}
                                />
                              ))}
                            </div>
                            <div className="absolute inset-0 bg-zinc-50/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCreateOnDate(cellTime); }}
                                  className="w-6 h-6 bg-white border border-zinc-200 rounded-full shadow-sm flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-brand-600 hover:border-brand-200 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                          </DroppableCell>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'Day' && (
              <div className="flex-1 flex flex-col overflow-auto min-w-[400px] max-w-4xl mx-auto w-full border-x border-border-subtle">
                <div className="py-4 text-center bg-zinc-50/50 border-b border-border-subtle">
                  <div className="text-[13px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">{format(currentDate, 'EEEE')}</div>
                  <div className={`text-[24px] font-bold ${isSameDay(currentDate, new Date()) ? 'text-brand-600' : 'text-zinc-900'}`}>{format(currentDate, 'MMMM d, yyyy')}</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cellTime = setHours(startOfDay(currentDate), hour);
                    const cellEnd = addHours(cellTime, 1);
                    const cellPosts = filteredPosts.filter((p: any) => {
                      if (!p.scheduledAt) return false;
                      const pTime = parseISO(p.scheduledAt);
                      return pTime >= cellTime && pTime < cellEnd;
                    });
                    
                    return (
                      <div key={hour} className="flex border-b border-border-subtle min-h-[100px]">
                        <div className="w-24 p-3 text-[12px] font-medium text-zinc-400 text-right border-r border-border-subtle bg-zinc-50/30">
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </div>
                        <DroppableCell 
                          id={cellTime.toISOString()}
                          className="flex-1 p-2 relative group"
                        >
                          <div className="space-y-2 h-full">
                            {cellPosts.map((post: any) => (
                              <div key={post.id} className="w-1/2">
                                <DraggablePost 
                                  post={post} 
                                  onClick={() => setSelectedPost(post)} 
                                  mediaAssets={mediaAssets}
                                  socialAccounts={state.socialAccounts}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-zinc-50/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-0">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCreateOnDate(cellTime); }}
                              className="w-8 h-8 bg-white border border-zinc-200 rounded-full shadow-sm flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-brand-600 hover:border-brand-200 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </DroppableCell>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </DndContext>
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(selectedPost.status)} text-white`}>
                    {selectedPost.status.replace('_', ' ')}
                  </span>
                  <span className="text-[12px] text-zinc-500 font-medium flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {selectedPost.scheduledAt ? format(parseISO(selectedPost.scheduledAt), 'MMM d, yyyy • HH:mm') : 'No date'}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-zinc-900 leading-tight">{selectedPost.title}</h3>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-1.5 hover:bg-zinc-200/60 rounded-md transition-colors text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-5">
                <p className="text-[13px] text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-3 rounded-[8px] border border-zinc-100 leading-relaxed">
                  {selectedPost.originalContent.caption || <span className="italic text-zinc-400">No caption</span>}
                </p>
              </div>
              
              {selectedPost.originalContent.mediaIds.length > 0 && (
                <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
                  {selectedPost.originalContent.mediaIds.map((mid: string) => {
                    const m = mediaAssets.find((a: any) => a.id === mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="w-20 h-20 rounded-[8px] overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        {m.type === 'image' ? (
                          <img src={m.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">Video</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => navigate(`/create?edit=${selectedPost.id}`)}
                  className="py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm flex items-center justify-center"
                >
                  Edit Post
                </button>
                <button 
                  onClick={() => handleDuplicate(selectedPost)}
                  className="py-2 bg-white border border-zinc-200 text-zinc-700 rounded-[8px] text-[13px] font-medium hover:bg-zinc-50 transition-colors shadow-sm flex items-center justify-center"
                >
                  Duplicate
                </button>
                <button 
                  onClick={() => {
                    navigate(`/create?edit=${selectedPost.id}`);
                  }}
                  className="py-2 bg-white border border-zinc-200 text-zinc-700 rounded-[8px] text-[13px] font-medium hover:bg-zinc-50 transition-colors shadow-sm flex items-center justify-center"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => handleDelete(selectedPost.id)}
                  className="py-2 bg-white border border-status-danger/20 text-status-danger hover:bg-status-danger/10 rounded-[8px] text-[13px] font-medium transition-colors shadow-sm flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}