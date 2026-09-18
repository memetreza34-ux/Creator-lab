import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Eye, TrendingUp, Calendar, Sparkles, MessageSquare, Heart, Share2, Play } from 'lucide-react';
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

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const workspacePosts = getWorkspacePosts(state);
  const workspaceMedia = getWorkspaceMedia(state);
  const analytics = getWorkspaceAnalytics(state);

  const scheduledPosts = workspacePosts
    .filter((p: any) => p.status === 'scheduled')
    .sort((a: any, b: any) => new Date(a.scheduledAt || '').getTime() - new Date(b.scheduledAt || '').getTime())
    .slice(0, 4);

  const publishedPosts = workspacePosts
    .filter((p: any) => p.status === 'published')
    .sort((a: any, b: any) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime())
    .slice(0, 4);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      
      {/* Compact Performance Strip */}
      <div className="flex flex-wrap items-center bg-white border border-zinc-200 rounded-[10px] shadow-sm divide-y md:divide-y-0 md:divide-x divide-zinc-100 overflow-hidden">
        {analytics.map((metric: any) => (
          <div key={metric.id} className="flex-1 min-w-[120px] px-5 py-3.5 flex flex-col justify-center">
            <h3 className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{metric.label}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-zinc-900 leading-none">
                {metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
              </span>
              <span className={`flex items-center text-[11px] font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI Insight */}
          <div className="bg-brand-50 border border-brand-100 rounded-[10px] p-4 flex items-start space-x-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="p-2 bg-white rounded-lg shadow-sm border border-brand-100 shrink-0 relative z-10">
              <Sparkles className="w-5 h-5 text-brand-600" />
            </div>
            <div className="relative z-10 pt-0.5 flex-1">
              <h3 className="text-[13px] font-bold text-brand-700 mb-1">CREATOR LAB INSIGHT</h3>
              <p className="text-brand-900/80 text-sm leading-relaxed mb-3">
                Educational tutorial videos generated 34% more engagement than your lifestyle content this month. 
                Consider prioritizing the "Lighting Setup" script in your pipeline.
              </p>
              <div className="flex items-center space-x-3">
                <button className="text-[13px] font-semibold text-white bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded flex items-center transition-colors">
                  View Insight
                </button>
                <button className="text-[13px] font-medium text-brand-700 hover:text-brand-800 transition-colors">
                  Create Variation
                </button>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-5 rounded-[10px] border border-zinc-200 shadow-sm">
            <h3 className="text-[15px] font-semibold text-zinc-900 mb-5">Performance Growth</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#635BFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E7E5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181B', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#635BFF" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Content Visual */}
          <div className="bg-white rounded-[10px] border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-[15px] font-semibold text-zinc-900">Top Content This Week</h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {publishedPosts.map((post: any, i: number) => {
                const platforms = getPostPlatforms(post, state.socialAccounts);
                const platform = platforms[0] || 'instagram';
                const mediaAssetId = post.originalContent.mediaIds[0];
                const mediaAsset = workspaceMedia.find((m: any) => m.id === mediaAssetId);

                return (
                  <div key={post.id} onClick={() => navigate(`/create?edit=${post.id}`)} className="group cursor-pointer">
                    <div className="aspect-[4/5] rounded-lg bg-zinc-100 overflow-hidden relative mb-2 border border-zinc-200/60">
                      {mediaAsset ? (
                        <img src={mediaAsset.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-medium">Text</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="flex items-center space-x-2 text-white text-xs font-medium">
                          <span className="flex items-center"><Play className="w-3 h-3 mr-1 fill-current" /> {Math.floor(Math.random() * 20) + 1}K</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-[13px] font-medium text-zinc-900 leading-tight line-clamp-2 mb-1">
                      {post.title || 'Untitled Post'}
                    </h4>
                    <div className="flex items-center text-[11px] text-zinc-500 capitalize">
                      <PlatformIcon platform={platform} className="w-3 h-3 mr-1" />
                      {platform}
                    </div>
                  </div>
                );
              })}
              {publishedPosts.length === 0 && (
                <div className="col-span-full py-8 text-center text-zinc-500 text-sm">
                  Publish your first post to see top content here.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Your Week */}
          <div className="bg-white p-5 rounded-[10px] border border-zinc-200 shadow-sm">
            <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Your Week</h3>
            <div className="flex justify-between items-end h-16">
              {weekDays.map((day, i) => {
                const activity = [2, 4, 1, 5, 0, 3, 2][i]; // simulated activity level
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div className="w-1.5 bg-brand-100 rounded-t-sm relative flex justify-center w-full group">
                      {activity > 0 && (
                        <div 
                          className="w-1.5 bg-brand-500 rounded-sm absolute bottom-0 transition-all duration-300"
                          style={{ height: `${activity * 8}px` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Content */}
          <div className="bg-white p-5 rounded-[10px] border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider">Upcoming</h3>
              <button onClick={() => navigate('/calendar')} className="text-[12px] text-brand-600 font-medium hover:text-brand-700">View all</button>
            </div>
            
            <div className="space-y-0">
              {scheduledPosts.map((post, i) => (
                <div key={post.id} onClick={() => navigate(`/create?edit=${post.id}`)} className="flex items-start space-x-3 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded shadow-sm bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/50">
                    {post.originalContent.mediaIds[0] ? (
                      <img src={workspaceMedia.find((m: any) => m.id === post.originalContent.mediaIds[0])?.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 font-medium">Text</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-zinc-900 text-[13px] leading-tight truncate">{post.title || 'Untitled Post'}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[11px] text-zinc-500 flex items-center font-medium">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.scheduledAt || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center -space-x-1">
                        {getPostPlatforms(post, state.socialAccounts).map((platform: any) => (
                          <PlatformIcon key={platform} platform={platform} className="w-3.5 h-3.5 ring-1 ring-white" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {scheduledPosts.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-100">
                    <Calendar className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-[13px] text-zinc-500 font-medium">No upcoming posts</p>
                  <button onClick={() => navigate('/create')} className="mt-2 text-[12px] text-brand-600 font-medium">Plan your next post</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
