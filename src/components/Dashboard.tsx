import React from 'react';
import { ArrowUpRight, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { name: 'Mon', views: 4000, engagement: 240 },
  { name: 'Tue', views: 3000, engagement: 139 },
  { name: 'Wed', views: 2000, engagement: 980 },
  { name: 'Thu', views: 2780, engagement: 390 },
  { name: 'Fri', views: 1890, engagement: 480 },
  { name: 'Sat', views: 2390, engagement: 380 },
  { name: 'Sun', views: 3490, engagement: 430 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-zinc-500 mt-1">Track your content performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Views"
          value="19.5K"
          trend="+12.5%"
          icon={Eye}
        />
        <MetricCard
          title="Avg. CTR"
          value="6.4%"
          trend="+1.2%"
          icon={MousePointerClick}
        />
        <MetricCard
          title="Engagement Rate"
          value="4.2%"
          trend="-0.4%"
          icon={TrendingUp}
          trendDown
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 mb-6">Audience Growth</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  trendDown = false,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  trendDown?: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        <div className="p-2 bg-zinc-50 rounded-lg">
          <Icon className="w-5 h-5 text-zinc-700" />
        </div>
      </div>
      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-bold text-zinc-900">{value}</span>
        <span
          className={`flex items-center text-sm font-medium ${
            trendDown ? 'text-red-600' : 'text-emerald-600'
          }`}
        >
          {trendDown ? null : <ArrowUpRight className="w-4 h-4 mr-1" />}
          {trend}
        </span>
      </div>
    </div>
  );
}
