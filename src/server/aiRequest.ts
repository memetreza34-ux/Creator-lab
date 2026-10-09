// AI request validation is deterministic, before any paid model invocation.
// This prototype has no authenticated AI billing gate yet; production calls
// remain disabled until server-side workspace authorization is implemented.
export const AI_TOOLS = [
  'improve',
  'hook',
  'rewrite',
  'shorten',
  'hashtags',
  'analyze',
  'optimize_platform',
  'weak_points',
  'variations',
] as const;

export type AiTool = (typeof AI_TOOLS)[number];

export const AI_PLATFORMS = [
  'youtube', 'instagram', 'tiktok', 'twitter',
  'linkedin', 'facebook', 'pinterest', 'threads',
] as const;

export const AI_TONES = [
  'Professional', 'Casual', 'Educational',
  'Energetic', 'Concise', 'Storytelling',
] as const;

export interface AiValidatedRequest {
  tool: AiTool;
  content: string;
  platform?: string;
  platforms?: string[];
  tone?: string;
  weaknesses?: string | string[];
}

export type AiValidationResult =
  | { ok: true; value: AiValidatedRequest }
  | { ok: false; error: string };

const aiToolSet = new Set<string>(AI_TOOLS);
const platformSet = new Set<string>(AI_PLATFORMS);
const toneSet = new Set<string>(AI_TONES);

export function validateAiRequest(body: unknown): AiValidationResult {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid AI request body.' };
  }

  const input = body as Record<string, unknown>;

  // No arbitrary custom instructions in the unauthenticated prototype.
  if ('prompt' in input && input.prompt != null) {
    return { ok: false, error: 'Custom AI instructions are not supported.' };
  }

  const tool = typeof input.tool === 'string'
    ? input.tool.trim().toLowerCase()
    : '';
  if (!aiToolSet.has(tool)) {
    return { ok: false, error: 'Unsupported AI operation.' };
  }

  if (typeof input.content !== 'string' || !input.content.trim()) {
    return { ok: false, error: 'Content must be a non-empty string.' };
  }
  if (input.content.length > 6000) {
    return { ok: false, error: 'Content exceeds the 6000-character limit.' };
  }

  let platform: string | undefined;
  if (input.platform != null) {
    if (typeof input.platform !== 'string' || !platformSet.has(input.platform)) {
      return { ok: false, error: 'Invalid platform.' };
    }
    platform = input.platform;
  }

  let platforms: string[] | undefined;
  if (input.platforms != null) {
    if (
      !Array.isArray(input.platforms) ||
      input.platforms.length < 1 ||
      input.platforms.length > 8 ||
      !input.platforms.every(
        (p): p is string => typeof p === 'string' && platformSet.has(p),
      ) ||
      new Set(input.platforms).size !== input.platforms.length
    ) {
      return { ok: false, error: 'Invalid destination platforms.' };
    }
    platforms = input.platforms;
  }

  let tone: string | undefined;
  if (input.tone != null) {
    if (typeof input.tone !== 'string' || !toneSet.has(input.tone)) {
      return { ok: false, error: 'Invalid rewrite tone.' };
    }
    tone = input.tone;
  }

  let weaknesses: string | string[] | undefined;
  if (input.weaknesses != null) {
    const w = input.weaknesses;
    if (typeof w === 'string' && w.length <= 1000) {
      weaknesses = w;
    } else if (
      Array.isArray(w) && w.length <= 10 &&
      w.every((item): item is string => typeof item === 'string' && item.length <= 240)
    ) {
      weaknesses = w;
    } else {
      return { ok: false, error: 'Invalid weaknesses input.' };
    }
  }

  return {
    ok: true,
    value: {
      tool: tool as AiTool,
      content: input.content.trim(),
      ...(platform ? { platform } : {}),
      ...(platforms ? { platforms } : {}),
      ...(tone ? { tone } : {}),
      ...(weaknesses !== undefined ? { weaknesses } : {}),
    },
  };
}
