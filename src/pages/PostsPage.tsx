import React from 'react';
import { Search, Filter, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { mockPosts } from '../data/mockData';
import { format } from 'date-fns';

export function PostsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-zinc-900">All Posts</h2>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-[400px]">Post</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Platforms</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {mockPosts.map(post => (
              <tr key={post.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-zinc-400 border border-zinc-200">
                      {post.originalContent.media[0] ? (
                        <img src={post.originalContent.media[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 line-clamp-1 mb-1">{post.title}</p>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{post.originalContent.caption}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex space-x-1 mt-1">
                    {post.platformContent.map(pc => (
                      <span key={pc.platform} className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {pc.platform}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 ${
                    post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="text-sm text-zinc-900 mt-1 font-medium">
                    {format(new Date(post.scheduledAt || post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(post.scheduledAt || post.publishedAt || post.createdAt), 'h:mm a')}
                  </p>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors mt-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
