# B-03 — Live-issued Auth JWT / RLS / private Storage acceptance

**Status: NOT EXECUTED until two confirmed real Supabase Auth test users and opt-in are supplied.**
This is different from the earlier SQL transaction/RLS simulations in PR #16.

## Goal

Demonstrate *real* Supabase Auth-issued access tokens against the deployed Creator Lab
REST/RPC/Storage endpoints. It must verify two independent user identities cannot
access each other's rows or Storage objects before enabling real customer cloud data.

The test uses **only** the dedicated project:
'Creator Lab' (ref: aoyrijspyygqoyeajxpf; Frankfurt).
It fails closed if pointed anywhere else.

## Preconditions

1. Finish PR #16 review. The project's three schema migrations are already applied.
   Do **not** re-run them or create a second Supabase project.
2. Create two separate, verified disposable Auth users via the Supabase dashboard or
   normal signup flow. Verify/confirm their email addresses. Do not use production users.
3. Make sure the Supabase Data API exposes 'public' and has the intended grants/RLS.
4. Obtain only the project's **publishable** API key (or legacy anon-role JWT).
   NEVER use a service_role, secret API key or database admin credentials.
5. Run from a trusted machine. Set variables in a local untracked environment;
   NEVER paste passwords/tokens into GitHub, PRs, shell history or screenshots.
6. Use Node.js 22+. Requires no additional NPM dependency.

Example (shell variables represented by placeholders; fill them safely from
a local secrets manager rather than committing a credential file):

- SUPABASE_URL=https://aoyrijspyygqoyeajxpf.supabase.co/
- SUPABASE_PUBLISHABLE_KEY=(project publishable key; NOT service role)
- RLS_TEST_A_EMAIL=(confirmed user A email)
- RLS_TEST_A_PASSWORD=(password A)
- RLS_TEST_B_EMAIL=(confirmed user B email)
- RLS_TEST_B_PASSWORD=(password B)
- CREATOR_LAB_LIVE_TESTS=YES

Execute 'node --test scripts/verify-live-auth-rls.test.mjs' for the **offline unit
guards** first; this neither contacts Supabase nor mutates any data.
Then execute 'node scripts/verify-live-auth-rls.mjs' with the above exported variables.

## What the integration script does

1. Uses the Supabase Auth password grant for both existing users and validates each
   issued access token against '/auth/v1/user'. It rejects equal user IDs.
2. Confirms anonymous workspace RPC access is denied.
3. Creates one uniquely labeled workspace per user through the production RPC
   'creator_create_workspace' and verifies the owner's membership works.
4. Verifies owner can SELECT own workspaces; another user sees an **empty** response.
5. Inserts an owner-scoped content item. Verifies that the other user cannot SELECT,
   INSERT, UPDATE or DELETE that owner's item.
6. Uploads one transparent PNG to the private 'creator-media' bucket under the
   owner's workspace path. Tests owner download, forbidden other-user and anonymous
   download, and denied cross-workspace upload.
7. Removes the PNG **via the Storage API**, not Postgres SQL, verifies it is no
   longer accessible, then deletes only the temporary workspaces created in the
   run. Reports failures and cleanup failures separately.
8. Exits with nonzero code on any failed assertion or failed cleanup.

**Important:** A successful offline unit test alone is NOT B-03 acceptance. A
successful green script run is only one part of the backend gate; browser
sign-in/logout/session refresh, multi-device persistence, viewer/editor roles,
storage limits, recovery, and the authenticated frontend still need separate
acceptance and proper E2E tests.

## Fail/cleanup procedure

If any 'CLEANUP FAILED' line occurs, inspect the dedicated project as the owner,
locate only the uniquely labeled temporary workspace/assets, and clean them
through the authenticated Storage API and owner workspace deletion. Never
bulk-delete unrelated customer workspaces. The script never uses service_role
or bypass-RLS credentials.

A cross-user read returning nonempty rows or a foreign write succeeding is a
**release-stopping security incident**. Pause cloud rollout, assess RLS, remediate,
rerun a fresh integration check. Report only check names/results, not JWTs.

## Execution note

The GitHub-hosted CI runner is currently blocked before first step
[Issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19).
Even when CI is restored, keep live tests **manually opted in** and separated
from default PR checks: they mutate dedicated staging data and require secrets.
Do not store those secrets as public variables or print token values.
