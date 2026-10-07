import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Sparkles } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import {
  getPostPlatforms,
  getWorkspaceAccounts,
  getWorkspaceAnalytics,
  getWorkspacePerformance,
  getWorkspacePosts,
} from '../utils/selectors';
import { utcToZonedDateTime } from '../utils/time';

export function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const workspacePosts = getWorkspacePosts(state);
  const workspaceAccounts = getWorkspaceAccounts(state);
  const analytics = getWorkspaceAnalytics(state);
  const performances = getWorkspacePerformance(state);

  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  ) || state.workspaces[0];

  const scheduledPosts = workspacePosts
    .filter((post) => post.status === 'scheduled' && post.scheduledAt)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt || '').getTime() -
        new Date(b.scheduledAt || '').getTime(),
    )
    .slice(0, 4);

  const trajectory = useMemo(() => {
    const grouped = new Map<string, number>();

    performances.forEach((performance) => {
      const publishedAt = parseISO(performance.publishedAt);
      if (!isValid(publishedAt)) return;

      const key = format(publishedAt, 'yyyy-MM-dd');
      grouped.set(key, (grouped.get(key) || 0) + performance.reach);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, reach]) => ({
        date: format(parseISO(date), 'MMM d'),
        reach,
      }));
  }, [performances]);

  const strongestPerformance = useMemo(
    () => [...performances].sort((a, b) => b.engagementRate - a.engagementRate)[0],
    [performances],
  );

  const strongestPost = strongestPerformance
    ? workspacePosts.find((post) => post.id === strongestPerformance.postId)
    : undefined;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EBEBE9]">
        <div>
          <p className="text-[12px] font-sans font-semibold text-[#999996] uppercase tracking-[0.15em] mb-3">
            Overview
          </p>
          <h1 className="text-4xl font-serif text-[#0A0A0A] font-medium tracking-tight">
            Welcome back to {activeWorkspace?.name}
          </h1>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[13px] font-sans font-medium hover:bg-[#1A1A1A] transition-colors shadow-sm rounded-lg"
        >
          Create New Post
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analytics.map((metric) => (
          <div
            key={metric.id}
            className="p-6 bg-white border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[12px] font-sans font-medium text-[#666661] tracking-wide">
                {metric.label}
              </h3>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-500">
                {metric.source}
              </span>
            </div>
            <div className="mt-auto pt-4">
              <span className="text-[28px] font-serif text-[#0A0A0A] leading-none">
                {metric.label.includes('Rate')
                  ? `${metric.value}%`
                  : metric.value.toLocaleString()}
              </span>
              <p className="text-[10px] text-zinc-400 mt-2">
                No comparison delta is shown without a measured comparison period.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#F8F8F7] border border-[#EBEBE9] p-6 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 bg-white border border-[#D1D1CE] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-[12px] font-sans font-semibold text-[#0A0A0A] tracking-[0.1em] uppercase mb-2">
                Measured Observation
              </h3>
              {strongestPerformance ? (
                <>
                  <p className="text-[#666661] text-[14px] font-sans leading-relaxed max-w-2xl">
                    <strong className="text-[#0A0A0A] font-semibold">
                      {strongestPost?.title || 'A measured post'}
                    </strong>{' '}
                    currently has the highest recorded engagement rate in this workspace at{' '}
                    <strong className="text-[#0A0A0A] font-semibold">
                      {strongestPerformance.engagementRate.toFixed(1)}%
                    </strong>.
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Based on {performances.length} recorded performance item{performances.length === 1 ? '' : 's'}. This is descriptive evidence, not a causal explanation.
                  </p>
                </>
              ) : (
                <p className="text-[#666661] text-[14px] font-sans leading-relaxed max-w-2xl">
                  No performance evidence is available yet. Publish through a verified integration later, or use the clearly labeled demo workspace to explore the analytics UI.
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 border border-[#0A0A0A] text-[#0A0A0A] bg-white text-[12px] font-sans font-medium hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              View Evidence
            </button>
          </div>

          <div className="bg-white border border-[#EBEBE9] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[18px] font-serif text-[#0A0A0A] font-medium">Performance Trajectory</h3>
                <p className="text-[11px] text-zinc-400 mt-1">Recorded reach only; missing dates are not estimated.</p>
              </div>
            </div>
            {trajectory.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#999996', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#999996', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '0px', border: '1px solid #1A1A1A', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#EBEBE9', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="#0A0A0A"
                      strokeWidth={2}
                      fillOpacity={0.05}
                      fill="#0A0A0A"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center border border-dashed border-[#EBEBE9] bg-[#F8F8F7] text-center">
                <div>
                  <p className="text-[13px] font-medium text-zinc-700">No measured trajectory yet</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Creator Lab does not generate synthetic chart points.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-[#EBEBE9] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-serif text-[#0A0A0A] font-medium">Upcoming Releases</h3>
              <button
                onClick={() => navigate('/calendar')}
                className="text-[#666661] hover:text-[#0A0A0A] transition-colors p-1"
                aria-label="Open calendar"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            {scheduledPosts.length > 0 ? (
              <div className="space-y-4">
                {scheduledPosts.map((post) => {
                  const platforms = getPostPlatforms(post, workspaceAccounts);
                  let localDate = '';
                  let localTime = '';

                  try {
                    const localSchedule = utcToZonedDateTime(
                      post.scheduledAt || '',
                      activeWorkspace?.timezone || 'UTC',
                    );
                    localDate = localSchedule.date;
                    localTime = localSchedule.time;
                  } catch {
                    localDate = 'Invalid date';
                    localTime = '--:--';
                  }

                  return (
                    <div
                      key={post.id}
                      className="group relative flex items-start space-x-4 p-4 border border-[#EBEBE9] hover:border-[#D1D1CE] transition-colors cursor-pointer bg-[#F8F8F7]"
                      onClick={() => navigate(`/create?edit=${post.id}`)}
                    >
                      <div className="flex flex-col items-center justify-center min-w-[62px]">
                        <span className="text-[10px] font-sans font-bold text-[#999996] uppercase">
                          {localDate}
                        </span>
                        <span className="text-[13px] font-serif text-[#0A0A0A] mt-1">
                          {localTime}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1 space-x-2">
                          <div className="flex -space-x-1">
                            {platforms.map((platform) => (
                              <div
                                key={platform}
                                className="w-5 h-5 rounded-full bg-white border border-[#EBEBE9] flex items-center justify-center text-[#666661]"
                              >
                                <PlatformIcon platform={platform} className="w-3 h-3" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <h4 className="text-[13px] font-sans font-medium text-[#0A0A0A] truncate">
                          {post.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {activeWorkspace?.timezone || 'UTC'} · local planning schedule
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-[#EBEBE9] bg-[#F8F8F7]">
                <Calendar className="w-6 h-6 text-[#999996] mx-auto mb-2" />
                <p className="text-[13px] font-sans text-[#666661]">No posts scheduled</p>
              </div>
            )}

            <button
              onClick={() => navigate('/calendar')}
              className="w-full mt-6 py-2.5 border border-[#0A0A0A] text-[#0A0A0A] font-sans font-medium text-[13px] hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              Open Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
