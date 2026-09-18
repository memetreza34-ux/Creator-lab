const fs = require('fs');

const code = `
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
  { name: 'Shorts/Reels', views: 45000, fill: '#0A0A0A' },
  { name: 'Carousels', views: 28000, fill: '#333333' },
  { name: 'Long Form', views: 12000, fill: '#666661' },
  { name: 'Static Image', views: 8500, fill: '#999996' },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { state } = useApp();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EBEBE9]">
        <div>
          <p className="text-[12px] font-sans font-semibold text-[#999996] uppercase tracking-[0.15em] mb-3">
            Performance
          </p>
          <h1 className="text-4xl font-serif text-[#0A0A0A] font-medium tracking-tight">
            Audience Analytics
          </h1>
        </div>
        <div className="flex items-center bg-[#F8F8F7] border border-[#EBEBE9] p-1">
          <button 
            onClick={() => setTimeRange('7d')}
            className={\`px-5 py-2 text-[12px] font-sans font-medium transition-all \${timeRange === '7d' ? 'bg-white text-[#0A0A0A] shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-[#EBEBE9]' : 'text-[#666661] hover:text-[#0A0A0A] border border-transparent'}\`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={\`px-5 py-2 text-[12px] font-sans font-medium transition-all \${timeRange === '30d' ? 'bg-white text-[#0A0A0A] shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-[#EBEBE9]' : 'text-[#666661] hover:text-[#0A0A0A] border border-transparent'}\`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={\`px-5 py-2 text-[12px] font-sans font-medium transition-all \${timeRange === 'all' ? 'bg-white text-[#0A0A0A] shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-[#EBEBE9]' : 'text-[#666661] hover:text-[#0A0A0A] border border-transparent'}\`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Horizontal Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: '39.4K', change: '+12%', trend: 'up' },
          { label: 'Net Followers', value: '582', change: '+4%', trend: 'up' },
          { label: 'Avg. Engagement', value: '4.2%', change: '+1.1%', trend: 'up' },
          { label: 'Total Comments', value: '1,204', change: '-2%', trend: 'down' }
        ].map((metric, i) => (
          <div key={i} className="p-6 bg-white border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px]">
            <h3 className="text-[12px] font-sans font-medium text-[#666661] tracking-wide uppercase">{metric.label}</h3>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[28px] font-serif text-[#0A0A0A] leading-none">
                {metric.value}
              </span>
              <span className={\`flex items-center text-[12px] font-medium font-sans \${metric.trend === 'up' ? 'text-[#059669]' : 'text-[#DC2626]'}\`}>
                {metric.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-serif font-medium text-[#0A0A0A] tracking-tight">Audience Growth</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-[12px] text-[#666661] font-sans font-medium"><span className="w-2.5 h-2.5 bg-[#0A0A0A] mr-2"></span>Views</div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999996', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999996', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '0px', border: 'none', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#EBEBE9', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="views" stroke="#0A0A0A" strokeWidth={2} fillOpacity={0.05} fill="#0A0A0A" activeDot={{ r: 5, fill: '#0A0A0A', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Format Performance */}
        <div className="bg-white p-8 border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-serif font-medium text-[#0A0A0A] tracking-tight">Format Distribution</h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={240}>
              <BarChart data={formatData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBEBE9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#666661', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }} width={90} />
                <RechartsTooltip 
                  cursor={{ fill: '#F8F8F7' }}
                  contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '0px', border: 'none', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
                />
                <Bar dataKey="views" radius={[0, 0, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-[#EBEBE9]">
            <p className="text-[13px] text-[#666661] font-sans leading-relaxed">
              <strong className="text-[#0A0A0A] font-semibold">Short form video</strong> continues to drive the highest top-of-funnel reach this month, accounting for over 50% of total impressions.
            </p>
          </div>
        </div>
      </div>
      
      {/* Platform Breakdown Table */}
      <div className="bg-white border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-[#EBEBE9]">
          <h3 className="text-[18px] font-serif font-medium text-[#0A0A0A] tracking-tight">Platform Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8F7] border-b border-[#EBEBE9]">
                <th className="px-6 py-4 text-[11px] font-sans font-semibold text-[#999996] uppercase tracking-wider">Platform</th>
                <th className="px-6 py-4 text-[11px] font-sans font-semibold text-[#999996] uppercase tracking-wider">Followers</th>
                <th className="px-6 py-4 text-[11px] font-sans font-semibold text-[#999996] uppercase tracking-wider">Growth</th>
                <th className="px-6 py-4 text-[11px] font-sans font-semibold text-[#999996] uppercase tracking-wider">Avg Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBE9]">
              {[
                { platform: 'instagram', name: 'Instagram', followers: '12,400', growth: '+2.4%', avgViews: '4,200', trend: 'up' },
                { platform: 'tiktok', name: 'TikTok', followers: '45,100', growth: '+8.1%', avgViews: '22,500', trend: 'up' },
                { platform: 'youtube', name: 'YouTube', followers: '8,200', growth: '0.0%', avgViews: '1,800', trend: 'neutral' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#F8F8F7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[13px] font-sans font-medium text-[#0A0A0A]">
                      <div className="w-8 h-8 bg-white border border-[#EBEBE9] flex items-center justify-center mr-4 text-[#0A0A0A]">
                        <PlatformIcon platform={row.platform as any} className="w-4 h-4" />
                      </div>
                      {row.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-sans font-medium text-[#666661]">{row.followers}</td>
                  <td className={\`px-6 py-4 text-[13px] font-sans font-medium \${row.trend === 'up' ? 'text-[#059669]' : 'text-[#666661]'}\`}>{row.growth}</td>
                  <td className="px-6 py-4 text-[13px] font-sans font-medium text-[#0A0A0A]">{row.avgViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/AnalyticsPage.tsx', code);
