import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { AlertTriangle, Building2, Globe, Plus, Trash2, X } from 'lucide-react';
import { Workspace } from '../types';

const IANA_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time - US & Canada)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time - US & Canada)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time - US & Canada)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time - US & Canada)' },
  { value: 'Europe/London', label: 'Europe/London (GMT / BST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET / CEST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET / CEST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST / AEDT)' },
];

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  ) || state.workspaces[0];

  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [timezone, setTimezone] = useState(activeWorkspace?.timezone || 'UTC');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceTimezone, setNewWorkspaceTimezone] = useState(
    activeWorkspace?.timezone || 'UTC',
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState('');

  useEffect(() => {
    if (!activeWorkspace) return;
    setWorkspaceName(activeWorkspace.name);
    setTimezone(activeWorkspace.timezone);
    setNewWorkspaceTimezone(activeWorkspace.timezone);
  }, [activeWorkspace]);

  const activeWorkspaceId = activeWorkspace?.id;
  const postCount = state.posts.filter(
    (post) => post.workspaceId === activeWorkspaceId,
  ).length;
  const accountCount = state.socialAccounts.filter(
    (account) => account.workspaceId === activeWorkspaceId,
  ).length;
  const mediaCount = state.mediaAssets.filter(
    (asset) => asset.workspaceId === activeWorkspaceId,
  ).length;
  const mediaFolderCount = state.mediaFolders.filter(
    (folder) => folder.workspaceId === activeWorkspaceId,
  ).length;
  const pipelineCount = state.pipelineItems.filter(
    (item) => item.workspaceId === activeWorkspaceId,
  ).length;
  const experimentCount = state.experiments.filter(
    (experiment) => experiment.workspaceId === activeWorkspaceId,
  ).length;
  const canDeleteWorkspace = state.workspaces.length > 1;

  const handleSave = () => {
    if (!activeWorkspace) return;

    const updated: Workspace = {
      ...activeWorkspace,
      name: workspaceName.trim() || activeWorkspace.name,
      timezone,
    };

    dispatch({ type: 'UPDATE_WORKSPACE', payload: updated });
    toast.success('Workspace settings updated successfully');
  };

  const openDeleteModal = () => {
    if (!canDeleteWorkspace) {
      toast.error('The final workspace cannot be deleted');
      return;
    }
    setConfirmNameInput('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!activeWorkspace || !canDeleteWorkspace) {
      toast.error('The final workspace cannot be deleted');
      setShowDeleteModal(false);
      return;
    }

    if (confirmNameInput !== activeWorkspace.name) {
      toast.error('Workspace name does not match');
      return;
    }

    dispatch({ type: 'DELETE_WORKSPACE', payload: activeWorkspace.id });
    setShowDeleteModal(false);
    setConfirmNameInput('');
    toast.success(`Deleted workspace "${activeWorkspace.name}"`);
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const newWorkspace: Workspace = {
      id: uuidv4(),
      name: newWorkspaceName.trim(),
      plan: 'free',
      timezone: newWorkspaceTimezone,
      createdAt: new Date().toISOString(),
      dataMode: 'standard',
    };

    dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
    dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: newWorkspace.id });
    setNewWorkspaceName('');
    setShowCreateModal(false);
    toast.success(`Workspace "${newWorkspace.name}" created`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Workspace Settings</h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Manage your brand profile, timezone, and multi-workspace organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Workspace
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EBEBE9] shadow-xs">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#F2F2F0]">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900 leading-tight">
                {activeWorkspace?.name}
              </h3>
              <p className="text-[12px] text-zinc-500">
                Current Active Workspace ({activeWorkspace?.plan?.toUpperCase()} Plan)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                Workspace Display Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="w-full px-3.5 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5 flex items-center justify-between">
                <span>Scheduling Timezone (IANA)</span>
                <span className="text-[11px] text-zinc-400 font-normal">Controls publish times and best-time engine</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  {IANA_TIMEZONES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F2F2F0] flex justify-between items-center">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 transition-colors shadow-xs"
            >
              Save Changes
            </button>

            <button
              onClick={openDeleteModal}
              disabled={!canDeleteWorkspace}
              title={!canDeleteWorkspace ? 'The final workspace cannot be deleted' : undefined}
              className="flex items-center px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Workspace...
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EBEBE9] shadow-xs">
          <h3 className="text-[14px] font-semibold text-zinc-900 mb-3">All Workspaces ({state.workspaces.length})</h3>
          <div className="divide-y divide-[#F2F2F0]">
            {state.workspaces.map((workspace) => {
              const isActive = workspace.id === state.activeWorkspaceId;
              return (
                <div key={workspace.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[13px] font-semibold text-zinc-900">{workspace.name}</span>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Timezone: {workspace.timezone}
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: workspace.id });
                        toast.success(`Switched to "${workspace.name}"`);
                      }}
                      className="px-3 py-1 bg-[#FAFAF9] hover:bg-zinc-100 border border-[#DCDCD8] text-zinc-700 rounded-md text-[12px] font-medium transition-colors"
                    >
                      Switch To
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9]">
              <h3 className="text-[15px] font-semibold text-zinc-900">Create New Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Workspace Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newWorkspaceName}
                  onChange={(event) => setNewWorkspaceName(event.target.value)}
                  placeholder="e.g. YouTube Studio, Client Brand"
                  className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Timezone</label>
                <select
                  value={newWorkspaceTimezone}
                  onChange={(event) => setNewWorkspaceTimezone(event.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  {IANA_TIMEZONES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#F2F2F0] flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 shadow-xs transition-colors"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && canDeleteWorkspace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-[15px] font-semibold">Delete Workspace Safety Check</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-rose-100 rounded-md text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[13px] text-zinc-700 leading-relaxed">
                This action is <strong className="text-rose-600 font-semibold">irreversible</strong>. Deleting{' '}
                <strong className="font-semibold text-zinc-900">"{activeWorkspace?.name}"</strong> will permanently delete all associated resources:
              </p>

              <div className="bg-[#FAFAF9] rounded-xl p-3.5 border border-[#EBEBE9] grid grid-cols-2 gap-2 text-[12px]">
                {[
                  ['Posts', postCount],
                  ['Social Accounts', accountCount],
                  ['Media Assets', mediaCount],
                  ['Media Folders', mediaFolderCount],
                  ['Pipeline Items', pipelineCount],
                  ['Experiments', experimentCount],
                ].map(([label, value]) => (
                  <div key={String(label)} className="p-2 bg-white rounded-lg border border-[#F2F2F0]">
                    <span className="text-zinc-500 block">{label}:</span>
                    <span className="font-bold text-zinc-900 text-[14px]">{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                  To confirm, type <span className="font-mono font-bold text-zinc-900">"{activeWorkspace?.name}"</span> below:
                </label>
                <input
                  type="text"
                  value={confirmNameInput}
                  onChange={(event) => setConfirmNameInput(event.target.value)}
                  placeholder={activeWorkspace?.name}
                  className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAFAF9] border-t border-[#EBEBE9] flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmNameInput !== activeWorkspace?.name}
                className="px-4 py-1.5 bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[12px] font-semibold hover:bg-rose-700 shadow-xs transition-colors"
              >
                Permanently Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
