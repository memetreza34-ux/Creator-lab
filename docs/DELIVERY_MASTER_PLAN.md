# Creator Lab — Delivery Master Plan (source of execution truth)

**Updated:** 2026-10-09 · **Target:** a complete, trustworthy, market-ready product, delivered incrementally rather than by unreviewed feature dumping.

> This is the **execution index** for the existing `docs/v1/*` requirements. It does not replace the product vision, platform feasibility research, domain architecture, release criteria, or phase specs. **Status lives in `docs/v1/STATUS.md` and per-task evidence in this plan.** Every change must stay traceable to a requirement and an acceptance gate.

## 1. Product and completion contract

Creator Lab is a **Creator Operating System / Content Intelligence Workspace** for solo creators and small brands. Its distinctive workflow:

**Idea → Pipeline → Composer → Platform adaptation → Schedule/Publish → Measure → Evidence → Experiment → Next idea.**

"Finished" for the V1 release means real users can complete that workflow on supported real platforms, with durable data, reliable status, good design, safe permissions, and understandable errors. It **does not** mean imitating every feature of Buffer, Publer or Metricool before first launch. Every additional idea belongs in a named milestone, not in ad hoc coding.

### What is in V1, vs. future releases

| Group | V1 obligation | Expansion after V1 |
|---|---|---|
| Core operations | Workspaces, pipeline, composer, per-platform versions, media library, Posts, timezone-safe calendar | Evergreen recycling, bulk CSV, RSS, advanced queue slots |
| Identity and storage | Supabase Auth; verified per-workspace authorization; persistent Postgres; private durable media; safe migrations | Advanced team/agency collaboration |
| Publishing | Verified YouTube OAuth, upload/publish and scheduling jobs, per-destination states/retries; Instagram only if it passes current official API feasibility | Wider network parity: TikTok/LinkedIn/Pinterest/Threads/Facebook/X as feasible |
| AI | Reviewable hooks, rewrites, variants, transparent heuristics; actionable evidence-based interpretation | Long-term Content DNA, autonomous creation, high-confidence predictions only after measured evidence |
| Analytics | Actual provider metrics with source, freshness, history and insufficient-data states | Advanced competitor intelligence, social listening, multi-client reports |
| Experiments | Hypothesis, variants, metric, dates, observed result, limitations, link back to Composer | Stronger statistics, automated experiments |
| Experience | Consistent premium visual language, responsive desktop/mobile web, loading/empty/error states, accessibility, onboarding | Native mobile app, white-label, unified inbox, link-in-bio |

Requirements and deferrals are detailed in `docs/v1/05_V1_SCOPE.md` and `docs/POST_V1_BACKLOG.md`. A new feature is accepted only after documenting its exact user benefit, production dependency, and validation cost.

## 2. Verified code inventory and critical gaps

This is based on actual repository files inspected on 2026-10-09; **presence of code is not proof of functioning production behavior**.

| Area | Existing implementation / evidence | Critical missing condition |
|---|---|---|
| Navigation and visual shell | `src/App.tsx`, `AppLayout`, `Sidebar`, `TopHeader`, `src/index.css` | Design token consistency, complete mobile navigation, branded identity, accessibility/reduced motion |
| Composer + AI | `CreatePostPage.tsx`, composer panels, destination validation, Express Gemini endpoint | Production user authentication and quota; provider media specification; actual publishing |
| Pipeline, Posts, Media | Dedicated pages, selectors, reducer, IndexedDB uploads, lifecycle tests | Authenticated Postgres ownership; private Storage; cross-device persistence |
| Calendar | Month/week/day + scheduling utilities + DST tests | Browser interaction QA; durable backend jobs; retry/status UX |
| Experiment and Analytics | Pages, demo data models, basic per-workspace selectors | Real provider data, timestamped metrics, verified evidence, small-sample handling |
| Post destinations | `src/domain/postDestinations.ts`, schema v3 local persistence | Production database rows and backend-owned outcomes |
| Backend | `server.ts` Express Gemini proxy and in-memory rate limit | Authn/authz, durable user rate limits, server-only token handling, monitoring |
| Supabase | **PR #16 unmerged**: SQL schema/RLS and safety tests proposed | CI failure without reliable job logs; schema not executed; dedicated project not created |
| Quality | Node tests via `tsx --test`, TypeScript, Vite build via CI | Browser E2E, two-user RLS proof, responsive QA, real-provider integration/operational tests |

**Truthful state:** local prototype with solid frontend blocks, not a production social-media service.

## 3. Milestones, dependencies and hard gates

Progress is earned by a passing gate; no phase is declared complete merely because routes or mock data exist.

| Milestone | Priority | Required outcome | Gate before closing |
|---|---|---|---|
| M0: baseline governance | P0 | Versioned plan, architecture/design inventory, explicit blockers, tracked PRs | Documents synced with actual `main` |
| M1: finish Phase 3 QA | P0 | Cross-timezone calendar and responsive/keyboard manual QA | Tested Month/Week/Day and no unresolved major defects |
| M2: Supabase foundation | P0 | Separate project, SQL migration, real two-user RLS tests and protected media | Actual database tests, access denial proof, no secrets in client |
| M3: full authenticated app | P0 | Login, session, onboarding, per-workspace CRUD, safe import, durable uploads | Logout/refresh/devices and cross-user tests |
| M4: YouTube first real channel | P0 | OAuth + verified publisher, durable UTC jobs, retries, provider-confirmed outcomes | Real account upload/publish test, duplicate-job test, failure recovery |
| M5: analytics + learning | P0 | Provider metric sync, freshness, insight → next-content actions | Evidence-linked metrics, missing data UI, cross-platform semantic checks |
| M6: real experiments | P1 | Experiment lifecycle linked to actual posts and metrics | No fabricated winners; traceable result and limitations |
| M7: Instagram gate | P1 conditional | Official API permissions and test account verified, then adapter | Only advertise when OAuth/publishing/metrics pass; otherwise explicit unsupported state |
| M8: design/UX release gate | P0 throughout; final gate | Premium consistency, accessibility, onboarding, performance and recovery | Responsive review, E2E critical journey, security review, support documentation |
| M9: general release | P0 | Deploy + smoke tests + observability + rollout | All `docs/v1/10_RELEASE_CRITERIA.md` MUST criteria resolved |

Parallel work permitted only when it cannot bypass a dependency (e.g., design audit and isolated UI polish while backend access is blocked).

## 4. Actionable implementation backlog (one issue/PR-sized slice per item)

Each task below has an immutable ID. Split into smaller PRs if tests, review or rollback would otherwise be difficult. Status values: `DONE`, `IN PROGRESS`, `BLOCKED`, `READY`, `DEFERRED`. Only `DONE` with linked evidence is complete.

### G — Governance and recovery

- **G-01 [IN PROGRESS]** Publish master plan, design spec, competitive matrix and release test matrix. Acceptance: docs point at current implementation, no duplicate contradictory roadmap, concrete next task.
- **G-02 [READY]** Repair PR #16 CI blocker. Inspect actual runner/check failure; do not guess root cause, do not merge until passing TypeScript/build/tests or documented equivalent verified offline with review. PR: [#16](https://github.com/memetreza34-ux/Creator-lab/pull/16).
- **G-03 [READY]** Update `STATUS.md` after each accepted PR: commit, completed tests, open bugs, next exact task, external blockers.
- **G-04 [READY]** Review the pending manual calendar acceptance matrix in `docs/v1/phases/PHASE_03_SCHEDULING.md`; record browser/test environment, outcome, issues.

### B — Backend and production identity (depends on user-approved project)

- **B-01 [BLOCKED]** Create a **dedicated** Supabase Creator Lab project; confirm selected organization, exact project cost and Frankfurt location. Do not modify the unrelated inactive projects.
- **B-02 [BLOCKED]** Apply reviewed versioned migrations; run SQL preflight, check advisors, generate actual schema types. **PR #16 is code preparation only.**
- **B-03 [BLOCKED]** Two-user security test: anonymous/member/viewer/editor/owner cases, workspace UUID guessing, cross-workspace foreign keys, storage path traversal; deny before enabling user write flows.
- **B-04 [READY after B-03]** Supabase client initialization, Auth sign-up/login/logout/password reset/session refresh, route guards, authenticated error states, safe redirect URLs.
- **B-05 [READY after B-04]** Server-authoritative CRUD repositories for workspaces, pipeline, posts, destinations and media folders; replace `AppContext` local authority without double-write races.
- **B-06 [READY after B-05]** Private Storage upload/read/delete, object cleanup/reconciliation, mime/size limits, media URL expiry, cross-device QA.
- **B-07 [READY after B-06]** Import flow for user-created local data only: preview, ownership checks, ID remap, dry-run, rollback/idempotency, explicit consent; never treat demo accounts as real.
- **B-08 [READY after B-05]** Secure AI endpoint auth and per-user/workspace quotas; provider secrets only on server; meaningful rate limits, validation and audit logs.

### P — Real publishing and platform adapters

- **P-01 [READY after B-05]** Immutable per-account destination lifecycle and provider capability validation; separate planned/sent/published/failed states.
- **P-02 [READY after B-04]** YouTube OAuth consent/callback/revoke, encrypted token handling, refresh lifecycle, user-visible connection health. Verify Google consent-screen/audit requirements.
- **P-03 [READY after P-02]** YouTube upload adapter: media compatibility, privacy/scheduling semantics, upload progress, provider response and canonical ID.
- **P-04 [READY after P-03]** Durable publish jobs with UTC due date, DB-backed lease, idempotency, retries/backoff, permanent failures, dead-letter/manual retry and monitoring.
- **P-05 [READY after P-04]** Full scheduled YouTube E2E with a real sandbox/test account; no duplicate publishes and accurate status after provider confirmation.
- **P-06 [CONDITIONAL after P-05]** Instagram official Meta API feasibility gate, permissions, app review, authorized account types; implement only after documented proof.
- **P-07 [DEFERRED]** Other platforms until supported official API and terms are verified; keep unsupported UI explicit.

### A — Data, evidence and experiments

- **A-01 [READY after P-05]** Ingest YouTube metrics with timestamps, source and sync watermark; respect quota/latency.
- **A-02 [READY after A-01]** Analytics UI based on real snapshots: per-post, per-platform, period/date range, missing data, denominator consistency and freshness.
- **A-03 [READY after A-02]** Evidence-linked insights: source post IDs/metrics, sample size and interpretation boundaries; direct action to create a variant or experiment.
- **A-04 [READY after A-03]** Persist experiment hypothesis, variant IDs, metric, observation window, outcome; guard against unsupported significance.
- **A-05 [READY after A-04]** Close loop: evidence → reused/modified draft in Composer → measured follow-up.

### D — Product design (continuous, but no pure UI fake promises)

- **D-01 [READY]** Fix visible product name mismatch (`Creator OS` vs `Creator Lab`) and audit real navigation controls.
- **D-02 [READY]** Extract reusable visual tokens/components and write per-route design specs (see `DESIGN_SYSTEM_UX.md`).
- **D-03 [READY]** Responsive sidebar/navigation, Composer adaptation, keyboard controls, color contrast, focus, modal/screen-reader behavior.
- **D-04 [READY after B-04]** New user onboarding: account → workspace → connect verified channel → draft → schedule; empty/demo states truthful.
- **D-05 [READY after P-05]** Provider publish feedback: job state, retries, precise errors and success only when proven.
- **D-06 [READY before M9]** Cross-route cohesive polish, interaction audits, performance budget, reduced motion, screenshot baselines and accessibility review.

### R — Release engineering

- **R-01 [READY]** GitHub Actions reliability, deterministic tests, separate CI failure vs runner/infrastructure failure, protected merging.
- **R-02 [READY after B-06]** Integration tests with distinct Auth identities and Storage policies; migration forward-only and backups.
- **R-03 [READY after P-05]** End-to-end user journeys in desktop and mobile browser; OAuth/scheduled jobs must be tested against real supported providers.
- **R-04 [READY before M9]** Deployment/rollback, monitoring, service health, alerting, support/error documentation, privacy and account/data deletion.
- **R-05 [BLOCKED until all gates]** Release sign-off in `docs/v1/10_RELEASE_CRITERIA.md`.

## 5. Execution protocol — enforce at every future handoff

1. **Read:** `docs/v1/STATUS.md`, this master plan, current phase spec, latest relevant code, open PRs, and repo CI status.
2. **Select:** highest-priority **unblocked** task from above. Explain if choosing an out-of-order dependency; do not silently change scope.
3. **Scope:** state user behavior, domain constraints, files, migration/rollback effects, tests, expected UX.
4. **Implement:** focused feature branch, no unreviewed unrelated rewrite. Reuse selectors, models and existing components.
5. **Verify:** automated tests + TypeScript + production build; relevant database/browser/provider tests depending on the task. **If CI has no job logs/steps, mark validation `BLOCKED`, not `PASS`.**
6. **Review:** confirm demo vs real labels, security/ownership, accessibility and neighboring flows.
7. **Merge only on passing gate.** Record PR, commit, result and any deferred work in STATUS. Never hide failures or claim live provider behavior without proof.
8. **Advance:** set one next exact task. Ask the user only for decisions the tools cannot safely infer (cost, organization, branding deviation, OAuth/app registration, irreversible production action).

### Definition of Done

- User-visible behavior works, no dead controls, clear pending/error/empty/success states.
- Data ownership and persistence follow production trust boundary.
- Tests cover failure, cross-workspace leakage and recovery, not just happy path.
- Design tokens, responsive behavior and accessibility followed or deviations documented.
- Provider claims traceable to provider evidence.
- CI passes; relevant integration/browser checks recorded.
- Documentation and STATUS are updated; rollback path understood.

## 6. Decisions and current blockers

**Already settled:** target solo creators/small brands; product loop; React+TypeScript UI; Supabase selected; YouTube first; Instagram gated; AI assistance is reviewable and not a virality guarantee.

**Current external decision:** user's chosen Supabase **organization** and actual new-project **cost** confirmation. Two existing inactive projects are **not** Creator Lab and must remain untouched.

**Current code blocker:** [PR #16](https://github.com/memetreza34-ux/Creator-lab/pull/16) contains initial Supabase SQL/RLS, but its GitHub Actions run failed without usable steps/logs. SQL has not been executed and actual RLS is not proved.

**Current QA blocker:** Phase 3 cross-timezone/manual responsive calendar test still needs evidence.

**No user action required** for ordinary refactors, design consistency fixes, test coverage or documentation.

## 7. Autonomous-in-session starting order

1. Finish **G-01**, sync status and peer references in a documentation PR.
2. Then attempt **G-02** in a separate focused branch/PR or via the existing PR #16; identify CI infrastructure vs code failure before merging.
3. While Supabase creation awaits cost/organization selection, implement **D-01** (safe branding/functional navigation audit) and **R-01** (CI reproducibility) only when isolated from backend branch.
4. Once organization/cost is approved, continue **B-01 → B-03** before touching production Auth/Storage state.
5. Proceed through B, P, A, D/R release gates to **M9**.

**Important:** ChatGPT works only when invoked in a session or a separately configured scheduled task. This roadmap describes how to resume consistently; it does not claim unattended continuous work.
