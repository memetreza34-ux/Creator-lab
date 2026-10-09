# Creator Lab — Supabase Deployment Runbook (Phase 4)

## Current state (2026-10-08)

The connected Supabase account contains two **inactive** projects, `KlarKI Staging` and `memetreza34-ux's Project`. Neither was identifiable as Creator Lab. **Do not deploy this migration to either existing project.** It is committed as code, but has **not** been executed against a database.

User decision: use Supabase for Creator Lab. A dedicated project still requires choosing the organization and confirming the actual project cost before creation. Proposed project: `Creator Lab`, region `eu-central-1` (Frankfurt).

## New project initialization

1. Obtain user's explicit organization selection and cost confirmation before creating a project.
2. Create the separate project with Supabase tools in the chosen organization and region; wait until the project is healthy.
3. Review `supabase/migrations/20261009163035_creator_core_initial.sql`. This is an initial schema, not a migration for an existing Creator Lab database.
4. Apply the migration to that **new Creator Lab project only** and run `supabase/verify/001_security_preflight.sql`.
5. Inspect Supabase security/performance advisors and generated database types.
6. Verify Auth allowed redirect URLs, email confirmation behavior, registration abuse protections, and account deletion policies before opening registration.
7. Add project URL and **publishable** key to deployment environment. These are *public-client configuration*, not privileged secrets. Secret/service-role keys must **never** be committed or exposed in `VITE_*`, client bundles, logs, or localStorage.
8. Implement authenticated app routing and data repositories; switch production AppContext to server-backed data only after both-user RLS tests pass.
9. Migrate genuinely user-created local content through an **explicitly approved import** with new UUIDs, media upload, and verified ownership. Never silently import mock demo social accounts or simulated analytics.

## Domain tables in first migration

- `creator_workspaces` — server-created via `creator_create_workspace(name, timezone)`
- `creator_workspace_members` — membership/roles; **no direct client membership writes**
- `creator_content_items` — workflow records
- `creator_posts` — base/per-platform content and local plan states
- `creator_social_accounts` — browser writes limited to **demo** mode
- `creator_post_destinations` — per-account snapshots preserving channel identity
- `creator_media_folders` and `creator_media_assets` — private-storage metadata
- private `creator-media` Storage bucket, object keys prefixed by workspace UUID

The database *deliberately* has no client-exposed OAuth tokens, provider secrets, publish jobs, payment entitlements, or provider-verified metrics yet.

### Reviewed integrity safeguards

- A BEFORE INSERT/UPDATE trigger on `creator_workspaces.timezone` rejects names outside PostgreSQL's known timezone list, even when a workspace owner edits the row directly. Validating only the workspace creation RPC was insufficient.
- A BEFORE INSERT/UPDATE trigger on `creator_post_destinations` checks that any referenced account belongs to the same workspace **and** matches the destination's platform and connection mode. This prevents client-written demo destinations from disguising a real OAuth account reference.
- `supabase/verify/001_security_preflight.sql` now checks these triggers are enabled and that anonymous sessions cannot run the workspace creation RPC.
- Static SQL tests cover these contracts, but **do not replace actual Postgres migration execution and two-user/role-level checks**.

**Additional negative cases before release:**

1. Authenticated workspace owner updates their `timezone` to `Mars/Nowhere`: database rejects; `Europe/Berlin` is accepted.
2. Owner inserts a demo destination with the UUID of a server-created OAuth account: rejected by account-mode guard.
3. Owner inserts destination with a platform different from its referenced account: rejected.
4. Owner inserts a genuine demo destination for their own workspace/account: accepted.
5. Owner attempts a referenced account outside workspace: rejected by workspace-scoped FK/RLS.
6. After deleting an account, existing published snapshot with `social_account_id = null` retains platform/account label, and no forged published status can be inserted by a browser.


## Trust boundaries

**Authenticated browser**: may read workspace data if a member; owner/editor may edit content; viewer is read-only. Auth users may create a workspace via the vetted SECURITY DEFINER RPC. No direct membership privilege escalation. Demo social-account writes cannot turn into verified OAuth connections. Clients cannot mark posts/destinations `published` through normal policies.

**Trusted backend only** (later): provider OAuth exchange and refresh, publish-job execution, provider statuses, encrypted credential storage, subscription enforcement, metrics sync. Never use privileged service keys inside the frontend.

**Storage**: private bucket. A client can only access `creator-media/<workspace_uuid>/...` if a matching active workspace membership authorizes it. Database asset metadata likewise requires workspace ownership. Check file type, extension, size, malware policies, storage quotas, and signed URL lifetime before production uploads.

## Two-user authorization test — not yet executed

The SQL catalog preflight is **not** a proof of true authorization. Run on a separate fresh project with two test Supabase Auth users (A and B), and record the result:

1. A invokes `creator_create_workspace` and creates A's post and media folder.
2. B creates an independent workspace. B cannot SELECT/UPDATE/DELETE A's workspace/post/media or read private files even if B knows A's UUID or object path.
3. A cannot SELECT/UPDATE B's data.
4. Unauthorized/anonymous clients cannot invoke workspace creation or read any rows/media.
5. A cannot insert themselves as owner into B's membership, escalate a viewer to owner, or forge `connection_mode='oauth'`.
6. A cannot mark a planned post or destination published, attach data to a post/account from B's workspace, or access B's signed media URLs.
7. Browser-supplied `workspace_id` is not trusted without database authorization.
8. Editor vs viewer read/write boundaries are tested with a vetted, server-created membership fixture (not a browser-created role).
9. Confirm existing published post-destination identity survives deleting its social account. No provider publishing is implied by a local `published` row.
10. Verify workspace deletion cascades and signed URL expiration.

Tests must use actual authenticated JWT sessions and check both successful and denied operations; SQL catalog introspection alone is insufficient. Do not announce Phase 4 acceptance before these pass.

## Recorded project and exact migration lineage (2026-10-09)

- Supabase project **Creator Lab** in Frankfurt, project ref `aoyrijspyygqoyeajxpf`, active and dedicated to this application. Creation quote was **€0/month** for the selected organization.
- Initial schema applied successfully as migration `20261009163035_creator_core_initial`, followed by `20261009163313_creator_function_acl` and `20261009163442_creator_security_indexes`.
- The source filenames now match the **actual version IDs recorded in the database**, preventing a future migration runner from replaying a version under an unrelated filename.
- Initial SQL syntax errors were corrected before deployment; the failed attempt left no tables. A subsequent Supabase catalog preflight passed after anonymous execute grants were revoked.
- All **eight workspace-facing tables have RLS enabled**. Dedicated private media bucket `creator-media` exists. No customer accounts, imported content or provider credentials are present.
- Supabase security advisor still reports four intentionally callable authenticated SECURITY DEFINER functions: three workspace membership predicates and the workspace-creation RPC. These must be tested against genuine authenticated users and are not a claim of completed security acceptance. The direct-authenticated trigger function warning was removed.
- Performance advisor now reports only unused indexes expected on empty tables. Missing foreign-key index warnings were addressed.
- Generated database TypeScript definitions are committed as `src/backend/database.types.ts`.
- **NEXT: real two-user Supabase Auth RLS/storage tests and authenticated client integration.** Do not describe Phase 4 as complete until they pass.

## Deployment stages

| Stage | Required evidence | Status |
|---|---|---|
| Schema committed | Migration + static security regression checks | Prepared in PR |
| Dedicated project | User-selected organization + cost confirmation | Awaiting approval |
| Database deployed | Migration applied and catalog preflight | Not started |
| Real authorization | A/B authenticated RLS matrix | Not started |
| Client auth & state | Login, authenticated repositories, no mock upload | Not started |
| Durable media | Private Storage + cross-device proof | Not started |
| Phase 4 complete | All acceptance checks pass | Not started |

## Sources

- [Supabase: Securing your data](https://supabase.com/docs/guides/database/secure-data)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
