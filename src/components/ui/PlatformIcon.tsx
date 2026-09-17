import React from 'react';
import { Platform } from '../../types';
import { Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

export const PlatformIcon: React.FC<{ platform: Platform, className?: string }> = ({ platform, className = "w-4 h-4" }) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'tiktok':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
    case 'youtube':
      return <Youtube className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    default:
      return null;
  }
}
