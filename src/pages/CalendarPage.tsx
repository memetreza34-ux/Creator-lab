import React, { useEffect, useMemo, useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Plus, Filter, Clock, X, 
  Calendar as CalendarIcon, Search, Sparkles, Check, 
  Image as ImageIcon, FileText, Copy, Trash2, Edit3 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MediaAsset, Platform, Post, PostStatus, SocialAccount } from '../types';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { getWorkspacePosts, getPostPlatforms, getWorkspaceMedia, getWorkspaceAccounts } from '../utils/selectors';
import toast from 'react-hot-toast';
import { resolveMediaUrl } from '../utils/mediaStorage';
import {
  getScheduledLocalDateTime,
  getStatusAfterCalendarReschedule,
  getWorkspaceTodayDate,
  isCalendarDraggableStatus,
  isScheduledInLocalHour,
  isScheduledOnLocalDate,
  rescheduleUtcForCalendarSlot,
} from '../utils/scheduling';
import { v4 as uuidv4 } from 'uuid';

const getStatusBadge = (status: PostStatus) => {
  switch (status) {
    case 'published':
      return { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Published' };
    case 'scheduled':
      return { bg: 'bg-brand-500', text: 'text-brand-700', label: 'Scheduled' };
    case 'draft':
      return { bg: 'bg-zinc-400', text: 'text-zinc-600', label: 'Draft' };
    case 'failed':
      return { bg: 'bg-rose-500', text: 'text-rose-700', label: 'Failed' };
    case 'needs_review':
      return { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Review' };
    default:
      return { bg: 'bg-zinc-400', text: 'text-zinc-600', label: status };
  }
};

interface DraggablePostProps {
  post: Post;
  onClick: () => void;
  mediaAssets: MediaAsset[];
  socialAccounts: SocialAccount[];
  timeZone: string;
  resolvedMediaUrls: Record<string, string>;
}

const DraggablePost: React.FC<DraggablePostProps> = ({
  post,
  onClick,
  mediaAssets,
  socialAccounts,
  timeZone,
  resolvedMediaUrls,
}) => {
  const isDraggable = isCalendarDraggableStatus(post.status);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post },
    disabled: !isDraggable,
  });

  const mediaAsset = post.originalContent.mediaIds[0] 
    ? mediaAssets.find(m => m.id === post.originalContent.mediaIds[0]) 
    : null;
  const platforms = getPostPlatforms(post, socialAccounts);
  const badge = getStatusBadge(post.status);

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`p-2 border border-[#EBEBE9] rounded-lg bg-white shadow-2xs hover:border-brand-400 hover:shadow-xs transition-all cursor-pointer group/card flex flex-col gap-1.5 select-none ${
        isDragging ? 'opacity-40 ring-2 ring-brand-500 scale-98' : 'opacity-100'
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[10px] font-semibold text-zinc-600">
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.bg}`} />
          {post.scheduledAt
            ? getScheduledLocalDateTime(post.scheduledAt, timeZone).time
            : 'Draft'}
        </div>
        <div className="flex -space-x-1">
          {platforms.map((platform) => (
            <div key={platform} className="w-4 h-4 rounded-full bg-white border border-[#EBEBE9] flex items-center justify-center p-0.5">
              <PlatformIcon platform={platform} className="w-2.5 h-2.5" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-start gap-1.5">
        {mediaAsset && (
          <div className="w-6 h-6 rounded bg-zinc-100 shrink-0 overflow-hidden border border-[#EBEBE9] pointer-events-none">
            {mediaAsset.type === 'image' ? (
              <img
                src={resolvedMediaUrls[mediaAsset.id] || mediaAsset.url}
                className="w-full h-full object-cover"
                alt=""
              />
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

interface DroppableCellProps {
  id: string;
  date: string;
  time?: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  id,
  date,
  time,
  className,
  children,
  onClick,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { date, time },
  });
  return (
    <div 
      ref={setNodeRef} 
      onClick={onClick}
      className={`${className} ${isOver ? 'bg-brand-50/60 ring-2 ring-inset ring-brand-300' : ''}`}
    >
      {children}
    </div>
  );
};

export function CalendarPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  );
  const workspaceTimeZone = activeWorkspace?.timezone || 'UTC';
  const workspaceTodayDate = getWorkspaceTodayDate(workspaceTimeZone);
  const [currentDate, setCurrentDate] = useState(
    () => new Date(`${workspaceTodayDate}T12:00:00`),
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [resolvedMediaUrls, setResolvedMediaUrls] = useState<Record<string, string>>({});

  const workspacePosts = getWorkspacePosts(state);
  // Selector returns a new array; memoize to avoid repeated async URL resolution.
  const mediaAssets = useMemo(
    () => getWorkspaceMedia(state),
    [state.mediaAssets, state.activeWorkspaceId],
  );
  const socialAccounts = getWorkspaceAccounts(state);

  // Compact Filter Popover State
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'media' | 'text'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentDate(new Date(`${workspaceTodayDate}T12:00:00`));
  }, [state.activeWorkspaceId, workspaceTodayDate]);

  useEffect(() => {
    let cancelled = false;

    const resolveUrls = async () => {
      const entries = await Promise.all(
        mediaAssets.map(async (asset) => {
          const url = await resolveMediaUrl(asset.id, asset.url);
          return [asset.id, url] as const;
        }),
      );
      if (!cancelled) setResolvedMediaUrls(Object.fromEntries(entries));
    };

    void resolveUrls();
    return () => {
      cancelled = true;
    };
  }, [mediaAssets]);

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

  const goToToday = () => setCurrentDate(new Date(`${workspaceTodayDate}T12:00:00`));

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

  const handleCreateOnSlot = (date: string, time?: string) => {
    navigate(time ? `/create?date=${date}&time=${time}` : `/create?date=${date}`);
  };

  // DnD uses civil workspace date/time from the drop target.
  // scheduledAt remains the single canonical UTC value.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const post = active.data.current?.post as Post | undefined;
    if (!post) return;

    if (!isCalendarDraggableStatus(post.status)) {
      toast.error(
        post.status === 'published'
          ? 'Published posts cannot be rescheduled.'
          : 'Fix this post in Composer before rescheduling it.',
      );
      return;
    }

    const targetDate = over.data.current?.date;
    const targetTime = over.data.current?.time;
    if (typeof targetDate !== 'string') return;

    try {
      const scheduledAt = rescheduleUtcForCalendarSlot({
        scheduledAt: post.scheduledAt,
        targetDate,
        targetTime: typeof targetTime === 'string' ? targetTime : undefined,
        viewMode,
        timeZone: workspaceTimeZone,
      });

      dispatch({
        type: 'UPDATE_POST',
        payload: {
          ...post,
          scheduledAt,
          status: getStatusAfterCalendarReschedule(post.status),
        },
      });

      const local = getScheduledLocalDateTime(scheduledAt, workspaceTimeZone);
      toast.success(
        `"${post.title}" moved to ${local.date} at ${local.time} (${workspaceTimeZone})`,
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'This calendar slot cannot be scheduled.',
      );
    }
  };

  // Filter application
  const filteredPosts = workspacePosts.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    
    if (platformFilter !== 'all') {
      const postPlatforms = getPostPlatforms(post, socialAccounts);
      if (!postPlatforms.includes(platformFilter)) return false;
    }

    if (accountFilter !== 'all') {
      if (!post.destinationAccountIds.includes(accountFilter)) return false;
    }

    if (contentTypeFilter === 'media') {
      if (post.originalContent.mediaIds.length === 0) return false;
    } else if (contentTypeFilter === 'text') {
      if (post.originalContent.mediaIds.length > 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = post.title.toLowerCase().includes(q);
      const matchesCaption = (post.originalContent.caption || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesCaption) return false;
    }

    return true;
  });

  // Active filter count and clear
  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (platformFilter !== 'all' ? 1 : 0) +
    (accountFilter !== 'all' ? 1 : 0) +
    (contentTypeFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setPlatformFilter('all');
    setAccountFilter('all');
    setContentTypeFilter('all');
    setSearchQuery('');
  };

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
    toast.success('Duplicated as draft');
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
    <div className="h-full flex flex-col bg-[#FAFAF9] overflow-hidden relative">
      <div className="flex-none p-6 pb-2">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Calendar</h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Local planning in {workspaceTimeZone}. Social publishing is not connected yet.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-[#EBEBE9] rounded-lg p-1 shadow-2xs">
              <button 
                onClick={() => setViewMode('Month')} 
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                  viewMode === 'Month' ? 'bg-[#FAFAF9] text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewMode('Week')} 
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                  viewMode === 'Week' ? 'bg-[#FAFAF9] text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('Day')} 
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                  viewMode === 'Day' ? 'bg-[#FAFAF9] text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Day
              </button>
            </div>

            <button 
              onClick={() => navigate('/create')} 
              className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Post
            </button>
          </div>
        </div>

        {/* Date Controls & Filter Popover Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-white p-3.5 rounded-xl border border-[#EBEBE9] shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button onClick={prev} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={goToToday} className="px-2.5 py-1 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                Today
              </button>
            </div>

            <h2 className="text-[15px] font-semibold text-zinc-900 min-w-[150px]">
              {viewMode === 'Month' ? format(currentDate, 'MMMM yyyy') : 
               viewMode === 'Week' ? `${format(calendarDays[0], 'MMM d')} - ${format(calendarDays[6], 'MMM d, yyyy')}` :
               format(currentDate, 'MMMM d, yyyy')}
            </h2>
          </div>

          {/* Filter Popover Trigger & Search */}
          <div className="flex items-center space-x-2.5 w-full lg:w-auto relative">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search calendar..."
                className="w-full pl-8 pr-2.5 py-1.5 text-[12px] border border-[#EBEBE9] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Compact Filter Popover Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                  activeFiltersCount > 0 
                    ? 'border-brand-300 bg-brand-50 text-brand-800' 
                    : 'border-[#EBEBE9] bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filter Popover Modal */}
              {showFilterPopover && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#EBEBE9] rounded-xl shadow-xl z-30 p-4 space-y-3.5 text-[12px] animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F2F2F0]">
                    <span className="font-semibold text-zinc-900">Calendar Filters</span>
                    <button 
                      onClick={clearAllFilters}
                      className="text-[11px] text-brand-600 hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as PostStatus | 'all')}
                      className="w-full border border-[#DCDCD8] rounded-lg p-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Locally Planned</option>
                      <option value="published">Published</option>
                      <option value="needs_review">Needs Review</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Platform
                    </label>
                    <select
                      value={platformFilter}
                      onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
                      className="w-full border border-[#DCDCD8] rounded-lg p-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="all">All Platforms</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="facebook">Facebook</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="threads">Threads</option>
                    </select>
                  </div>

                  {/* Social Account */}
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Social Account
                    </label>
                    <select
                      value={accountFilter}
                      onChange={e => setAccountFilter(e.target.value)}
                      className="w-full border border-[#DCDCD8] rounded-lg p-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="all">All planning profiles</option>
                      {socialAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.displayName} ({acc.platform})</option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Content Type
                    </label>
                    <select
                      value={contentTypeFilter}
                      onChange={e => setContentTypeFilter(e.target.value as 'all' | 'media' | 'text')}
                      className="w-full border border-[#DCDCD8] rounded-lg p-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="all">All Content Types</option>
                      <option value="media">Has Media (Images / Videos)</option>
                      <option value="text">Text Only</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowFilterPopover(false)}
                    className="w-full py-1.5 bg-zinc-900 text-white rounded-lg text-[12px] font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-zinc-400 font-medium">Active Filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-brand-50 text-brand-800 border border-brand-200">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="ml-1 text-brand-600 hover:text-brand-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {platformFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-brand-50 text-brand-800 border border-brand-200">
                Platform: {platformFilter}
                <button onClick={() => setPlatformFilter('all')} className="ml-1 text-brand-600 hover:text-brand-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {accountFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-brand-50 text-brand-800 border border-brand-200">
                Account: {socialAccounts.find(a => a.id === accountFilter)?.displayName}
                <button onClick={() => setAccountFilter('all')} className="ml-1 text-brand-600 hover:text-brand-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {contentTypeFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-brand-50 text-brand-800 border border-brand-200">
                Type: {contentTypeFilter}
                <button onClick={() => setContentTypeFilter('all')} className="ml-1 text-brand-600 hover:text-brand-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-brand-50 text-brand-800 border border-brand-200">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 text-brand-600 hover:text-brand-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Calendar Board */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        <div className="bg-white rounded-xl border border-[#EBEBE9] shadow-2xs h-full flex flex-col overflow-hidden">
          
          <DndContext onDragEnd={handleDragEnd}>
            {/* MONTH VIEW */}
            {viewMode === 'Month' && (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-[#EBEBE9] shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2.5 text-center text-[11px] font-bold text-zinc-400 tracking-wider uppercase bg-[#FAFAF9]">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                  {calendarDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayPosts = filteredPosts.filter((post) =>
                      isScheduledOnLocalDate(post.scheduledAt, dayStr, workspaceTimeZone),
                    );
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = dayStr === workspaceTodayDate;
                    
                    return (
                      <DroppableCell 
                        key={dayStr} 
                        id={`date:${dayStr}`}
                        date={dayStr}
                        className={`border-r border-b border-[#EBEBE9] p-1.5 relative group transition-colors min-h-[110px] ${
                          !isCurrentMonth ? 'bg-zinc-50/50' : ''
                        } ${isToday ? 'bg-brand-50/20' : ''}`}
                      >
                        <div className="flex items-center justify-between p-1 mb-1">
                          <span className={`text-[12px] font-semibold ${
                            isToday ? 'text-brand-600 bg-brand-100 rounded px-1.5 py-0.2' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'
                          }`}>
                            {format(day, 'd')}
                          </span>

                          <button 
                            onClick={(event) => { event.stopPropagation(); handleCreateOnSlot(dayStr); }}
                            className="w-5 h-5 rounded-md text-zinc-400 hover:text-brand-600 hover:bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Create post on this date"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-28px)] scrollbar-hide pb-2">
                          {dayPosts.map((post) => (
                            <DraggablePost 
                              key={post.id} 
                              post={post} 
                              onClick={() => setSelectedPost(post)} 
                              mediaAssets={mediaAssets}
                              socialAccounts={socialAccounts}
                            timeZone={workspaceTimeZone}
                            resolvedMediaUrls={resolvedMediaUrls}
                            />
                          ))}
                        </div>
                      </DroppableCell>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'Week' && (
              <div className="flex-1 flex flex-col overflow-auto min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-[#EBEBE9] shrink-0">
                  <div className="py-2.5 text-center text-[11px] font-bold text-zinc-400 uppercase bg-[#FAFAF9] border-r border-[#EBEBE9]">
                    Time
                  </div>
                  {calendarDays.map(day => (
                    <div key={day.toISOString()} className="py-2 text-center bg-[#FAFAF9] border-r border-[#EBEBE9]">
                      <div className="text-[11px] font-semibold text-zinc-500 uppercase">{format(day, 'EEE')}</div>
                      <div className={`text-[14px] font-bold mt-0.5 ${format(day, 'yyyy-MM-dd') === workspaceTodayDate ? 'text-brand-600' : 'text-zinc-900'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-[#EBEBE9] min-h-[75px]">
                      <div className="p-2 text-[11px] font-medium text-zinc-400 text-right border-r border-[#EBEBE9] bg-[#FAFAF9]/40">
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                      {calendarDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const slotTime = `${String(hour).padStart(2, '0')}:00`;
                        const cellPosts = filteredPosts.filter((post) =>
                          isScheduledInLocalHour(post.scheduledAt, dayStr, hour, workspaceTimeZone),
                        );
                        return (
                          <DroppableCell
                            key={`${dayStr}-${slotTime}`}
                            id={`slot:${dayStr}:${slotTime}`}
                            date={dayStr}
                            time={slotTime}
                            className="p-1 border-r border-[#EBEBE9] relative group"
                          >
                            <div className="space-y-1 h-full">
                              {cellPosts.map((post) => (
                                <DraggablePost 
                                  key={post.id} 
                                  post={post} 
                                  onClick={() => setSelectedPost(post)} 
                                  mediaAssets={mediaAssets}
                                  socialAccounts={socialAccounts}
                                timeZone={workspaceTimeZone}
                                resolvedMediaUrls={resolvedMediaUrls}
                                />
                              ))}
                            </div>
                            <div className="absolute inset-0 bg-brand-50/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <button 
                                onClick={(event) => { event.stopPropagation(); handleCreateOnSlot(dayStr, slotTime); }}
                                className="w-6 h-6 bg-white border border-[#EBEBE9] rounded-full shadow-xs flex items-center justify-center text-zinc-400 pointer-events-auto hover:text-brand-600 hover:border-brand-300 transition-colors"
                                title={`Schedule post at ${slotTime} (${workspaceTimeZone})`}
                              >
                                <Plus className="w-3.5 h-3.5" />
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

            {/* DAY VIEW */}
            {viewMode === 'Day' && (
              <div className="flex-1 flex flex-col overflow-auto max-w-4xl mx-auto w-full border-x border-[#EBEBE9]">
                <div className="py-3 text-center bg-[#FAFAF9] border-b border-[#EBEBE9]">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{format(currentDate, 'EEEE')}</div>
                  <div className={`text-[18px] font-bold ${format(currentDate, 'yyyy-MM-dd') === workspaceTodayDate ? 'text-brand-600' : 'text-zinc-900'}`}>
                    {format(currentDate, 'MMMM d, yyyy')}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const dayStr = format(currentDate, 'yyyy-MM-dd');
                    const slotTime = `${String(hour).padStart(2, '0')}:00`;
                    const cellPosts = filteredPosts.filter((post) =>
                      isScheduledInLocalHour(post.scheduledAt, dayStr, hour, workspaceTimeZone),
                    );
                    return (
                      <div key={hour} className="flex border-b border-[#EBEBE9] min-h-[85px]">
                        <div className="w-20 p-2 text-[11px] font-medium text-zinc-400 text-right border-r border-[#EBEBE9] bg-[#FAFAF9]/40 shrink-0">
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </div>
                        <DroppableCell 
                          id={`slot:${dayStr}:${slotTime}`}
                          date={dayStr}
                          time={slotTime}
                          className="flex-1 p-2 relative group"
                        >
                          <div className="space-y-1.5 h-full">
                            {cellPosts.map((post) => (
                              <DraggablePost 
                                key={post.id} 
                                post={post} 
                                onClick={() => setSelectedPost(post)} 
                                mediaAssets={mediaAssets}
                                socialAccounts={socialAccounts}
                              timeZone={workspaceTimeZone}
                              resolvedMediaUrls={resolvedMediaUrls}
                              />
                            ))}
                          </div>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleCreateOnSlot(dayStr, slotTime)}
                              className="px-2.5 py-1 bg-white border border-[#DCDCD8] text-zinc-600 hover:text-brand-700 hover:border-brand-300 rounded-md text-[11px] font-medium flex items-center space-x-1 shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Post</span>
                            </button>
                          </div>
                        </DroppableCell>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </DndContext>
        </div>
      </div>

      {/* Post Details & Management Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9]">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(selectedPost.status).text} bg-zinc-100`}>
                  {selectedPost.status}
                </span>
                <span className="text-[12px] text-zinc-500">
                  {selectedPost.scheduledAt ? (() => {
                    const local = getScheduledLocalDateTime(selectedPost.scheduledAt, workspaceTimeZone);
                    return `${local.date} ${local.time} (${workspaceTimeZone})`;
                  })() : 'Draft'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-zinc-900 mb-1">{selectedPost.title}</h3>
                <p className="text-[13px] text-zinc-700 whitespace-pre-wrap bg-[#FAFAF9] p-3 rounded-lg border border-[#F2F2F0] leading-relaxed max-h-48 overflow-y-auto">
                  {selectedPost.originalContent.caption || <span className="italic text-zinc-400">No caption</span>}
                </p>
              </div>

              {selectedPost.originalContent.mediaIds.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedPost.originalContent.mediaIds.map(mid => {
                    const m = mediaAssets.find(a => a.id === mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="w-20 h-20 rounded-lg overflow-hidden border border-[#EBEBE9]">
                        <img src={resolvedMediaUrls[m.id] || m.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#EBEBE9] bg-[#FAFAF9] flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedPost.id)}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[12px] font-medium flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDuplicate(selectedPost)}
                  className="px-3 py-1.5 bg-white border border-[#DCDCD8] text-zinc-700 hover:bg-zinc-50 rounded-lg text-[12px] font-medium flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => {
                    navigate(`/create?edit=${selectedPost.id}`);
                  }}
                  className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit in Composer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
