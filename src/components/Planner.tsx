import { Calendar, Plus, Youtube, Instagram, Twitter } from 'lucide-react';
import type { ContentIdea } from '../types';

const mockIdeas: ContentIdea[] = [
  { id: '1', title: 'I Tried A/B Testing My Life For 7 Days', status: 'production', platform: 'youtube', targetDate: '2026-09-20' },
  { id: '2', title: 'Why Hooks are Failing in 2026', status: 'planning', platform: 'youtube', targetDate: '2026-09-25' },
  { id: '3', title: 'My Content System Setup', status: 'idea', platform: 'instagram', targetDate: '2026-09-22' },
  { id: '4', title: 'Quick tip: Edit faster', status: 'published', platform: 'tiktok', targetDate: '2026-09-10' },
];

export function Planner() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Content Planner</h1>
          <p className="text-zinc-500 mt-1">Manage your content pipeline and editorial map.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Idea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Column title="Ideas" status="idea" items={mockIdeas} />
        <Column title="Planning" status="planning" items={mockIdeas} />
        <Column title="Production" status="production" items={mockIdeas} />
        <Column title="Published" status="published" items={mockIdeas} />
      </div>
    </div>
  );
}

function Column({ title, status, items }: { title: string; status: ContentIdea['status']; items: ContentIdea[] }) {
  const columnItems = items.filter((item) => item.status === status);
  
  return (
    <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-4 flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-700">{title}</h3>
        <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {columnItems.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {columnItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
            <h4 className="font-medium text-zinc-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div className="flex items-center bg-zinc-100 px-2 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {item.targetDate}
              </div>
              <PlatformIcon platform={item.platform} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: ContentIdea['platform'] }) {
  switch (platform) {
    case 'youtube':
      return <Youtube className="w-4 h-4 text-red-500" />;
    case 'instagram':
      return <Instagram className="w-4 h-4 text-pink-500" />;
    case 'twitter':
      return <Twitter className="w-4 h-4 text-blue-400" />;
    default:
      return <div className="w-4 h-4 bg-zinc-800 rounded-sm" />; // Fallback for tiktok
  }
}
