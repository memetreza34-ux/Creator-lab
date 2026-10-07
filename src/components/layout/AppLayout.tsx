import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const { state } = useApp();
  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId,
  ) || state.workspaces[0];
  const isDemoWorkspace = activeWorkspace?.dataMode === 'demo';

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader />
        {isDemoWorkspace && (
          <div
            role="status"
            className="shrink-0 border-b border-amber-200 bg-amber-50 px-5 py-2 text-[11px] text-amber-900"
          >
            <strong className="font-semibold">Demo workspace:</strong>{' '}
            accounts, publishing states, experiments, and performance metrics are sample data. No live social provider is connected.
          </div>
        )}
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
