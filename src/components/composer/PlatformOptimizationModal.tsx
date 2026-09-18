import React, { useState } from 'react';
import { 
  Sparkles, Check, X, ArrowRight, RefreshCw, Layers, CheckCircle2 
} from 'lucide-react';
import { Platform } from '../../types';
import { PlatformIcon } from '../ui/PlatformIcon';
import { PLATFORM_CONFIGS } from '../../config/platformConfig';

interface PlatformOptimizationModalProps {
  baseContent: string;
  selectedPlatforms: Platform[];
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: (platform: Platform, adaptedContent: string) => void;
  onApplyAll: (optimizations: Record<Platform, string>) => void;
}

export const PlatformOptimizationModal: React.FC<PlatformOptimizationModalProps> = ({
  baseContent,
  selectedPlatforms,
  isOpen,
  onClose,
  onApplyOptimization,
  onApplyAll
}) => {
  const [loading, setLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<Record<string, string>>({});
  const [appliedPlatforms, setAppliedPlatforms] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!baseContent.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: baseContent,
          tool: 'optimize_platform',
          platforms: selectedPlatforms
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to adapt content');

      if (json.data && json.data.optimizations) {
        setOptimizations(json.data.optimizations);
      } else {
        // Fallback default adaptations if server raw
        const fallbackMap: Record<string, string> = {};
        selectedPlatforms.forEach(p => {
          if (p === 'instagram') {
            fallbackMap[p] = `${baseContent}\n\n.\n.\n#contentcreator #creatorlab #growth`;
          } else if (p === 'tiktok') {
            fallbackMap[p] = `Wait till the end! 🛑 ${baseContent.slice(0, 150)} #fyp #tips`;
          } else if (p === 'linkedin') {
            fallbackMap[p] = `Key Takeaway:\n\n${baseContent}\n\nWhat are your thoughts on this? Drop a comment below.`;
          } else if (p === 'twitter') {
            fallbackMap[p] = baseContent.slice(0, 260);
          } else {
            fallbackMap[p] = baseContent;
          }
        });
        setOptimizations(fallbackMap);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error adapting content');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySingle = (platform: Platform, text: string) => {
    onApplyOptimization(platform, text);
    setAppliedPlatforms(prev => new Set(prev).add(platform));
  };

  const handleApplyAllClick = () => {
    const validMap: Record<Platform, string> = {} as any;
    selectedPlatforms.forEach(p => {
      if (optimizations[p]) {
        validMap[p] = optimizations[p];
      }
    });
    onApplyAll(validMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#EBEBE9] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#EBEBE9] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-[15px]">Multi-Platform Content Adaptation</h3>
              <p className="text-[12px] text-zinc-500">
                Tailors tone, line breaks, character count, and hashtag culture for each destination
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {Object.keys(optimizations).length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-zinc-600 mb-4 max-w-md mx-auto">
                Generate tailored adaptations for your <strong>{selectedPlatforms.length} selected platform{selectedPlatforms.length > 1 ? 's' : ''}</strong> ({selectedPlatforms.join(', ')}).
              </p>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center space-x-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Platform Adaptations</span>
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-3" />
              <p className="text-[13px] text-zinc-700 font-medium">Adapting content for {selectedPlatforms.length} platforms...</p>
              <p className="text-[11px] text-zinc-400 mt-1">Applying platform-specific heuristics and attention curves</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedPlatforms.map(platform => {
                const config = PLATFORM_CONFIGS[platform];
                const adaptedText = optimizations[platform] || baseContent;
                const isApplied = appliedPlatforms.has(platform);

                return (
                  <div key={platform} className="border border-[#EBEBE9] rounded-xl p-4 bg-white hover:border-zinc-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform={platform} className="w-4 h-4" />
                        <span className="font-semibold text-zinc-900 text-[13px]">{config?.displayName || platform}</span>
                        <span className="text-[11px] text-zinc-400">
                          (Limit: ~{config?.prototypeCaptionLimit || 2200} chars)
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isApplied ? (
                          <span className="text-[11px] font-medium text-emerald-600 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplySingle(platform, adaptedText)}
                            className="px-2.5 py-1 bg-white border border-[#DCDCD8] hover:bg-zinc-50 text-zinc-800 rounded-md text-[11px] font-medium flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply for {config?.displayName || platform}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 mb-2 italic">
                      Guidance: {config?.hashtagGuidance}
                    </p>

                    <div className="p-3 bg-[#FAFAF9] border border-[#F2F2F0] rounded-lg text-[12px] text-zinc-800 whitespace-pre-line leading-relaxed">
                      {adaptedText}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {Object.keys(optimizations).length > 0 && (
          <div className="p-4 border-t border-[#EBEBE9] bg-[#FAFAF9] flex items-center justify-between">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-3 py-1.5 text-[12px] text-zinc-600 hover:text-zinc-900 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate All</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleApplyAllClick}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply All Platforms ({selectedPlatforms.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
