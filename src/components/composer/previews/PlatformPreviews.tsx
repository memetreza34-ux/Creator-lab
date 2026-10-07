import React from 'react';
import { MediaAsset, Platform, SocialAccount } from '../../../types';
import {
  Bookmark,
  CheckCircle2,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Repeat,
  RotateCcw,
  Send,
  Share2,
  ThumbsUp,
} from 'lucide-react';
import { PlatformIcon } from '../../ui/PlatformIcon';
import { PLATFORM_CONFIGS } from '../../../config/platformConfig';

interface PreviewProps {
  platform: Platform;
  account?: SocialAccount;
  caption: string;
  mediaAssets: MediaAsset[];
  isCustomized: boolean;
  onResetToBase?: () => void;
}

function PreviewTruthNote() {
  return (
    <div className="text-[10px] text-zinc-400">
      Preview only · engagement appears after publishing
    </div>
  );
}

function CustomizationFooter({
  platform,
  isCustomized,
  onResetToBase,
  dark = false,
}: Pick<PreviewProps, 'platform' | 'isCustomized' | 'onResetToBase'> & {
  dark?: boolean;
}) {
  const displayName = PLATFORM_CONFIGS[platform].displayName;

  return (
    <div
      className={
        dark
          ? 'px-3 py-2 bg-black/80 border-t border-zinc-800 flex items-center justify-between text-[10px]'
          : 'px-3 py-2 bg-[#F8F8F7] border-t border-[#EBEBE9] flex items-center justify-between text-[11px]'
      }
    >
      <span className={dark ? 'text-zinc-300' : 'text-zinc-600 font-medium'}>
        {isCustomized ? `Customized for ${displayName}` : 'Inherits Base Content'}
      </span>
      {isCustomized && onResetToBase && (
        <button
          type="button"
          onClick={onResetToBase}
          className={
            dark
              ? 'flex items-center text-zinc-400 hover:text-white font-medium'
              : 'flex items-center text-zinc-500 hover:text-zinc-900 font-medium hover:underline'
          }
          aria-label={`Reset ${displayName} content to base content`}
        >
          <RotateCcw className="w-3 h-3 mr-1" aria-hidden="true" />
          Reset to Base
        </button>
      )}
    </div>
  );
}

function Avatar({
  src,
  fallback,
  className,
}: {
  src?: string;
  fallback: string;
  className: string;
}) {
  return (
    <img
      src={src || fallback}
      alt=""
      className={className}
    />
  );
}

export const InstagramPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => {
  const username = account?.username || '@creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto text-[13px] font-sans">
      <div className="p-3 flex items-center justify-between border-b border-[#F2F2F0]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
              <Avatar
                src={account?.avatarUrl}
                fallback="https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900 leading-tight">
              {username.replace('@', '')}
            </div>
            <div className="text-[10px] text-zinc-400">Post preview</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-400" aria-hidden="true" />
      </div>

      <div className="aspect-square bg-zinc-900 relative flex items-center justify-center overflow-hidden">
        {firstMedia ? (
          firstMedia.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              <img
                src={firstMedia.url}
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white">
                <Play className="w-5 h-5 fill-white ml-0.5" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-zinc-500 text-[12px] flex flex-col items-center">
            <PlatformIcon
              platform="instagram"
              className="w-8 h-8 mb-2 opacity-40 text-white"
            />
            <span>No media attached</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div
          className="flex items-center justify-between mb-2 text-zinc-700"
          aria-hidden="true"
        >
          <div className="flex items-center space-x-4">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Send className="w-5 h-5" />
          </div>
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="text-[12px] leading-relaxed text-zinc-800 whitespace-pre-line">
          <span className="font-semibold text-zinc-900 mr-1.5">
            {username.replace('@', '')}
          </span>
          {caption || (
            <span className="text-zinc-400 italic">
              Caption preview will appear here...
            </span>
          )}
        </div>
        <div className="mt-2">
          <PreviewTruthNote />
        </div>
      </div>

      <CustomizationFooter
        platform="instagram"
        isCustomized={isCustomized}
        onResetToBase={onResetToBase}
      />
    </div>
  );
};

export const TikTokPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => {
  const username = account?.username || '@creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl max-w-xs mx-auto text-white relative aspect-[9/16] flex flex-col justify-between p-4 font-sans">
      <div className="absolute inset-0 z-0">
        {firstMedia ? (
          <img
            src={firstMedia.url}
            alt=""
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-[12px]">
            9:16 media preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 flex justify-center text-[11px] font-medium pt-2 text-zinc-300">
        Content preview
      </div>

      <div
        className="relative z-10 self-end flex flex-col items-center space-y-4 mb-16 pr-1 text-center"
        aria-hidden="true"
      >
        <div className="w-9 h-9 rounded-full bg-white p-[1px] mb-1">
          <Avatar
            src={account?.avatarUrl}
            fallback="https://ui-avatars.com/api/?name=TT&background=000&color=fff"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        {[Heart, MessageCircle, Bookmark, Share2].map((Icon, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full bg-zinc-900/60 backdrop-blur flex items-center justify-center"
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        ))}
      </div>

      <div className="relative z-10 pb-1">
        <div className="font-bold text-[13px] mb-1">{username}</div>
        <p className="text-[12px] leading-snug line-clamp-3 text-zinc-200">
          {caption || 'TikTok caption preview...'}
        </p>
        <div className="mt-2 text-[10px] text-zinc-400">
          Engagement is not simulated in preview.
        </div>
      </div>

      <div className="relative z-10 -mx-4 -mb-4">
        <CustomizationFooter
          platform="tiktok"
          isCustomized={isCustomized}
          onResetToBase={onResetToBase}
          dark
        />
      </div>
    </div>
  );
};

export const YouTubePreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => {
  const firstMedia = mediaAssets[0];
  const channelName = account?.displayName || 'Creator Channel';
  const lines = caption.split('\n');
  const title = lines[0]?.trim() || 'Video title preview';
  const description = lines.slice(1).join('\n').trim();

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="aspect-video bg-zinc-900 relative flex items-center justify-center overflow-hidden">
        {firstMedia ? (
          <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-zinc-500 text-[12px] flex flex-col items-center">
            <PlatformIcon platform="youtube" className="w-8 h-8 mb-2 text-red-600" />
            <span>16:9 or Shorts media preview</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-red-600 shrink-0 overflow-hidden">
            <Avatar
              src={account?.avatarUrl}
              fallback="https://ui-avatars.com/api/?name=YT&background=FF0000&color=fff"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-zinc-900 text-[14px] line-clamp-2 leading-snug">
              {title}
            </h4>
            <div className="text-[11px] text-zinc-500 mt-1">{channelName}</div>
          </div>
        </div>

        {description && (
          <div className="mt-3 pt-3 border-t border-[#F2F2F0] text-[12px] text-zinc-600 line-clamp-3 leading-relaxed bg-[#F8F8F7] p-2.5 rounded-lg whitespace-pre-line">
            {description}
          </div>
        )}
        <div className="mt-2">
          <PreviewTruthNote />
        </div>
      </div>

      <CustomizationFooter
        platform="youtube"
        isCustomized={isCustomized}
        onResetToBase={onResetToBase}
      />
    </div>
  );
};

export const LinkedInPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => {
  const firstMedia = mediaAssets[0];
  const displayName = account?.displayName || 'Creator';

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="p-4 pb-2 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-700 overflow-hidden shrink-0">
            <Avatar
              src={account?.avatarUrl}
              fallback="https://ui-avatars.com/api/?name=LI&background=0A66C2&color=fff"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-zinc-900 leading-tight">
              {displayName}
            </div>
            <div className="text-[11px] text-zinc-500">Public post preview</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-400" aria-hidden="true" />
      </div>

      <div className="px-4 py-2 text-[13px] leading-relaxed text-zinc-800 whitespace-pre-line">
        {caption || (
          <span className="text-zinc-400 italic">
            Professional post preview...
          </span>
        )}
      </div>

      {firstMedia && (
        <div className="border-t border-b border-[#F2F2F0] max-h-[300px] overflow-hidden bg-zinc-100">
          <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-4 py-2 border-t border-[#F2F2F0] flex items-center gap-5 text-zinc-400">
        <ThumbsUp className="w-4 h-4" aria-hidden="true" />
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        <Repeat className="w-4 h-4" aria-hidden="true" />
        <PreviewTruthNote />
      </div>

      <CustomizationFooter
        platform="linkedin"
        isCustomized={isCustomized}
        onResetToBase={onResetToBase}
      />
    </div>
  );
};

export const XPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => {
  const username = account?.username || '@creator';
  const displayName = account?.displayName || 'Creator';
  const firstMedia = mediaAssets[0];

  return (
    <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
      <div className="p-4 flex space-x-3">
        <div className="w-9 h-9 rounded-full bg-black overflow-hidden shrink-0">
          <Avatar
            src={account?.avatarUrl}
            fallback="https://ui-avatars.com/api/?name=X&background=000&color=fff"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-zinc-900 truncate">{displayName}</span>
            <span className="text-zinc-500 text-[12px]">{username}</span>
          </div>

          <p className="mt-1 text-[13px] text-zinc-900 leading-relaxed whitespace-pre-line">
            {caption || (
              <span className="text-zinc-400 italic">Post preview...</span>
            )}
          </p>

          {firstMedia && (
            <div className="mt-2.5 rounded-xl border border-zinc-200 overflow-hidden max-h-[240px]">
              <img src={firstMedia.url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="mt-3 flex items-center justify-between text-zinc-400 max-w-xs"
            aria-hidden="true"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <Repeat className="w-3.5 h-3.5" />
            <Heart className="w-3.5 h-3.5" />
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2">
            <PreviewTruthNote />
          </div>
        </div>
      </div>

      <CustomizationFooter
        platform="twitter"
        isCustomized={isCustomized}
        onResetToBase={onResetToBase}
      />
    </div>
  );
};

export const FacebookPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => (
  <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
    <div className="p-3 flex items-center space-x-2.5">
      <div className="w-9 h-9 rounded-full bg-blue-600 overflow-hidden">
        <Avatar
          src={account?.avatarUrl}
          fallback="https://ui-avatars.com/api/?name=FB&background=1877F2&color=fff"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="font-semibold text-zinc-900">
          {account?.displayName || 'Creator Page'}
        </div>
        <div className="text-[11px] text-zinc-400">Public post preview</div>
      </div>
    </div>
    <div className="px-3 pb-2 text-[13px] text-zinc-800 whitespace-pre-line leading-relaxed">
      {caption || (
        <span className="text-zinc-400 italic">Community post preview...</span>
      )}
    </div>
    {mediaAssets[0] && (
      <div className="max-h-[280px] overflow-hidden bg-zinc-100">
        <img src={mediaAssets[0].url} alt="" className="w-full h-full object-cover" />
      </div>
    )}
    <div className="px-3 py-2 border-t border-[#F2F2F0]">
      <PreviewTruthNote />
    </div>
    <CustomizationFooter
      platform="facebook"
      isCustomized={isCustomized}
      onResetToBase={onResetToBase}
    />
  </div>
);

export const PinterestPreview: React.FC<PreviewProps> = ({
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => (
  <div className="bg-white border border-[#EBEBE9] rounded-2xl overflow-hidden shadow-sm max-w-xs mx-auto font-sans text-[13px]">
    <div className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
      {mediaAssets[0] ? (
        <img src={mediaAssets[0].url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-[12px]">
          <PlatformIcon platform="pinterest" className="w-8 h-8 text-rose-600 mb-2" />
          <span>2:3 vertical pin preview</span>
        </div>
      )}
    </div>
    <div className="p-3">
      <h4 className="font-bold text-zinc-900 text-[14px] line-clamp-2">
        {caption ? caption.slice(0, 60) : 'Pin title preview'}
      </h4>
      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
        {caption || 'Pin description preview...'}
      </p>
      <div className="mt-2">
        <PreviewTruthNote />
      </div>
    </div>
    <CustomizationFooter
      platform="pinterest"
      isCustomized={isCustomized}
      onResetToBase={onResetToBase}
    />
  </div>
);

export const ThreadsPreview: React.FC<PreviewProps> = ({
  account,
  caption,
  mediaAssets,
  isCustomized,
  onResetToBase,
}) => (
  <div className="bg-white border border-[#EBEBE9] rounded-xl overflow-hidden shadow-sm max-w-md mx-auto font-sans text-[13px]">
    <div className="p-4 flex space-x-3">
      <div className="w-8 h-8 rounded-full bg-zinc-900 overflow-hidden shrink-0">
        <Avatar
          src={account?.avatarUrl}
          fallback="https://ui-avatars.com/api/?name=TH&background=000&color=fff"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-zinc-900">
          {account?.username || '@creator'}
        </div>
        <p className="mt-1 text-zinc-800 leading-relaxed whitespace-pre-line">
          {caption || (
            <span className="text-zinc-400 italic">
              Conversation preview...
            </span>
          )}
        </p>
        {mediaAssets[0] && (
          <div className="mt-2.5 rounded-xl border border-zinc-200 overflow-hidden max-h-[220px]">
            <img
              src={mediaAssets[0].url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="mt-2">
          <PreviewTruthNote />
        </div>
      </div>
    </div>
    <CustomizationFooter
      platform="threads"
      isCustomized={isCustomized}
      onResetToBase={onResetToBase}
    />
  </div>
);

export const PlatformPreviewRenderer: React.FC<PreviewProps> = (props) => {
  switch (props.platform) {
    case 'instagram':
      return <InstagramPreview {...props} />;
    case 'tiktok':
      return <TikTokPreview {...props} />;
    case 'youtube':
      return <YouTubePreview {...props} />;
    case 'linkedin':
      return <LinkedInPreview {...props} />;
    case 'twitter':
      return <XPreview {...props} />;
    case 'facebook':
      return <FacebookPreview {...props} />;
    case 'pinterest':
      return <PinterestPreview {...props} />;
    case 'threads':
      return <ThreadsPreview {...props} />;
  }
};
