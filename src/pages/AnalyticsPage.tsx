import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, isAfter, parseISO, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { Platform } from '../types';
import {
  getWorkspacePerformance,
  getWorkspacePosts,
} from '../utils/selectors';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const { state } = useApp();

  const workspacePerformances = getWorkspacePerformance(state);
  const workspacePosts = getWorkspacePosts(state);

  const filteredPerformances = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;

    if (timeRange === '7d') cutoff = subDays(now, 7);
    else if (timeRange === '30d') cutoff = subDays(now, 30);
    else if (timeRange === '90d') cutoff = subDays(now, 90);

    return workspacePerformances.filter((performance) => {
      if (selectedPlatform !== 'all' && performance.platform !== selectedPlatform) {
        return false;
      }

      if (!cutoff) return true;

      try {
        return isAfter(parseISO(performance.publishedAt), cutoff);
      } catch {
        return false;
      }
    });
  }, [workspacePerformances, timeRange, selectedPlatform]);

  const totals = useMemo(() => {
    const views = filteredPerformances.reduce((total, item) => total + item.views, 0);
    const likes = filteredPerformances.reduce((total, item) => total + item.likes, 0);
    const comments = filteredPerformances.reduce((total, item) => total + item.comments, 0);
    const shares = filteredPerformances.reduce((total, item) => total + item.shares, 0);
    const followers = filteredPerformances.reduce(
      (total, item) => total + item.followersGained,
      0,
    );
    const engagementRate =
      filteredPerformances.length > 0
        ? filteredPerformances.reduce(
            (total, item) => total + item.engagementRate,
            0,
          ) / filteredPerformances.length
        : 0;

    return {
      views,
      likes,
      comments,
      shares,
      followers,
      engagementRate,
    };
  }, [filteredPerformances]);

  const trendData = useMemo(() => {
    const byDate = new Map<string, { views: number; engagementTotal: number; count: number }>();

    for (const performance of filteredPerformances) {
      let dateKey: string;
      try {
        dateKey = format(parseISO(performance.publishedAt), 'yyyy-MM-dd');
      } catch {
        continue;
      }

      const current = byDate.get(dateKey) || {
        views: 0,
        engagementTotal: 0,
        count: 0,
      };

      current.views += performance.views;
      current.engagementTotal += performance.engagementRate;
      current.count += 1;
      byDate.set(dateKey, current);
    }

    return Array.from(byDate.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, value]) => ({
        date: format(parseISO(date), 'MMM d'),
        views: value.views,
        engagement: Number((value.engagementTotal / value.count).toFixed(1)),
      }));
  }, [filteredPerformances]);

  const platformBreakdown = useMemo(() => {
    const platforms: Platform[] = [
      'instagram',
      'tiktok',
      'youtube',
      'linkedin',
      'twitter',
      'facebook',
      'pinterest',
      'threads',
    ];

    return platforms
      .map((platform) => {
        const items = filteredPerformances.filter(
          (performance) => performance.platform === platform,
        );
        if (items.length === 0) return null;

        return {
          platform,
          name: platform === 'twitter'
            ? 'X (Twitter)'
            : platform.charAt(0).toUpperCase() + platform.slice(1),
          postsCount: items.length,
          views: items.reduce((total, item) => total + item.views, 0),
          engagementRate: (
            items.reduce((total, item) => total + item.engagementRate, 0) /
            items.length
          ).toFixed(1),
        };
      })
      .filter(
        (item): item is {
          platform: Platform;
          name: string;
          postsCount: number;
          views: number;
          engagementRate: string;
        } => Boolean(item),
      );
  }, [filteredPerformances]);

  const containsDemoData = filteredPerformances.some(
    (performance) => performance.source === 'demo',
  );
  const containsProviderData = filteredPerformances.some(
    (performance) => performance.source === 'provider',
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 pb-20 bg-white min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#EBEBE9]">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Measured post performance with explicit source and freshness boundaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#FAFAF9] border border-[#EBEBE9] rounded-lg p-0.5 text-[12px]">
            {(['all', 'instagram', 'tiktok', 'youtube', 'linkedin'] as const).map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#FAFAF9] border border-[#EBEBE9] rounded-lg p-0.5 text-[12px]">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {containsDemoData && !containsProviderData && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-amber-900">Demo performance data</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              These values are sample data for product preview and are not synced from social platforms.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Total Views',
            value: totals.views >= 1000 ? `${(totals.views / 1000).toFixed(1)}k` : totals.views,
            icon: Eye,
          },
          {
            label: 'Avg. Engagement',
            value: `${totals.engagementRate.toFixed(1)}%`,
            icon: Sparkles,
          },
          {
            label: 'Total Interactions',
            value:
              totals.likes + totals.comments + totals.shares >= 1000
                ? `${((totals.likes + totals.comments + totals.shares) / 1000).toFixed(1)}k`
                : totals.likes + totals.comments + totals.shares,
            icon: MessageSquare,
          },
          {
            label: 'Followers Gained',
            value: `+${totals.followers}`,
            icon: Users,
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="p-4 bg-white border border-[#EBEBE9] rounded-xl shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>{metric.label}</span>
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="mt-2">
                <span className="text-[22px] font-bold text-zinc-900 leading-none">
                  {metric.value}
                </span>
                <p className="text-[10px] text-zinc-400 mt-1.5">
                  Based on {filteredPerformances.length} performance record{filteredPerformances.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#EBEBE9] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Measured Views Over Time</h3>
            <p className="text-[11px] text-zinc-500">
              Only dates with actual stored performance records are plotted.
            </p>
          </div>
        </div>

        {trendData.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={0.12}
                  fill="#6366F1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] border border-dashed border-[#E4E4E0] rounded-xl bg-[#FAFAF9] flex items-center justify-center text-center px-6">
            <div>
              <p className="text-[13px] font-semibold text-zinc-800">No measured performance in this range</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Provider-synced metrics will appear here after real integrations are enabled.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#EBEBE9] shadow-2xs flex flex-col">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Platform Performance</h3>
          <p className="text-[11px] text-zinc-500 mb-4">Comparison from stored performance records</p>

          <div className="space-y-3 flex-1">
            {platformBreakdown.length > 0 ? platformBreakdown.map((platform) => (
              <div key={platform.platform} className="p-3 rounded-xl border border-[#F2F2F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <PlatformIcon platform={platform.platform} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold text-zinc-900">{platform.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                    {platform.engagementRate}% Eng
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{platform.postsCount} measured post{platform.postsCount === 1 ? '' : 's'}</span>
                  <span className="font-semibold text-zinc-900">{platform.views.toLocaleString()} views</span>
                </div>
              </div>
            )) : (
              <p className="text-[12px] text-zinc-500">No platform performance available.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#EBEBE9] shadow-2xs">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Post Performance Ledger</h3>
          <p className="text-[11px] text-zinc-500 mb-4">Stored metrics with explicit data origin</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EBEBE9] text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="pb-2.5">Post</th>
                  <th className="pb-2.5">Platform</th>
                  <th className="pb-2.5">Views</th>
                  <th className="pb-2.5">Engagement</th>
                  <th className="pb-2.5">Saves/Shares</th>
                  <th className="pb-2.5">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F0] text-[12px]">
                {filteredPerformances.map((performance) => {
                  const post = workspacePosts.find(
                    (workspacePost) => workspacePost.id === performance.postId,
                  );
                  const title = post?.title || `Post #${performance.postId.slice(0, 6)}`;

                  return (
                    <tr key={performance.postId + performance.platform} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 font-medium text-zinc-900 max-w-xs truncate pr-2" title={title}>
                        {title}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center space-x-1">
                          <PlatformIcon platform={performance.platform} className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="capitalize text-zinc-600 text-[11px]">{performance.platform}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-semibold text-zinc-800">{performance.views.toLocaleString()}</td>
                      <td className="py-2.5">{performance.engagementRate}%</td>
                      <td className="py-2.5 text-zinc-500">{performance.saves} / {performance.shares}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          performance.source === 'provider'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : performance.source === 'demo'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                        }`}>
                          {performance.source}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
