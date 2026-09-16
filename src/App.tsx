/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Planner } from './components/Planner';
import { ExperimentLab } from './components/ExperimentLab';
import type { Tab } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {currentTab === 'dashboard' && <Dashboard />}
          {currentTab === 'planner' && <Planner />}
          {currentTab === 'experiments' && <ExperimentLab />}
          {currentTab === 'analytics' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Advanced Analytics</h2>
              <p className="text-zinc-500 mt-2 max-w-sm">
                Connect your YouTube and Instagram APIs to see deep dives into your content metrics here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
