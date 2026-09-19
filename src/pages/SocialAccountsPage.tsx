import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Platform, SocialAccount } from '../types';
import { Plus, CheckCircle2, RefreshCw, LogOut, Settings, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { getWorkspaceAccounts } from '../utils/selectors';

interface AvailablePlatform {
  id: Platform;
  name: string;
}

const availablePlatforms: AvailablePlatform[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'X (Twitter)' },
];

export function SocialAccountsPage() {
  const { state, dispatch } = useApp();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<AvailablePlatform | null>(null);

  const activeAccounts = getWorkspaceAccounts(state);

  const handleConnectAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') || '').trim();
    const username = String(formData.get('username') || '').trim();

    if (selectedPlatform && displayName && username) {
      const newAccount: SocialAccount = {
        id: uuidv4(),
        workspaceId: state.activeWorkspaceId,
        platform: selectedPlatform.id,
        displayName,
        username,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
        status: 'connected',
        lastSync: 'Just now',
      };

      dispatch({ type: 'ADD_SOCIAL_ACCOUNT', payload: newAccount });
      toast.success(`${selectedPlatform.name} account connected`);
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
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col h-full bg-surface-bg overflow-y-auto">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Social Accounts</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage connected channels and platform integrations.</p>
        </div>

        <button
          onClick={() => { setShowConnectModal(true); setConnectStep(1); }}
          className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Connect
        </button>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-[16px] font-semibold text-zinc-900 mb-2">No accounts connected</h3>
          <p className="text-[13px] text-zinc-500 mb-6 max-w-md">
            Connect your social media accounts to start scheduling and publishing content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8 shrink-0">
          {activeAccounts.map((account) => (
            <div key={account.id} className="bg-white p-5 rounded-[12px] border border-border-subtle shadow-sm flex flex-col hover:border-brand-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src={account.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-zinc-200" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
                      <PlatformIcon platform={account.platform} className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-zinc-900 leading-tight truncate max-w-[120px]">{account.displayName || account.platform}</h3>
                    <p className="text-[12px] text-zinc-500 truncate max-w-[120px]">{account.username}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 mb-5">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span className="text-[11px] font-medium text-status-success">Connected</span>
                <span className="text-[11px] text-zinc-400 ml-auto">Sync: {account.lastSync}</span>
              </div>

              <div className="flex items-center space-x-2 mt-auto border-t border-zinc-100 pt-4">
                <button
                  onClick={() => toast.success('Reconnected successfully')}
                  className="flex-1 flex items-center justify-center px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[12px] font-medium rounded-[6px] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Refresh
                </button>
                <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-[6px] transition-colors cursor-not-allowed opacity-50" title="Settings (Soon)">
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(account.id)}
                  className="p-1.5 text-zinc-400 hover:text-status-danger hover:bg-status-danger/10 rounded-[6px] transition-colors tooltip"
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
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h3 className="text-[16px] font-semibold text-zinc-900 leading-tight">
                  {connectStep === 1 ? 'Connect Account' : `Connect ${selectedPlatform?.name}`}
                </h3>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {connectStep === 1 ? 'Select a platform to connect.' : 'Enter account details.'}
                </p>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="p-1.5 hover:bg-zinc-200/60 rounded-md transition-colors text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {connectStep === 1 ? (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {availablePlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 border border-border-subtle rounded-[8px] hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-left"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setConnectStep(2);
                      }}
                    >
                      <div className="w-7 h-7 bg-zinc-50 rounded-[6px] flex items-center justify-center text-zinc-600 shrink-0 border border-zinc-200">
                        <PlatformIcon platform={platform.id} className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-[13px] text-zinc-800">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectAccount} className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Display Name</label>
                  <input
                    name="displayName"
                    required
                    placeholder={`e.g. My ${selectedPlatform?.name}`}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Username / Handle</label>
                  <input
                    name="username"
                    required
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="submit" className="flex-1 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm">
                    Connect Account
                  </button>
                </div>
              </form>
            )}

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-between">
              {connectStep === 2 ? (
                <button
                  onClick={() => setConnectStep(1)}
                  className="px-4 py-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
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
