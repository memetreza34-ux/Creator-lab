import React, { useState } from 'react';
import { Plus, Settings, RefreshCw, LogOut, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Platform } from '../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export function SocialAccountsPage() {
  const { state, dispatch } = useApp();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState<1 | 2>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<{name: string, id: Platform} | null>(null);

  const activeAccounts = state.socialAccounts.filter(a => a.workspaceId === state.activeWorkspaceId);

  const availablePlatforms: { name: string, id: Platform, icon: string }[] = [
    { name: 'Instagram', id: 'instagram', icon: 'IG' },
    { name: 'TikTok', id: 'tiktok', icon: 'TK' },
    { name: 'YouTube', id: 'youtube', icon: 'YT' },
    { name: 'LinkedIn', id: 'linkedin', icon: 'LI' },
    { name: 'Facebook', id: 'facebook', icon: 'FB' },
    { name: 'X', id: 'twitter', icon: 'X' },
    { name: 'Pinterest', id: 'pinterest', icon: 'PI' },
    { name: 'Threads', id: 'threads', icon: 'TH' }
  ];

  const handleConnectAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const displayName = formData.get('displayName') as string;

    if (selectedPlatform) {
      dispatch({
        type: 'ADD_SOCIAL_ACCOUNT',
        payload: {
          id: uuidv4(),
          workspaceId: state.activeWorkspaceId,
          platform: selectedPlatform.id,
          username,
          displayName,
          status: 'connected',
          lastSync: 'Just now'
        }
      });
      toast.success(`${selectedPlatform.name} account connected (Demo)`);
    }
    
    setShowConnectModal(false);
    setConnectStep(1);
    setSelectedPlatform(null);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      dispatch({ type: 'REMOVE_SOCIAL_ACCOUNT', payload: id });
      toast.success('Account removed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Social Accounts</h2>
          <p className="text-sm text-zinc-500 mt-1">Connect and manage the channels Creator Lab uses to publish and analyze content.</p>
        </div>
        
        <button 
          onClick={() => { setShowConnectModal(true); setConnectStep(1); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect Account
        </button>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No accounts connected</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            Connect your social media accounts to start scheduling and publishing content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAccounts.map(account => (
            <div key={account.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-lg text-zinc-400">
                    {account.platform[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 capitalize">{account.displayName || account.platform}</h3>
                    <p className="text-sm text-zinc-500">{account.username}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">Connected (Demo)</span>
                <span className="text-xs text-zinc-400 ml-auto">Sync: {account.lastSync}</span>
              </div>
              
              <div className="flex items-center space-x-2 mt-auto border-t border-zinc-100 pt-4">
                <button 
                  onClick={() => toast.success('Simulated reconnect')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Reconnect
                </button>
                <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-not-allowed opacity-50" title="Settings (Soon)">
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleRemove(account.id)}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip" 
                  title="Remove"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {connectStep === 1 ? 'Connect a new account' : `Connect ${selectedPlatform?.name}`}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {connectStep === 1 ? 'Select the platform you want to connect.' : 'Enter demo account details.'}
                </p>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="p-1 hover:bg-zinc-100 rounded-md">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            {connectStep === 1 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {availablePlatforms.map(platform => (
                    <button 
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors text-left"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setConnectStep(2);
                      }}
                    >
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-xs text-zinc-500 shrink-0">
                        {platform.icon}
                      </div>
                      <span className="font-medium text-sm text-zinc-700">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Display Name</label>
                  <input 
                    name="displayName"
                    required
                    placeholder={`e.g. My ${selectedPlatform?.name}`}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Username / Handle</label>
                  <input 
                    name="username"
                    required
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Connect Demo Account
                  </button>
                </div>
              </form>
            )}
            
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-between">
              {connectStep === 2 ? (
                <button 
                  onClick={() => setConnectStep(1)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
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
