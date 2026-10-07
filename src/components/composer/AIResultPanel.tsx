import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  X,
  Plus,
  Hash,
  History,
} from 'lucide-react';

export interface AIHistoryItem {
  id: string;
  tool: string;
  timestamp: string;
  originalText: string;
  resultText: string;
  hooks?: string[];
  hashtags?: string[];
}

interface AIResultPanelProps {
  tool: string;
  originalText: string;
  resultText: string;
  hooks?: string[];
  hashtags?: string[];
  onApply: (text: string) => void;
  onInsert: (text: string) => void;
  onRegenerate: () => void;
  onDiscard: () => void;
  history: AIHistoryItem[];
  onRestoreFromHistory: (item: AIHistoryItem) => void;
}

export const AIResultPanel: React.FC<AIResultPanelProps> = ({
  tool,
  originalText,
  resultText,
  hooks,
  hashtags,
  onApply,
  onInsert,
  onRegenerate,
  onDiscard,
  history,
  onRestoreFromHistory
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(
    new Set(hashtags || [])
  );
  const [activeTab, setActiveTab] = useState<'result' | 'history'>('result');

  useEffect(() => {
    setSelectedHashtags(new Set(hashtags || []));
    setActiveTab('result');
  }, [hashtags, resultText]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const toggleHashtag = (tag: string) => {
    const next = new Set(selectedHashtags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    setSelectedHashtags(next);
  };

  const handleAddSelectedHashtags = () => {
    const textToAdd = Array.from(selectedHashtags).join(' ');
    if (textToAdd) {
      onInsert('\n\n' + textToAdd);
    }
  };

  return (
    <div className="bg-white border border-brand-200 rounded-xl overflow-hidden shadow-md my-4 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Panel Top Header */}
      <div className="bg-brand-50/60 px-4 py-3 border-b border-brand-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold text-zinc-900 text-[13px]">
            AI Suggestion: <span className="capitalize">{tool}</span>
          </span>
          <span className="text-[11px] bg-brand-100/70 text-brand-800 font-medium px-2 py-0.5 rounded-full">
            Preview Mode
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            aria-pressed={activeTab === 'history'}
            onClick={() => setActiveTab(activeTab === 'result' ? 'history' : 'result')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center space-x-1 transition-colors ${
              activeTab === 'history' 
                ? 'bg-brand-200 text-brand-900' 
                : 'text-zinc-600 hover:bg-brand-100/50'
            }`}
          >
            <History className="w-3 h-3 mr-1" />
            <span>History ({history.length})</span>
          </button>

          <button
            type="button"
            aria-label="Discard AI suggestion"
            onClick={onDiscard}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100"
            title="Discard Suggestion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="p-4 max-h-[350px] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-[12px] text-zinc-500 mb-2">
            <span>Session Suggestions ({history.length})</span>
            <span>Click any item to restore</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-[13px]">
              No previous AI suggestions in this session yet.
            </div>
          ) : (
            history.map((item) => (
              <button
                type="button"
                key={item.id}
                className="w-full text-left border border-[#EBEBE9] rounded-lg p-3 hover:border-brand-300 hover:bg-brand-50/20 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                onClick={() => {
                  onRestoreFromHistory(item);
                  setActiveTab('result');
                }}
              >
                <span className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                  <span className="font-semibold text-zinc-700 capitalize">{item.tool}</span>
                  <span>{item.timestamp}</span>
                </span>
                <span className="block text-[12px] text-zinc-800 line-clamp-2 leading-relaxed">
                  {item.resultText}
                </span>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="p-4">
          {/* HOOKS ALTERNATIVES SPECIFIC VIEW */}
          {hooks && hooks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[12px] text-zinc-600 font-medium">
                Select one of the strategic hook angles to apply:
              </p>
              <div className="space-y-2.5">
                {hooks.map((hook, index) => {
                  const labels = ['1. Curiosity Gap', '2. Bold Thesis', '3. Direct Value'];
                  return (
                    <div 
                      key={index}
                      className="border border-[#EBEBE9] bg-[#FAFAF9] rounded-lg p-3 hover:border-brand-400 transition-colors"
                    >
                      <div className="text-[10px] uppercase font-bold text-brand-700 tracking-wider mb-1">
                        {labels[index] || `Option ${index + 1}`}
                      </div>
                      <p className="text-[13px] text-zinc-900 font-medium leading-snug mb-2">
                        "{hook}"
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => onApply(hook + '\n\n' + originalText)}
                          className="px-2.5 py-1 bg-brand-600 text-white rounded text-[11px] font-semibold hover:bg-brand-700 flex items-center space-x-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Prepend as Hook</span>
                        </button>
                        <button
                          onClick={() => onApply(hook)}
                          className="px-2.5 py-1 bg-white border border-[#DCDCD8] text-zinc-700 rounded text-[11px] font-medium hover:bg-zinc-50"
                        >
                          Replace Post
                        </button>
                        <button
                          onClick={() => handleCopy(hook)}
                          className="px-2 py-1 text-zinc-500 hover:text-zinc-800 text-[11px]"
                        >
                          <Copy className="w-3 h-3 inline mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : hashtags && hashtags.length > 0 ? (
            /* HASHTAGS CHIPS SPECIFIC VIEW */
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-zinc-700">
                  Select hashtags to insert ({selectedHashtags.size} selected):
                </span>
                <button
                  onClick={() => {
                    if (selectedHashtags.size === hashtags.length) {
                      setSelectedHashtags(new Set());
                    } else {
                      setSelectedHashtags(new Set(hashtags));
                    }
                  }}
                  className="text-[11px] text-brand-600 hover:underline font-medium"
                >
                  {selectedHashtags.size === hashtags.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#FAFAF9] rounded-lg border border-[#EBEBE9]">
                {hashtags.map((tag) => {
                  const isSelected = selectedHashtags.has(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      aria-pressed={isSelected}
                      onClick={() => toggleHashtag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[12px] font-medium flex items-center space-x-1 transition-all ${
                        isSelected 
                          ? 'bg-brand-600 text-white shadow-xs' 
                          : 'bg-white border border-[#DCDCD8] text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      <Hash className="w-3 h-3 opacity-60" />
                      <span>{tag.replace(/^#/, '')}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-[#F2F2F0]">
                <button
                  disabled={selectedHashtags.size === 0}
                  onClick={handleAddSelectedHashtags}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 disabled:opacity-40 flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Selected Hashtags ({selectedHashtags.size})</span>
                </button>
                <button
                  onClick={onDiscard}
                  className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg text-[12px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* GENERAL TEXT SUGGESTION (REWRITE, IMPROVE, SHORTEN) */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border border-[#EBEBE9] bg-[#FAFAF9] rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                    Original Base
                  </div>
                  <p className="text-[12px] text-zinc-600 whitespace-pre-line leading-relaxed max-h-[140px] overflow-y-auto">
                    {originalText || <span className="italic">Empty</span>}
                  </p>
                </div>

                <div className="border border-brand-200 bg-brand-50/30 rounded-lg p-3 relative">
                  <div className="text-[10px] uppercase font-bold text-brand-700 tracking-wider mb-1 flex items-center justify-between">
                    <span>AI Suggested Revision</span>
                    {copied && <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>}
                  </div>
                  <p className="text-[12px] text-zinc-900 font-medium whitespace-pre-line leading-relaxed max-h-[140px] overflow-y-auto">
                    {resultText}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2F2F0]">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onApply(resultText)}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Composer</span>
                  </button>

                  <button
                    onClick={() => onInsert('\n\n' + resultText)}
                    className="px-3 py-2 bg-white border border-[#DCDCD8] text-zinc-700 rounded-lg text-[12px] font-medium hover:bg-zinc-50 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert at Cursor</span>
                  </button>

                  <button
                    onClick={() => handleCopy(resultText)}
                    className="px-2.5 py-2 text-zinc-600 hover:text-zinc-900 rounded-lg text-[12px] flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onRegenerate}
                    className="px-2.5 py-1.5 text-zinc-600 hover:text-brand-700 rounded-lg text-[12px] flex items-center space-x-1 hover:bg-brand-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={onDiscard}
                    className="px-2.5 py-1.5 text-zinc-500 hover:text-zinc-800 rounded-lg text-[12px]"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
