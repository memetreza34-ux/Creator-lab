import React, { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Experiment,
  MediaAsset,
  Platform,
  PlatformSpecificContent,
  Post,
  PostContent,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  ImageIcon,
  Layers,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { PLATFORM_CONFIGS } from '../config/platformConfig';
import {
  getDestinationCapability,
  getFirstBlockingIssue,
  validateComposerDestinations,
} from '../config/destinationCapabilities';
import { AIResultPanel, AIHistoryItem } from '../components/composer/AIResultPanel';
import { CreatorIntelligencePanel } from '../components/composer/CreatorIntelligencePanel';
import { PlatformOptimizationModal } from '../components/composer/PlatformOptimizationModal';
import { PlatformPreviewRenderer } from '../components/composer/previews/PlatformPreviews';
import { getRecommendedPostingTimes, getPrimaryRecommendedTime } from '../utils/bestTimeEngine';
import { getWorkspaceAccounts, getWorkspaceMedia } from '../utils/selectors';
import { resolveMediaUrl } from '../utils/mediaStorage';
import {
  countInvalidMediaReferences,
  sanitizeComposerContent,
} from '../utils/composerContent';
import { utcToZonedDateTime, zonedDateTimeToUtc } from '../utils/time';

const REWRITE_TONES = [
  'Professional',
  'Casual',
  'Educational',
  'Energetic',
  'Concise',
  'Storytelling',
];

function normalizeDateParam(value: string | null): string {
  if (!value) return '';
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return '';

  const normalized = match[1];
  const parsed = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? '' : normalized;
}

function normalizeTimeParam(value: string | null): string {
  if (!value) return '18:00';
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '18:00';
}

function isPlatformSpecificContent(
  content: PlatformSpecificContent | undefined,
): content is PlatformSpecificContent {
  return Boolean(content);
}

export function CreatePostPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get('edit');
  const dateParam = normalizeDateParam(searchParams.get('date'));
  const timeParam = normalizeTimeParam(searchParams.get('time'));
  const mediaIdParam = searchParams.get('mediaId');
  const fromPipelineId = searchParams.get('fromPipeline');
  const titleParam = searchParams.get('title');
  const platformsParam = searchParams.get('platforms');

  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  ) || state.workspaces[0];
  const availableAccounts = getWorkspaceAccounts(state);
  const workspaceMedia = getWorkspaceMedia(state);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<'original' | Platform>('original');
  const [isScheduling, setIsScheduling] = useState(Boolean(dateParam));
  const [scheduleDate, setScheduleDate] = useState(dateParam);
  const [scheduleTime, setScheduleTime] = useState(timeParam);
  const [resolvedMediaUrls, setResolvedMediaUrls] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const navigationBypassRef = useRef(false);

  const [originalContent, setOriginalContent] = useState<PostContent>({
    caption: titleParam ? `${titleParam}\n\n` : '',
    mediaIds:
      mediaIdParam && workspaceMedia.some((asset) => asset.id === mediaIdParam)
        ? [mediaIdParam]
        : [],
  });
  const [platformContents, setPlatformContents] = useState<
    Partial<Record<Platform, PlatformSpecificContent>>
  >({});

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [activeAISuggestion, setActiveAISuggestion] = useState<{
    tool: string;
    originalText: string;
    resultText: string;
    hooks?: string[];
    hashtags?: string[];
  } | null>(null);
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [selectedRewriteTone, setSelectedRewriteTone] = useState<string>('Professional');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !navigationBypassRef.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const shouldLeave = window.confirm(
      'You have unsaved Composer changes. Leave without saving?',
    );

    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    navigationBypassRef.current = false;
    setIsDirty(true);
  };

  const markSaved = () => {
    navigationBypassRef.current = true;
    setIsDirty(false);
  };

  useEffect(() => {
    navigationBypassRef.current = false;
    setIsDirty(false);

    if (editId) {
      const existing = state.posts.find(
        (post) =>
          post.id === editId &&
          post.workspaceId === state.activeWorkspaceId,
      );

      if (!existing) {
        toast.error('Post not found in the active workspace');
        navigationBypassRef.current = true;
        navigate('/posts', { replace: true });
        return;
      }

      if (existing) {
        const availableAccountIds = new Set(
          availableAccounts.map((account) => account.id),
        );
        setSelectedAccountIds(
          existing.destinationAccountIds.filter((accountId) =>
            availableAccountIds.has(accountId),
          ),
        );
        setOriginalContent(existing.originalContent);

        const existingPlatformContents: Partial<
          Record<Platform, PlatformSpecificContent>
        > = {};
        existing.platformContent.forEach((platformContent) => {
          existingPlatformContents[platformContent.platform] = {
            ...platformContent,
            enabled: true,
          };
        });
        setPlatformContents(existingPlatformContents);

        if (existing.scheduledAt && activeWorkspace?.timezone) {
          setIsScheduling(true);
          try {
            const zonedSchedule = utcToZonedDateTime(
              existing.scheduledAt,
              activeWorkspace.timezone,
            );
            setScheduleDate(zonedSchedule.date);
            setScheduleTime(zonedSchedule.time);
          } catch {
            setScheduleDate('');
            setScheduleTime('18:00');
          }
        }
      }
    } else if (platformsParam) {
      const targetPlatforms = platformsParam.split(',');
      const matchedAccountIds = availableAccounts
        .filter((account) => targetPlatforms.includes(account.platform))
        .map((account) => account.id);
      if (matchedAccountIds.length > 0) {
        setSelectedAccountIds(matchedAccountIds);
      }
    } else if (availableAccounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds([availableAccounts[0].id]);
    }
  }, [
    editId,
    state.posts,
    state.socialAccounts,
    state.activeWorkspaceId,
    platformsParam,
    activeWorkspace?.timezone,
  ]);

  useEffect(() => {
    let cancelled = false;

    const resolveWorkspaceMedia = async () => {
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

    void resolveWorkspaceMedia();

    return () => {
      cancelled = true;
    };
  }, [state.activeWorkspaceId, state.mediaAssets]);

  const selectedAccounts = availableAccounts.filter((account) =>
    selectedAccountIds.includes(account.id),
  );
  const destinationCapabilities = selectedAccounts.map(getDestinationCapability);
  const hasDemoDestinations = destinationCapabilities.some(
    (capability) => capability.isDemo,
  );
  const hasLocalOnlyDestinations = destinationCapabilities.some(
    (capability) => !capability.canScheduleLive,
  );
  const canPublishLive =
    selectedAccounts.length > 0 &&
    destinationCapabilities.every((capability) => capability.canPublishLive);
  const firstPublishBlockReason = destinationCapabilities.find(
    (capability) => !capability.canPublishLive,
  )?.publishBlockReason;

  const selectedPlatforms = Array.from(
    new Set<Platform>(selectedAccounts.map((account) => account.platform)),
  );

  const currentContentObj = activePreviewTab === 'original'
    ? originalContent
    : platformContents[activePreviewTab]?.content || originalContent;

  const currentContentText = currentContentObj.caption;
  const currentMediaIds = currentContentObj.mediaIds;

  const primaryPlatform = activePreviewTab !== 'original'
    ? activePreviewTab
    : selectedPlatforms[0];
  const recommendedTime = getPrimaryRecommendedTime(primaryPlatform);
  const bestTimes = getRecommendedPostingTimes(activeWorkspace?.id, primaryPlatform);

  const toggleAccount = (id: string) => {
    markDirty();
    setSelectedAccountIds((previous) =>
      previous.includes(id)
        ? previous.filter((accountId) => accountId !== id)
        : [...previous, id],
    );
  };

  const handleAITool = async (tool: string, customTone?: string) => {
    if (!currentContentText.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading(`Consulting AI Assistant for ${tool}...`);

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          content: currentContentText,
          platform: activePreviewTab !== 'original'
            ? activePreviewTab
            : selectedPlatforms[0],
          tone: tool.toLowerCase() === 'rewrite'
            ? customTone || selectedRewriteTone
            : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      toast.dismiss(toastId);

      let resultText = data.result || '';
      let hooks: string[] | undefined;
      let hashtags: string[] | undefined;

      if (data.data && Array.isArray(data.data.hooks)) {
        hooks = data.data.hooks;
        resultText = hooks.join('\n\n');
      } else if (data.data && Array.isArray(data.data.hashtags)) {
        hashtags = data.data.hashtags;
        resultText = hashtags.join(' ');
      }

      const suggestion = {
        tool: tool.toLowerCase() === 'rewrite'
          ? `Rewrite (${customTone || selectedRewriteTone})`
          : tool,
        originalText: currentContentText,
        resultText,
        hooks,
        hashtags,
      };

      setActiveAISuggestion(suggestion);

      const historyItem: AIHistoryItem = {
        id: uuidv4(),
        tool: suggestion.tool,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        originalText: currentContentText,
        resultText,
        hooks,
        hashtags,
      };
      setAiHistory((previous) => [historyItem, ...previous.slice(0, 19)]);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'AI Assistant unavailable';
      toast.error(message, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAISuggestion = (newText: string) => {
    handleContentChange(newText);
    setActiveAISuggestion(null);
    toast.success('Applied to composer');
  };

  const handleInsertAtCursor = (textToInsert: string) => {
    handleContentChange(currentContentText + textToInsert);
    setActiveAISuggestion(null);
    toast.success('Inserted into content');
  };

  const handleContentChange = (text: string) => {
    markDirty();
    if (activePreviewTab === 'original') {
      setOriginalContent((previous) => ({ ...previous, caption: text }));
    } else {
      setPlatformContents((previous) => ({
        ...previous,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: { ...currentContentObj, caption: text },
        },
      }));
    }
  };

  const handleResetPlatformToBase = (platform: Platform) => {
    markDirty();
    setPlatformContents((previous) => {
      const copy = { ...previous };
      delete copy[platform];
      return copy;
    });
    toast.success(`Reset ${platform} content to base`);
  };

  const addMediaToCurrent = (assetId: string) => {
    if (!workspaceMedia.some((asset) => asset.id === assetId)) {
      toast.error('This media asset is not available in the active workspace');
      return;
    }

    if (currentMediaIds.includes(assetId)) {
      setShowMediaModal(false);
      return;
    }

    markDirty();

    if (activePreviewTab === 'original') {
      setOriginalContent((previous) => ({
        ...previous,
        mediaIds: [...previous.mediaIds, assetId],
      }));
    } else {
      setPlatformContents((previous) => ({
        ...previous,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: {
            ...currentContentObj,
            mediaIds: [...currentContentObj.mediaIds, assetId],
          },
        },
      }));
    }
    setShowMediaModal(false);
  };

  const removeMediaFromCurrent = (assetId: string) => {
    markDirty();
    if (activePreviewTab === 'original') {
      setOriginalContent((previous) => ({
        ...previous,
        mediaIds: previous.mediaIds.filter((id) => id !== assetId),
      }));
    } else {
      setPlatformContents((previous) => ({
        ...previous,
        [activePreviewTab]: {
          platform: activePreviewTab,
          enabled: true,
          content: {
            ...currentContentObj,
            mediaIds: currentContentObj.mediaIds.filter((id) => id !== assetId),
          },
        },
      }));
    }
  };

  const getCleanPlatformContent = (): PlatformSpecificContent[] =>
    Object.values(platformContents)
      .filter(isPlatformSpecificContent)
      .filter((platformContent) =>
        selectedPlatforms.includes(platformContent.platform),
      )
      .map((platformContent) => ({
        ...platformContent,
        enabled: true,
      }));

  const getPlatformContentMap = (): Partial<Record<Platform, PostContent>> => {
    const contentMap: Partial<Record<Platform, PostContent>> = {};
    Object.values(platformContents)
      .filter(isPlatformSpecificContent)
      .forEach((platformContent) => {
        contentMap[platformContent.platform] = platformContent.content;
      });
    return contentMap;
  };

  const allowedWorkspaceMediaIds = new Set(
    workspaceMedia.map((asset) => asset.id),
  );
  const cleanPlatformContent = getCleanPlatformContent();
  const invalidMediaReferenceCount = countInvalidMediaReferences(
    originalContent,
    cleanPlatformContent,
    allowedWorkspaceMediaIds,
  );
  const composerValidationIssues = validateComposerDestinations({
    intent: 'draft',
    accounts: selectedAccounts,
    baseContent: originalContent,
    platformContent: getPlatformContentMap(),
  });

  const getSanitizedComposerContent = () =>
    sanitizeComposerContent(
      originalContent,
      getCleanPlatformContent(),
      new Set(workspaceMedia.map((asset) => asset.id)),
      new Set(selectedPlatforms),
    );

  const applySanitizedContentState = (
    sanitized: ReturnType<typeof sanitizeComposerContent>,
  ) => {
    setOriginalContent(sanitized.baseContent);
    const nextPlatformContents: Partial<
      Record<Platform, PlatformSpecificContent>
    > = {};
    sanitized.platformContent.forEach((entry) => {
      nextPlatformContents[entry.platform] = entry;
    });
    setPlatformContents(nextPlatformContents);
  };

  const handleSaveDraft = () => {
    if (selectedAccounts.length === 0) {
      toast.error('Select at least one destination account');
      return;
    }

    const sanitized = getSanitizedComposerContent();
    const existingPost = editId
      ? state.posts.find(
          (candidate) =>
            candidate.id === editId &&
            candidate.workspaceId === state.activeWorkspaceId,
        )
      : undefined;

    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: state.activeWorkspaceId,
      title: originalContent.caption.slice(0, 40).trim() || 'Untitled Draft',
      status: 'draft',
      originalContent: sanitized.baseContent,
      platformContent: sanitized.platformContent,
      destinationAccountIds: selectedAccounts.map((account) => account.id),
      sourceContentItemId:
        fromPipelineId || existingPost?.sourceContentItemId || undefined,
      createdAt: existingPost?.createdAt || new Date().toISOString(),
    };

    applySanitizedContentState(sanitized);
    markSaved();

    if (sanitized.removedMediaReferenceCount > 0) {
      toast(
        `Removed ${sanitized.removedMediaReferenceCount} unavailable or duplicate media reference(s).`,
      );
    }

    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
      toast.success('Draft updated');
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
      toast.success('Draft saved');
      navigate(`/create?edit=${post.id}`, { replace: true });
    }
  };

  const handleScheduleOrPublish = (status: 'scheduled' | 'published') => {
    const sanitized = getSanitizedComposerContent();
    const sanitizedPlatformMap: Partial<Record<Platform, PostContent>> = {};
    sanitized.platformContent.forEach((entry) => {
      sanitizedPlatformMap[entry.platform] = entry.content;
    });

    const intent = status === 'published' ? 'publish' : 'schedule';
    const validationIssues = validateComposerDestinations({
      intent,
      accounts: selectedAccounts,
      baseContent: sanitized.baseContent,
      platformContent: sanitizedPlatformMap,
    });
    const blockingIssue = getFirstBlockingIssue(validationIssues);

    if (blockingIssue) {
      toast.error(blockingIssue.message);
      return;
    }

    if (status === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      toast.error('Select a date and time for scheduling');
      return;
    }

    let scheduledAt: string | undefined;
    if (status === 'scheduled') {
      if (!activeWorkspace?.timezone) {
        toast.error('Workspace timezone is not configured');
        return;
      }

      try {
        scheduledAt = zonedDateTimeToUtc(
          scheduleDate,
          scheduleTime,
          activeWorkspace.timezone,
        );
      } catch {
        toast.error('Select a valid scheduling date and time for this workspace');
        return;
      }
    }

    const existingPost = editId
      ? state.posts.find(
          (candidate) =>
            candidate.id === editId &&
            candidate.workspaceId === state.activeWorkspaceId,
        )
      : undefined;

    const post: Post = {
      id: editId || uuidv4(),
      workspaceId: state.activeWorkspaceId,
      title:
        sanitized.baseContent.caption.slice(0, 40).trim() ||
        'Untitled Post',
      status,
      scheduledAt,
      publishedAt: undefined,
      originalContent: sanitized.baseContent,
      platformContent: sanitized.platformContent,
      destinationAccountIds: selectedAccounts.map((account) => account.id),
      sourceContentItemId:
        fromPipelineId || existingPost?.sourceContentItemId || undefined,
      createdAt: existingPost?.createdAt || new Date().toISOString(),
    };

    applySanitizedContentState(sanitized);
    markSaved();

    if (sanitized.removedMediaReferenceCount > 0) {
      toast(
        `Removed ${sanitized.removedMediaReferenceCount} unavailable or duplicate media reference(s).`,
      );
    }

    if (editId) {
      dispatch({ type: 'UPDATE_POST', payload: post });
    } else {
      dispatch({ type: 'ADD_POST', payload: post });
    }

    if (status === 'scheduled') {
      toast.success(
        hasLocalOnlyDestinations
          ? 'Scheduled locally for planning. Nothing was sent to a social platform.'
          : 'Post scheduled successfully.',
      );
      navigate('/calendar');
      return;
    }

    toast.success('Post published successfully.');
    navigate('/calendar');
  };

  const handleCreateExperimentFromVariation = (
    variantContent: string,
    strategyName: string,
  ) => {
    const newExperiment: Experiment = {
      id: uuidv4(),
      workspaceId: state.activeWorkspaceId,
      name: `Variation Test: ${strategyName} vs Original`,
      type: 'caption',
      hypothesis: `Testing ${strategyName} strategy against original baseline to lift audience engagement and retention.`,
      primaryMetric: 'Engagement Rate',
      status: 'draft',
      variantA: {
        label: 'Variant A (Current Base)',
        metric: 0,
        content: originalContent.caption,
      },
      variantB: {
        label: `Variant B (${strategyName})`,
        metric: 0,
        content: variantContent,
      },
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EXPERIMENT', payload: newExperiment });
    toast.success(`Created Experiment "${newExperiment.name}"`);
    navigate('/experiments');
  };

  const uniqueCurrentMediaIds = Array.from(new Set(currentMediaIds));
  const activeMediaAssets: MediaAsset[] = uniqueCurrentMediaIds
    .map((id) => workspaceMedia.find((asset) => asset.id === id))
    .filter((asset): asset is MediaAsset => Boolean(asset));

  const activeConfig = activePreviewTab !== 'original'
    ? PLATFORM_CONFIGS[activePreviewTab]
    : null;
  const isOverLimit = Boolean(
    activeConfig && currentContentText.length > activeConfig.prototypeCaptionLimit,
  );

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      <div className="flex-1 lg:max-w-[62%] flex flex-col h-full border-r border-[#EBEBE9] overflow-y-auto">
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Composer</h1>
              <p className="text-[12px] text-zinc-500 mt-0.5">
                Draft, optimize with Creator Intelligence, and schedule across all platforms
              </p>
            </div>

            {fromPipelineId && (
              <span className="text-[11px] font-medium bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full flex items-center">
                Linked to Pipeline Item
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Destination Accounts ({selectedAccountIds.length})
              </label>
              <button
                onClick={() => {
                  markDirty();
                  setSelectedAccountIds(availableAccounts.map((account) => account.id));
                }}
                className="text-[11px] text-brand-600 hover:underline font-medium"
              >
                Select All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableAccounts.map((account) => {
                const isSelected = selectedAccountIds.includes(account.id);
                return (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 text-brand-800 shadow-xs ring-1 ring-brand-500/20'
                        : 'border-[#EBEBE9] bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <PlatformIcon platform={account.platform} className="w-3.5 h-3.5 mr-2" />
                    <span className="mr-1.5">{account.displayName}</span>
                    {account.connectionMode === 'demo' && (
                      <span className="mr-1.5 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                        Demo
                      </span>
                    )}
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-600 ml-1" />}
                  </button>
                );
              })}
              {availableAccounts.length === 0 && (
                <div className="text-[12px] text-zinc-500 italic bg-[#FAFAF9] p-3 rounded-lg border border-[#EBEBE9] w-full">
                  No social accounts connected in this workspace. Visit Settings to connect channels.
                </div>
              )}
            </div>

            {selectedAccounts.length > 0 && (hasDemoDestinations || !canPublishLive) && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <p className="text-[11px] font-semibold text-amber-900">
                    Local planning destination
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                    Drafts and local scheduling are available. Live publishing is not active for these destinations yet.
                    {firstPublishBlockReason ? ` ${firstPublishBlockReason}` : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#EBEBE9] pb-0.5">
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActivePreviewTab('original')}
                  className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activePreviewTab === 'original'
                      ? 'border-brand-600 text-brand-700 font-semibold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Original Base
                </button>
                {selectedPlatforms.map((platform) => {
                  const isCustomized = Boolean(platformContents[platform]);
                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePreviewTab(platform)}
                      className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${
                        activePreviewTab === platform
                          ? 'border-brand-600 text-brand-700 font-semibold'
                          : 'border-transparent text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <PlatformIcon platform={platform} className="w-3.5 h-3.5 mr-1.5" />
                      <span className="capitalize">{PLATFORM_CONFIGS[platform]?.displayName || platform}</span>
                      <span
                        className={`ml-1.5 rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                          isCustomized
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {isCustomized ? 'Customized' : 'Inherits base'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedPlatforms.length > 1 && (
                <button
                  onClick={() => setShowOptimizeModal(true)}
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-md flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  <span>Optimize All Destinations</span>
                </button>
              )}
            </div>

            <div className="bg-white border border-[#EBEBE9] rounded-xl shadow-xs overflow-hidden focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
              <textarea
                value={currentContentText}
                onChange={(event) => handleContentChange(event.target.value)}
                placeholder={activeConfig
                  ? activeConfig.placeholderText
                  : 'Write an engaging, high-signal post with hooks and clear takeaways...'}
                className="w-full min-h-[160px] p-4 text-[14px] text-zinc-900 resize-y focus:outline-none placeholder-zinc-400 font-sans leading-relaxed"
              />

              {uniqueCurrentMediaIds.length > 0 && (
                <div className="px-4 pb-3 flex gap-3 overflow-x-auto">
                  {uniqueCurrentMediaIds.map((mediaId) => {
                    const asset = workspaceMedia.find((media) => media.id === mediaId);
                    if (!asset) return null;
                    return (
                      <div key={mediaId} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#EBEBE9] group shrink-0 bg-zinc-100">
                        {asset.type === 'image' ? (
                          <img src={resolvedMediaUrls[asset.id] || asset.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">Video</div>
                        )}
                        <button
                          onClick={() => removeMediaFromCurrent(mediaId)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2 bg-[#FAFAF9] border-t border-[#F2F2F0]">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowMediaModal(true)}
                    className="flex items-center px-2.5 py-1 text-zinc-600 hover:bg-zinc-200/70 rounded-md text-[12px] font-medium transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                    Attach Media ({uniqueCurrentMediaIds.length})
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  {activeConfig && (
                    <span className={`font-medium ${isOverLimit ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                      {currentContentText.length} / ~{activeConfig.prototypeCaptionLimit} chars
                    </span>
                  )}
                  {!activeConfig && (
                    <span className="text-zinc-400 font-medium">{currentContentText.length} chars</span>
                  )}
                </div>
              </div>
            </div>

            {(composerValidationIssues.length > 0 || invalidMediaReferenceCount > 0) && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-[11px] font-semibold text-rose-900">
                      Composer needs attention
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-rose-800">
                      {composerValidationIssues.slice(0, 3).map((issue, index) => (
                        <li key={`${issue.code}-${issue.platform || 'base'}-${index}`}>
                          • {issue.message}
                        </li>
                      ))}
                      {invalidMediaReferenceCount > 0 && (
                        <li>
                          • {invalidMediaReferenceCount} unavailable or duplicate media reference(s) will be removed when saved.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[12px] font-semibold text-brand-600 flex items-center mr-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI Assist:
              </span>

              {['Improve', 'Hook', 'Shorten', 'Hashtags'].map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleAITool(tool)}
                  disabled={isGeneratingAI}
                  className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-white border border-[#DCDCD8] hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800 rounded-md transition-all shadow-2xs disabled:opacity-50"
                >
                  {tool}
                </button>
              ))}

              <div className="relative inline-block">
                <div className="flex rounded-md shadow-2xs">
                  <button
                    onClick={() => handleAITool('Rewrite', selectedRewriteTone)}
                    disabled={isGeneratingAI}
                    className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-white border border-[#DCDCD8] hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800 rounded-l-md transition-all disabled:opacity-50"
                  >
                    Rewrite ({selectedRewriteTone})
                  </button>
                  <button
                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                    className="px-1.5 py-1 bg-[#FAFAF9] border-t border-r border-b border-[#DCDCD8] text-zinc-500 hover:text-zinc-800 rounded-r-md"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {showToneDropdown && (
                  <div className="absolute left-0 mt-1 w-36 bg-white border border-[#EBEBE9] rounded-lg shadow-lg z-20 py-1 text-[12px]">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-400">Select Tone</div>
                    {REWRITE_TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => {
                          setSelectedRewriteTone(tone);
                          setShowToneDropdown(false);
                          handleAITool('Rewrite', tone);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-brand-50 ${
                          selectedRewriteTone === tone
                            ? 'font-semibold text-brand-700 bg-brand-50/40'
                            : 'text-zinc-700'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {activeAISuggestion && (
              <AIResultPanel
                tool={activeAISuggestion.tool}
                originalText={activeAISuggestion.originalText}
                resultText={activeAISuggestion.resultText}
                hooks={activeAISuggestion.hooks}
                hashtags={activeAISuggestion.hashtags}
                onApply={handleApplyAISuggestion}
                onInsert={handleInsertAtCursor}
                onRegenerate={() => handleAITool(activeAISuggestion.tool)}
                onDiscard={() => setActiveAISuggestion(null)}
                history={aiHistory}
                onRestoreFromHistory={(item) => {
                  setActiveAISuggestion({
                    tool: item.tool,
                    originalText: item.originalText,
                    resultText: item.resultText,
                    hooks: item.hooks,
                    hashtags: item.hashtags,
                  });
                }}
              />
            )}

            <CreatorIntelligencePanel
              content={currentContentText}
              platform={activePreviewTab !== 'original'
                ? activePreviewTab
                : selectedPlatforms[0]}
              platforms={selectedPlatforms}
              onApplyContent={handleContentChange}
              onCreateExperiment={handleCreateExperimentFromVariation}
            />
          </div>
        </div>

        <div className="p-5 border-t border-[#EBEBE9] bg-[#FAFAF9] shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1 max-w-sm">
              {isScheduling && (
                <div className="p-3 bg-white border border-[#EBEBE9] rounded-xl shadow-xs mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] font-semibold text-zinc-700 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                      Schedule Posting Time
                    </h4>
                    <button
                      onClick={() => {
                        markDirty();
                        setScheduleTime(recommendedTime);
                      }}
                      className="text-[11px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded flex items-center transition-colors"
                      title={`Prototype suggested time: ${recommendedTime}`}
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Suggested: {recommendedTime}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => {
                        markDirty();
                        setScheduleDate(event.target.value);
                      }}
                      className="flex-1 min-w-0 border border-[#DCDCD8] rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(event) => {
                        markDirty();
                        setScheduleTime(event.target.value);
                      }}
                      className="w-28 border border-[#DCDCD8] rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  {bestTimes.length > 0 && (
                    <div className="text-[10px] text-zinc-400 mt-1.5">
                      Prototype suggestion: {bestTimes[0].dayName} at {bestTimes[0].time} ({bestTimes[0].reason})
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSaveDraft}
                className="flex items-center px-3.5 py-2 text-zinc-600 font-medium text-[12px] hover:bg-zinc-200/60 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save as Draft
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  markDirty();
                  setIsScheduling(!isScheduling);
                }}
                className={`flex items-center px-3.5 py-2 font-medium text-[12px] rounded-lg transition-colors ${
                  isScheduling
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-white border border-[#DCDCD8] text-zinc-700 hover:bg-zinc-50 shadow-2xs'
                }`}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {isScheduling ? 'Scheduling' : 'Set Schedule'}
              </button>

              <button
                onClick={() => handleScheduleOrPublish(isScheduling ? 'scheduled' : 'published')}
                title={!isScheduling && !canPublishLive ? firstPublishBlockReason || 'Live publishing is not available yet.' : undefined}
                className={`flex items-center px-4 py-2 font-medium text-[12px] rounded-lg transition-colors shadow-xs ${
                  !isScheduling && !canPublishLive
                    ? 'bg-zinc-300 text-zinc-600 hover:bg-zinc-300'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isScheduling
                  ? hasLocalOnlyDestinations
                    ? 'Schedule Locally'
                    : 'Schedule Post'
                  : canPublishLive
                    ? 'Publish Now'
                    : 'Live Publish Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[38%] bg-[#FAFAF9] flex-col overflow-y-auto border-l border-[#EBEBE9]">
        <div className="sticky top-0 p-3.5 border-b border-[#EBEBE9] bg-white/90 backdrop-blur z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {activePreviewTab === 'original'
                ? 'Base Content Preview'
                : `${PLATFORM_CONFIGS[activePreviewTab]?.displayName || activePreviewTab} Preview`}
            </span>
          </div>

          {activePreviewTab !== 'original' && platformContents[activePreviewTab] && (
            <button
              onClick={() => handleResetPlatformToBase(activePreviewTab)}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Base</span>
            </button>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col items-center justify-start">
          {activePreviewTab === 'original' ? (
            <div className="w-full max-w-sm bg-white rounded-xl shadow-xs border border-[#EBEBE9] overflow-hidden text-[13px]">
              <div className="p-4 border-b border-[#F2F2F0] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-[12px]">
                    CL
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 leading-tight">{activeWorkspace?.name || 'Creator Lab'}</div>
                    <div className="text-[11px] text-zinc-400">Multi-Channel Base Draft</div>
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {selectedPlatforms.map((platform) => (
                    <div key={platform} className="w-5 h-5 rounded-full bg-white border border-[#EBEBE9] flex items-center justify-center p-0.5">
                      <PlatformIcon platform={platform} className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="text-[13px] text-zinc-800 whitespace-pre-wrap leading-relaxed mb-4">
                  {currentContentText || (
                    <span className="text-zinc-400 italic">Enter caption text in composer to preview...</span>
                  )}
                </div>

                {activeMediaAssets.length > 0 ? (
                  <div className="w-full rounded-lg overflow-hidden border border-[#F2F2F0] bg-zinc-100 max-h-60 flex items-center justify-center">
                    <img
                      src={resolvedMediaUrls[activeMediaAssets[0].id] || activeMediaAssets[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 bg-[#FAFAF9] rounded-lg flex flex-col items-center justify-center text-zinc-400 border border-dashed border-[#EBEBE9]">
                    <ImageIcon className="w-5 h-5 mb-1" />
                    <span className="text-[11px]">No media attached</span>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 bg-[#FAFAF9] border-t border-[#EBEBE9] text-[11px] text-zinc-500 flex justify-between">
                <span>Base Template</span>
                <span>Applies to all uncustomized channels</span>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <PlatformPreviewRenderer
                platform={activePreviewTab}
                account={availableAccounts.find(
                  (account) => account.platform === activePreviewTab
                    && selectedAccountIds.includes(account.id),
                )}
                caption={currentContentText}
                mediaAssets={activeMediaAssets}
                isCustomized={Boolean(platformContents[activePreviewTab])}
                onResetToBase={() => handleResetPlatformToBase(activePreviewTab)}
              />
            </div>
          )}
        </div>
      </div>

      <PlatformOptimizationModal
        baseContent={originalContent.caption}
        selectedPlatforms={selectedPlatforms}
        isOpen={showOptimizeModal}
        onClose={() => setShowOptimizeModal(false)}
        onApplyOptimization={(platform, adaptedText) => {
          markDirty();
          setPlatformContents((previous) => ({
            ...previous,
            [platform]: {
              platform,
              enabled: true,
              content: {
                caption: adaptedText,
                mediaIds: previous[platform]?.content.mediaIds || originalContent.mediaIds,
              },
            },
          }));
          toast.success(`Adapted for ${platform}`);
        }}
        onApplyAll={(optimizations) => {
          markDirty();
          const next = { ...platformContents };
          Object.entries(optimizations).forEach(([platformId, text]) => {
            const platform = platformId as Platform;
            next[platform] = {
              platform,
              enabled: true,
              content: {
                caption: text,
                mediaIds: next[platform]?.content.mediaIds || originalContent.mediaIds,
              },
            };
          });
          setPlatformContents(next);
          toast.success(`Applied customizations for ${Object.keys(optimizations).length} platforms`);
        }}
      />

      {showMediaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-[#EBEBE9]">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9]">
              <div>
                <h3 className="font-semibold text-zinc-900 text-[14px]">Select Media from Library</h3>
                <p className="text-[11px] text-zinc-500">Pick images or videos from this workspace</p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 bg-white">
              {workspaceMedia.map((asset) => {
                const isAttached = currentMediaIds.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (isAttached) {
                        removeMediaFromCurrent(asset.id);
                      } else {
                        addMediaToCurrent(asset.id);
                      }
                    }}
                    className={`aspect-square bg-zinc-100 rounded-xl overflow-hidden border cursor-pointer group relative transition-all ${
                      isAttached
                        ? 'border-brand-500 ring-2 ring-brand-400'
                        : 'border-[#EBEBE9] hover:border-brand-400'
                    }`}
                  >
                    {asset.type === 'image' ? (
                      <img src={resolvedMediaUrls[asset.id] || asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">Video</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {isAttached && (
                      <div className="absolute top-1.5 right-1.5 bg-brand-600 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {workspaceMedia.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-700">No media available</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Upload assets in the Media Library first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
