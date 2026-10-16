# Creator Lab — read-only privileged-function and RLS triage

**Inspection: 2026-10-16.** Project: `aoyrijspyygqoyeajxpf`. Baseline git `main` at the start of this audit: `e5c4a4f22cb11f31090af325eb81fec3e54b6c81`.

## What was actually verified

This is **read-only structural inspection of the live database**, not a real JWT, browser, security penetration, or cross-user access test. The query retrieved live `pg_get_functiondef`, `has_function_privilege`, `pg_policies`, the Supabase security advisor and the Auth-user count. No SQL changes, role changes, migrations, user creation, secrets or data mutations were performed.

- Supabase security advisor returned **four WARN findings**: `authenticated_security_definer_function_executable` for `creator_can_edit(uuid)`, `creator_create_workspace(text,text)`, `creator_is_member(uuid)`, `creator_is_owner(uuid)`.
- The four reported functions are `SECURITY DEFINER` with **`search_path = ''`**, not unqualified dynamic SQL. Each membership check references `public.creator_workspace_members` and **the current `auth.uid()`**, not caller-supplied user IDs. `creator_create_workspace` creates a new workspace and corresponding owner membership only for `auth.uid()`, validates workspace name (2–100 chars) and a PostgreSQL IANA timezone name.
- Live function privilege checks: **`anon EXECUTE = false`, `authenticated EXECUTE = true`** on all four. `creator_guard_destination_identity()`, an internal privileged trigger function, has **no direct `anon` or `authenticated` EXECUTE**.
- Public `creator_*` row security policies observed: `creator_is_member(workspace_id)` for relevant SELECTs; `creator_can_edit(workspace_id)` on mutable content; workspace UPDATE/DELETE uses `creator_is_owner(id)`. The owner/role helper functions are intended to break recursive membership RLS lookups.
- Current `creator_posts` and `creator_post_destinations` client INSERT/UPDATE policies restrict `status='draft'`, `scheduled_at IS NULL`, `published_at IS NULL` and corresponding publisher fields; direct browser API is not permitted to claim provider publication.
- Live `storage.objects` policies for the private `creator-media` bucket were present: SELECT requires workspace membership, INSERT requires edit rights, DELETE requires edit rights **and absence of an attached post/media link**. No general Storage UPDATE policy was observed: overwrite/upsert should **remain disabled** for immutable uploads, not casually enabled.
- **Auth users = 0** in another read-only count. No real A/B issued-JWT verification has been completed.

## WARN-by-WARN assessment (design review only)

| Function | Intended purpose | Static risk assessment |
| --- | --- | --- |
| `creator_is_member(uuid)` | Boolean permission check for the calling JWT subject | Read-only membership lookup scoped to `auth.uid()`; no caller-controlled subject identifier. Authenticated callable by design; not proof of exploitable bypass. |
| `creator_can_edit(uuid)` | Boolean permission check for owner/editor | Read-only role lookup scoped to `auth.uid()`; again requires live verification of RLS isolation. |
| `creator_is_owner(uuid)` | Boolean permission check for owner | Read-only, checks actual membership + `role = 'owner'`; test role separation with true signed-in accounts. |
| `creator_create_workspace(text,text)` | Atomic creation of workspace + owner membership | Auth-identity bound and validated, but write-capable and intentionally elevated; **abuse/rate-limit/quota controls** should be designed before broad public signup. Check Supabase Auth anonymous-user settings: `TO authenticated` alone is not proof of permanent verified email identity if anonymous sign-in is enabled. |

These **four advisor warnings remain WARN**; do not remove/ignore or mark them definitively harmless on this report alone. If future architecture removes these functions or moves them into a private schema, check every RLS policy and all PostgREST RPC call sites first: revoking authenticated EXECUTE indiscriminately will break the real app.

## Remaining hard gates

1. **Issue [#36](https://github.com/memetreza34-ux/Creator-lab/issues/36) is BLOCKED**: owner must provision two confirmed distinct Auth test users and encrypted GitHub Actions secrets as in [the main-only runbook](../v1/LIVE_RLS_ACTIONS_RUNBOOK.md). Run the existing real issued-JWT REST/Storage acceptance; retain only sanitized PASS/FAIL evidence, including cleanup and denied cross-tenant operations.
2. Follow up any failed permission check or privilege design finding with a minimal **versioned migration + integration regression tests**, and rerun advisors; **do not mutate the production database speculatively**.
3. Test actual Auth configuration (anonymous sign-in policy, email confirmation, redirect allowlist, session revocation), resource-abuse limits and client-side privileges independently. A valid `authenticated` PostgreSQL role is not equivalent to proven email confirmation.
4. Verify deleting a workspace and any referenced private media cannot leave inaccessible orphaned Storage objects or destroy user data without explicit warning and safe cleanup.
5. Browser-level Auth → workspaces → draft → private media → manual plan/export acceptance, second device, logout, rate-limits and recovery still required after backend proof.

**Reference:** [Supabase linter 0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Primary source is the live project inspection on 2026-10-16; this report cannot replace future red-team or real-world security assurance.
