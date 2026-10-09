# AI Prototype Boundary — Phase 4 Prerequisite

**Current purpose:** prevent the existing unauthenticated Gemini endpoint from
becoming an unmetered public paid-model proxy. This does **not** implement
production AI, Supabase Auth, quota billing, provider moderation or legal sign-off.

## Behavior

- In **production**, `POST /api/ai/suggest` returns HTTP 503 until a real
  authenticated workspace-aware endpoint replaces this temporary guard.
- In local development, the existing Composer suggestion operations continue
  to work with `GEMINI_API_KEY`, provided the request passes validation.
- All requests must specify an allowlisted operation, non-empty content up to
  6,000 characters, and only known platforms/tones. Multi-destination lists
  and weaknesses context are bounded.
- Arbitrary custom `prompt` requests are rejected; the Composer never
  required this bypass. Unsupported operation types cannot reach Gemini.
- Generation requests cap model output at 2,048 tokens, and backend failures
  show a stable public error rather than returning internal exception messages.
- Developer-only requests still use a prototype IP limiter; it is **not** a
  production rate/usage/billing guarantee.

## Re-enabling production AI requires

1. Real Supabase Auth and verified per-workspace membership (B-03/B-04).
2. A server-owned request/credit meter with concurrency-safe reservations and
   cost limits per user/workspace (PAY-02/AI-03).
3. Abuse rate limits, provider retry/budget controls, safe prompt construction,
   output validation, and vendor processing/AI transparency assessment.
4. Integration tests for different JWT users, forged workspace IDs, exhausted
   quotas, prompt-injection attempts, and save/restore of the user's draft.
5. Explicit removal/replacement of the temporary production 503, never
   a toggle for unauthenticated calls in a publicly reachable deployment.

## Validation

`src/server/aiRequest.test.ts` covers Composer request compatibility,
unrecognized operations, custom prompt bypass, input length, invalid/duplicate
destinations, rewrite tone, and weaknesses context. Must pass alongside
TypeScript/build checks when GitHub Actions is healthy.

This block should be merged only after credible verification. Open CI blocker:
[Issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19).
