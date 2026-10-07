# V1 Status

Last updated: 2026-10-07

## Current phase

PHASE 3 — CALENDAR & SCHEDULING ENGINE

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

## Next exact task

Start **PHASE 3 — CALENDAR & SCHEDULING ENGINE** with a scheduling-state audit before adding queue features:

- audit Calendar month/week/day behavior against one canonical scheduledAt UTC value,
- verify every rendered/editable time uses the active workspace IANA timezone,
- identify any remaining browser-local Date conversions that can cause timezone drift,
- verify drag/drop rescheduling preserves intended local time in Month view and updates date/time correctly in Week/Day views,
- verify published posts cannot be moved and failed/needs-review states are represented consistently,
- centralize deterministic schedule/reschedule helpers where page code currently owns business rules,
- add regression tests for timezone/DST/reschedule invariants,
- do not add durable backend workers or real provider scheduling yet; those belong to Phase 4/5.

## Validation evidence

GitHub Actions run 37659570369 on PR #11 completed successfully:
- Automated tests: success
- TypeScript check: success
- Production build: success

## Phase transition

**PHASE 0 — FOUNDATION: COMPLETE**

**PHASE 1 — COMPOSER EXCELLENCE: COMPLETE**

**PHASE 2 — CONTENT OPERATIONS: COMPLETE**

**Current phase: PHASE 3 — CALENDAR & SCHEDULING ENGINE**