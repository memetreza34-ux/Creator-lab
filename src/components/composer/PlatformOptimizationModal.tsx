import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  RefreshCw,
  CheckCircle2,
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
  onApplyAll: (
    optimizations: Partial<Record<Platform, string>>,
  ) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export const PlatformOptimizationModal: React.FC<
  PlatformOptimizationModalProps
> = ({
  baseContent,
  selectedPlatforms,
  isOpen,
  onClose,
  onApplyOptimization,
  onApplyAll,
}) => {
  const [loading, setLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<
    Partial<Record<Platform, string>>
  >({});
  const [appliedPlatforms, setAppliedPlatforms] = useState<Set<Platform>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!baseContent.trim()) {
      setError('Add base content before generating platform adaptations.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Select at least one destination platform first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAppliedPlatforms(new Set());

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: baseContent,
          tool: 'optimize_platform',
          platforms: selectedPlatforms,
        }),
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const message =
          isRecord(json) && typeof json.error === 'string'
            ? json.error
            : 'Failed to adapt content';
        throw new Error(message);
      }

      const data =
        isRecord(json) && isRecord(json.data) ? json.data : undefined;
      const rawOptimizations =
        data && isRecord(data.optimizations)
          ? data.optimizations
          : undefined;

      if (!rawOptimizations) {
        throw new Error(
          'AI returned an invalid adaptation response. No content was changed.',
        );
      }

      const next: Partial<Record<Platform, string>> = {};
      selectedPlatforms.forEach((platform) => {
        const value = rawOptimizations[platform];
        if (typeof value === 'string' && value.trim()) {
          next[platform] = value.trim();
        }
      });

      if (Object.keys(next).length === 0) {
        throw new Error(
          'AI did not return a usable adaptation for any selected platform.',
        );
      }

      setOptimizations(next);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error adapting content';
      setError(message);
      setOptimizations({});
    } finally {
      setLoading(false);
    }
  };

  const handleApplySingle = (platform: Platform, text: string) => {
    onApplyOptimization(platform, text);
    setAppliedPlatforms((previous) => new Set(previous).add(platform));
  };

  const handleApplyAllClick = () => {
    const validMap: Partial<Record<Platform, string>> = {};

    selectedPlatforms.forEach((platform) => {
      const text = optimizations[platform];
      if (text) validMap[platform] = text;
    });

    if (Object.keys(validMap).length === 0) {
      setError('There are no generated adaptations to apply.');
      return;
    }

    onApplyAll(validMap);
    onClose();
  };

  const generatedCount = Object.keys(optimizations).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-optimization-title"
        className="bg-white rounded-2xl border border-[#EBEBE9] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-[#EBEBE9] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="platform-optimization-title"
                className="font-semibold text-zinc-900 text-[15px]"
              >
                Multi-Platform Content Adaptation
              </h3>
              <p className="text-[12px] text-zinc-500">
                AI suggestions are previews. Review each version before applying it.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close platform adaptation dialog"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-800"
            >
              {error}
            </div>
          )}

          {generatedCount === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-zinc-600 mb-4 max-w-md mx-auto">
                Generate reviewable adaptations for{' '}
                <strong>
                  {selectedPlatforms.length} selected platform
                  {selectedPlatforms.length !== 1 ? 's' : ''}
                </strong>
                .
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!baseContent.trim() || selectedPlatforms.length === 0}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center space-x-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Generate Platform Adaptations</span>
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12" aria-live="polite">
              <RefreshCw
                className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-[13px] text-zinc-700 font-medium">
                Generating AI adaptations for {selectedPlatforms.length} platform
                {selectedPlatforms.length !== 1 ? 's' : ''}...
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Your base content will not be changed until you explicitly apply a result.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedPlatforms.map((platform) => {
                const config = PLATFORM_CONFIGS[platform];
                const adaptedText = optimizations[platform];
                const isApplied = appliedPlatforms.has(platform);

                return (
                  <div
                    key={platform}
                    className="border border-[#EBEBE9] rounded-xl p-4 bg-white hover:border-zinc-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <PlatformIcon
                          platform={platform}
                          className="w-4 h-4 shrink-0"
                        />
                        <span className="font-semibold text-zinc-900 text-[13px]">
                          {config.displayName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Prototype limit: ~{config.prototypeCaptionLimit} chars
                        </span>
                      </div>

                      {adaptedText && (
                        <div className="flex items-center space-x-2 shrink-0">
                          {isApplied ? (
                            <span className="text-[11px] font-medium text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleApplySingle(platform, adaptedText)
                              }
                              className="px-2.5 py-1 bg-white border border-[#DCDCD8] hover:bg-zinc-50 text-zinc-800 rounded-md text-[11px] font-medium flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Apply for {config.displayName}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-500 mb-2 italic">
                      Prototype guidance: {config.hashtagGuidance}
                    </p>

                    {adaptedText ? (
                      <div className="p-3 bg-[#FAFAF9] border border-[#F2F2F0] rounded-lg text-[12px] text-zinc-800 whitespace-pre-line leading-relaxed">
                        {adaptedText}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-800">
                        No usable AI adaptation was returned for this platform.
                        The base content remains unchanged.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {generatedCount > 0 && (
          <div className="p-4 border-t border-[#EBEBE9] bg-[#FAFAF9] flex items-center justify-between">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="px-3 py-1.5 text-[12px] text-zinc-600 hover:text-zinc-900 flex items-center space-x-1 disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Regenerate All</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyAllClick}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Apply Generated ({generatedCount})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
