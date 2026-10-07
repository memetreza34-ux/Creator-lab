# V1 Status

Last updated: 2026-10-07

## Current phase

PHASE 0 — FOUNDATION

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
- [ ] Audit demo/mock truth labels so fake accounts/analytics cannot be mistaken for live provider data.
- [ ] Re-audit media persistence/storage behavior and document production migration needs.
- [x] Run tests/lint/build for the completed Phase 0 block.
- [ ] Update this file with evidence and move to Phase 1 only when Phase 0 exit criteria pass.

## Completed in current Phase 0 block

- Added `tsx --test` using Node's built-in test runner; no new test dependency required.
- Added tests for date/time validation, IANA timezone conversion, DST gaps, workspace selectors, and destructive workspace cascade behavior.
- Composer scheduling now interprets date/time in the active workspace timezone and stores canonical UTC instead of silently using the browser timezone.
- Added persisted-state schema version `1` with a deterministic migration pipeline for legacy unversioned `creator_lab_state`.
- Legacy state now normalizes workspace ownership across accounts, posts, media, folders, pipeline items, experiments, analytics, and post performance.
- Current state serializes through an explicit versioned envelope; unsupported future schemas are rejected instead of being guessed.
- Added migration tests for ownership, legacy defaults, round-tripping, malformed JSON, and future-version rejection.
- CI runs automated tests before TypeScript validation and production build.

## Next exact task

Audit demo/mock truth boundaries and media persistence. Ensure seeded accounts/analytics cannot be mistaken for live provider data, document current IndexedDB/local media behavior, and define the production migration boundary. Do not start Composer feature expansion yet.

## Validation evidence

GitHub Actions run 37635769771 on PR #3 completed successfully:
- Automated tests: success
- TypeScript check: success
- Production build: success
