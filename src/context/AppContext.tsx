import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  Workspace, SocialAccount, Post, MediaAsset, 
  ContentItem, Experiment, AnalyticsMetric, MediaFolder,
  PostPerformance, AppState
} from '../types';
import { 
  mockWorkspaces, mockSocialAccounts, mockPosts, 
  mockMediaAssets, mockMediaFolders, mockPipelineItems, 
  mockExperiments, mockAnalytics, mockPostPerformance
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
  postPerformances: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_WORKSPACE':
      return { ...state, activeWorkspaceId: action.payload };

    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };

    case 'UPDATE_WORKSPACE':
      return { 
        ...state, 
        workspaces: state.workspaces.map(w => w.id === action.payload.id ? action.payload : w) 
      };

    case 'DELETE_WORKSPACE': {
      if (state.workspaces.length <= 1) return state; // Prevent deleting the final workspace
      const targetWorkspaceId = action.payload;
      const newWorkspaces = state.workspaces.filter(w => w.id !== targetWorkspaceId);
      const newActiveId = state.activeWorkspaceId === targetWorkspaceId 
        ? newWorkspaces[0].id 
        : state.activeWorkspaceId;

      // Clean, complete cascade deletion: remove all orphaned resources belonging to this workspace
      return { 
        ...state, 
        workspaces: newWorkspaces,
        activeWorkspaceId: newActiveId,
        posts: state.posts.filter(p => p.workspaceId !== targetWorkspaceId),
        socialAccounts: state.socialAccounts.filter(a => a.workspaceId !== targetWorkspaceId),
        mediaAssets: state.mediaAssets.filter(m => m.workspaceId !== targetWorkspaceId),
        mediaFolders: state.mediaFolders.filter(f => f.workspaceId !== targetWorkspaceId),
        pipelineItems: state.pipelineItems.filter(i => i.workspaceId !== targetWorkspaceId),
        experiments: state.experiments.filter(e => e.workspaceId !== targetWorkspaceId),
        analytics: state.analytics.filter(a => a.workspaceId !== targetWorkspaceId),
        postPerformances: (state.postPerformances || []).filter(p => p.workspaceId !== targetWorkspaceId)
      };
    }

    case 'ADD_POST':
      return { ...state, posts: [...state.posts, action.payload] };

    case 'UPDATE_POST':
      return { ...state, posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p) };

    case 'DELETE_POST':
      return { 
        ...state, 
        posts: state.posts.filter(p => p.id !== action.payload),
        postPerformances: (state.postPerformances || []).filter(p => p.postId !== action.payload)
      };

    case 'ADD_SOCIAL_ACCOUNT':
      return { ...state, socialAccounts: [...state.socialAccounts, action.payload] };

    case 'UPDATE_SOCIAL_ACCOUNT':
      return { 
        ...state, 
        socialAccounts: state.socialAccounts.map(a => a.id === action.payload.id ? action.payload : a) 
      };

    case 'REMOVE_SOCIAL_ACCOUNT':
      return { ...state, socialAccounts: state.socialAccounts.filter(a => a.id !== action.payload) };

    case 'ADD_MEDIA_ASSET':
      return { ...state, mediaAssets: [...state.mediaAssets, action.payload] };

    case 'UPDATE_MEDIA_ASSET':
      return { ...state, mediaAssets: state.mediaAssets.map(m => m.id === action.payload.id ? action.payload : m) };

    case 'REMOVE_MEDIA_ASSET':
      return { ...state, mediaAssets: state.mediaAssets.filter(m => m.id !== action.payload) };

    case 'ADD_MEDIA_FOLDER':
      return { ...state, mediaFolders: [...(state.mediaFolders || []), action.payload] };

    case 'UPDATE_MEDIA_FOLDER':
      return { 
        ...state, 
        mediaFolders: (state.mediaFolders || []).map(f => f.id === action.payload.id ? action.payload : f) 
      };

    case 'DELETE_MEDIA_FOLDER':
      return { 
        ...state, 
        mediaFolders: (state.mediaFolders || []).filter(f => f.id !== action.payload),
        mediaAssets: state.mediaAssets.map(m => m.folderId === action.payload ? { ...m, folderId: undefined } : m)
      };

    case 'ADD_PIPELINE_ITEM':
      return { ...state, pipelineItems: [...state.pipelineItems, action.payload] };

    case 'UPDATE_PIPELINE_ITEM':
      return { 
        ...state, 
        pipelineItems: state.pipelineItems.map(p => p.id === action.payload.id ? action.payload : p) 
      };

    case 'BATCH_UPDATE_PIPELINE_ITEMS': {
      const updatedMap = new Map(action.payload.map(item => [item.id, item]));
      return {
        ...state,
        pipelineItems: state.pipelineItems.map(item => updatedMap.get(item.id) || item)
      };
    }

    case 'DELETE_PIPELINE_ITEM':
      return { ...state, pipelineItems: state.pipelineItems.filter(p => p.id !== action.payload) };

    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.payload] };

    case 'UPDATE_EXPERIMENT':
      return { 
        ...state, 
        experiments: state.experiments.map(e => e.id === action.payload.id ? action.payload : e) 
      };

    case 'DELETE_EXPERIMENT':
      return { ...state, experiments: state.experiments.filter(e => e.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    const saved = localStorage.getItem('creator_lab_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.workspaces && parsed.workspaces.length > 0) {
          // Normalize any existing state that may be missing new fields
          const workspaces = parsed.workspaces.map((w: Workspace) => ({
            ...w,
            timezone: w.timezone || 'America/New_York',
            createdAt: w.createdAt || new Date().toISOString()
          }));

          const pipelineItems = (parsed.pipelineItems || []).map((item: ContentItem, idx: number) => ({
            ...item,
            order: typeof item.order === 'number' ? item.order : idx,
            notes: item.notes || ''
          }));

          return {
            ...parsed,
            workspaces,
            mediaFolders: parsed.mediaFolders || mockMediaFolders,
            pipelineItems,
            experiments: parsed.experiments || mockExperiments,
            postPerformances: parsed.postPerformances || mockPostPerformance
          };
        }
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    
    // Default seed data
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
      postPerformances: mockPostPerformance
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('creator_lab_state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state in localStorage', e);
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
