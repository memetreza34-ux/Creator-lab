# M1 Cut List and Remaining Release Gates
Updated: 2026-10-15 — code branch `mvp/lean-beta-journey-20261015`
Scope reference: proposed focus PR #34. This document describes the **local M1 UX slice**, not a completed cloud beta.

## Keep in first release
1. **Overview** — user-created idea/draft/local plan counts and next step; no fabricated dashboard charts.
2. **Ideas / Pipeline** — capture and progress content ideas.
3. **Create** — base caption, selected manual target platform(s), optional platform-specific variant, reviewable basic AI rewrite, media, save draft, local plan.
4. **Calendar** — timezone-correct local planning and rescheduling, clearly NOT actual social scheduling.
5. **Posts** — saved drafts/manual plans, edit, duplicate, copy or export a UTF-8 .txt of actual text. No fake provider delivery.
6. **Media** — local upload, preview, download original uploaded browser file. Only JPG/PNG/WEBP/GIF/MP4/MOV to 25 MiB in this local prototype.
7. **Settings** — workspace/timezone setup.

## Actually removed from the M1 visible journey (code and existing data remain)
- Analytics route/navigation and demo metrics overview.
- Experiment Lab and unsupported statistical winner/AI success-score panel.
- Social Accounts route and demo-account onboarding.
- Dead notification/avatar buttons; misleading plan/tier copy and prototype best-time boost predictions.
- Default seed of demo posts, social accounts, experiments, media, analytics in NEW browser states. Existing saved data is **not** deleted.

## Added/fixed in this proposed PR
- Fresh local workspace starts empty, with browser timezone.
- Save drafts and plan locally without attaching a fake social account; real publish validation continues to require verified provider.
- Select manual YouTube, Instagram or TikTok preparation targets independent of connected accounts; store `Post.planningPlatforms` and normalize on reload.
- Export content including platform-specific/inherited variants and explicit manual-only notice; safe filenames. Copy fallback via text download.
- Download uploaded local original media (not demo remote media), input MIME/size guard; memoized media workspace array to avoid repeated preview effects.
- Narrow desktop sidebar and mobile bottom navigation; simplified overview and header.
- Targeted unit tests added for draft/local validation, clean seed, export; no CI or browser results claimed as passing.

## Important dependency truth
- `main` still relies on browser localStorage and IndexedDB, not production Auth/Postgres/private cloud storage. Do NOT advertise this PR alone as beta ready.
- PRs #16/#23/#24–#32 hold substantial **unmerged** cloud/security work; integrate and validate rather than reimplement. Rebase this UI slice onto the accepted cloud state as needed; in particular cloud drafts must persist manual target platforms too.
- PR #20 is the existing fix direction for unauthenticated production AI. Disable production AI until JWT auth + spending limits are enforced.
- CI issue #19 remains blocking: previous runs had no runner steps. No merge without credible typecheck/test/build + QA.
- Existing saved mock/demo state persists. Users should not have data cleared implicitly; a future safe migration should distinguish demo and user-owned records.
- No feature or data was deleted from old routes/components. Deprecated UI paths redirect to Overview in this branch.

## Still required for first invite-only REAL beta (M1)
- Resolve CI, review and consolidate existing stacked backend/security PRs and actual applied migrations.
- Genuine two-user JWT RLS/private Storage negative tests; no privilege or media leakage.
- Auth/login/recovery/logout and data that survives a second device.
- Cloud-first idea→draft→media→local calendar→copy/export integrated with a **single source of truth**. No separate shadow demo/cloud product.
- Real-browser tests: clean first visit, optional manual platforms, no accounts, long/empty text, media upload/download, DST planning, refresh/logout, mobile 375px, keyboard navigation, error recovery, data deletion.
- AI output/error handling and authenticated quota gate; otherwise leave AI disabled in the public beta.
- Invite-only feedback from actual target creators, privacy/security basics and staging deployment.

## First verified automatic publisher (M2, NOT M1)
- YouTube official OAuth/connect/disconnect/refresh; permission review/audit.
- Durable UTC publishing jobs with retries, idempotency, provider IDs and confirmed outcomes.
- Real provider metrics before enabling Analytics; verify API quotas/latency.
- Support, legal/privacy/operational gates before public commercial launch.

## Tests and verification
GitHub connector code edits only. `npm ci`, `npm test`, `npm run lint`, `npm run build` and interactive browser/E2E were NOT run here due unavailable executable checkout and unresolved Actions runner. All review/merge gates remain open.

## One next action
Diagnose issue #19, reconcile the first cloud security migrations and true JWT tests, then run full validations and rebase/integrate this focused interface slice with the cloud app before releasing M1.
