import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSave = () => {
    if (activeWorkspace) {
      toast.success('Workspace settings saved (Demo)');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-semibold text-zinc-900 mb-8">Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Workspace Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Workspace Name</label>
              <input 
                type="text" 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Timezone</label>
              <select className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (London)</option>
                <option>UTC+1 (Central Europe)</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
