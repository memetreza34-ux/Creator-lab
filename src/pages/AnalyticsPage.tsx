import React, { useMemo, useState } from 'react';
import {
  Eye,
  MessageSquare,
  MousePointerClick,
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
import { format, isAfter, isValid, parseISO, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { Platform } from '../types';
import {
  getWorkspaceAccounts,
  getWorkspacePerformance,
  getWorkspacePosts,
} from '../utils/selectors';

type TimeRange = '7d' | '30d' | '90d' | 'all';

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const { state } = useApp();

  const workspacePerformances = getWorkspacePerformance(state);
  const workspaceAccounts = getWorkspaceAccounts(state);
  const workspacePosts = getWorkspacePosts(state);

  const filteredPerformances = useMemo(() => {
    const now = new Date();
    const cutoff =
      timeRange === '7d'
        ? subDays(now, 7)
        : timeRange === '30d'
          ? subDays(now, 30)
          : timeRange === '90d'
            ? subDays(now, 90)
            : null;

    return workspacePerformances.filter((performance) => {
      if (
        selectedPlatform !== 'all' &&
        performance.platform !== selectedPlatform
      ) {
        return false;
      }

      const publishedAt = parseISO(performance.publishedAt);
      if (!isValid(publishedAt)) return false;
      if (cutoff && !isAfter(publishedAt, cutoff)) return false;
      return true;
    });
  }, [workspacePerformances, timeRange, selectedPlatform]);

  const totals = useMemo(() => {
    const views = filteredPerformances.reduce(
      (total, performance) => total + performance.views,
      0,
    );
    const reach = filteredPerformances.reduce(
      (total, performance) => total + performance.reach,
      0,
    );
    const followers = filteredPerformances.reduce(
      (total, performance) => total + performance.followersGained,
      0,
    );
    const comments = filteredPerformances.reduce(
      (total, performance) => total + performance.comments,
      0,
    );
    const clicks = filteredPerformances.reduce(
      (total, performance) => total + performance.clicks,
      0,
    );
    const engagementRate =
      filteredPerformances.length > 0
        ? filteredPerformances.reduce(
            (total, performance) => total + performance.engagementRate,
            0,
          ) / filteredPerformances.length
        : 0;

    return {
      views,
      reach,
      followers,
      comments,
      clicks,
      engagementRate,
    };
  }, [filteredPerformances]);

  const trendData = useMemo(() => {
    const byDate = new Map<string, { views: number; reach: number }>();

    filteredPerformances.forEach((performance) => {
      const publishedAt = parseISO(performance.publishedAt);
      if (!isValid(publishedAt)) return;

      const key = format(publishedAt, 'yyyy-MM-dd');
      const previous = byDate.get(key) || { views: 0, reach: 0 };
      byDate.set(key, {
        views: previous.views + performance.views,
        reach: previous.reach + performance.reach,
      });
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, metrics]) => ({
        date,
        label: format(parseISO(date), 'MMM d'),
        ...metrics,
      }));
  }, [filteredPerformances]);

  const platformBreakdown = useMemo(() => {
    const platforms = Array.from(
      new Set(filteredPerformances.map((performance) => performance.platform)),
    );

    return platforms
      .map((platform) => {
        const platformItems = filteredPerformances.filter(
          (performance) => performance.platform === platform,
        );
        const views = platformItems.reduce(
          (total, performance) => total + performance.views,
          0,
        );
        const avgEngagement =
          platformItems.length > 0
            ? platformItems.reduce(
                (total, performance) => total + performance.engagementRate,
                0,
              ) / platformItems.length
            : 0;

        const followerMetric = workspaceAccounts.find(
          (account) =>
            account.platform === platform &&
            account.connectionKind !== 'placeholder',
        )?.metrics?.followers;

        return {
          platform,
          postsCount: platformItems.length,
          views,
          engagementRate: avgEngagement,
          followers: followerMetric,
        };
      })
      .sort((a, b) => b.views - a.views);
  }, [filteredPerformances, workspaceAccounts]);

  const dataSources = useMemo(
    () => Array.from(new Set(filteredPerformances.map((item) => item.source))),
    [filteredPerformances],
  );

  const strongestMeasuredPost = useMemo(
    () =>
      [...filteredPerformances].sort(
        (a, b) => b.engagementRate - a.engagementRate,
      )[0],
    [filteredPerformances],
  );

  const strongestPostTitle = strongestMeasuredPost
    ? workspacePosts.find((post) => post.id === strongestMeasuredPost.postId)?.title
    : undefined;

  const sourceLabel =
    dataSources.length === 0
      ? 'No performance records'
      : dataSources
          .map((source) =>
            source === 'provider'
              ? 'Provider'
              : source === 'demo'
                ? 'Demo'
                : source === 'derived'
                  ? 'Derived'
                  : 'Local',
          )
          .join(' + ');

  const cards = [
    {
      label: 'Total Views',
      value: formatCompact(totals.views),
      icon: Eye,
    },
    {
      label: 'Total Reach',
      value: formatCompact(totals.reach),
      icon: Users,
    },
    {
      label: 'Avg. Engagement',
      value: `${totals.engagementRate.toFixed(1)}%`,
      icon: Sparkles,
    },
    {
      label: 'Followers Gained',
      value: formatCompact(totals.followers),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 pb-20 bg-white min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#EBEBE9]">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            Workspace Intelligence & Analytics
          </h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Performance records stored for this workspace. Missing dates are not estimated or filled with synthetic values.
          </p>
          <div className="mt-2 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
            Data source: {sourceLabel}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#FAFAF9] border border-[#EBEBE9] rounded-lg p-0.5 text-[12px] overflow-x-auto">
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
                {range === 'all' ? 'All' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-4 bg-white border border-[#EBEBE9] rounded-xl shadow-2xs"
            >
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>{card.label}</span>
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="mt-3">
                <span className="text-[22px] font-bold text-zinc-900 leading-none">
                  {card.value}
                </span>
                <p className="text-[10px] text-zinc-400 mt-2">
                  {filteredPerformances.length} measured post record{filteredPerformances.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#EBEBE9] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900">Measured Performance Timeline</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Only dates with recorded performance are plotted.
              </p>
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#999996', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999996', fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#18181B"
                    fill="#18181B"
                    fillOpacity={0.06}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-center px-6">
              <div>
                <Eye className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                <p className="text-[13px] font-medium text-zinc-700">No performance records for these filters</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Creator Lab will not invent values to fill the chart.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#FAFAF9] border border-[#EBEBE9] rounded-2xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <MousePointerClick className="w-4 h-4 text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-zinc-900">Measured Observation</h3>
          </div>

          {strongestMeasuredPost ? (
            <>
              <p className="text-[13px] leading-relaxed text-zinc-700">
                <strong className="text-zinc-900">
                  {strongestPostTitle || 'A measured post'}
                </strong>{' '}
                has the highest engagement rate in the current filtered sample at{' '}
                <strong className="text-zinc-900">
                  {strongestMeasuredPost.engagementRate.toFixed(1)}%
                </strong>.
              </p>
              <p className="text-[11px] text-zinc-500 mt-3">
                This is a descriptive observation from {filteredPerformances.length} record{filteredPerformances.length === 1 ? '' : 's'}, not a causal claim.
              </p>
            </>
          ) : (
            <p className="text-[12px] text-zinc-500">
              Add real or clearly labeled demo performance records before Creator Lab draws an observation.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#EBEBE9] rounded-2xl p-5 shadow-2xs">
        <h3 className="text-[15px] font-semibold text-zinc-900 mb-4">Platform Evidence</h3>
        {platformBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform} className="rounded-xl border border-zinc-200 p-3">
                <div className="flex items-center space-x-2">
                  <PlatformIcon platform={platform.platform} className="w-4 h-4 text-zinc-600" />
                  <span className="text-[12px] font-semibold capitalize text-zinc-800">
                    {platform.platform}
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-zinc-500 space-y-1">
                  <div className="flex justify-between"><span>Records</span><strong className="text-zinc-800">{platform.postsCount}</strong></div>
                  <div className="flex justify-between"><span>Views</span><strong className="text-zinc-800">{formatCompact(platform.views)}</strong></div>
                  <div className="flex justify-between"><span>Avg. engagement</span><strong className="text-zinc-800">{platform.engagementRate.toFixed(1)}%</strong></div>
                  {platform.followers !== undefined && (
                    <div className="flex justify-between"><span>Followers</span><strong className="text-zinc-800">{formatCompact(platform.followers)}</strong></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-zinc-500">No platform performance records match the current filters.</p>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#EBEBE9] shadow-2xs">
        <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Post Performance Ledger</h3>
        <p className="text-[11px] text-zinc-500 mb-4">
          Recorded metrics per post and platform. Source labels show whether the record is demo, local, derived, or provider data.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBEBE9] text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="pb-2.5">Post</th>
                <th className="pb-2.5">Platform</th>
                <th className="pb-2.5">Views</th>
                <th className="pb-2.5">Engagement</th>
                <th className="pb-2.5">Clicks</th>
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
                    <td className="py-2.5 font-medium text-zinc-700">{performance.engagementRate.toFixed(1)}%</td>
                    <td className="py-2.5 text-zinc-500">{performance.clicks.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                        {performance.source}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPerformances.length === 0 && (
            <div className="py-10 text-center text-[12px] text-zinc-500">
              No performance records to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
