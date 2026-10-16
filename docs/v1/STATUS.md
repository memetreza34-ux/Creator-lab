# V1 Status

Last updated: 2026-10-16 (phase 4 reconciliation)

## Current phase

PHASE 4 — CLOUD AUTH INTEGRATION (release pending)

## Overall status

Planning baseline established. Existing frontend is substantial, but production trust boundaries are incomplete.

## Completed before this plan

- Typed workspace-scoped core domain.
- Local persistence normalization/migration baseline.
- Workspace deletion cascade.
- Composer platform-specific content typing and schedule query normalization.
- Workspace-scoped analytics/dashboard data.
- Server-side Gemini key usage and API validation/rate-limit baseline.
- CI workflow running TypeScript validation and production build.

## Phase 0 remaining

- [x] Introduce an explicit persisted-state schema version and migration pipeline.
- [x] Define/test workspace timezone -> UTC schedule conversion helpers.
- [x] Add automated test framework and critical tests for reducer/selectors/time conversion.
- [x] Audit demo/mock truth labels so fake accounts/analytics cannot be mistaken for live provider data.
- [x] Re-audit media persistence/storage behavior and document production migration needs.
- [x] Run tests/lint/build for the completed Phase 0 block.
- [x] Update this file with evidence and move to Phase 1 only when Phase 0 exit criteria pass.

## Completed in current Phase 0 block

- Added `tsx --test` using Node's built-in test runner; no new test dependency required.
- Added tests for date/time validation, IANA timezone conversion, DST gaps, workspace selectors, and destructive workspace cascade behavior.
- Composer scheduling now interprets date/time in the active workspace timezone and stores canonical UTC instead of silently using the browser timezone.
- Added persisted-state schema version `1` with a deterministic migration pipeline for legacy unversioned `creator_lab_state`.
- Legacy state now normalizes workspace ownership across accounts, posts, media, folders, pipeline items, experiments, analytics, and post performance.
- Current state serializes through an explicit versioned envelope; unsupported future schemas are rejected instead of being guessed.
- Added migration tests for ownership, legacy defaults, round-tripping, malformed JSON, and future-version rejection.
- CI runs automated tests before TypeScript validation and production build.

## Completed truth & media block

- Added explicit data-origin metadata for analytics and post performance.
- Added explicit demo-vs-OAuth account mode so prototype accounts are no longer presented as live provider connections.
- Removed fabricated analytics fallback multipliers, synthetic trend interpolation, and the hard-coded dashboard performance claim.
- Added media storage origin metadata (`demo_remote`, `indexeddb`, reserved `remote`).
- User uploads now fail visibly if IndexedDB persistence fails instead of creating false-success metadata.
- IndexedDB assets resolve fresh runtime URLs after reload; persisted `blob:` URLs are no longer treated as durable.
- Documented the production object-storage migration boundary in `docs/v1/MEDIA_STORAGE.md`.
- Persistence schema advanced to version 2 so legacy local state receives the new truth/storage metadata safely.

## Phase 1 completed — destination capability block

- Added a centralized platform publishing capability registry.
- Demo accounts can be used for drafts, previews, and local planning only.
- Live publishing now requires both a real OAuth account and a verified Creator Lab provider adapter.
- No current platform is falsely marked as live before Phase 5 integration work.
- Composer validation now checks destination availability and platform caption limits through one deterministic layer.
- Demo destination chips are visibly labeled.
- "Publish Now" no longer creates a fake published post when live publishing is unavailable.
- Local scheduling explicitly says that nothing was sent to a social platform.
- Editing a scheduled post now converts stored UTC back into the workspace IANA timezone instead of the browser timezone.
- IndexedDB media URLs are resolved again inside Composer after reload.
- Prototype best-time UI is now labeled as a suggestion instead of claiming historical evidence.
- Added automated destination-capability tests.

## Phase 1 completed — Composer integrity block

- Composer edit routes are now workspace-scoped; a post from another workspace cannot be edited through a guessed URL.
- Existing destination IDs are filtered to accounts owned by the active workspace.
- Duplicate and unavailable media references are detected and sanitized before persistence.
- Platform overrides for unselected destinations are not persisted as stale hidden content.
- Existing `createdAt` and source-content traceability are preserved when editing.
- Inherited vs customized platform content is explicit in the UI.
- Composer shows a single validation summary for selected destinations and invalid media references.
- Unsaved content, destination, media, and schedule changes are protected on internal navigation and browser unload.
- Added deterministic media integrity tests; current suite contains 22 passing tests.

## Phase 1 completed — final Composer quality audit

- Removed fabricated likes, views, comments, repost counts, timestamps, and misleading sponsored/audio labels from platform previews.
- Platform previews are now explicitly static previews; engagement is not simulated.
- Preview media uses resolved runtime URLs instead of stale persisted blob URLs.
- Centralized deterministic helpers now own platform override inheritance, cloning, and reset behavior.
- Added regression tests proving base-content changes do not overwrite customized platform content and reset restores inheritance without mutating previous state.
- AI "Insert at Cursor" now inserts at the actual textarea selection instead of silently appending.
- AI history is keyboard-accessible, restored hooks apply to current Composer content, and rewrite regeneration preserves the selected tone.
- Hashtag selections resync when a new AI result is shown.
- Platform Optimization no longer invents fallback adaptations when the AI response is malformed; it shows an explicit error and changes nothing.
- Added accessible labels/state for destination selection, rewrite tone, media removal/picker controls, schedule inputs, dialogs, and unavailable live publishing.
- Removed dead interaction styling from preview-only engagement chrome.
- Phase 1 acceptance criteria reviewed and satisfied.

## Phase 2 completed — lifecycle and traceability block

- Added centralized content-operation helpers for deterministic pipeline movement, source-linked stage synchronization, and post media-reference cleanup.
- Pipeline drag/drop now normalizes order in both source and target columns and persists changes through one batch action.
- Creating or updating a linked scheduled/published post automatically advances its source ContentItem to the corresponding pipeline stage.
- Deleting a ContentItem preserves downstream posts/experiments but clears their source references instead of leaving broken IDs.
- Deleting a Post removes its performance rows and clears experiment source-post references.
- Deleting a MediaAsset removes that asset ID from base and platform-specific post content.
- Removing a SocialAccount removes its post destination references; a scheduled post that loses its final destination becomes `needs_review` and its schedule is cleared.
- Platform-specific content for a removed account's platform is cleaned when no remaining destination still uses that platform.
- Posts now expose `failed` and `needs_review` as real status tabs and no longer show a dead Filter button.
- Pipeline form parsing now validates ContentFormat and Platform values instead of relying on `any`.
- Added regression coverage for cross-stage ordering, same-stage ordering, post→pipeline stage synchronization, orphan cleanup, media cleanup, and lost-destination review behavior.

## Phase 2 completed — content UI integrity block

- Added workspace-scoped selectors for ContentItem↔Post traceability, MediaAsset usage, and SocialAccount usage.
- Added regression tests proving those selectors do not leak records from other workspaces and do not double-count platform-specific media references.
- Media Library now shows when an asset is referenced by posts and explains the exact local impact before destructive deletion.
- Media deletion messaging explicitly distinguishes Creator Lab record cleanup from external social-platform content.
- Posts resolves IndexedDB media URLs at runtime, so locally persisted uploads preview correctly after reload instead of depending on stale/empty persisted URLs.
- Posts displays its linked Pipeline source when one exists, derived from sourceContentItemId rather than duplicated display state.
- Pipeline cards show the number and latest status of linked posts without introducing a second source of truth.
- Social Accounts now says "Add Demo Account" instead of implying real OAuth connectivity.
- Removed the dead account Settings control and made account-removal impact explicit, including scheduled-post review behavior.
- Documented the current historical-destination limitation and the required future PostDestination snapshot model instead of hiding the limitation with duplicated fields.
- Phase 2 acceptance criteria reviewed and satisfied.

## Phase 3 completed — workspace-timezone Calendar block

- Added central calendar scheduling helpers for workspace-local day/hour membership and UTC rescheduling.
- Month/Week/Day views now display and locate scheduled posts using the active workspace IANA timezone rather than the browser timezone.
- Drag-and-drop passes a civil date/time slot; Month preserves the original workspace-local wall-clock time across DST offset changes; Week/Day use the chosen workspace-local hour.
- Published, failed, and needs-review posts cannot be dragged to create misleading status changes.
- Invalid/nonexistent DST wall-clock slots fail visibly rather than silently moving a post.
- Local media previews in Calendar use resolved IndexedDB URLs, with a memoized dependency to prevent repeated resolution loops.
- Removed invented best-time performance boost percentages and confidence labels. Suggested times remain explicitly prototype planning slots, not analytics-driven forecasts.
- Added regression tests for cross-timezone calendar membership, DST rescheduling, slot times, workspace today date, and drag eligibility.
- Calendar states clearly that scheduling is local planning; no live provider publish job was created.

## Phase 3 completed — Dashboard timezone presentation block

- Dashboard's Upcoming Planned Posts now shows the same workspace-local dates and times as Calendar.
- The Today indicator uses the workspace date rather than the browser date.
- Performance chart date labels use workspace-local publication dates.
- Posts marked scheduled without an actual scheduledAt value are excluded from Upcoming Planned Posts instead of displaying a misleading createdAt fallback.
- Wording clarifies that these are locally planned posts rather than live provider releases.

## Phase 3 completed — cross-page date integrity block

- Posts list now displays the correct workspace-local date and time with explicit source labels: scheduled, published or created. A published post is no longer mislabeled using stale `scheduledAt`.
- Graceful fallback for legacy missing/invalid date fields; no fabricated publication timestamp.
- Media URL resolution in Posts now uses a stable memoized workspace-media dependency rather than a fresh array per render.
- Analytics performance trend date buckets are grouped in the workspace timezone, consistent with Calendar and Dashboard.
- The time parser now rejects autumn DST's repeated local wall-clock hour as ambiguous instead of choosing an unacknowledged UTC instant.
- Added regression tests for timestamp precedence, workspace date conversion, stale draft schedules, invalid timestamps and autumn DST.
- Formalized the scheduling truth contract and manual browser QA steps in `docs/v1/phases/PHASE_03_SCHEDULING.md`.
- Decision: simple queue slots deferred until real per-destination publishing jobs exist; advanced queues stay post-V1.

## Phase 4 preparation — destination domain contract

- First-class `PostDestination` local snapshots now hold per-account platform, account identity label/handle, planning state, and timestamps.
- Post creation/editing synchronizes per-destination rows; published historical snapshots remain after account removal and can still be shown in Posts.
- Deletion cascades clear destinations when posts/workspaces are deleted; pending detached destinations require review.
- Local persistence schema 3 migrates legacy v0-v2 states and guards against workspace-forged destination records.
- Regression tests cover per-account lifecycle, snapshots after reload, ownership boundaries, and deletion cascades.
- Phase 4 backend/auth requirements are specified in `docs/v1/phases/PHASE_04_BACKEND_AUTH.md`.
- This work is **a local domain foundation only**, not a functioning server data layer or live publishing.

## Next exact task

- Dedicated Creator Lab Supabase project is provisioned with six applied migrations (2026-10-09 to 2026-10-11), nine RLS-enabled creator tables and private Storage. All six applied migration sources are now in main via merged PRs #16/#28/#30; do NOT reapply to the same database.
- Two distinct real Auth JWTs and private Storage negative tests still **not executed** (no real users at 2026-10-16 check). Never enable customer access before verification.
- Add tested ownership checks for two independent users and multiple workspaces; do not build privileged write APIs before auth.
- Plan safe import of user-entered browser-local data; do not import or disguise demonstration content as real user data.
- Keep Phase 3 browser acceptance test open; code/CI success does not demonstrate real interactive calendar QA.
- Do not enable OAuth/social publishing or a billing/Pro entitlement until underlying provider and server enforcement work.

## Validation evidence

The core schema, provider state hardening, draft media protection, offline auth acceptance and RLS-only Cloud adapter have merged with GitHub tests, TypeScript and production build passing. This is **not** a live Auth or UX proof.
PR #14 (Phase 3) previously passed tests, TypeScript and production build.

## Phase transition

**PHASE 0 — FOUNDATION: COMPLETE**

**PHASE 1 — COMPOSER EXCELLENCE: COMPLETE**

**PHASE 2 — CONTENT OPERATIONS: COMPLETE**

**Current phase: PHASE 4 — CLOUD AUTH INTEGRATION (not released)**

## Verified repo reconciliation 2026-10-16

- GitHub Actions PR #16 original head rerun [#37961296344](https://github.com/memetreza34-ux/Creator-lab/actions/runs/37961296344) passed tests, TS check and production build; issue #19 is closed as recovered.
- The six live migration **version IDs** match the three initial files here plus the status and draft-media security migrations from #28/#30. Exact live HTTP Auth RLS is NOT verified.
- Main preserves PR #20's fail-closed Gemini endpoint and the new V1 focus rules. This source inclusion does not execute database schema mutations or activate Cloud routes.
- Four authenticated SECURITY DEFINER advisor WARNs require signoff and real two-user Auth tests before public release. See https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.
- Next: include the already applied server-owned-status and draft/media hardening migrations without rerunning them, then run genuine issued-JWT storage isolation and integrate one Cloud user journey.


## Verified 2026-10-16 execution checkpoint

- GitHub merged PRs #16, #28, #30, #32 and #24 after actual successful CI; last main validation [run #38849645708](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38849645708) PASS.
- Database already had six migration IDs installed and private Storage with RLS; they were **not** reapplied as part of merges.
- Offline security check on the fully combined schema branch: [run #38849401989](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38849401989), **92 automated tests and 9 explicit offline auth tests passed**, TypeScript and build passed. **No live issued-JWT test completed.**
- At last inspection the dedicated Creator Lab project had **0 Auth users**, so live multiuser acceptance is blocked. Secure setup and exact checklist: [issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36).
- Production AI remains disabled by default; Cloud data adapter is in source but not connected to a complete signed-in user experience.
- PRs #25–#31 remain staged Cloud UI work; #35 simplified browser-local UI was merged, but **no live Cloud integration exists**. No release claim. Next: real two-user Auth/RLS/Storage acceptance, then integrate a **single** authenticated Creator UI path.


## UX + local media status — 2026-10-16

- [PR #35](https://github.com/memetreza34-ux/Creator-lab/pull/35) merged: first-run empty local workspace, narrowed Creator navigation, optional planning-only targets, accountless draft saving and manual text export. Combined [run #38850132131](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38850132131) passed 109/109 automated tests plus 9/9 explicitly invoked offline Auth fixture tests, TypeScript and build.
- [PR #21](https://github.com/memetreza34-ux/Creator-lab/pull/21) merged: IndexedDB operations now confirm transaction commit before reporting a saved/deleted media file, and preview URLs survive rolled-back deletion. Real-browser QA remains open.
- #17 (expansive SaaS plan) and #18 (older duplicate branding) closed without deleting their PR histories.
- The **single next gate** is real authenticated two-user database + private Storage acceptance [issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36), then reuse existing Cloud UI PRs #25–#31 to connect one user journey; never claim local plans are provider schedule jobs.
