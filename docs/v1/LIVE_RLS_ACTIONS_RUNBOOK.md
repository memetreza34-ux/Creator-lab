# F-003 — Execute the real two-user security acceptance from GitHub Actions

**This runbook prepares the verification; it does not claim that live acceptance has passed.**
Status checked 2026-10-16: the existing Creator Lab Supabase project had **0 Auth users**.
Do not create users by writing to `auth.users`, do not fabricate signed JWTs, and do
not test with service-role or `sb_secret_*` API keys.

## Owner setup (once)

1. Open [Creator Lab Supabase Authentication → Users](https://supabase.com/dashboard/project/aoyrijspyygqoyeajxpf/auth/users).
   Set up **two separate, disposable, confirmed email/password Auth users** (A and B).
   They must be able to sign in through Supabase Auth. Keep password resets and test
   credentials out of PRs, chat, screenshots and committed files.
2. Fetch the existing Creator Lab project's **`sb_publishable_*` publishable key**
   from its [API Keys settings](https://supabase.com/dashboard/project/aoyrijspyygqoyeajxpf/settings/api-keys).
   Do not use the legacy service_role JWT or new secret API key.
3. In the [GitHub repo's Actions secrets settings](https://github.com/memetreza34-ux/Creator-lab/settings/secrets/actions),
   add exactly these five **encrypted repository secrets**, one value per secret:

   | Encrypted Actions secret | Value |
   | --- | --- |
   | `CREATOR_LAB_RLS_PUBLISHABLE_KEY` | Existing `sb_publishable_*` browser key |
   | `CREATOR_LAB_RLS_A_EMAIL` | Confirmed test user A email |
   | `CREATOR_LAB_RLS_A_PASSWORD` | Password for test user A |
   | `CREATOR_LAB_RLS_B_EMAIL` | Confirmed **different** test user B email |
   | `CREATOR_LAB_RLS_B_PASSWORD` | Password for test user B |

   Encrypted Actions secrets are **not** source-controlled files or public
   repository variables. Do not store these in GitHub issues, pull requests, `.env.example`,
   public variables, a branch, or a test report. Limit repository write access,
   because maintainers with write access can potentially access workflow secrets.
4. Review that the [dedicated Supabase project](https://supabase.com/dashboard/project/aoyrijspyygqoyeajxpf)
   has the six previously installed migration versions. **Do not reapply them.**

## Start exactly once

1. Open [Actions → Live two-user Supabase RLS acceptance](https://github.com/memetreza34-ux/Creator-lab/actions/workflows/live-auth-rls.yml).
2. Choose **Run workflow**, select branch **`main`**, choose confirmation
   **`RUN_LIVE_RLS`**, then start the run. No automatic runs on PRs, on push,
   or on a schedule. No other branch may access these credentials through this workflow.
3. The workflow checks out **reviewed `main`** with minimal read-only GitHub permissions,
   runs the nine credential-free Node acceptance fixtures, checks that the five
   required secrets exist, and runs the real issued-JWT/Storage probe using
   Node 22 built-ins. No `npm install` or third-party application dependencies
   are executed in this credentials-bearing job.
4. Inspect only named PASS/FAIL and cleanup lines. Never publish or copy raw
   tokens, passwords, environment variable values or private response bodies.

The script creates only run-specific workspaces and a transparent 1×1 image
and must clean up the file, its relational attachment and temporary workspaces.
A failure, especially a `CLEANUP FAILED` line, is a **stop sign**:
investigate and clean up only run-specific assets as the owning test user;
do not broadly delete storage objects or user records.

## Green is not public beta approval

- Require both real Supabase Auth JWTs to be verified by `/auth/v1/user`,
  cross-user read/write/download denial, Storage ownership, fake-provider-state
  rejection, relational attached-file protections and verified cleanup.
- Review the existing four signed-in callable SECURITY DEFINER function warnings.
- Separately test browser signup/confirmation, recovery, refresh, logout,
  mobile, session safety and the combined authenticated Creator Lab UI.
- Record **only** the successful run URL + anonymized gate results in
  [issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36).
  Do not close that issue merely because the workflow exists or unit tests pass.
- After the security check, **remove the five temporary Actions secrets** and
  disable/remove the two disposable Supabase Auth test users after any necessary
  repeat runs. Check for leftover temporary data before disposing of the users.

For direct local execution with the same test users, see
[LIVE_AUTH_RLS_ACCEPTANCE.md](./LIVE_AUTH_RLS_ACCEPTANCE.md).
