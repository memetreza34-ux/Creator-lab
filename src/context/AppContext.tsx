import React, { createContext, useContext, useEffect, useReducer } from 'react';
import {
  AnalyticsMetric,
  AppState,
  ContentItem,
  Experiment,
  MediaAsset,
  MediaFolder,
  PlatformSpecificContent,
  Post,
  SocialAccount,
  Workspace,
} from '../types';
import {
  mockAnalytics,
  mockExperiments,
  mockMediaAssets,
  mockMediaFolders,
  mockPipelineItems,
  mockPostPerformance,
  mockPosts,
  mockSocialAccounts,
  mockWorkspaces,
} from '../data/mockData';

export type { AppState };

export type Action =
  | { type: 'SET_ACTIVE_WORKSPACE'; payload: string }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
  | { type: 'DELETE_WORKSPACE'; payload: string }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_SOCIAL_ACCOUNT'; payload: SocialAccount }
  | { type: 'REMOVE_SOCIAL_ACCOUNT'; payload: string }
  | { type: 'UPDATE_SOCIAL_ACCOUNT'; payload: SocialAccount }
  | { type: 'ADD_MEDIA_ASSET'; payload: MediaAsset }
  | { type: 'UPDATE_MEDIA_ASSET'; payload: MediaAsset }
  | { type: 'REMOVE_MEDIA_ASSET'; payload: string }
  | { type: 'ADD_MEDIA_FOLDER'; payload: MediaFolder }
  | { type: 'UPDATE_MEDIA_FOLDER'; payload: MediaFolder }
  | { type: 'DELETE_MEDIA_FOLDER'; payload: string }
  | { type: 'ADD_PIPELINE_ITEM'; payload: ContentItem }
  | { type: 'UPDATE_PIPELINE_ITEM'; payload: ContentItem }
  | { type: 'BATCH_UPDATE_PIPELINE_ITEMS'; payload: ContentItem[] }
  | { type: 'DELETE_PIPELINE_ITEM'; payload: string }
  | { type: 'ADD_EXPERIMENT'; payload: Experiment }
  | { type: 'UPDATE_EXPERIMENT'; payload: Experiment }
  | { type: 'DELETE_EXPERIMENT'; payload: string };

const initialState: AppState = {
  workspaces: [],
  activeWorkspaceId: '',
  socialAccounts: [],
  posts: [],
  mediaAssets: [],
  mediaFolders: [],
  pipelineItems: [],
  experiments: [],
  analytics: [],
  postPerformances: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function normalizePersistedState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;

  const parsed = raw as Partial<AppState>;
  if (!Array.isArray(parsed.workspaces) || parsed.workspaces.length === 0) return null;

  const now = new Date().toISOString();
  const defaultTimezone = getDefaultTimezone();

  const workspaces: Workspace[] = parsed.workspaces.map((workspace) => ({
    ...workspace,
    timezone: workspace.timezone || defaultTimezone,
    createdAt: workspace.createdAt || now,
  }));

  const fallbackWorkspaceId = workspaces[0].id;
  const activeWorkspaceId = workspaces.some(
    (workspace) => workspace.id === parsed.activeWorkspaceId,
  )
    ? parsed.activeWorkspaceId as string
    : fallbackWorkspaceId;

  const posts: Post[] = (parsed.posts || []).map((post) => ({
    ...post,
    workspaceId: post.workspaceId || activeWorkspaceId,
    platformContent: (post.platformContent || []).map(
      (platformContent): PlatformSpecificContent => ({
        ...platformContent,
        enabled: platformContent.enabled ?? true,
      }),
    ),
  }));

  const pipelineItems: ContentItem[] = (parsed.pipelineItems || []).map(
    (item, index) => ({
      ...item,
      workspaceId: item.workspaceId || activeWorkspaceId,
      order: typeof item.order === 'number' ? item.order : index,
      notes: item.notes || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
    }),
  );

  const analytics: AnalyticsMetric[] = (parsed.analytics || []).map((metric) => ({
    ...metric,
    workspaceId: metric.workspaceId || activeWorkspaceId,
  }));

  return {
    workspaces,
    activeWorkspaceId,
    socialAccounts: parsed.socialAccounts || [],
    posts,
    mediaAssets: parsed.mediaAssets || [],
    mediaFolders: parsed.mediaFolders || [],
    pipelineItems,
    experiments: parsed.experiments || [],
    analytics,
    postPerformances: parsed.postPerformances || [],
  };
}

function createSeedState(): AppState {
  return {
    workspaces: mockWorkspaces,
    activeWorkspaceId: mockWorkspaces[0].id,
    socialAccounts: mockSocialAccounts,
    posts: mockPosts,
    mediaAssets: mockMediaAssets,
    mediaFolders: mockMediaFolders,
    pipelineItems: mockPipelineItems,
    experiments: mockExperiments,
    analytics: mockAnalytics,
    postPerformances: mockPostPerformance,
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_WORKSPACE':
      if (!state.workspaces.some((workspace) => workspace.id === action.payload)) {
        return state;
      }
      return { ...state, activeWorkspaceId: action.payload };

    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };

    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === action.payload.id ? action.payload : workspace,
        ),
      };

    case 'DELETE_WORKSPACE': {
      if (state.workspaces.length <= 1) return state;

      const targetWorkspaceId = action.payload;
      if (!state.workspaces.some((workspace) => workspace.id === targetWorkspaceId)) {
        return state;
      }

      const workspaces = state.workspaces.filter(
        (workspace) => workspace.id !== targetWorkspaceId,
      );
      const activeWorkspaceId = state.activeWorkspaceId === targetWorkspaceId
        ? workspaces[0].id
        : state.activeWorkspaceId;

      return {
        ...state,
        workspaces,
        activeWorkspaceId,
        posts: state.posts.filter((post) => post.workspaceId !== targetWorkspaceId),
        socialAccounts: state.socialAccounts.filter(
          (account) => account.workspaceId !== targetWorkspaceId,
        ),
        mediaAssets: state.mediaAssets.filter(
          (asset) => asset.workspaceId !== targetWorkspaceId,
        ),
        mediaFolders: state.mediaFolders.filter(
          (folder) => folder.workspaceId !== targetWorkspaceId,
        ),
        pipelineItems: state.pipelineItems.filter(
          (item) => item.workspaceId !== targetWorkspaceId,
        ),
        experiments: state.experiments.filter(
          (experiment) => experiment.workspaceId !== targetWorkspaceId,
        ),
        analytics: state.analytics.filter(
          (metric) => metric.workspaceId !== targetWorkspaceId,
        ),
        postPerformances: state.postPerformances.filter(
          (performance) => performance.workspaceId !== targetWorkspaceId,
        ),
      };
    }

    case 'ADD_POST':
      return { ...state, posts: [...state.posts, action.payload] };

    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post,
        ),
      };

    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
        postPerformances: state.postPerformances.filter(
          (performance) => performance.postId !== action.payload,
        ),
      };

    case 'ADD_SOCIAL_ACCOUNT':
      return { ...state, socialAccounts: [...state.socialAccounts, action.payload] };

    case 'UPDATE_SOCIAL_ACCOUNT':
      return {
        ...state,
        socialAccounts: state.socialAccounts.map((account) =>
          account.id === action.payload.id ? action.payload : account,
        ),
      };

    case 'REMOVE_SOCIAL_ACCOUNT':
      return {
        ...state,
        socialAccounts: state.socialAccounts.filter(
          (account) => account.id !== action.payload,
        ),
      };

    case 'ADD_MEDIA_ASSET':
      return { ...state, mediaAssets: [...state.mediaAssets, action.payload] };

    case 'UPDATE_MEDIA_ASSET':
      return {
        ...state,
        mediaAssets: state.mediaAssets.map((asset) =>
          asset.id === action.payload.id ? action.payload : asset,
        ),
      };

    case 'REMOVE_MEDIA_ASSET':
      return {
        ...state,
        mediaAssets: state.mediaAssets.filter((asset) => asset.id !== action.payload),
      };

    case 'ADD_MEDIA_FOLDER':
      return { ...state, mediaFolders: [...state.mediaFolders, action.payload] };

    case 'UPDATE_MEDIA_FOLDER':
      return {
        ...state,
        mediaFolders: state.mediaFolders.map((folder) =>
          folder.id === action.payload.id ? action.payload : folder,
        ),
      };

    case 'DELETE_MEDIA_FOLDER':
      return {
        ...state,
        mediaFolders: state.mediaFolders.filter(
          (folder) => folder.id !== action.payload,
        ),
        mediaAssets: state.mediaAssets.map((asset) =>
          asset.folderId === action.payload
            ? { ...asset, folderId: undefined }
            : asset,
        ),
      };

    case 'ADD_PIPELINE_ITEM':
      return { ...state, pipelineItems: [...state.pipelineItems, action.payload] };

    case 'UPDATE_PIPELINE_ITEM':
      return {
        ...state,
        pipelineItems: state.pipelineItems.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };

    case 'BATCH_UPDATE_PIPELINE_ITEMS': {
      const updates = new Map(action.payload.map((item) => [item.id, item]));
      return {
        ...state,
        pipelineItems: state.pipelineItems.map(
          (item) => updates.get(item.id) || item,
        ),
      };
    }

    case 'DELETE_PIPELINE_ITEM':
      return {
        ...state,
        pipelineItems: state.pipelineItems.filter((item) => item.id !== action.payload),
      };

    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.payload] };

    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map((experiment) =>
          experiment.id === action.payload.id ? action.payload : experiment,
        ),
      };

    case 'DELETE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.filter(
          (experiment) => experiment.id !== action.payload,
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    const saved = localStorage.getItem('creator_lab_state');

    if (saved) {
      try {
        const normalized = normalizePersistedState(JSON.parse(saved));
        if (normalized) return normalized;
      } catch (error) {
        console.error('Failed to parse saved Creator Lab state', error);
      }
    }

    return createSeedState();
  });

  useEffect(() => {
    try {
      localStorage.setItem('creator_lab_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist Creator Lab state', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
