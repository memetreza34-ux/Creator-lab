import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Eye, MousePointerClick, TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';
import { mockAnalytics, mockPosts } from '../data/mockData';

const data = [
  { name: 'Mon', reach: 14000, engagement: 240 },
  { name: 'Tue', reach: 23000, engagement: 139 },
  { name: 'Wed', reach: 20000, engagement: 980 },
  { name: 'Thu', reach: 27800, engagement: 390 },
  { name: 'Fri', reach: 18900, engagement: 480 },
  { name: 'Sat', reach: 23900, engagement: 380 },
  { name: 'Sun', reach: 34900, engagement: 430 },
];

export function DashboardPage() {
  const scheduledPosts = mockPosts.filter(p => p.status === 'scheduled');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockAnalytics.map(metric => (
          <div key={metric.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="text-sm font-medium text-zinc-500 mb-4">{metric.label}</h3>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-zinc-900">
                {metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
              </span>
              <span className={`flex items-center text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6">Performance Overview</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-900 mb-1">Creator Lab Insight</h3>
              <p className="text-indigo-800/80 text-sm leading-relaxed">
                Educational videos generated 34% more engagement than your other content this month. Consider prioritizing the "Why Hooks are Failing" script in your pipeline.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Upcoming Posts */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900">Upcoming Posts</h3>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View Calendar</button>
            </div>
            <div className="space-y-4">
              {scheduledPosts.map(post => (
                <div key={post.id} className="flex items-start space-x-4 p-3 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-100">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                    {post.originalContent.media[0] && (
                      <img src={post.originalContent.media[0].url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 text-sm line-clamp-1">{post.title}</h4>
                    <div className="flex items-center text-xs text-zinc-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(post.scheduledAt || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
              {scheduledPosts.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No upcoming posts scheduled.</p>
              )}
            </div>
          </div>

          {/* Top Performing */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6">Top Performing</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                <div className="w-12 h-12 rounded-lg bg-zinc-200 shrink-0 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1516280440502-a270f20ceb68?w=100&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-900 text-sm line-clamp-1">Top 5 Editing Hooks</h4>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="flex items-center text-xs font-medium text-zinc-600">
                      <Eye className="w-3 h-3 mr-1" /> 45.2K
                    </span>
                    <span className="flex items-center text-xs font-medium text-emerald-600">
                      <TrendingUp className="w-3 h-3 mr-1" /> 12%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
