import { Post } from '../types';

/** Local, user-initiated text export. Never represents a provider publication. */
export function formatPostForManualExport(post: Post): string {
  const lines = [
    'CREATOR LAB — MANUAL CONTENT EXPORT',
    'This file is for manual posting. It has NOT been sent to a social network.',
    '',
    `TITLE: ${post.title}`,
    '',
    'BASE CONTENT',
    post.originalContent.caption.trim() || '(media-only draft)',
  ];

  const targets = Array.from(new Set([
    ...(post.planningPlatforms || []),
    ...post.platformContent.filter(item => item.enabled).map(item => item.platform),
  ]));
  for (const platform of targets) {
    const override = post.platformContent.find(item => item.platform === platform && item.enabled);
    lines.push('', `${platform.toUpperCase()} VERSION`,
      override?.content.caption.trim() || post.originalContent.caption.trim() || '(media-only draft)');
  }
  if (post.scheduledAt && post.status === 'scheduled') {
    lines.push('', `LOCAL PLAN (UTC): ${post.scheduledAt}`, 'This is a reminder, not an automatic publish job.');
  }
  return lines.join('\n') + '\n';
}

export function safePostExportFilename(title: string): string {
  const safe = title.normalize('NFKC')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s-]+|[.\s-]+$/g, '')
    .slice(0, 70)
    .trim();
  return `${safe || 'creator-lab-post'}.txt`;
}
