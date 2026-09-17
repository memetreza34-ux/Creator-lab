import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Smile, 
  Hash, 
  Wand2, 
  Clock, 
  Send, 
  Save, 
  Calendar,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { mockSocialAccounts } from '../data/mockData';
import { Platform } from '../types';

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram']);
  const [activePreviewTab, setActivePreviewTab] = useState<Platform | 'original'>('original');
  const [isScheduling, setIsScheduling] = useState(false);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="flex h-full">
      {/* Composer Area */}
      <div className="flex-1 flex flex-col border-r border-zinc-200 bg-white">
        
        {/* Account Selection */}
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">Post to</h2>
          <div className="flex flex-wrap gap-3">
            {mockSocialAccounts.map(account => (
              <button
                key={account.id}
                onClick={() => togglePlatform(account.platform)}
                className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedPlatforms.includes(account.platform)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-zinc-200 mr-2 flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] uppercase font-bold">{account.platform[0]}</span>
                </div>
                <span className="font-medium">{account.username}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedPlatforms.length > 1 && (
            <div className="mb-6 flex space-x-2 border-b border-zinc-200">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activePreviewTab === 'original' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => setActivePreviewTab('original')}
              >
                Original
              </button>
              {selectedPlatforms.map(platform => (
                <button
                  key={platform}
                  className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${activePreviewTab === platform ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  onClick={() => setActivePreviewTab(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          )}

          <div className="border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <textarea
              className="w-full min-h-[200px] p-4 outline-none resize-none text-zinc-900 placeholder:text-zinc-400"
              placeholder="What do you want to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-200">
              <div className="flex items-center space-x-1">
                <button className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-md transition-colors tooltip" title="Add Media">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-md transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-md transition-colors">
                  <Hash className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-400 font-medium">{content.length} characters</span>
            </div>
          </div>

          {/* AI Tools */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              AI Improve
            </button>
            <button className="flex items-center px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors">
              Rewrite
            </button>
            <button className="flex items-center px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors">
              Shorten
            </button>
            <button className="flex items-center px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors">
              Generate Hashtags
            </button>
          </div>
        </div>

        {/* Publishing Footer */}
        <div className="p-6 border-t border-zinc-200 bg-zinc-50">
          {isScheduling && (
            <div className="mb-4 p-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-500 mb-1">Date</label>
                  <input type="date" className="border border-zinc-200 rounded-md px-3 py-1.5 text-sm" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-500 mb-1">Time</label>
                  <input type="time" className="border border-zinc-200 rounded-md px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-emerald-600 flex items-center justify-end">
                  <Sparkles className="w-3 h-3 mr-1" /> High engagement predicted
                </p>
                <p className="text-xs text-zinc-500 mt-1">Based on your audience</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button className="flex items-center px-4 py-2 text-zinc-600 font-medium text-sm hover:bg-zinc-200 rounded-lg transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsScheduling(!isScheduling)}
                className={`flex items-center px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  isScheduling ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </button>
              <button className="flex items-center px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Send className="w-4 h-4 mr-2" />
                {isScheduling ? 'Schedule Post' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="w-[400px] bg-zinc-50 p-8 overflow-y-auto">
        <h3 className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-wider text-center">Live Preview</h3>
        
        {/* Mock Phone Container */}
        <div className="w-full max-w-[320px] mx-auto bg-white rounded-[2.5rem] border-[8px] border-zinc-900 shadow-xl overflow-hidden h-[600px] flex flex-col relative">
          <div className="absolute top-0 inset-x-0 h-6 bg-white z-10 flex justify-center">
            <div className="w-1/3 h-4 bg-zinc-900 rounded-b-xl"></div>
          </div>
          
          <div className="pt-10 px-4 pb-4 flex-1 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-zinc-200 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 leading-none">creatorlab</p>
                <p className="text-xs text-zinc-500">Just now</p>
              </div>
            </div>
            
            <div className="flex-1 bg-zinc-100 rounded-xl mb-4 flex items-center justify-center text-zinc-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            
            <div className="text-sm text-zinc-800 whitespace-pre-wrap line-clamp-3">
              {content || 'Your caption will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


