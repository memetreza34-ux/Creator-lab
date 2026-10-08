import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Post, PostStatus } from '../types';
import { format } from 'date-fns';
import {
  Search,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit2,
  ImageIcon,
  Calendar,
  Link2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import {
  getPostDestinationHistory,
  getPostPlatforms,
  getSourceContentItemForPost,
  getWorkspaceAccounts,
  getWorkspaceMedia,
  getWorkspacePosts,
} from '../utils/selectors';
import { resolveMediaUrl } from '../utils/mediaStorage';
import { getPostDisplayDateTime } from '../utils/scheduling';

export function PostsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PostStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [resolvedMediaUrls, setResolvedMediaUrls] = useState<Record<string, string>>({});

  const workspacePosts = getWorkspacePosts(state);
  const workspaceMedia = useMemo(
    () => getWorkspaceMedia(state),
    [state.mediaAssets, state.activeWorkspaceId],
  );
  const workspaceAccounts = getWorkspaceAccounts(state);
  const workspaceTimeZone = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  )?.timezone || 'UTC';

  useEffect(() => {
    let cancelled = false;

    const resolveUrls = async () => {
      const entries = await Promise.all(
        workspaceMedia.map(async (asset) => {
          const url = await resolveMediaUrl(asset.id, asset.url);
          return [asset.id, url] as const;
        }),
      );

      if (!cancelled) {
        setResolvedMediaUrls(Object.fromEntries(entries));
      }
    };

    void resolveUrls();

    return () => {
      cancelled = true;
    };
  }, [workspaceMedia]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const posts = workspacePosts
    .filter((post) => activeTab === 'all' || post.status === activeTab)
    .filter((post) => {
      if (!normalizedSearchQuery) return true;
      return post.title.toLowerCase().includes(normalizedSearchQuery)
        || post.originalContent.caption.toLowerCase().includes(normalizedSearchQuery);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDuplicate = (post: Post) => {
    const duplicated: Post = {
      ...post,
      id: uuidv4(),
      title: `${post.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      scheduledAt: undefined,
      publishedAt: undefined,
    };
    dispatch({ type: 'ADD_POST', payload: duplicated });
    toast.success('Post duplicated as draft');
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_POST', payload: id });
      toast.success('Post deleted');
    }
    setOpenMenuId(null);
  };

  const tabs: { id: PostStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Drafts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'published', label: 'Published' },
    { id: 'needs_review', label: 'Needs Review' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <div className="p-6 h-full flex flex-col bg-surface-bg" onClick={() => setOpenMenuId(null)}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Posts</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage and track your content. Dates shown in {workspaceTimeZone}.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9 pr-4 py-1.5 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 w-64 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-zinc-200 mb-6 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {posts.length === 0 ? (
          <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm p-16 flex flex-col items-center justify-center text-center max-w-3xl mx-auto mt-8">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-[16px] font-semibold text-zinc-900 mb-2">No posts found</h3>
            <p className="text-[13px] text-zinc-500 mb-6 max-w-sm">
              {searchQuery ? 'Try adjusting your search filters.' : 'You haven\'t created any posts in this category yet.'}
            </p>
            <button
              onClick={() => navigate('/create')}
              className="px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-zinc-50/50">
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[40%]">Post</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Platforms</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {posts.map((post) => {
                  const previewMedia = workspaceMedia.find(
                    (asset) => asset.id === post.originalContent.mediaIds[0],
                  );
                  const history = getPostDestinationHistory(state, post.id);
                  const platforms = getPostPlatforms(
                    post,
                    workspaceAccounts,
                    history,
                  );
                  const removedHistoricalAccounts = history.filter(
                    (destination) =>
                      !destination.socialAccountId &&
                      destination.status === 'published',
                  );
                  const sourceItem = getSourceContentItemForPost(state, post);
                  const displayTimestamp = getPostDisplayDateTime(post, workspaceTimeZone);

                  return (
                    <tr key={post.id} className="hover:bg-zinc-50/60 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-zinc-100 rounded-[6px] overflow-hidden shrink-0 flex items-center justify-center text-zinc-400 border border-zinc-200">
                            {previewMedia ? (
                              <img
                                src={resolvedMediaUrls[previewMedia.id] || previewMedia.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-zinc-900 truncate mb-0.5">{post.title}</p>
                            <p className="text-[12px] text-zinc-500 line-clamp-1">{post.originalContent.caption || 'No caption'}</p>
                            {removedHistoricalAccounts.length > 0 && (
                              <p
                                className="mt-1 text-[10px] text-amber-700"
                                title="Historical local snapshot. Not proof of live publishing."
                              >
                                Archived channel: {removedHistoricalAccounts.map(
                                  (destination) => destination.accountLabel,
                                ).join(', ')}
                                {' · local history'}
                              </p>
                            )}
                            {sourceItem && (
                              <div className="mt-1 flex items-center text-[10px] font-medium text-brand-700">
                                <Link2 className="w-3 h-3 mr-1 shrink-0" />
                                <span className="truncate">Pipeline: {sourceItem.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="flex space-x-1.5">
                          {platforms.map((platform) => (
                            <div key={platform} className="w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600" title={platform}>
                              <PlatformIcon platform={platform} className="w-3.5 h-3.5" />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                          post.status === 'published' ? 'bg-status-success/10 text-status-success' :
                          post.status === 'scheduled' ? 'bg-brand-50 text-brand-600' :
                          post.status === 'failed' ? 'bg-status-danger/10 text-status-danger' :
                          post.status === 'needs_review' ? 'bg-amber-50 text-amber-700' :
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-middle whitespace-nowrap">
                        <p className="text-[13px] text-zinc-900 font-medium">
                          {displayTimestamp
                            ? format(new Date(`${displayTimestamp.date}T12:00:00`), 'MMM d, yyyy')
                            : 'Date unavailable'}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {displayTimestamp
                            ? `${displayTimestamp.time} · ${displayTimestamp.kind}`
                            : 'Check post details'}
                        </p>
                      </td>
                      <td className="px-5 py-3 align-middle text-right relative">
                        <button
                          type="button"
                          aria-label={`Open actions for ${post.title}`}
                          aria-expanded={openMenuId === post.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(openMenuId === post.id ? null : post.id);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-md transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === post.id && (
                          <div className="absolute right-6 top-10 w-40 bg-white border border-zinc-200 rounded-[8px] shadow-lg z-10 py-1 text-left">
                            <button
                              onClick={() => navigate(`/create?edit=${post.id}`)}
                              className="w-full px-4 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicate(post)}
                              className="w-full px-4 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </button>
                            <div className="h-px bg-zinc-100 my-1 mx-2" />
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="w-full px-4 py-1.5 text-[13px] text-status-danger hover:bg-status-danger/10 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
