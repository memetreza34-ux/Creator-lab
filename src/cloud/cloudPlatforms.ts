/** Planning destinations only. No platform here implies a live connection. */
export const CLOUD_CONTENT_PLATFORMS = [
  'youtube', 'instagram', 'tiktok', 'twitter', 'linkedin',
  'facebook', 'pinterest', 'threads',
] as const;
export type CloudContentPlatform = typeof CLOUD_CONTENT_PLATFORMS[number];
