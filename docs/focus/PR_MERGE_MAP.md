# Creator Lab — PR inventory and integration order

Snapshot: 2026-10-15. `main` at `06944b6d98a24f1fc4ad9024b582b65e5aca11e8` (2026-10-08). 19 PRs were open at audit time. **Proposed branches are NOT merged functionality.** Confirm freshness via GitHub before acting.

## CI recovered, but live Auth acceptance still unverified (2026-10-16)
- Historical issue [#19](https://github.com/memetreza34-ux/Creator-lab/issues/19) documented runners failing before any step; the cause remains unknown. A **rerun of PR #16 on the exact previously failed head** now passed Checkout, npm ci, automated tests, TypeScript and production build: [run #37961296344](https://github.com/memetreza34-ux/Creator-lab/actions/runs/37961296344) (attempt 2).
- [PR #33](https://github.com/memetreza34-ux/Creator-lab/pull/33) was **merged into main on 2026-10-16** (merge SHA `564005e92f3f2cb3e5976bae3ff922e5f457aae2`); it adds stacked-base PR CI, diagnostics, read-only permissions, cancellation and timeout. It is not authorization to skip PR-specific checks.
- Real dedicated Supabase project confirmed **active** with six migration versions (from #16/#28/#30), nine public creator tables with RLS enabled, private creator-media bucket, zero Auth users/workspaces/posts/media as checked on 2026-10-16. **True issued-JWT A/B acceptance remains NOT RUN**.
- Security advisor reports four callable authenticated SECURITY DEFINER helpers (membership checks and workspace-create RPC). Their bodies use `auth.uid()` and fixed search_path. These are **review-required warnings**, not proven vulnerabilities. See [advisor documentation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Verify each changed PR head through actual npm test/lint/build and record evidence. Database live Auth/Storage, browser and provider work require independent acceptance.

## Reuse existing work; no duplicates
| PR | Function | Relationship / recommended disposition |
|---|---|---|
| #16 | Supabase schema / RLS / private bucket | Database was reportedly provisioned and migrations applied; review against **actual live catalog**, then integrate as root once validated |
| #28 | Server-owned publication/connection statuses | Depends on #16; ensure its live applied migration and source order match |
| #30 | Workspace-safe media relations + immutable uploads | Security migration after #28; separate schema review |
| #23 → #32 | Real JWT / RLS / Storage acceptance probe & fix | Tests on schema; run with **two real issued JWTs** and report actual results, don't treat PR text as proof |
| #24 → #25 → #26 → #27 → #29 → #31 | Cloud client → Auth → pipeline → draft composer → private library → media attachments | **Stacked sequence**; merge/rebase in dependency order after security and CI. Prefer one tested end-to-end release candidate over parallel extra features |
| #20 | Restrict unauthenticated Gemini AI and validate requests | High-priority security; reconcile with real JWT auth before enabling AI |
| #21 | IndexedDB preview/persistence integrity | Only integrate if still relevant during transition to cloud; avoid throwaway duplicate work |
| #22 | Stop fake statistical experiment winner claims | Low-risk honesty fix; compare with deferred Experiment UI |
| #18 | Branding/navigation | Keep only coherent, low-risk cleanup; defer substantial design expansion |
| #17 | Extensive 19-file delivery/market/SaaS master plan | **Already exists**; review, do not recreate. This focus reset should narrow its large MUST scope before it guides further expansion |
| #33 | CI diagnostics for stacked PRs | **MERGED in main on 2026-10-16**; no longer an open PR; validate specific stacked heads |
| #8, #4 | Older phase audit PRs | Review for stale/duplicate changes against merged main and archive/close with explanation if superseded, never blind merge |

Known notable facts (from PR descriptions; verification pending):
- #16 reports existing Frankfurt Supabase project and three applied SQL migrations.
- #28 and #30 report additional live SQL migrations.
- #25–#31 are separate pilot app implementation slices; not a finished merged cloud user journey.
- #32 explicitly says live-JWT security acceptance **has not been claimed passed**.
- Many of these PRs are drafts or target non-main feature branches.
- `docs/DELIVERY_MASTER_PLAN.md` only exists in unmerged PR #17 at snapshot; don't cite it as a merged main source.

## Safe consolidation algorithm
1. Freeze feature PR creation; enumerate all PRs and base/head ancestry again.
2. Diagnose runner blocker; capture evidence and make checks effective for stacked PRs.
3. Compare live Supabase migration history with #16/#28/#30 exact SQL sources; no unreviewed repeat migration.
4. Run real 2-user JWT/RLS/media acceptance; do not enable multiuser UI before it passes.
5. Build/validate tested integration candidate in topological order. Resolve conflicting security policy edits before merge; refresh each branch as needed.
6. Verify one real auth→idea→draft→media→reload journey across devices, and non-owner denial. Only then merge and make cloud the customer-facing source of truth.
7. Review #17 against newly approved M1/M2 scope; retain deep compliance references as release gates, remove inappropriate early work.
8. Keep PR history and close superseded work with explanation. Do not create replacement PRs for work that already exists.

## Never conflate
- Applied remote SQL ≠ merged reproducible migration code.
- Draft branch implementation ≠ shipped feature.
- SQL simulated principal ≠ genuine Supabase Auth access token.
- Green unit tests ≠ real external provider publish proof.
- Proposed docs ≠ approved founder scope.
