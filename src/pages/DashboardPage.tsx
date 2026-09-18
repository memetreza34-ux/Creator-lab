
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Calendar, Sparkles, MessageSquare, Play, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { getWorkspacePosts, getWorkspaceMedia, getWorkspaceAnalytics, getPostPlatforms } from '../utils/selectors';

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
  const { state } = useApp();
  const navigate = useNavigate();
  
  const workspacePosts = getWorkspacePosts(state);
  const analytics = getWorkspaceAnalytics(state);

  const scheduledPosts = workspacePosts
    .filter((p: any) => p.status === 'scheduled')
    .sort((a: any, b: any) => new Date(a.scheduledAt || '').getTime() - new Date(b.scheduledAt || '').getTime())
    .slice(0, 4);

  const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId) || state.workspaces[0];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EBEBE9]">
        <div>
          <p className="text-[12px] font-sans font-semibold text-[#999996] uppercase tracking-[0.15em] mb-3">
            Overview
          </p>
          <h1 className="text-4xl font-serif text-[#0A0A0A] font-medium tracking-tight">
            Welcome back to {activeWorkspace?.name}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/create')}
            className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[13px] font-sans font-medium hover:bg-[#1A1A1A] transition-colors shadow-sm rounded-lg"
          >
            Create New Post
          </button>
        </div>
      </div>

      {/* Metrics Row (Flat Depth) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analytics.map((metric: any) => (
          <div key={metric.id} className="p-6 bg-white border border-[#EBEBE9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px]">
            <h3 className="text-[12px] font-sans font-medium text-[#666661] tracking-wide">{metric.label}</h3>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[28px] font-serif text-[#0A0A0A] leading-none">
                {metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
              </span>
              <span className={`flex items-center text-[12px] font-medium font-sans ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI Insight (Sophisticated, no gradients) */}
          <div className="bg-[#F8F8F7] border border-[#EBEBE9] p-6 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-10 h-10 bg-white border border-[#D1D1CE] flex flex-col items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-[12px] font-sans font-semibold text-[#0A0A0A] tracking-[0.1em] uppercase mb-2">
                Studio Intelligence
              </h3>
              <p className="text-[#666661] text-[14px] font-sans leading-relaxed max-w-2xl">
                Your educational tutorials are outperforming lifestyle content by <strong className="text-[#0A0A0A] font-semibold">34%</strong> this month. 
                Consider prioritizing the "Lighting Setup" script currently in your pipeline to capitalize on this momentum.
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <button onClick={() => navigate('/pipeline')} className="px-4 py-2 border border-[#0A0A0A] text-[#0A0A0A] bg-white text-[12px] font-sans font-medium hover:bg-[#0A0A0A] hover:text-white transition-colors">
                View Pipeline
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border border-[#EBEBE9] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[18px] font-serif text-[#0A0A0A] font-medium">Performance Trajectory</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-[12px] text-[#666661] font-sans font-medium">
                  <span className="w-2.5 h-2.5 bg-[#0A0A0A] mr-2"></span> Reach
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE9" />
                  <XAxis 
                    dataKey="name" 
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
                    activeDot={{ r: 5, fill: '#0A0A0A', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-white border border-[#EBEBE9] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-serif text-[#0A0A0A] font-medium">Upcoming Releases</h3>
              <button onClick={() => navigate('/calendar')} className="text-[#666661] hover:text-[#0A0A0A] transition-colors p-1">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
            
            {scheduledPosts.length > 0 ? (
              <div className="space-y-4">
                {scheduledPosts.map((post: any) => {
                  const date = new Date(post.scheduledAt);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const platforms = getPostPlatforms(post, state.socialAccounts);
                  
                  return (
                    <div key={post.id} className="group relative flex items-start space-x-4 p-4 border border-[#EBEBE9] hover:border-[#D1D1CE] transition-colors cursor-pointer bg-[#F8F8F7]" onClick={() => navigate(`/create?edit=${post.id}`)}>
                      <div className="flex flex-col items-center justify-center min-w-[48px]">
                        <span className="text-[11px] font-sans font-bold text-[#999996] uppercase mb-0.5">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className={`text-[20px] font-serif leading-none ${isToday ? 'text-brand-600 font-bold' : 'text-[#0A0A0A]'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1 space-x-2">
                          <span className="text-[11px] font-sans font-medium text-[#666661] bg-white border border-[#EBEBE9] px-2 py-0.5 rounded">
                            {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          <div className="flex -space-x-1">
                            {platforms.map(platform => (
                              <div key={platform} className="w-5 h-5 rounded-full bg-white border border-[#EBEBE9] flex items-center justify-center text-[#666661] z-10">
                                <PlatformIcon platform={platform} className="w-3 h-3" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <h4 className="text-[13px] font-sans font-medium text-[#0A0A0A] truncate">{post.title}</h4>
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
