import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { mockPosts } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-16')); // Mock current date
  const navigate = useNavigate();

  // Simple mock month view generation (just one week for now to keep it clean)
  const startDate = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
            <button className="px-3 py-1.5 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-md">Month</button>
            <button className="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-md">Week</button>
            <button className="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-md">Day</button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg">
              Today
            </button>
            <button className="p-2 border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-zinc-900 ml-4">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {/* Calendar Grid (Simplified Week View) */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/50 shrink-0">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="px-4 py-3 border-r border-zinc-200 last:border-r-0">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg font-semibold ${isSameDay(day, new Date('2026-09-16')) ? 'text-indigo-600' : 'text-zinc-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 flex-1 min-h-[500px]">
          {weekDays.map(day => {
            // Find posts for this day
            const dayPosts = mockPosts.filter(p => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));
            const isToday = isSameDay(day, new Date('2026-09-16'));

            return (
              <div key={day.toISOString()} className={`border-r border-zinc-200 last:border-r-0 p-2 relative group transition-colors ${isToday ? 'bg-indigo-50/10' : ''}`}>
                <div className="space-y-2">
                  {dayPosts.map(post => (
                    <div key={post.id} className="p-2.5 bg-white border border-indigo-100 rounded-lg shadow-sm shadow-indigo-100/50 hover:border-indigo-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {post.status}
                        </span>
                        <div className="flex -space-x-1">
                          {post.platformContent.map(pc => (
                            <div key={pc.platform} className="w-4 h-4 rounded-full bg-zinc-200 border border-white flex items-center justify-center overflow-hidden">
                              <span className="text-[8px] font-bold uppercase">{pc.platform[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-snug">
                        {post.title}
                      </p>
                      <div className="flex items-center text-[10px] text-zinc-500 mt-2 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(post.scheduledAt || ''), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add button overlay on hover */}
                <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={() => navigate('/create')}
                    className="w-10 h-10 bg-white border border-zinc-200 rounded-full shadow-md flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
