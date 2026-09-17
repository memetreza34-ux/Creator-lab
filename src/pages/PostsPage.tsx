import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Image as ImageIcon, Edit2, Copy, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Post, PostStatus } from '../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export function PostsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | PostStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const posts = state.posts
    .filter(p => p.workspaceId === state.activeWorkspaceId)
    .filter(p => activeTab === 'all' || p.status === activeTab)
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.originalContent.caption.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_POST', payload: id });
      toast.success('Post deleted');
      setOpenMenuId(null);
    }
  };

  const handleDuplicate = (post: Post) => {
    const newPost = { ...post, id: uuidv4(), title: `${post.title} (Copy)`, status: 'draft' as PostStatus, scheduledAt: undefined, publishedAt: undefined };
    dispatch({ type: 'ADD_POST', payload: newPost });
    toast.success('Post duplicated to drafts');
    setOpenMenuId(null);
  };

  const tabs: { id: 'all' | PostStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Drafts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'published', label: 'Published' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full" onClick={() => setOpenMenuId(null)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">Posts</h2>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 bg-white"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm opacity-50 cursor-not-allowed">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-zinc-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No posts found</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            {searchQuery ? 'Try adjusting your search filters.' : 'You haven\'t created any posts in this category yet.'}
          </p>
          <button 
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      ) : (
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
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-zinc-400 border border-zinc-200">
                        {post.originalContent.mediaIds[0] ? (
                          <img src={state.mediaAssets.find(m => m.id === post.originalContent.mediaIds[0])?.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1 mb-1">{post.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{post.originalContent.caption || 'No caption'}</p>
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
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 
                      post.status === 'scheduled' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-zinc-100 text-zinc-700'
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
                  <td className="px-6 py-4 align-top text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === post.id ? null : post.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors mt-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === post.id && (
                      <div className="absolute right-6 top-10 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 py-1 text-left">
                        <button 
                          onClick={() => navigate(`/create?edit=${post.id}`)}
                          className="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDuplicate(post)}
                          className="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
