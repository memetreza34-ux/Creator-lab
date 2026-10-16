# Phase 4 — Authenticated Cloud API Adapter (pre-integration)

**Status:** Code present on this branch. NOT connected to AppContext or an Auth UI.
This module does not imply that login, cloud persistence or cross-device sync works.

## What it implements

'src/cloud/creatorCloudClient.ts' is a narrow client for the already-provisioned
dedicated Creator Lab Supabase database (schema from PR #16). It:

- Requires the exact project URL and a 'sb_publishable_' browser-safe key.
- Requires a fresh Supabase Auth access token on **every** operation, and fails
  before network access if there is no token or the JWT is an anonymous or
  service_role token. Client-side claims validation is only defense in depth:
  Supabase verifies signature, issuer, expiry and workspace RLS.
- Lists only the user's RLS-visible workspaces; creates a workspace only through
  the owner/membership RPC 'creator_create_workspace'.
- Reads only the explicitly named workspace's pipeline items and posts.
- Creates one new content idea in that workspace and requires the server to
  return exactly one persisted row before reporting success.
- Rejects bad workspace UUIDs, never puts a JWT into URL parameters, and omits
  raw SQL or server error bodies from displayed exceptions.
- Imports SQL-generated row types from 'src/backend/database.types.ts'.
- Does not read/write browser localStorage, seed demo data, copy IndexedDB
  blobs, publish provider content, or fake successful cloud operations.

## Intentionally missing and gated

- The browser Auth/session provider must be implemented using a maintained,
  locked and verified Supabase Auth SDK. That provider must handle registration,
  email confirmation, password reset, refresh, sign out, and session/user changes.
- Connect this adapter to the production workspace/AppContext flow **only after**
  real issued-JWT A/B isolation proof and safe local-to-cloud import UX exist.
- Do not load local mock workspaces on cloud sign-in. Do not silently merge
  unrelated browser-local state into a real user's workspace.
- Implement private Storage upload, cross-device media and server jobs later.
- A browser cloud client must NEVER receive service_role or secret keys.
- Enforce RLS server-side even though this adapter additionally filters requests
  by workspace ID; frontend filtering is not authorization.

## Usage contract (not active UI)

After Auth integration, construct the client with the verified Supabase project
URL, a **publishable** key, and a function that obtains a refreshed user JWT
from the Auth session manager. Invoke 'listWorkspaces()', 'createWorkspace()',
'listContentItems()', 'createContentItem()' or 'listPosts()'. Surface
CloudAuthenticationRequired by sending users to sign-in and handle
CloudRequestError with a safe retry/permissions message.

## Validation

'src/cloud/creatorCloudClient.test.ts' uses a fake network to cover config
and key rejection, auth/JWT gating, authorization headers, RPC-only workspace
creation, workspace query scoping, persisted INSERT acknowledgement and
sanitized error messages.

**Not yet executed on repo CI:** GitHub Actions issue #19 prevents runners
from starting. Future merge gate: npm test, npm run lint, npm run build.
Real two-user RLS/Storage test PR #23 must pass before onboarding is enabled.
No deploy, OAuth integrations or payments are part of this slice.
