import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">
          <span>Local demo — content here is not saved to your personal cloud account.</span>
          <Link to="/cloud" className="font-semibold underline">Open Cloud account</Link>
        </div>
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
