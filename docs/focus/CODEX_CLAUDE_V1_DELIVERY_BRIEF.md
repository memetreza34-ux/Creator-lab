# Creator Lab — V1 code integration brief (Codex implementation, Claude independent review)

**Inspected 2026-10-16.** Intended working base: current `main` starting at `e5c4a4f22cb11f31090af325eb81fec3e54b6c81`; re-fetch before branching. Owner/agent responsibilities are in [AI_OWNERSHIP_V1.md](AI_OWNERSHIP_V1.md). **Do not implement this brief automatically:** Codex must be explicitly invoked; Claude follows when a reviewable PR exists.

## Open-PR inventory after 2026-10-16 cleanup

The only open PRs are the **six source DRAFTS** [#39](https://github.com/memetreza34-ux/Creator-lab/pull/39), [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25), [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26), [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27), [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29), and [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31). Older [#4](https://github.com/memetreza34-ux/Creator-lab/pull/4), [#8](https://github.com/memetreza34-ux/Creator-lab/pull/8), and [#22](https://github.com/memetreza34-ux/Creator-lab/pull/22) were **reviewed and closed without merge** due to scope/conflicts; commits remain readable. Do not cherry-pick old blanket redesigns. [PR_MERGE_MAP.md](PR_MERGE_MAP.md) records precisely what is already in `main` and what was deferred, including the important Experiment Lab truth gap and remaining Composer keyboard QA. This cleanup does **not** mean #36 passed or that cloud features were implemented.

## Product choice (no re-design, no broad scope)

Deliver one secure **invite-only M1**: actual email Auth, own workspace, idea, draft/caption and per-platform text variants, private file upload/preview/attachment, **manual date/time plan in workspace timezone**, human-controlled copy/export/download. Multi-device data should roundtrip through Cloud. **No auto-publishing, OAuth connections, fake analytics, billing, client-forged scheduled/published statuses or unauthenticated paid AI.**

The current `main` is a focused **local** V1. Its `src/App.tsx` has only Dashboard, Create, Calendar, Ideas/Pipeline, Posts, Media and Settings. The existing pages use local `AppContext` and IndexedDB for files. Treat this as a UI/UX reference; do not make a permanently separate second Cloud product or combine local and cloud records without an explicit import step and tested migration.

## Reuse this exact PR sequence; do not blindly merge the old stack

| Source | Content to reuse | Integration decision |
| --- | --- | --- |
| [#39](https://github.com/memetreza34-ux/Creator-lab/pull/39), branch `integration/cloud-auth-v1-20261016` | Hardened `src/auth/creatorAuth.ts`, Auth test suite, pilot `CloudAccountPage.tsx`, Vite env declarations | CI 125 app tests + 9 offline security fixture tests passed on final known head `a902efa6cc61c38af3d7a8f62db925046d804794`. **Still draft / not main** and not live-verified. Preserve late-restore/log-out/account-switch safeguards. Do not overwrite newer lean M1 shell with original #25. |
| [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25) | Original Auth/pilot context | Superseded for the tested Auth files by #39; use for reference only, not a second implementation. |
| [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26) | `src/components/cloud/CloudPipelinePanel.tsx`, updated Cloud API+tests | Port the actual idea/pipeline CRUD and stage UI selectively, preserving `main` routes and existing status-truth contract. |
| [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27) | `src/cloud/cloudDrafts.ts`, `cloudPlatforms.ts`, `CloudDraftComposerPanel.tsx`, Cloud client+tests | Draft-only CRUD, captions/platform variants; reject published/provider status writes. |
| [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29) | `creatorMediaClient.ts`, tests, `CloudMediaLibraryPanel.tsx` | Authenticated private Storage, object-path workspace scope, size/type checks, download, stable previews and safe deletion. |
| [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31) | `CloudDraftAttachmentsPanel.tsx`, post-media client changes, `database.types.ts` | Relational media attachments for saved drafts; avoid replacing private links with untrusted `mediaIds` JSON. Cross-account and attached-delete tests mandatory. |

**Known source-level compile issue to fix while porting:** in the inspected #31 branch, `src/components/cloud/CloudDraftComposerPanel.tsx` references `createCreatorMediaClient` and renders `CloudDraftAttachmentsPanel` but **does not import either symbol**. This has not been confirmed by a full CI run on that old branch; fix its imports in the NEW integration branch and require TypeScript/build checks. The old stacked chain cannot be assumed clean merely because #39 builds.

**Important:** #31 reflects cumulative stacked cloud work; it is **not** based on current `main`. Old cloud `src/pages/CloudAccountPage.tsx`, `src/App.tsx` and sidebar must not overwrite hardened #39 Auth or the slim local UI. Prefer small PRs that independently pass CI; do not reconcile by copying entire historical branch trees.

## Exact Codex tickets, sequential (after owner provides real security gate)

1. **C1 — integrate verified Auth and Cloud-only data access into one M1 navigation.** Use #39 security protections, one logical workspace context, clear config-missing/unauthenticated/empty/loading/error states. Do not import local/demo data invisibly. Keep Local V1 use clearly marked during migration; single future Cloud source of truth. Unit test logout/recovery/race conditions and a real browser login after provisioned users.
2. **C2 — pipeline/drafts/private media.** Selectively port #26 → #27 → #29 → #31 files as above, fix missing imports, verify actual `creator_posts` + `creator_post_media` types, owner/editor/viewer isolation, media object lifecycle and failures. Do not fake provider acknowledgements. Unit, integration and two-user private Storage acceptance required.
3. **C3 — true *manual* planning in Cloud.** Existing Supabase `creator_posts.status='scheduled'` and `scheduled_at` **must remain server-owned**; do not relax RLS or spoof provider status. Design an independent owner-controlled plan field/table with a reviewed versioned migration, date/time + IANA zone + DST gap/overlap behavior, and clear `Manuell geplant / Nicht veröffentlicht` UI. Plan must show consistently in Calendar and Posts; copy/export manually.
4. **C4 — browser E2E + release fixes.** Automated and actual browser signup/confirmation/login/restore/reset/logout, cross-user row/media isolation, new-account UX, failed upload/429/network, persistence across second device, 375px mobile, keyboard, deletion/export. `npm ci`, `npm test`, `npm run lint`, `npm run build` plus independent manual proof. Resolve UI dead ends before review.

**Stop rule:** real [#36](https://github.com/memetreza34-ux/Creator-lab/issues/36) A/B JWT/Storage gate must pass before inviting customers or launching the cloud experience. Non-live preparatory code can be reviewed in drafts but must remain explicitly labeled **NOT LIVE VERIFIED**. Any schema change must be reviewed/verified and handled with a versioned migration before controlled apply. Do not submit production credentials to an agent.

## Claude review instructions (only after a Codex PR exists)

Review the **specific final PR URL + head SHA**, not a speculative roadmap. Check in descending severity: (1) auth/token/account-switch race; (2) RLS/function permissions and object-path IDOR; (3) upload/delete and orphaned private Storage assets; (4) plan semantics/DST vs provider claims; (5) state/UX/a11y/mobile/empty/failure states; (6) dependency/CI evidence. Report **`BLOCKER`, `WARNING`, `SUGGESTION`** with file+line, reproduction and minimized fix. No parallel rewrite/merge. ChatGPT or the human owner makes the integration decision after Codex addresses findings and CI is green.

## ChatGPT completion / owner-only gates

ChatGPT owns **decisions and evidence checks**, not all Codex implementation: scope freeze, PR dependency map, read-only privileged-function review, security acceptance evaluation, task prioritization and go/no-go recommendation. No background work is implied.

The project owner must:
- Create **two separate confirmed disposable Auth test users** through the real Supabase Auth flow and safely set five encrypted GitHub Actions secrets via [the manual runbook](../v1/LIVE_RLS_ACTIONS_RUNBOOK.md).
- Start the main-only security workflow, then share only the **run URL and scrubbed PASS/FAIL outcome**; do not share passwords/tokens.
- Later configure intended domain, deploy settings, Auth callback allowlist, email delivery, legal/privacy requirements and decide whether real invite-only users may enter.

**Acceptance:** Codex can read this one brief and deliver bounded PRs; Claude can independently review actual commits; ChatGPT can issue an evidence-based decision; the owner can reach M1 without recurring broad "what next" planning. No automatic provider posting required for M1.
