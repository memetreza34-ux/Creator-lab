import React from 'react';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Analytics Overview</h2>
          <p className="text-sm text-zinc-500 mt-1">Detailed performance metrics across all platforms.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
          <button className="px-4 py-1.5 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-md">7 Days</button>
          <button className="px-4 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-md">30 Days</button>
          <button className="px-4 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-md">All Time</button>
        </div>
      </div>

      {/* Placeholder content since we're using mock data without full charts for now */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center justify-center h-48">
          <Eye className="w-8 h-8 text-indigo-500 mb-4" />
          <p className="text-3xl font-bold text-zinc-900 mb-1">1.2M</p>
          <p className="text-sm font-medium text-zinc-500">Total Views</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center justify-center h-48">
          <Users className="w-8 h-8 text-pink-500 mb-4" />
          <p className="text-3xl font-bold text-zinc-900 mb-1">45.2K</p>
          <p className="text-sm font-medium text-zinc-500">Net Followers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center justify-center h-48">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-zinc-900 mb-1">6.4%</p>
          <p className="text-sm font-medium text-zinc-500">Avg. Engagement</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center h-[400px]">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
          <BarChart3 className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Detailed Charts</h3>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          Select specific platforms and metrics above to render detailed performance charts here.
        </p>
      </div>
    </div>
  );
}
