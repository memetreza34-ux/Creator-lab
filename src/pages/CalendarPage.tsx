import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Filter, Clock, X, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { PlatformIcon } from '../components/ui/PlatformIcon';

export function CalendarPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');

  const posts = state.posts;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleCreateOnDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    navigate(`/create?date=${yyyy}-${mm}-${dd}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-status-success text-white border-status-success';
      case 'scheduled': return 'bg-brand-500 text-white border-brand-500';
      case 'failed': return 'bg-status-danger text-white border-status-danger';
      default: return 'bg-zinc-200 text-zinc-700 border-zinc-300';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'published': return 'bg-status-success';
      case 'scheduled': return 'bg-brand-500';
      case 'failed': return 'bg-status-danger';
      default: return 'bg-zinc-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg p-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-6">
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Calendar</h1>
          
          <div className="flex items-center p-1 bg-zinc-200/50 rounded-lg">
            {['Month', 'Week', 'Day'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-[13px] font-medium rounded-md transition-colors ${
                  viewMode === mode 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 mr-4">
            <button onClick={prevMonth} className="p-1.5 hover:bg-zinc-200/60 rounded-md text-zinc-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-200/60 rounded-md transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-zinc-200/60 rounded-md text-zinc-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-semibold text-zinc-900 ml-3 min-w-[140px]">
              {format(currentDate, 'MMMM yyyy')}
            </span>
          </div>

          <button className="flex items-center px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-[13px] font-medium hover:bg-zinc-50 shadow-sm transition-colors">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filter
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="flex items-center px-4 py-1.5 bg-brand-500 text-white rounded-lg text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create
          </button>
        </div>
      </div>

      {/* Calendar Grid (Month View) */}
      <div className="flex-1 bg-white border border-border-subtle rounded-[12px] shadow-sm overflow-hidden flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border-subtle bg-zinc-50/50 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="px-3 py-2.5 border-r border-border-subtle last:border-r-0 text-center">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {dayName}
              </div>
            </div>
          ))}
        </div>
        
        {/* Cells */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto min-h-[600px]">
          {calendarDays.map((day, idx) => {
            const dayPosts = posts.filter(p => p.scheduledAt && isSameDay(parseISO(p.scheduledAt), day));
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            
            // Add a mock "Best time" recommendation for today or future dates sparingly
            const showBestTime = isToday || (day.getDate() % 5 === 0 && isCurrentMonth);

            return (
              <div 
                key={day.toISOString()} 
                className={`border-r border-b border-border-subtle p-1.5 relative group transition-colors min-h-[120px] ${!isCurrentMonth ? 'bg-zinc-50/40' : ''} ${isToday ? 'bg-brand-50/30' : ''}`}
              >
                <div className={`text-[12px] font-medium p-1 mb-1 ${isToday ? 'text-brand-600 font-bold bg-brand-100 rounded inline-block px-1.5 py-0.5' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-28px)] scrollbar-hide pb-6">
                  {showBestTime && dayPosts.length === 0 && (
                    <div className="px-1.5 py-1 text-[10px] font-medium text-brand-500/80 flex items-center bg-brand-50/50 rounded border border-brand-100/50">
                      <Clock className="w-2.5 h-2.5 mr-1" /> Best: 18:45
                    </div>
                  )}

                  {dayPosts.map(post => {
                    const mediaAsset = post.originalContent.mediaIds[0] ? state.mediaAssets.find(m => m.id === post.originalContent.mediaIds[0]) : null;
                    return (
                      <div 
                        key={post.id} 
                        onClick={() => setSelectedPost(post)}
                        className="p-1.5 border border-zinc-200 rounded-[6px] bg-white shadow-sm hover:border-brand-300 hover:shadow transition-all cursor-pointer group/card flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-[10px] font-semibold text-zinc-600">
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDot(post.status)}`} />
                            {format(parseISO(post.scheduledAt || ''), 'HH:mm')}
                          </div>
                          <div className="flex -space-x-1">
                            {post.platformContent.map(pc => (
                              <div key={pc.platform} className="w-4 h-4 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
                                <PlatformIcon platform={pc.platform} className="w-2.5 h-2.5" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1.5">
                          {mediaAsset && (
                            <div className="w-6 h-6 rounded bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200/50">
                              {mediaAsset.type === 'image' ? (
                                <img src={mediaAsset.url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[8px] text-white">Vid</div>
                              )}
                            </div>
                          )}
                          <p className="text-[11px] font-medium text-zinc-800 line-clamp-2 leading-tight">
                            {post.title}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Add button overlay on hover */}
                <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={() => handleCreateOnDate(day)}
                    className="w-8 h-8 bg-white border border-zinc-200 rounded-full shadow-md flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-brand-600 hover:border-brand-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Details Drawer/Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    selectedPost.status === 'published' ? 'bg-status-success/10 text-status-success' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {selectedPost.status}
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
                  {selectedPost.originalContent.mediaIds.map(mid => {
                    const m = state.mediaAssets.find(a => a.id === mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="w-20 h-20 rounded-[8px] overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        {m.type === 'image' ? (
                          <img src={m.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">Video</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigate(`/create?edit=${selectedPost.id}`);
                  }}
                  className="flex-1 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Edit Post
                </button>
                <button className="flex-1 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-[8px] text-[13px] font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
