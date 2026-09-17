import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../context/AppContext';

const data = [
  { name: 'Mon', views: 4000, followers: 24, engagement: 2.4 },
  { name: 'Tue', views: 5000, followers: 13, engagement: 2.8 },
  { name: 'Wed', views: 2000, followers: 98, engagement: 1.2 },
  { name: 'Thu', views: 2780, followers: 39, engagement: 3.1 },
  { name: 'Fri', views: 1890, followers: 48, engagement: 4.5 },
  { name: 'Sat', views: 8900, followers: 120, engagement: 6.2 },
  { name: 'Sun', views: 14900, followers: 240, engagement: 7.1 },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { state } = useApp();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Analytics Overview</h2>
          <p className="text-sm text-zinc-500 mt-1">Detailed performance metrics across all platforms.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm opacity-50 cursor-not-allowed">
          <button className={`px-4 py-1.5 text-sm font-medium rounded-md ${timeRange === '7d' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500'}`}>7 Days</button>
          <button className={`px-4 py-1.5 text-sm font-medium rounded-md text-zinc-500`}>30 Days</button>
          <button className={`px-4 py-1.5 text-sm font-medium rounded-md text-zinc-500`}>All Time</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Total Views</h3>
            <Eye className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 mb-1">39.4K</p>
          <p className="text-sm font-medium text-emerald-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +12% this week
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Net Followers</h3>
            <Users className="w-5 h-5 text-pink-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 mb-1">582</p>
          <p className="text-sm font-medium text-emerald-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +4% this week
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Avg. Engagement</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 mb-1">4.2%</p>
          <p className="text-sm font-medium text-emerald-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +1.1% this week
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 mb-6">Views Over Time</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
