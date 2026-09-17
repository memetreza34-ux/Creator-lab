import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Workspace, SocialAccount, Post, MediaAsset, 
  ContentItem, Experiment, AnalyticsMetric 
} from '../types';
import { 
  mockWorkspaces, mockSocialAccounts, mockPosts, 
  mockMediaAssets, mockPipelineItems, mockExperiments, mockAnalytics
} from '../data/mockData';

interface AppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  socialAccounts: SocialAccount[];
  posts: Post[];
  mediaAssets: MediaAsset[];
  pipelineItems: ContentItem[];
  experiments: Experiment[];
  analytics: AnalyticsMetric[];
}

type Action = 
  | { type: 'SET_ACTIVE_WORKSPACE'; payload: string }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_SOCIAL_ACCOUNT'; payload: SocialAccount }
  | { type: 'REMOVE_SOCIAL_ACCOUNT'; payload: string }
  | { type: 'ADD_MEDIA_ASSET'; payload: MediaAsset }
  | { type: 'REMOVE_MEDIA_ASSET'; payload: string }
  | { type: 'ADD_PIPELINE_ITEM'; payload: ContentItem }
  | { type: 'UPDATE_PIPELINE_ITEM'; payload: ContentItem }
  | { type: 'DELETE_PIPELINE_ITEM'; payload: string };

const initialState: AppState = {
  workspaces: [],
  activeWorkspaceId: '',
  socialAccounts: [],
  posts: [],
  mediaAssets: [],
  pipelineItems: [],
  experiments: [],
  analytics: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_WORKSPACE':
      return { ...state, activeWorkspaceId: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [...state.posts, action.payload] };
    case 'UPDATE_POST':
      return { ...state, posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter(p => p.id !== action.payload) };
    case 'ADD_SOCIAL_ACCOUNT':
      return { ...state, socialAccounts: [...state.socialAccounts, action.payload] };
    case 'REMOVE_SOCIAL_ACCOUNT':
      return { ...state, socialAccounts: state.socialAccounts.filter(a => a.id !== action.payload) };
    case 'ADD_MEDIA_ASSET':
      return { ...state, mediaAssets: [...state.mediaAssets, action.payload] };
    case 'REMOVE_MEDIA_ASSET':
      return { ...state, mediaAssets: state.mediaAssets.filter(m => m.id !== action.payload) };
    case 'ADD_PIPELINE_ITEM':
      return { ...state, pipelineItems: [...state.pipelineItems, action.payload] };
    case 'UPDATE_PIPELINE_ITEM':
      return { ...state, pipelineItems: state.pipelineItems.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PIPELINE_ITEM':
      return { ...state, pipelineItems: state.pipelineItems.filter(p => p.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const saved = localStorage.getItem('creator_lab_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.workspaces && parsed.workspaces.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    
    // Seed data
    return {
      workspaces: mockWorkspaces,
      activeWorkspaceId: mockWorkspaces[0].id,
      socialAccounts: mockSocialAccounts,
      posts: mockPosts,
      mediaAssets: mockMediaAssets,
      pipelineItems: mockPipelineItems,
      experiments: mockExperiments,
      analytics: mockAnalytics
    };
  });

  useEffect(() => {
    localStorage.setItem('creator_lab_state', JSON.stringify(state));
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
