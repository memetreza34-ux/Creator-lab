# Phase 4 B-04 — Auth session and separate Cloud entry (pilot)

**Status: IMPLEMENTED ON BRANCH / NOT LIVE-VERIFIED / NOT CONNECTED TO DEMO STATE.**

This is an incremental real-auth pilot, not a claim that the entire Creator Lab
app is an authenticated SaaS yet.

## Product behavior

- '/': current **local demo** routes and localStorage-based AppContext. A visible
  banner explains that edits here do not belong to the signed-in cloud user.
- '/cloud': dedicated real Cloud account area:
  - Email/password sign-in and signup (email confirmation may be required).
  - Generic password recovery request and recovery-link callback.
  - Password replacement from the recovery session.
  - Tab-scoped session restore, JWT refresh and sign-out.
  - Auth-confirmed user identity and RLS-scoped workspace listing/creation.
  - First real Cloud content ideas, saved/read back from Creator Lab Postgres.
  - No demo workspace or analytics seed imported. No fake provider connections.
  - All cloud calls require a non-anonymous user JWT and are governed by RLS.
  - No publishing, social connection, paid billing or cloud composer is active.

This **does not** move the Composer/Calendar/Media/Posts data into Supabase.

## Implementation choices and limitations

The Auth transport ('src/auth/creatorAuth.ts') uses the official GoTrue
HTTP endpoints without an extra package. This avoids committing an
unverified SDK lockfile while the existing GitHub CI runner is blocked.
Before general release, replace/evaluate this narrow client against a
maintained, pinned 'supabase-js' SDK and complete a full Auth threat review.
The app still needs automated browser E2E and rate-limit/abuse testing.

- Auth tokens are held in browser 'sessionStorage', **per tab**, not in the local
  creator demo state. Signing out clears the tab session immediately. Remote
  logout is attempted but remote revocation has not been E2E-verified.
  Shared-device and XSS risk assessments remain launch blockers.
- On reload, the stored session is confirmed using '/auth/v1/user', or refreshed.
  Decoding JWT claims on the client only rejects obviously wrong tokens:
  Supabase's server signature/session validation remains authoritative.
- Refresh tokens are rotated; signout guards against a late refresh racing
  to reinstate a locally cleared session.
- Email account confirmation and reset links require Supabase Auth redirect
  URL allowlist configuration (see below). Tokens appearing in URL hashes are
  removed from browser history *before* the Auth API verifies them.
- Auth secrets, passwords, JWTs and raw server response/error bodies are
  never logged by app code.
- The cloud adapter and database types are provided by stacked PR #24 and #16.
- The real two-user JWT/Storage RLS probe is prepared separately in PR #23.
- The service may require custom SMTP before real account launch: the built-in
  Supabase mail service has low rate limits. Never claim email deliverability
  is proven without real confirmation/reset tests.

## Environment and Supabase dashboard

1. Use the existing Creator Lab project 'aoyrijspyygqoyeajxpf'.
   Do **not** create another database or reapply the three SQL migrations.
2. Provide the **publishable** API key via 'VITE_SUPABASE_PUBLISHABLE_KEY'
   and the expected project URL via 'VITE_SUPABASE_URL', as in '.env.example'.
   The VITE_ prefix makes values PUBLIC to browser JavaScript. NEVER use a
   service_role, secret key or database admin password in these settings.
3. In Supabase Authentication > URL Configuration, set the deployed site's
   Site URL and allowlist EXACT deployed callback 'https://<your-domain>/cloud'.
   For local preview, explicitly allow 'http://localhost:<port>/cloud'.
   Verify hostnames/ports rather than using '*'.
4. Verify email/password signups and email-confirmation policy; test normal
   email and password reset with **disposable** verified users.
5. Start 'npm run dev' once CI/dependencies are available; navigate to '/cloud'.
   The existing local prototype remains at '/'.
6. When testing, use two distinct confirmed users, validate each sees only
   their own RLS workspaces/ideas, create/reload ideas, and run the independent
   real JWT security probe described in 'docs/v1/LIVE_AUTH_RLS_ACCEPTANCE.md'
   on PR #23 before declaring B-03 complete.
7. Verify logout, refresh and stale-tab scenarios; ensure the app does not
   silently copy local demo data to a real account.

## Automated checks still required

- 'npm test'
- 'npm run lint'
- 'npm run build'
- Browser E2E: signup requiring confirmation / signup with immediate session,
  sign-in, wrong password, invalid/expired email link, recovery, reset, refresh,
  sign out, history/back after logout, offline/429 failures, workspace isolation,
  local demo separation, mobile and keyboard accessibility.
- Issued-JWT RLS/Storage probe on disposable Supabase Auth users.
- Security review: XSS/CSP, mail deliverability, session retention,
  signout from other tabs/devices, session revocation and restore.

**CI caveat:** GitHub Actions issue #19 still prevents runner allocation.
No repository test, build, deployment or production auth check is considered
passed merely because the code is present.
