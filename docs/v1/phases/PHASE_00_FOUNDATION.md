# Phase 00 — Foundation

## Goal

Make the existing application safe to evolve without hidden data/time/state errors.

## In scope

- persisted-state versioning and deterministic migrations
- workspace isolation audit
- schedule time utilities using IANA timezone -> UTC
- automated test setup
- reducer/selector/time tests
- mock/demo truth labeling
- media persistence audit
- lint/build validation

## Acceptance criteria

- A persisted schema version exists and migrations are explicit.
- Schedule conversion does not depend on browser timezone.
- Critical selectors cannot leak another workspace's records.
- Workspace deletion cascade is covered by tests.
- Demo social accounts/analytics are not presented as verified live data.
- Test, lint, and build commands are documented and green.

## Out of scope

- new Composer AI features
- OAuth
- real social publishing
- cloud database migration
- new analytics charts
- Content DNA
