import React from 'react';
import { Platform, SocialAccount, MediaAsset } from '../../../types';
import { 
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, 
  ThumbsUp, Repeat, Eye, Play, Sparkles, RotateCcw, CheckCircle2 
} from 'lucide-react';
import { PlatformIcon } from '../../ui/PlatformIcon';

interface PreviewProps {
  platform: Platform;
  account?: SocialAccount;
  caption: string;
  mediaAssets: MediaAsset[];
  isCustomized: boolean;
  onResetToBase?: () => void;
}

export const InstagramPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  const username = account?.username || '@creator';
  const displayName = account?.displayName || 'Creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto text-[13px] font-sans">
      {/* Chrome header */}
      <div className="p-3 flex items-center justify-between border-b border-[#F2F2F0]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
              <img 
                src={account?.avatarUrl || "https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff"} 
                alt="" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900 leading-tight">{username.replace('@', '')}</div>
            <div className="text-[10px] text-zinc-400 font-normal">Original Audio</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
      </div>

      {/* Media area */}
      <div className="aspect-square bg-zinc-900 relative flex items-center justify-center overflow-hidden">
        {firstMedia ? (
          firstMedia.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              <img src={firstMedia.url} alt="" className="w-full h-full object-cover opacity-80" />
              <div className="absolute w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
          ) : (
            <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-zinc-500 text-[12px] flex flex-col items-center">
            <PlatformIcon platform="instagram" className="w-8 h-8 mb-2 opacity-40 text-white" />
            <span>No media attached</span>
          </div>
        )}
      </div>

      {/* Action icons */}
      <div className="p-3 pb-1">
        <div className="flex items-center justify-between mb-2 text-zinc-800">
          <div className="flex items-center space-x-4">
            <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer transition-colors" />
            <MessageCircle className="w-5 h-5 cursor-pointer hover:text-zinc-600" />
            <Send className="w-5 h-5 cursor-pointer hover:text-zinc-600" />
          </div>
          <Bookmark className="w-5 h-5 cursor-pointer hover:text-zinc-600" />
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-1.5">
          Illustrative post layout
        </div>
        <div className="text-[12px] leading-relaxed text-zinc-800 whitespace-pre-line">
          <span className="font-semibold text-zinc-900 mr-1.5">{username.replace('@', '')}</span>
          {caption || <span className="text-zinc-400 italic">Caption preview will appear here...</span>}
        </div>
        <div className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wide">Preview only</div>
      </div>

      {/* Customization Badge Footer */}
      <div className="px-3 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="flex items-center font-medium text-zinc-600">
          {isCustomized ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 mr-1.5" />
              Customized for Instagram
            </>
          ) : (
            <span className="text-zinc-500">Inherits Base Content</span>
          )}
        </span>
        {isCustomized && onResetToBase && (
          <button 
            onClick={onResetToBase} 
            className="flex items-center text-zinc-500 hover:text-zinc-900 font-medium hover:underline"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Base
          </button>
        )}
      </div>
    </div>
  );
};

export const TikTokPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  const username = account?.username || '@creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl max-w-xs mx-auto text-white relative aspect-[9/16] flex flex-col justify-between p-4 font-sans">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {firstMedia ? (
          <img src={firstMedia.url} alt="" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-[12px]">
            Vertical 9:16 Video Preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex justify-center space-x-4 text-[13px] font-semibold pt-2 text-zinc-300">
        <span className="opacity-60">Following</span>
        <span className="text-white border-b-2 border-white pb-0.5">For You</span>
      </div>

      {/* Side Action Column */}
      <div className="relative z-10 self-end flex flex-col items-center space-y-4 mb-16 pr-1 text-center text-[10px]">
        <div className="w-9 h-9 rounded-full bg-white p-[1px] mb-1">
          <img 
            src={account?.avatarUrl || "https://ui-avatars.com/api/?name=TT&background=000&color=fff"} 
            alt="" 
            className="w-full h-full rounded-full object-cover" 
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-900/60 backdrop-blur flex items-center justify-center">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="mt-0.5 font-medium">Like</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-900/60 backdrop-blur flex items-center justify-center">
            <MessageCircle className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="mt-0.5 font-medium">Comment</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-900/60 backdrop-blur flex items-center justify-center">
            <Bookmark className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="mt-0.5 font-medium">Save</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-900/60 backdrop-blur flex items-center justify-center">
            <Share2 className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="mt-0.5 font-medium">Share</span>
        </div>
      </div>

      {/* Bottom info & caption */}
      <div className="relative z-10 pb-1">
        <div className="font-bold text-[13px] mb-1">{username}</div>
        <p className="text-[12px] leading-snug line-clamp-3 text-zinc-200">
          {caption || 'TikTok caption with trending hooks...'}
        </p>
        <div className="flex items-center space-x-1 text-[11px] text-zinc-400 mt-2">
          <span>♫ Original sound - {username}</span>
        </div>
      </div>

      {/* Footer customization */}
      <div className="relative z-10 -mx-4 -mb-4 px-3 py-1.5 bg-black/80 backdrop-blur border-t border-zinc-800 flex items-center justify-between text-[10px]">
        <span>{isCustomized ? 'Customized for TikTok' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-400 hover:text-white">Reset</button>
        )}
      </div>
    </div>
  );
};

export const YouTubePreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  const firstMedia = mediaAssets[0];
  const channelName = account?.displayName || 'Creator Channel';

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      {/* Video Thumbnail (16:9) */}
      <div className="aspect-video bg-zinc-900 relative flex items-center justify-center overflow-hidden">
        {firstMedia ? (
          <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-zinc-500 text-[12px] flex flex-col items-center">
            <PlatformIcon platform="youtube" className="w-8 h-8 mb-2 text-red-600" />
            <span>16:9 Thumbnail / Video Preview</span>
          </div>
        )}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          Preview
        </span>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-red-600 shrink-0 overflow-hidden">
            <img 
              src={account?.avatarUrl || "https://ui-avatars.com/api/?name=YT&background=FF0000&color=fff"} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-zinc-900 text-[14px] line-clamp-2 leading-snug">
              {caption ? caption.split('\n')[0].slice(0, 75) : 'Video Title Preview'}
            </h4>
            <div className="text-[11px] text-zinc-500 mt-1">
              <span>{channelName}</span> • <span>Illustrative layout</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F2F2F0] text-[12px] text-zinc-600 line-clamp-2 leading-relaxed bg-[#F8F8F7] p-2.5 rounded-lg">
          {caption || 'Detailed video description with timestamps and links will appear here...'}
        </div>
      </div>

      <div className="px-4 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">
          {isCustomized ? 'Customized for YouTube' : 'Inherits Base'}
        </span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const LinkedInPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  const displayName = account?.displayName || 'Creator Leader';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      {/* Header */}
      <div className="p-4 pb-2 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-700 overflow-hidden shrink-0">
            <img 
              src={account?.avatarUrl || "https://ui-avatars.com/api/?name=LI&background=0077B5&color=fff"} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="font-semibold text-zinc-900 leading-tight">{displayName}</div>
            <div className="text-[11px] text-zinc-500">Creator profile • Preview</div>
            <div className="text-[10px] text-zinc-400">Illustrative post • 🌐</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
      </div>

      {/* Post text */}
      <div className="px-4 py-2 text-[13px] leading-relaxed text-zinc-800 whitespace-pre-line">
        {caption || <span className="text-zinc-400 italic">Professional insight and breakdown preview...</span>}
      </div>

      {/* Media */}
      {firstMedia && (
        <div className="border-t border-b border-[#F2F2F0] max-h-[300px] overflow-hidden bg-zinc-100">
          <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-4 py-2 border-t border-[#F2F2F0] text-zinc-400 text-[11px]">
        Engagement controls are shown for layout only — no live metrics.
      </div>

      <div className="px-4 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">{isCustomized ? 'Customized for LinkedIn' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const XPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  const username = account?.username || '@creator';
  const displayName = account?.displayName || 'Creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="p-4 flex space-x-3">
        <div className="w-9 h-9 rounded-full bg-black overflow-hidden shrink-0">
          <img 
            src={account?.avatarUrl || "https://ui-avatars.com/api/?name=X&background=000&color=fff"} 
            alt="" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-zinc-900 truncate">{displayName}</span>
            <span className="text-zinc-500 text-[12px]">{username}</span>
            <span className="text-zinc-400">· Preview</span>
          </div>

          <p className="mt-1 text-[13px] text-zinc-900 leading-relaxed whitespace-pre-line">
            {caption || <span className="text-zinc-400 italic">Punchy, contrarian thought hook preview...</span>}
          </p>

          {firstMedia && (
            <div className="mt-2.5 rounded-xl border border-zinc-200 overflow-hidden max-h-[240px]">
              <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-zinc-500 text-[11px] max-w-xs" aria-label="Illustrative engagement controls">
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-3.5 h-3.5" /> <span>Reply</span>
            </span>
            <span className="flex items-center space-x-1">
              <Repeat className="w-3.5 h-3.5" /> <span>Repost</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" /> <span>Like</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" /> <span>View</span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">{isCustomized ? 'Customized for X (Twitter)' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const FacebookPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="p-3 flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-full bg-blue-600 overflow-hidden">
          <img src={account?.avatarUrl || "https://ui-avatars.com/api/?name=FB&background=1877F2&color=fff"} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">{account?.displayName || 'Creator Page'}</div>
          <div className="text-[11px] text-zinc-400">Post preview • Public layout • 🌐</div>
        </div>
      </div>
      <div className="px-3 pb-2 text-[13px] text-zinc-800 whitespace-pre-line leading-relaxed">
        {caption || <span className="text-zinc-400 italic">Community conversation starter...</span>}
      </div>
      {mediaAssets[0] && (
        <div className="max-h-[280px] overflow-hidden bg-zinc-100">
          <img src={mediaAssets[0].url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-3 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">{isCustomized ? 'Customized for Facebook' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const PinterestPreview: React.FC<PreviewProps> = ({ 
  caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  return (
    <div className="bg-white border border-[#EBEBE9] rounded-2xl overflow-hidden shadow-sm max-w-xs mx-auto font-sans text-[13px]">
      <div className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
        {mediaAssets[0] ? (
          <img src={mediaAssets[0].url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-[12px]">
            <PlatformIcon platform="pinterest" className="w-8 h-8 text-rose-600 mb-2" />
            <span>2:3 Vertical Pin Image</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-bold text-zinc-900 text-[14px] line-clamp-2">
          {caption ? caption.slice(0, 60) : 'Pin Title & Inspiration'}
        </h4>
        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
          {caption || 'Actionable pin description with searchable keywords...'}
        </p>
      </div>
      <div className="px-3 py-1.5 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">{isCustomized ? 'Customized' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const ThreadsPreview: React.FC<PreviewProps> = ({ 
  account, caption, mediaAssets, isCustomized, onResetToBase 
}) => {
  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="p-4 flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-zinc-900 overflow-hidden shrink-0">
          <img src={account?.avatarUrl || "https://ui-avatars.com/api/?name=TH&background=000&color=fff"} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-900">{account?.username || '@creator'}</span>
            <span className="text-zinc-400 text-[12px]">Preview</span>
          </div>
          <p className="mt-1 text-zinc-800 leading-relaxed whitespace-pre-line">
            {caption || <span className="text-zinc-400 italic">Casual real-time thought preview...</span>}
          </p>
          {mediaAssets[0] && (
            <div className="mt-2.5 rounded-xl border border-zinc-200 overflow-hidden max-h-[220px]">
              <img src={mediaAssets[0].url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 font-medium">{isCustomized ? 'Customized for Threads' : 'Inherits Base'}</span>
        {isCustomized && onResetToBase && (
          <button onClick={onResetToBase} className="text-zinc-500 hover:text-zinc-900">Reset</button>
        )}
      </div>
    </div>
  );
};

export const PlatformPreviewRenderer: React.FC<PreviewProps> = (props) => {
  let preview: React.ReactNode;

  switch (props.platform) {
    case 'instagram':
      preview = <InstagramPreview {...props} />;
      break;
    case 'tiktok':
      preview = <TikTokPreview {...props} />;
      break;
    case 'youtube':
      preview = <YouTubePreview {...props} />;
      break;
    case 'linkedin':
      preview = <LinkedInPreview {...props} />;
      break;
    case 'twitter':
      preview = <XPreview {...props} />;
      break;
    case 'facebook':
      preview = <FacebookPreview {...props} />;
      break;
    case 'pinterest':
      preview = <PinterestPreview {...props} />;
      break;
    case 'threads':
      preview = <ThreadsPreview {...props} />;
      break;
    default:
      preview = (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-[12px] text-zinc-500">
          Preview unavailable for this destination.
        </div>
      );
  }

  return (
    <div className="space-y-2">
      <div className="text-center text-[10px] font-medium text-zinc-400">
        Illustrative preview — not live platform data
      </div>
      {preview}
    </div>
  );
};
