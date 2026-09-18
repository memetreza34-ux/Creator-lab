import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
  
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSave = () => {
    if (activeWorkspace) {
      dispatch({ 
        type: 'UPDATE_WORKSPACE', 
        payload: { ...activeWorkspace, name: workspaceName } 
      });
      toast.success('Workspace settings saved');
    }
  };

  const handleDelete = () => {
    if (state.workspaces.length <= 1) {
      toast.error('Cannot delete the last workspace');
      return;
    }
    if (window.confirm(`Are you sure you want to delete workspace "${activeWorkspace?.name}"?`)) {
      dispatch({ type: 'DELETE_WORKSPACE', payload: state.activeWorkspaceId });
      toast.success('Workspace deleted');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const newWorkspace = {
      id: uuidv4(),
      name: newWorkspaceName,
      plan: 'free' as const
    };

    dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
    dispatch({ type: 'SET_ACTIVE_WORKSPACE', payload: newWorkspace.id });
    setNewWorkspaceName('');
    setShowCreateModal(false);
    toast.success('Workspace created');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Settings</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage your workspace preferences.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Workspace
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[12px] border border-border-subtle shadow-sm">
          <h3 className="text-[16px] font-semibold text-zinc-900 mb-4">Workspace General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Workspace Name</label>
              <input 
                type="text" 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Timezone</label>
              <select className="w-full px-4 py-2 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (London)</option>
                <option>UTC+1 (Central Europe)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
            >
              Save Changes
            </button>

            {state.workspaces.length > 1 && (
              <button 
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-status-danger bg-status-danger/10 rounded-[8px] text-[13px] font-medium hover:bg-status-danger/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Workspace
              </button>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-[16px] font-semibold text-zinc-900">Create New Workspace</h3>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Workspace Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. My Brand"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500" 
                />
              </div>
              <div className="pt-2 flex space-x-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}