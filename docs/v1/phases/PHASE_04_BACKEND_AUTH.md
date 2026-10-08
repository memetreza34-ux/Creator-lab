# Phase 04 — Backend, Auth & Cloud Data

## Goal

Replace browser-local authority with production identity and durable server-side data.

## Work

- authentication
- users/workspaces/memberships
- server-side authorization
- relational persistence
- object storage for media
- migrations
- API validation
- secure integration credential model
- production environment configuration

## Acceptance

Two users are isolated by server authorization, data survives devices/sessions, media is durable, and localStorage is no longer the production source of truth.

## First foundation block — PostDestination local contract

**Implemented in Phase 4 foundation PR (before cloud provider selection):**

- `PostDestination` represents one post/account pair, including workspace and parent post IDs, platform, account-name/handle snapshots, demo/OAuth origin, status, schedule and publish timestamp.
- Every new/edited post synchronizes its selected destination records without silently discarding historical published entries.
- Account deletion removes the active account reference but preserves historical published channel identity and marks non-published affected destinations `needs_review`.
- Deleting posts/workspaces cascades owned destination records.
- Versioned local persistence migrates legacy v0-v2 state to version 3 with newly derived destination snapshots. Migration cannot recover historical channel identity deleted *before* snapshots existed.
- Data derivation is still browser-local. **A locally marked `published` status is not evidence of provider delivery.** No OAuth/real publishing is enabled in this block.

### Domain contract before backend work

Future authoritative relational tables should include at minimum:

- users
- workspaces and workspace_members (authorization boundary)
- social_accounts (encrypted provider tokens; never browser-visible)
- posts
- post_destinations (immutable historical account snapshot, provider id, per-destination status)
- media_assets (private storage reference; ownership checks)
- publish_jobs (UTC due time, idempotency key, attempt count and failure classification)
- provider_events / post_performance_snapshots

A request must authenticate first, then prove membership in the resource's workspace. Never accept a client-supplied workspace ID as standalone authorization. Client-supplied social connection status does not grant provider authority.

### Deployment decision needed

Select one managed production provider for Auth + relational Postgres + private object storage. Recommended initial choice: Supabase, using server-enforced workspace authorization/RLS and secure token handling. Do not commit API keys, service-role secrets, or OAuth tokens. The existing `localStorage` and IndexedDB demo state must be migrated explicitly; do **not** synchronize the mock dataset as if it were real user data.

### Acceptance not yet satisfied

Phase 4 is **not complete** until two separately authenticated users are demonstrably isolated, server-side authorization is tested for all workspace data, media survives device/session changes, and the browser is no longer the authority for production state.
