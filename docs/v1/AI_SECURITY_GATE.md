# AI Prototype Boundary — Phase 4 Prerequisite

**Current purpose:** prevent the existing unauthenticated Gemini endpoint from
becoming an unmetered public paid-model proxy. This does **not** implement
production AI, Supabase Auth, quota billing, provider moderation or legal sign-off.

## Behavior

- Unauthenticated `POST /api/ai/suggest` is **HTTP 503 by default** — including when `NODE_ENV` is missing or set to production. No paid-model request is sent.
- Development is opt-in only: `NODE_ENV=development` AND `CREATOR_LAB_ALLOW_LOCAL_AI=YES` AND a loopback socket address (`127.0.0.1`, `::1`, IPv4-mapped loopback). No proxy forwarding headers are trusted for this local-only prototype. Never set the opt-in in public deployments.
- Once explicitly enabled for local development, Composer suggestions can use `GEMINI_API_KEY` and must also pass validation.
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

Merged CI PR #33 and the recovered historical runner [issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19) allow real automated validation. Merge only after this PR head passes tests, TypeScript and production build. This is a **temporary lock**, not Auth or quota implementation.
