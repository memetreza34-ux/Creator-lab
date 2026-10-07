# V1 Status

Last updated: 2026-10-07

## Current phase

PHASE 1 — COMPOSER EXCELLENCE

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

## Next exact task

Continue **PHASE 1 — COMPOSER EXCELLENCE** with a final Composer quality audit:

- audit platform previews against the centralized configuration and remove misleading preview behavior,
- verify every Composer control has a real effect and clear disabled/error state,
- add accessible labels/titles for icon-only and stateful Composer controls,
- audit AI result/apply/history behavior for accidental content loss,
- verify base-content changes never overwrite customized platform content,
- add regression tests for override inheritance/reset behavior where it can be kept deterministic,
- then evaluate the Phase 1 exit criteria before moving to Phase 2.

## Validation evidence

GitHub Actions run 37653293812 on PR #7 completed successfully:
- Automated tests: success (22 tests)
- TypeScript check: success
- Production build: success

## Phase transition

**PHASE 0 — FOUNDATION: COMPLETE**

**Current phase: PHASE 1 — COMPOSER EXCELLENCE**