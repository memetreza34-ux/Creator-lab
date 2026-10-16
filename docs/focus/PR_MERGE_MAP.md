# Creator Lab — audited PR merge and handoff map

**Verified 2026-10-16; baseline `main` SHA `644a5e435e933ecb44e5f13e72c0e63733a8eb06`.** Re-fetch current `main`, PR state and CI before work. Primary execution truth: [NEXT_ACTIONS.md](NEXT_ACTIONS.md). Actual role handoff: [AI_OWNERSHIP_V1.md](AI_OWNERSHIP_V1.md) and [CODEX_CLAUDE_V1_DELIVERY_BRIEF.md](CODEX_CLAUDE_V1_DELIVERY_BRIEF.md).

## Current open PRs — six Cloud-only DRAFTs, **not merged**

| PR | Parent PR / base | Purpose and action |
| --- | --- | --- |
| [#39](https://github.com/memetreza34-ux/Creator-lab/pull/39) | `main` | **Best Auth integration source**. Hardened session restore/refresh/logout, recovery and account/workspace async races. Verified on head `a902efa6cc61c38af3d7a8f62db925046d804794`: [Actions #38881297418](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38881297418) 125 app tests, 9 offline security fixtures, TypeScript and production build PASS. **No real two-user acceptance.** Keep DRAFT / not live published until #36 passes. |
| [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25) | Already merged #24 original branch | **Historical Auth stack base**, useful as prerequisite to #26, but its Auth UI was superseded by #39. Do **not** merge wholesale; avoid reintroducing legacy Analytics/Experiments/Accounts navigation. |
| [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26) | #25 | Idea/pipeline CRUD; selectively port updated Cloud client + tests and `CloudPipelinePanel.tsx` to a fresh `main`-based PR. |
| [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27) | #26 | Draft composer, caption/platform variants, valid draft CRUD; selectively port `cloudDrafts.ts`, `cloudPlatforms.ts`, panel and relevant Cloud client/test changes. |
| [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29) | #27 | Authenticated private media client, preview/download/deletion; selectively port files/tests. |
| [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31) | #29 | Relational private draft attachments and DB typing. **Known source defect** in old `CloudDraftComposerPanel.tsx`: missing imports for `createCreatorMediaClient` and `CloudDraftAttachmentsPanel`. Fix when porting; verify full CI. |

**Dependency rule:** #25 → #26 → #27 → #29 → #31 is an **old stacked source graph**, not a chain eligible for immediate merging into current lean `main`. Preserve as reference until Codex ports/validates its functionality. Do not retarget/rebase all old PRs at once, force-push, delete branches, or copy old `src/App.tsx` / sidebar. Avoid duplicate cloud applications: the finished beta needs one authenticated workspace source of truth, not separate permanent local-vs-`/cloud` products.

## Old PRs reviewed and closed without merge on 2026-10-16

| PR | Why CLOSED / NOT MERGED | Preserved follow-up |
| --- | --- | --- |
| [#4](https://github.com/memetreza34-ux/Creator-lab/pull/4) | 21-file older Phase 0 truth/media/state rewrite now overlaps more recent local V1 work: #35 removes default fake records, #21 enforces IndexedDB transaction success; `main` currently has persisted state **schema v3**, whereas old changes target earlier semantics. Blind merge risks regression. | Its proposed `DATA_TRUTH.md` and `MEDIA_PERSISTENCE.md` are **not** in current `main`; the old PR retains this reference material for selective future extraction. Any remaining truth/media details should be evaluated against live current V1, not treated as merged. |
| [#8](https://github.com/memetreza34-ux/Creator-lab/pull/8) | Seven-file older Composer/AI and "best times" overhaul conflicts with subsequent focused UI, honest previews, fail-closed AI #20, and existing prototype-labeled best-time data. | **Do not claim all keyboard/accessibility/error recovery concerns fixed.** Codex C4 must audit the modern Composer, 375px mobile, keyboard, asynchronous AI UI and labels, then Claude independently reviews evidence. |
| [#22](https://github.com/memetreza34-ux/Creator-lab/pull/22) | Non-M1 Experiment Lab manual-selection patch. `main` still contains misleading "Statistical A/B", "Declare Winner" and fabricated `aiInterpretation` in the **unused legacy page**; the current `/experiments` route redirects away and this capability is **NOT in V1**. | If Experiment Lab is ever re-enabled, **first** implement #22's or equivalent correctness protection (manual preferences ≠ measured winner), regression tests and provenance. Do not treat #22 as already implemented. |

Closing a PR does not delete its commits/branch, user data or code in `main`. Reopen only as a **new small reviewed PR** against current `main` with test evidence; do not resurrect the old all-in-one merge.

## Important merged milestones in `main`

- **#16, #28, #30**: six deployed, versioned Supabase schema/RLS/Storage security migrations. Do not blindly reapply them.
- **#20**: fail-closed unauthenticated paid AI; don't claim paid production AI is enabled.
- **#24**: fail-closed JWT Cloud API client, currently standalone backend infrastructure.
- **#21**: IndexedDB local media transaction commit safety.
- **#32, #33**: credential-free offline RLS/JWT harness and restored CI runners.
- **#34**: scope lock and agent contract.
- **#35, #37, #38**: narrower truthful local M1 experience and related docs.
- **#40**: manual reviewed-main-only actual two-user Supabase Auth/RLS/Storage workflow, available but **never equate workflow presence with a passed live test**.
- **#41**: ChatGPT (scope/integration), Codex (bounded implementation), Claude (independent PR review), owner (credentials/hosting/launch).
- **#42**: actual read-only live privileged function/RLS triage + precise implementation handoff. [Main CI #38886251369](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38886251369): 114/114 app tests, 9/9 offline fixtures, TypeScript/build PASS.

## One actual P0 issue and next actions

- [Issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36) remains **OPEN / BLOCKED**: zero confirmed test Auth users at last inspection. Owner provisions **two real, separate, confirmed disposable test identities** via Supabase Auth (not via SQL) plus five encrypted Actions secrets, then explicitly starts the [main-only live security workflow](https://github.com/memetreza34-ux/Creator-lab/actions/workflows/live-auth-rls.yml) following [the runbook](../v1/LIVE_RLS_ACTIONS_RUNBOOK.md). Do not share passwords in chat/PR/issue logs. Verify cross-user deny and full cleanup before clearing P0.
- **Codex after gate:** use [the exact handoff](CODEX_CLAUDE_V1_DELIVERY_BRIEF.md) to port #39 and old stack **selectively** on current main, implement a separate **manual Cloud planning** entity (never fabricate `creator_posts.status=scheduled` or server-owned `scheduled_at`), and complete real authenticated end-to-end tests.
- **Claude after a concrete Codex PR:** independent security + accessibility review of *exact HEAD*, file/line findings, not parallel reimplementation.
- **Owner:** real Auth test setup, later email redirects/domain/hosting/privacy and final launch decision. CI success does not substitute for full browser or real issued-JWT security tests.

**Out of V1:** auto-posting providers, OAuth, billing, wide analytics/experiments, fabricated insights, broad new features.
