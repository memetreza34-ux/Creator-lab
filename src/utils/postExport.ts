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

  for (const item of post.platformContent) {
    if (!item.enabled) continue;
    lines.push('', `${item.platform.toUpperCase()} VERSION`, item.content.caption.trim() || '(no text)');
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
