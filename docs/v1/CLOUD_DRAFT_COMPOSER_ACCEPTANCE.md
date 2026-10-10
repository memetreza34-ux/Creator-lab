# Phase 4 — Cloud Draft Composer acceptance (B-05 continuation)

**Status: implemented in stacked DRAFT PR; NOT merged, deployed, browser-tested or live-JWT-tested.**

## Functionality delivered

Under `/cloud`, after signing in and selecting an authorized workspace, a second cloud-only panel allows the user to:

- Create text-only **draft** posts with a title and base caption/script.
- Pick an optional related Pipeline content item in the same workspace (composite FK prevents cross-workspace links).
- Add platform-specific caption variants for YouTube, Instagram, TikTok, X/Twitter, LinkedIn, Facebook, Pinterest and Threads (labels only; **not connected or published**).
- Save one complete draft in a single PostgREST transaction with `status='draft'`. The requested payload contains no `scheduled_at`, `published_at`, provider ID or arbitrary URL/media attachment.
- List cloud drafts in the current authorized workspace, reopen them, update the text or link, and delete one draft after user confirmation.
- Reload from server; any timeout/uncertain write triggers a warning and disables further mutations until a successful reload.

The workspace/account-specific React key clears local editor state when the user changes account or workspace. The original AppContext/demo Composer, Media, Analytics and Calendar are **not** cloud-migrated.

## Security and data integrity

- The frontend **never** sets the status to scheduled/published: API create sets only `draft`; PATCH/DELETE contain `workspace_id=eq.<uuid>&id=eq.<uuid>&status=eq.draft`. They require exactly one matching record from `Prefer: return=representation`, else show an error.
- The server's Creator Lab `creator_posts` RLS / membership policies are the actual authorization gate. Browser validation is defense in depth, not authorization.
- Only title, caption, one optional source UUID, and unique supported platform-specific captions are accepted. No direct metadata, account or provider status write; unsafe/extra fields are rejected before the request.
- Each caption is limited to 6,000 characters and all optional mediaId arrays are explicitly empty.
- Existing or externally-created drafts with media, disabled variants or unsupported JSON formats are **shown as protected** and cannot be edited/deleted in this pilot, preventing silent attachment loss.
- A source pipeline idea can be linked only within its original workspace: the database composite foreign key protects this at the server boundary.
- Server-provided errors are sanitized by the cloud API layer. The network only receives the user's JWT, never a service-role credential.
- Editing/deletion is restricted to draft records; the UI never attempts to modify a scheduled, published or failed post.

**Provider-state backend hardening:** The directly authenticated Data API previously
permitted forged `scheduled` and demo `connected` states. The restriction has now
been **applied and verified** in the existing Creator Lab Supabase project by migration
`20261010151402_creator_server_owned_provider_statuses`, tracked separately in
[security PR #28](https://github.com/memetreza34-ux/Creator-lab/pull/28). Until
PR #28 is merged with the schema on all release environments and actual issued-JWT
tests pass, this remains a **release-blocking dependency**. This Composer still
never makes real provider requests or advertises connected accounts.

## Tests to run

1. `npm test`, `npm run lint`, `npm run build` after resolving GitHub Actions runner infrastructure [#19](https://github.com/memetreza34-ux/Creator-lab/issues/19).
2. Test `src/cloud/cloudDrafts.test.ts`: pure schema conversion, rejection of status/media/privileged fields, caption bounds, duplicate platforms, legacy JSON parsing and incompatibility protection.
3. Test `src/cloud/creatorCloudClient.test.ts`: create-only draft, exact workspace/post/status-scoped PATCH/DELETE, no false success on zero-row RLS results, wrong rows/status and validation before HTTP.
4. **Live Auth acceptance** with two confirmed disposable users + cross-workspace DB/Storage rejection ([PR #23](https://github.com/memetreza34-ux/Creator-lab/pull/23)).
5. Browser E2E: sign in → create workspace → create pipeline idea → create linked draft → reload → edit variant → reload → delete draft → reload; two users, unauthorized viewer, failed network, expired session, mobile and keyboard.
6. Verify no Media IDs, OAuth accounts, scheduled timestamps, jobs, metrics or provider outcomes are written through this pilot. Real publishing is future work.

## Deferred

Cloud media upload/preview, full advanced Composer parity, richer platform-specific constraints, draft concurrency conflict resolution, server-side AI authorization, jobs and provider OAuth, real analytics, subscriptions and payments. Do not claim production readiness or two-user verification until all gates pass.
