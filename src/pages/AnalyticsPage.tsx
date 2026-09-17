import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Users, MousePointerClick, MessageSquare, Play } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { useApp } from '../context/AppContext';
import { PlatformIcon } from '../components/ui/PlatformIcon';

const viewData = [
  { name: 'Mon', views: 4000, engagement: 2.4 },
  { name: 'Tue', views: 5000, engagement: 2.8 },
  { name: 'Wed', views: 2000, engagement: 1.2 },
  { name: 'Thu', views: 2780, engagement: 3.1 },
  { name: 'Fri', views: 1890, engagement: 4.5 },
  { name: 'Sat', views: 8900, engagement: 6.2 },
  { name: 'Sun', views: 14900, engagement: 7.1 },
];

const formatData = [
  { name: 'Shorts/Reels', views: 45000, fill: '#635BFF' },
  { name: 'Carousels', views: 28000, fill: '#817BFF' },
  { name: 'Long Form', views: 12000, fill: '#A39FFF' },
  { name: 'Static Image', views: 8500, fill: '#C6C4FF' },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { state } = useApp();

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col h-full bg-surface-bg overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Analytics</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Detailed performance metrics across all platforms.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded-[8px] p-1 shadow-sm">
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-[6px] transition-colors ${timeRange === '7d' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-[6px] transition-colors ${timeRange === '30d' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-[6px] transition-colors ${timeRange === 'all' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Horizontal Metric Summary Strip */}
      <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm mb-6 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100 shrink-0">
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-zinc-500 flex items-center"><Eye className="w-4 h-4 mr-1.5 text-zinc-400" /> Total Views</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-bold text-zinc-900 leading-none">39.4K</p>
            <p className="text-[12px] font-medium text-status-success flex items-center mb-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12%
            </p>
          </div>
        </div>
        
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-zinc-500 flex items-center"><Users className="w-4 h-4 mr-1.5 text-zinc-400" /> Net Followers</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-bold text-zinc-900 leading-none">582</p>
            <p className="text-[12px] font-medium text-status-success flex items-center mb-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4%
            </p>
          </div>
        </div>
        
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-zinc-500 flex items-center"><MousePointerClick className="w-4 h-4 mr-1.5 text-zinc-400" /> Engagement</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-bold text-zinc-900 leading-none">4.2%</p>
            <p className="text-[12px] font-medium text-status-success flex items-center mb-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +1.1%
            </p>
          </div>
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-zinc-500 flex items-center"><MessageSquare className="w-4 h-4 mr-1.5 text-zinc-400" /> Comments</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-bold text-zinc-900 leading-none">1,204</p>
            <p className="text-[12px] font-medium text-status-danger flex items-center mb-1">
              <TrendingDown className="w-3.5 h-3.5 mr-1" /> -2%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[12px] border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Audience Growth</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-[12px] text-zinc-500 font-medium"><span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>Views</div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635BFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 500, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="views" stroke="#635BFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, fill: '#635BFF', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Format Performance */}
        <div className="bg-white p-6 rounded-[12px] border border-border-subtle shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Format Performance</h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={formatData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 11, fontWeight: 500 }} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="views" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-[12px] text-zinc-500 font-medium">Short form video continues to drive the highest top-of-funnel reach this month.</p>
          </div>
        </div>
      </div>
      
      {/* Platform Breakdown Table (Mock) */}
      <div className="mt-6 bg-white border border-border-subtle rounded-[12px] shadow-sm overflow-hidden shrink-0 pb-8">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Platform Breakdown</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Platform</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Followers</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Growth</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Avg Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center text-[13px] font-medium text-zinc-900">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center mr-3 border border-zinc-200 text-zinc-700">
                    <PlatformIcon platform="instagram" className="w-4 h-4" />
                  </div>
                  Instagram
                </div>
              </td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">12,400</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-status-success">+2.4%</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">4,200</td>
            </tr>
            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center text-[13px] font-medium text-zinc-900">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center mr-3 border border-zinc-200 text-zinc-700">
                    <PlatformIcon platform="tiktok" className="w-4 h-4" />
                  </div>
                  TikTok
                </div>
              </td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">45,100</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-status-success">+8.1%</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">22,500</td>
            </tr>
            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center text-[13px] font-medium text-zinc-900">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center mr-3 border border-zinc-200 text-zinc-700">
                    <PlatformIcon platform="youtube" className="w-4 h-4" />
                  </div>
                  YouTube
                </div>
              </td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">8,200</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-500">0.0%</td>
              <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-700">1,800</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
