import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalendarIcon, Clock, X, Image as ImageIcon } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, endOfWeek, subMonths, addMonths, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';

export function CalendarPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const posts = state.posts.filter(p => p.status === 'scheduled' || p.status === 'published');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const handleCreateOnDate = (date: Date) => {
    // format as YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    navigate(`/create?date=${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'month' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
            >Month</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-md text-zinc-300 cursor-not-allowed`} title="Coming soon"
            >Week</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-md text-zinc-300 cursor-not-allowed`} title="Coming soon"
            >Day</button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-2 border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={today} className="px-4 py-2 border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-zinc-900 ml-4">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm cursor-not-allowed opacity-50" title="Coming soon">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {/* Calendar Grid (Month View) */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/50 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="px-4 py-3 border-r border-zinc-200 last:border-r-0 text-center">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
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
            
            return (
              <div 
                key={day.toISOString()} 
                className={`border-r border-b border-zinc-200 p-1.5 relative group transition-colors min-h-[120px] ${!isCurrentMonth ? 'bg-zinc-50/50' : ''} ${isToday ? 'bg-indigo-50/20' : ''}`}
              >
                <div className={`text-xs font-medium p-1 mb-1 ${isToday ? 'text-indigo-600 font-bold' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[calc(100%-24px)] scrollbar-hide pb-6">
                  {dayPosts.map(post => {
                    const statusColor = post.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100';
                    return (
                      <div 
                        key={post.id} 
                        onClick={() => setSelectedPost(post)}
                        className={`p-1.5 border rounded-md shadow-sm hover:shadow transition-shadow cursor-pointer ${statusColor}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {format(parseISO(post.scheduledAt || ''), 'h:mm a')}
                          </span>
                          <div className="flex -space-x-1">
                            {post.platformContent.map(pc => (
                              <div key={pc.platform} className="w-3.5 h-3.5 rounded-full bg-zinc-200 border border-white flex items-center justify-center overflow-hidden">
                                <span className="text-[7px] font-bold uppercase">{pc.platform[0]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] font-medium line-clamp-1 leading-snug">
                          {post.title}
                        </p>
                      </div>
                    )
                  })}
                </div>
                
                {/* Add button overlay on hover */}
                <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={() => handleCreateOnDate(day)}
                    className="w-8 h-8 bg-white border border-zinc-200 rounded-full shadow-md flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-indigo-600 hover:border-indigo-200 transition-colors"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    selectedPost.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {selectedPost.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedPost.scheduledAt ? format(parseISO(selectedPost.scheduledAt), 'MMM d, yyyy • h:mm a') : 'No date'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{selectedPost.title}</h3>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  {selectedPost.originalContent.caption || 'No caption'}
                </p>
              </div>
              
              {selectedPost.originalContent.mediaIds.length > 0 && (
                <div className="mb-6 flex gap-2 overflow-x-auto">
                  {selectedPost.originalContent.mediaIds.map(mid => {
                    const m = state.mediaAssets.find(a => a.id === mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="w-16 h-16 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        {m.type === 'image' ? (
                          <img src={m.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">Video</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigate(`/create?edit=${selectedPost.id}`);
                  }}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Edit Post
                </button>
                <button className="flex-1 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
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
