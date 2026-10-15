import React, { createContext, useContext, useEffect, useReducer } from 'react';
import {
  AppState,
  ContentItem,
  Experiment,
  MediaAsset,
  MediaFolder,
  Post,
  SocialAccount,
  Workspace,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  PERSISTED_STATE_KEY,
  deserializePersistedState,
  serializePersistedState,
} from '../state/persistence';
import {
  removeMediaReferenceFromPost,
  syncPipelineStageFromPost,
} from '../utils/contentOperations';
import {
  detachSocialAccount,
  syncPostDestinations,
} from '../domain/postDestinations';

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
  postDestinations: [],
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

/**
 * Brand-new users start with their own empty workspace instead of fictional
 * social accounts, engagement charts and demo posts.
 * Existing versioned localStorage data is loaded above and is never cleared here.
 */
export function createSeedState(): AppState {
  const workspace: Workspace = {
    id: uuidv4(),
    name: 'My Workspace',
    plan: 'free',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    createdAt: new Date().toISOString(),
  };
  return { ...initialState, workspaces: [workspace], activeWorkspaceId: workspace.id };
}

export function appReducer(state: AppState, action: Action): AppState {
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
        postDestinations: state.postDestinations.filter(
          (destination) => destination.workspaceId !== targetWorkspaceId,
        ),
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
      return {
        ...state,
        postDestinations: syncPostDestinations(
          state.postDestinations,
          action.payload,
          state.socialAccounts,
        ),
        posts: [...state.posts, action.payload],
        pipelineItems: syncPipelineStageFromPost(
          state.pipelineItems,
          action.payload,
        ),
      };

    case 'UPDATE_POST':
      return {
        ...state,
        postDestinations: syncPostDestinations(
          state.postDestinations,
          action.payload,
          state.socialAccounts,
        ),
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post,
        ),
        pipelineItems: syncPipelineStageFromPost(
          state.pipelineItems,
          action.payload,
        ),
      };

    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
        postDestinations: state.postDestinations.filter(
          (destination) => destination.postId !== action.payload,
        ),
        postPerformances: state.postPerformances.filter(
          (performance) => performance.postId !== action.payload,
        ),
        experiments: state.experiments.map((experiment) =>
          experiment.sourcePostId === action.payload
            ? { ...experiment, sourcePostId: undefined }
            : experiment,
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

    case 'REMOVE_SOCIAL_ACCOUNT': {
      const removedAccount = state.socialAccounts.find(
        (account) => account.id === action.payload,
      );
      const socialAccounts = state.socialAccounts.filter(
        (account) => account.id !== action.payload,
      );
      const remainingAccountsById = new Map(
        socialAccounts.map((account) => [account.id, account]),
      );

      const posts = state.posts.map((post) => {
        if (!post.destinationAccountIds.includes(action.payload)) {
          return post;
        }

        const destinationAccountIds = post.destinationAccountIds.filter(
          (accountId) => accountId !== action.payload,
        );

        const hasSamePlatformDestination =
          removedAccount &&
          destinationAccountIds.some(
            (accountId) =>
              remainingAccountsById.get(accountId)?.platform ===
              removedAccount.platform,
          );

        const platformContent =
          removedAccount && !hasSamePlatformDestination
            ? post.platformContent.filter(
                (entry) => entry.platform !== removedAccount.platform,
              )
            : post.platformContent;

        const losesAllDestinations = destinationAccountIds.length === 0;
        const shouldRequireReview =
          losesAllDestinations &&
          (post.status === 'scheduled' || post.status === 'needs_review');

        return {
          ...post,
          destinationAccountIds,
          platformContent,
          status: shouldRequireReview ? 'needs_review' : post.status,
          scheduledAt: shouldRequireReview ? undefined : post.scheduledAt,
        };
      });

      return {
        ...state,
        socialAccounts,
        posts,
        postDestinations: detachSocialAccount(
          state.postDestinations,
          action.payload,
        ),
      };
    }

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
        mediaAssets: state.mediaAssets.filter(
          (asset) => asset.id !== action.payload,
        ),
        posts: state.posts.map((post) =>
          removeMediaReferenceFromPost(post, action.payload),
        ),
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
        pipelineItems: state.pipelineItems.filter(
          (item) => item.id !== action.payload,
        ),
        posts: state.posts.map((post) =>
          post.sourceContentItemId === action.payload
            ? { ...post, sourceContentItemId: undefined }
            : post,
        ),
        experiments: state.experiments.map((experiment) =>
          experiment.sourceContentItemId === action.payload
            ? { ...experiment, sourceContentItemId: undefined }
            : experiment,
        ),
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
    try {
      const saved = localStorage.getItem(PERSISTED_STATE_KEY);

      if (saved) {
        const persistedState = deserializePersistedState(saved);
        if (persistedState) return persistedState;

        console.warn('Ignoring incompatible or invalid persisted Creator Lab state');
      }
    } catch (error) {
      console.error('Failed to load saved Creator Lab state', error);
    }

    return createSeedState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERSISTED_STATE_KEY, serializePersistedState(state));
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
