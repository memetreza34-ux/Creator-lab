import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Platform, SocialAccount } from '../types';
import { CheckCircle2, CircleDashed, FlaskConical, LogOut, Plus, X } from 'lucide-react';
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
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'X' },
  { id: 'threads', name: 'Threads' },
  { id: 'pinterest', name: 'Pinterest' },
];

export function SocialAccountsPage() {
  const { state, dispatch } = useApp();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<AvailablePlatform | null>(null);

  const activeAccounts = getWorkspaceAccounts(state);

  const closeModal = () => {
    setShowConnectModal(false);
    setConnectStep(1);
    setSelectedPlatform(null);
  };

  const handleAddPlaceholder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') || '').trim();
    const username = String(formData.get('username') || '').trim();

    if (!selectedPlatform || !displayName || !username) return;

    const newAccount: SocialAccount = {
      id: uuidv4(),
      workspaceId: state.activeWorkspaceId,
      platform: selectedPlatform.id,
      displayName,
      username,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F4F4F5&color=52525B`,
      status: 'disconnected',
      connectionKind: 'placeholder',
      lastSync: '',
    };

    dispatch({ type: 'ADD_SOCIAL_ACCOUNT', payload: newAccount });
    toast.success(`${selectedPlatform.name} placeholder added`);
    closeModal();
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this account from the workspace?')) {
      dispatch({ type: 'REMOVE_SOCIAL_ACCOUNT', payload: id });
      toast.success('Account removed');
    }
  };

  const getConnectionPresentation = (account: SocialAccount) => {
    if (account.connectionKind === 'demo') {
      return {
        icon: <FlaskConical className="w-3.5 h-3.5 text-amber-600" />,
        label: 'Demo account',
        detail: 'Sample data — no provider connection',
        className: 'text-amber-700',
      };
    }

    if (account.connectionKind === 'provider') {
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        label: 'Provider connected',
        detail: account.lastSync ? `Last sync: ${account.lastSync}` : 'Provider connection verified',
        className: 'text-emerald-700',
      };
    }

    return {
      icon: <CircleDashed className="w-3.5 h-3.5 text-zinc-500" />,
      label: 'Local placeholder',
      detail: 'Planning only — OAuth is not connected',
      className: 'text-zinc-600',
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col h-full bg-surface-bg overflow-y-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Social Accounts</h1>
          <p className="text-[14px] text-zinc-500 mt-1 max-w-2xl">
            Organize destination accounts for planning. Real OAuth connections and provider publishing are not enabled yet.
          </p>
        </div>

        <button
          onClick={() => {
            setShowConnectModal(true);
            setConnectStep(1);
          }}
          className="flex items-center justify-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add placeholder
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
        <strong className="font-semibold">Current V1 foundation state:</strong>{' '}
        manually added accounts are local planning placeholders. They do not grant Creator Lab access to a social platform and cannot publish externally.
      </div>

      {activeAccounts.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-[12px] shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-[16px] font-semibold text-zinc-900 mb-2">No destination accounts</h3>
          <p className="text-[13px] text-zinc-500 max-w-md">
            Add a local placeholder to plan platform-specific content. Real account connection arrives with the verified provider integration phase.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8 shrink-0">
          {activeAccounts.map((account) => {
            const connection = getConnectionPresentation(account);

            return (
              <div key={account.id} className="bg-white p-5 rounded-[12px] border border-border-subtle shadow-sm flex flex-col hover:border-brand-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={account.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full border border-zinc-200 bg-zinc-100"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
                        <PlatformIcon platform={account.platform} className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold text-zinc-900 leading-tight truncate">
                        {account.displayName || account.platform}
                      </h3>
                      <p className="text-[12px] text-zinc-500 truncate">{account.username}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center space-x-1.5">
                    {connection.icon}
                    <span className={`text-[11px] font-semibold ${connection.className}`}>
                      {connection.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">{connection.detail}</p>
                </div>

                <div className="mt-auto border-t border-zinc-100 pt-4 flex justify-end">
                  <button
                    onClick={() => handleRemove(account.id)}
                    className="flex items-center px-2.5 py-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] text-[11px] font-medium transition-colors"
                    title="Remove from workspace"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showConnectModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h3 className="text-[16px] font-semibold text-zinc-900 leading-tight">
                  {connectStep === 1
                    ? 'Add account placeholder'
                    : `Add ${selectedPlatform?.name} placeholder`}
                </h3>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {connectStep === 1
                    ? 'Choose the destination you want to plan for.'
                    : 'This saves display details only. No OAuth credentials are requested.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-zinc-200/60 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
                aria-label="Close"
              >
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
              <form onSubmit={handleAddPlaceholder} className="p-5 space-y-4">
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
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-[11px] text-zinc-600">
                  This placeholder is stored only inside Creator Lab. It is not a login or social-provider connection.
                </div>
                <div className="pt-2 flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
                  >
                    Add placeholder
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
                onClick={closeModal}
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
