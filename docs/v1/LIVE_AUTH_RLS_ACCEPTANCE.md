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

1. Finish schema/security PR reviews and confirm migrations from PR #16, #28
   and **#30** are already applied to the dedicated project (and every intended
   test environment). Do **not** duplicate production migrations.
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
   owner's workspace path. Tests owner download via the **private authenticated
   Storage endpoint** (the previous probe used an incorrect private GET URL),
   forbidden other-user and anonymous download, and denied cross-workspace upload.
7. Creates an actual 'draft' in creator_posts and indexed file metadata in
   creator_media_assets; tests owner attachment via creator_post_media,
   forbidden foreign read/insert, direct schedule/connected-account fabrication
   denied, and attached Storage object/metadata deletion forbidden.
8. Detaches the file and verifies the object still exists after detachment.
9. Cleanup always checks and removes precisely tracked draft/media links
   **before** deleting Storage objects, even if a test assertion failed or a
   link-insert response was lost. Then removes the PNG via Storage API,
   verifies it is inaccessible, and deletes only temporary workspaces.
10. Exits nonzero on failed authorization assertions or incomplete cleanup.

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

## Execution note (updated 2026-10-16)

GitHub Actions runners have recovered; the historical [issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19) is closed.
Default PR checks run **credential-free offline fixtures only**. To execute actual
two-user Auth-issued JWT + private Storage acceptance, follow
[LIVE_RLS_ACTIONS_RUNBOOK.md](./LIVE_RLS_ACTIONS_RUNBOOK.md), which defines a
separate **manually dispatched, main-only** GitHub Actions workflow and five
encrypted Actions secrets. Never store credentials in commits, issues, PR
comments, public variables, screenshots or raw logs. A dedicated trusted
local execution is also supported. Do not mistake the workflow's existence
for a successful real security audit.

## Verification status, 2026-10-11

The new offline integration fixture is committed in
'scripts/verify-live-auth-rls.integration.test.mjs'. Its scenarios include
successful authorized linking, foreign-user denial, a forged-scheduled-post
negative test, and cleanup after an intentional security assertion failure.
The source has undergone a V8 syntax compilation check, but full Node.js
offline tests have **not yet been executed on a checked-out repository**.

Read-only Supabase inspection on 2026-10-11 still found **zero Auth users** and
zero cloud media links. Therefore the real two-user JWT test remains **NOT RUN**.
Do not use those missing results as evidence of launch readiness.

## Updated verification — 2026-10-16

Live read-only Creator Lab Supabase inspection confirmed six applied migrations:
`20261009163035`, `20261009163313`, `20261009163442`,
`20261010151402`, `20261011140325`, `20261011140925`.
Nine public Creator tables have RLS enabled, the `creator-media` bucket is private,
and the project currently has **zero** Auth users and zero workspace/post/media records.
This **does not** replace actual issued-JWT isolation testing.

GitHub Actions now starts jobs on new runs: PR #16 run [37961296344](https://github.com/memetreza34-ux/Creator-lab/actions/runs/37961296344) retry passed tests, TypeScript, build. The updated workflow in merged PR #33 enables stacked PR CI. This branch explicitly adds the **credential-free offline auth/RLS fixture** to the default `npm test` command, so this check must pass in CI before considering the test harness reviewed.

Next required action: provision two independent disposable *confirmed* Supabase Auth test users through a secure owner-managed channel and run the opt-in live harness. Do not commit or share emails/passwords/tokens in the PR. The test script must verify its own scoped cleanup. Review the existing four signed-in SECURITY DEFINER helper-function advisory warnings separately; they are intentional membership/RPC entrypoints pending security approval, not automatically proven vulnerabilities.


## Updated main integration checkpoint — 2026-10-16

All six schema and hardening migration sources are now in `main` via merged PRs #16, #28 and #30, and their **matching migration version IDs** were found in the dedicated Creator Lab database. This verifies schema-source traceability, not real HTTP authorization.

The corrected harness was successfully executed in GitHub Actions [run #38848199722](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38848199722): 86/86 unit tests and 9/9 explicit offline authorization harness tests passed, TypeScript and build passed. This branch's final rebased test results must be verified separately before merging.

**Stop condition:** Auth currently had 0 users at the most recent inspection. A REAL issued-JWT two-user test is impossible to claim without two verified disposable sign-ins. Do not mark live RLS or storage protection PASSED on the basis of offline fixtures or synthetic SQL claims. Owner must provision separate confirmed users in the dedicated Supabase project and run the existing opt-in test securely; avoid storing test credentials in GitHub.
