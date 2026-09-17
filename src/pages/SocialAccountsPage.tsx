import React, { useState } from 'react';
import { Plus, MoreHorizontal, Settings, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { mockSocialAccounts } from '../data/mockData';

export function SocialAccountsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);

  const availablePlatforms = [
    { name: 'Instagram', icon: 'IG' },
    { name: 'TikTok', icon: 'TK' },
    { name: 'YouTube', icon: 'YT' },
    { name: 'LinkedIn', icon: 'LI' },
    { name: 'Facebook', icon: 'FB' },
    { name: 'X', icon: 'X' },
    { name: 'Pinterest', icon: 'PI' },
    { name: 'Threads', icon: 'TH' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Social Accounts</h2>
          <p className="text-sm text-zinc-500 mt-1">Connect and manage the channels Creator Lab uses to publish and analyze content.</p>
        </div>
        
        <button 
          onClick={() => setShowConnectModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSocialAccounts.map(account => (
          <div key={account.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-lg text-zinc-400">
                  {account.platform[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 capitalize">{account.platform}</h3>
                  <p className="text-sm text-zinc-500">{account.username}</p>
                </div>
              </div>
              <button className="p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">Connected</span>
              <span className="text-xs text-zinc-400 ml-auto">Sync: {account.lastSync}</span>
            </div>
            
            <div className="flex items-center space-x-2 mt-auto border-t border-zinc-100 pt-4">
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Reconnect
              </button>
              <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip" title="Remove">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900">Connect a new account</h3>
              <p className="text-sm text-zinc-500 mt-1">Select the platform you want to connect.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map(platform => (
                  <button 
                    key={platform.name}
                    className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors text-left"
                    onClick={() => setShowConnectModal(false)}
                  >
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-xs text-zinc-500">
                      {platform.icon}
                    </div>
                    <span className="font-medium text-sm text-zinc-700">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button 
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
