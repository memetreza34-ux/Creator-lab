# V1 Status

Last updated: 2026-10-09

## Current phase and delivery governance

**Active implementation:** PHASE 4 — BACKEND, AUTH & CLOUD DATA (foundation; production rollout blocked).
**Open prior acceptance gate:** PHASE 3 — CALENDAR & SCHEDULING ENGINE manual browser / timezone / responsive QA.
**Execution source:** [Delivery Master Plan](../DELIVERY_MASTER_PLAN.md). Per-feature UX: [Design System](DESIGN_SYSTEM_UX.md). Launch tests: [Release Test Matrix](RELEASE_TEST_MATRIX.md).

## Overall status

The existing frontend and local business logic are substantial but are **not yet production-connected**. A first-class PostDestination local model was merged in PR #15. Real Auth, server-controlled data, provider connections/jobs and authentic analytics are still missing. Product, competition, UX and release scope are now organized under one integrated delivery index in a documentation PR; this does **not** imply any feature was tested or shipped by documentation alone.

### Product, monetization and compliance deep review (plan only — 2026-10-09)

- Reviewed the real frontend/server code and master execution plan through four additional lenses: customer paying for the app, product designer, application/security engineer, and EU commercial-service operator.
- Found that **pricing/entitlements/consumer cancellation, AI model governance and AI Act scope, privacy/security compliance, and paid SaaS operations/marketing were under-specified** in the original plan; they have now been added as separate, testable implementation streams.
- Added `docs/v1/PRODUCT_EXPERIENCE_BLUEPRINT.md` for new/returning paying-user flows, premium UI hierarchy and usability research.
- Added `docs/v1/SUBSCRIPTIONS_AND_BILLING.md` with **provisional only** Free / Creator Pro / Studio packaging, server-only entitlements, usage metering, upgrade/downgrade, payment webhook, VAT/consumer cancellation and commercial approval gates.
- Added `docs/v1/AI_GOVERNANCE_AND_PRODUCT.md` for useful in-workflow AI, authentication, model cost caps, prompt-injection resilience, human approvals, vendor processing, role-specific EU AI Act transparency/marking and literacy assessment.
- Added `docs/v1/SECURITY_PRIVACY_COMPLIANCE.md` for threat model, RLS/storage, GDPR mapping, privacy notices, cookie consent assessment, legal/cancel/delete/incident handling and negative tests.
- Added `docs/v1/SAAS_OPERATIONS_AND_GROWTH.md` for landing/pricing/integrations website, email, support, i18n, backups/restore, monitoring, costs, deployment stages and actual customer onboarding.
- Integrated task IDs `AI-*`, `PAY-*`, `SEC-*`, `COM-*`, `OPS-*`, `GTM-*`, `I18N-*`, `CX-*` into the master plan and updated V1 scope, quality rules, release criteria, decisions, README and E2E test matrix.
- All new capabilities are **requirements**, not implemented features or passed legal security reviews. Sample tariff pricing and plan limits are hypotheses, **not live prices**. No payment processor or Supabase production project has been created through this work.
- Master-plan documents are part of still-**open PR #17**, not yet merged due to CI infrastructure blocker [Issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19). D-01 branding code changes reside in **open PR #18**; do not claim they are on main.

### Immediate external and validation blockers (checked 2026-10-09)

- **[PR #16](https://github.com/memetreza34-ux/Creator-lab/pull/16) OPEN, not merged:** Supabase schema/RLS proposal. GitHub Actions failed before exposing usable execution steps/logs, and the rerun also failed. Do not call this CI green or merge without a credible rerun/validation.
- **Supabase provisioning DONE, cloud wiring PENDING:** Separate **Creator Lab** project `aoyrijspyygqoyeajxpf` ACTIVE_HEALTHY in Frankfurt, cost confirmation €0/month. Eight RLS tables/private bucket installed and three migrations applied. SQL catalog preflight and transactional synthetic A/B RLS/guard tests passed; actual Supabase Auth JWT/browser and private Storage HTTP tests still needed. Existing two projects unchanged.
- **Phase 3 browser acceptance:** automated date tests passed earlier, but genuine cross-timezone Month/Week/Day + mobile interaction QA remains open.
- **Production trust:** user identity and workspace authorization, cross-device durable media, real provider publishing and metrics still unverified.

### Execution order

1. **G-01:** merge execution docs/master design, competition and tests after credible CI.
2. **G-02 / R-01:** diagnose and resolve PR #16 CI runner/build gate, review migration SQL without deploying it.
3. **G-04 / D-03:** execute documented calendar browser/responsive manual acceptance.
4. **B-01 DONE; B-02/B-03 partial:** dedicated Supabase project initialized; SQL and generated types verified, genuine issued-JWT + private Storage authorization still outstanding.
5. **B-04 onward:** build authenticated client and actual A/B user tests; only then migrate AppContext to cloud persistence, followed by YouTube OAuth/publish/jobs, analytics, experiments and release gates.
6. **AI-02 interim:** PR #20 rejects arbitrary Gemini custom prompts and disables unauthenticated AI in production until full Auth/usage budgets exist.

## Supabase actual project execution evidence (2026-10-09)

- **B-01 DONE:** created dedicated `Creator Lab` project `aoyrijspyygqoyeajxpf` in `memetreza34-ux's Org`, `eu-central-1`, after €0/month quote and cost confirmation.
- **B-02 partial:** SQL versions `20261009163035` / `20261009163313` / `20261009163442` installed; eight RLS-enabled public tables and private `creator-media` bucket, catalog preflight PASS, DB-generated TypeScript models prepared in PR #16.
- **B-03 partial:** rollback-only two-identity SQL probe PASSED on actual dedicated Postgres, including workspace isolation and rejected cross-tenant inserts/mismatched platform. All eight tables had zero rows afterward. The identities were **simulated database claims, not Supabase Auth-issued real JWTs**; browser/Storage/role matrix unverified.
- **Security remediation:** invalid IANA workspace timezone and mismatched OAuth/demo destination guards added; anon EXECUTE grants revoked explicitly, trigger functions hidden from authenticated RPC, missing composite FK indexes added. Supabase reports four intentionally callable authenticated `SECURITY DEFINER` helpers: review via [advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), not a finished penetration test.
- **GitHub blockers:** [PR #16](https://github.com/memetreza34-ux/Creator-lab/pull/16) still open due blocked GitHub runner; [PR #20](https://github.com/memetreza34-ux/Creator-lab/pull/20) contains pre-auth AI validation/fail-closed production gate; neither represents a merged production UI. See [Issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19).

## Completed before this plan

- Typed workspace-scoped core domain.
- Local persistence normalization/migration baseline.
- Workspace deletion cascade.
- Composer platform-specific content typing and schedule query normalization.
- Workspace-scoped analytics/dashboard data.
- Server-side Gemini key usage and API validation/rate-limit baseline.
- CI workflow running TypeScript validation and production build.

## Phase 0 remaining

- [x] Introduce an explicit persisted-state schema version and migration pipeline.
- [x] Define/test workspace timezone -> UTC schedule conversion helpers.
- [x] Add automated test framework and critical tests for reducer/selectors/time conversion.
- [x] Audit demo/mock truth labels so fake accounts/analytics cannot be mistaken for live provider data.
- [x] Re-audit media persistence/storage behavior and document production migration needs.
- [x] Run tests/lint/build for the completed Phase 0 block.
- [x] Update this file with evidence and move to Phase 1 only when Phase 0 exit criteria pass.

## Completed in current Phase 0 block

- Added `tsx --test` using Node's built-in test runner; no new test dependency required.
- Added tests for date/time validation, IANA timezone conversion, DST gaps, workspace selectors, and destructive workspace cascade behavior.
- Composer scheduling now interprets date/time in the active workspace timezone and stores canonical UTC instead of silently using the browser timezone.
- Added persisted-state schema version `1` with a deterministic migration pipeline for legacy unversioned `creator_lab_state`.
- Legacy state now normalizes workspace ownership across accounts, posts, media, folders, pipeline items, experiments, analytics, and post performance.
- Current state serializes through an explicit versioned envelope; unsupported future schemas are rejected instead of being guessed.
- Added migration tests for ownership, legacy defaults, round-tripping, malformed JSON, and future-version rejection.
- CI runs automated tests before TypeScript validation and production build.

## Completed truth & media block

- Added explicit data-origin metadata for analytics and post performance.
- Added explicit demo-vs-OAuth account mode so prototype accounts are no longer presented as live provider connections.
- Removed fabricated analytics fallback multipliers, synthetic trend interpolation, and the hard-coded dashboard performance claim.
- Added media storage origin metadata (`demo_remote`, `indexeddb`, reserved `remote`).
- User uploads now fail visibly if IndexedDB persistence fails instead of creating false-success metadata.
- IndexedDB assets resolve fresh runtime URLs after reload; persisted `blob:` URLs are no longer treated as durable.
- Documented the production object-storage migration boundary in `docs/v1/MEDIA_STORAGE.md`.
- Persistence schema advanced to version 2 so legacy local state receives the new truth/storage metadata safely.

## Phase 1 completed — destination capability block

- Added a centralized platform publishing capability registry.
- Demo accounts can be used for drafts, previews, and local planning only.
- Live publishing now requires both a real OAuth account and a verified Creator Lab provider adapter.
- No current platform is falsely marked as live before Phase 5 integration work.
- Composer validation now checks destination availability and platform caption limits through one deterministic layer.
- Demo destination chips are visibly labeled.
- "Publish Now" no longer creates a fake published post when live publishing is unavailable.
- Local scheduling explicitly says that nothing was sent to a social platform.
- Editing a scheduled post now converts stored UTC back into the workspace IANA timezone instead of the browser timezone.
- IndexedDB media URLs are resolved again inside Composer after reload.
- Prototype best-time UI is now labeled as a suggestion instead of claiming historical evidence.
- Added automated destination-capability tests.

## Phase 1 completed — Composer integrity block

- Composer edit routes are now workspace-scoped; a post from another workspace cannot be edited through a guessed URL.
- Existing destination IDs are filtered to accounts owned by the active workspace.
- Duplicate and unavailable media references are detected and sanitized before persistence.
- Platform overrides for unselected destinations are not persisted as stale hidden content.
- Existing `createdAt` and source-content traceability are preserved when editing.
- Inherited vs customized platform content is explicit in the UI.
- Composer shows a single validation summary for selected destinations and invalid media references.
- Unsaved content, destination, media, and schedule changes are protected on internal navigation and browser unload.
- Added deterministic media integrity tests; current suite contains 22 passing tests.

## Phase 1 completed — final Composer quality audit

- Removed fabricated likes, views, comments, repost counts, timestamps, and misleading sponsored/audio labels from platform previews.
- Platform previews are now explicitly static previews; engagement is not simulated.
- Preview media uses resolved runtime URLs instead of stale persisted blob URLs.
- Centralized deterministic helpers now own platform override inheritance, cloning, and reset behavior.
- Added regression tests proving base-content changes do not overwrite customized platform content and reset restores inheritance without mutating previous state.
- AI "Insert at Cursor" now inserts at the actual textarea selection instead of silently appending.
- AI history is keyboard-accessible, restored hooks apply to current Composer content, and rewrite regeneration preserves the selected tone.
- Hashtag selections resync when a new AI result is shown.
- Platform Optimization no longer invents fallback adaptations when the AI response is malformed; it shows an explicit error and changes nothing.
- Added accessible labels/state for destination selection, rewrite tone, media removal/picker controls, schedule inputs, dialogs, and unavailable live publishing.
- Removed dead interaction styling from preview-only engagement chrome.
- Phase 1 acceptance criteria reviewed and satisfied.

## Phase 2 completed — lifecycle and traceability block

- Added centralized content-operation helpers for deterministic pipeline movement, source-linked stage synchronization, and post media-reference cleanup.
- Pipeline drag/drop now normalizes order in both source and target columns and persists changes through one batch action.
- Creating or updating a linked scheduled/published post automatically advances its source ContentItem to the corresponding pipeline stage.
- Deleting a ContentItem preserves downstream posts/experiments but clears their source references instead of leaving broken IDs.
- Deleting a Post removes its performance rows and clears experiment source-post references.
- Deleting a MediaAsset removes that asset ID from base and platform-specific post content.
- Removing a SocialAccount removes its post destination references; a scheduled post that loses its final destination becomes `needs_review` and its schedule is cleared.
- Platform-specific content for a removed account's platform is cleaned when no remaining destination still uses that platform.
- Posts now expose `failed` and `needs_review` as real status tabs and no longer show a dead Filter button.
- Pipeline form parsing now validates ContentFormat and Platform values instead of relying on `any`.
- Added regression coverage for cross-stage ordering, same-stage ordering, post→pipeline stage synchronization, orphan cleanup, media cleanup, and lost-destination review behavior.

## Phase 2 completed — content UI integrity block

- Added workspace-scoped selectors for ContentItem↔Post traceability, MediaAsset usage, and SocialAccount usage.
- Added regression tests proving those selectors do not leak records from other workspaces and do not double-count platform-specific media references.
- Media Library now shows when an asset is referenced by posts and explains the exact local impact before destructive deletion.
- Media deletion messaging explicitly distinguishes Creator Lab record cleanup from external social-platform content.
- Posts resolves IndexedDB media URLs at runtime, so locally persisted uploads preview correctly after reload instead of depending on stale/empty persisted URLs.
- Posts displays its linked Pipeline source when one exists, derived from sourceContentItemId rather than duplicated display state.
- Pipeline cards show the number and latest status of linked posts without introducing a second source of truth.
- Social Accounts now says "Add Demo Account" instead of implying real OAuth connectivity.
- Removed the dead account Settings control and made account-removal impact explicit, including scheduled-post review behavior.
- Documented the current historical-destination limitation and the required future PostDestination snapshot model instead of hiding the limitation with duplicated fields.
- Phase 2 acceptance criteria reviewed and satisfied.

## Phase 3 completed — workspace-timezone Calendar block

- Added central calendar scheduling helpers for workspace-local day/hour membership and UTC rescheduling.
- Month/Week/Day views now display and locate scheduled posts using the active workspace IANA timezone rather than the browser timezone.
- Drag-and-drop passes a civil date/time slot; Month preserves the original workspace-local wall-clock time across DST offset changes; Week/Day use the chosen workspace-local hour.
- Published, failed, and needs-review posts cannot be dragged to create misleading status changes.
- Invalid/nonexistent DST wall-clock slots fail visibly rather than silently moving a post.
- Local media previews in Calendar use resolved IndexedDB URLs, with a memoized dependency to prevent repeated resolution loops.
- Removed invented best-time performance boost percentages and confidence labels. Suggested times remain explicitly prototype planning slots, not analytics-driven forecasts.
- Added regression tests for cross-timezone calendar membership, DST rescheduling, slot times, workspace today date, and drag eligibility.
- Calendar states clearly that scheduling is local planning; no live provider publish job was created.

## Phase 3 completed — Dashboard timezone presentation block

- Dashboard's Upcoming Planned Posts now shows the same workspace-local dates and times as Calendar.
- The Today indicator uses the workspace date rather than the browser date.
- Performance chart date labels use workspace-local publication dates.
- Posts marked scheduled without an actual scheduledAt value are excluded from Upcoming Planned Posts instead of displaying a misleading createdAt fallback.
- Wording clarifies that these are locally planned posts rather than live provider releases.

## Phase 3 completed — cross-page date integrity block

- Posts list now displays the correct workspace-local date and time with explicit source labels: scheduled, published or created. A published post is no longer mislabeled using stale `scheduledAt`.
- Graceful fallback for legacy missing/invalid date fields; no fabricated publication timestamp.
- Media URL resolution in Posts now uses a stable memoized workspace-media dependency rather than a fresh array per render.
- Analytics performance trend date buckets are grouped in the workspace timezone, consistent with Calendar and Dashboard.
- The time parser now rejects autumn DST's repeated local wall-clock hour as ambiguous instead of choosing an unacknowledged UTC instant.
- Added regression tests for timestamp precedence, workspace date conversion, stale draft schedules, invalid timestamps and autumn DST.
- Formalized the scheduling truth contract and manual browser QA steps in `docs/v1/phases/PHASE_03_SCHEDULING.md`.
- Decision: simple queue slots deferred until real per-destination publishing jobs exist; advanced queues stay post-V1.

## Phase 4 preparation — destination domain contract

- First-class `PostDestination` local snapshots now hold per-account platform, account identity label/handle, planning state, and timestamps.
- Post creation/editing synchronizes per-destination rows; published historical snapshots remain after account removal and can still be shown in Posts.
- Deletion cascades clear destinations when posts/workspaces are deleted; pending detached destinations require review.
- Local persistence schema 3 migrates legacy v0-v2 states and guards against workspace-forged destination records.
- Regression tests cover per-account lifecycle, snapshots after reload, ownership boundaries, and deletion cascades.
- Phase 4 backend/auth requirements are specified in `docs/v1/phases/PHASE_04_BACKEND_AUTH.md`.
- This work is **a local domain foundation only**, not a functioning server data layer or live publishing.

## Next exact task

**G-02 / R-01 — resolve GitHub Actions jobs failing before their first step** for PR #16, #17 and #18 (tracked in [Issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19)). Obtain the actual runner error from GitHub, restore credible automated tests/TypeScript/build, then review/merge documentation PR #17 and navigation PR #18 separately. Review SQL and actual RLS validation before merging or deploying PR #16.

**Then B-03 → B-04:** dedicated Supabase project and three versioned SQL migrations exist; SQL catalog and simulated A/B role probes passed. Complete actual Auth JWT/Storage multi-user isolation, then integrate login, authenticated repository CRUD and private media into React. Safe design/AI evaluation/QA tasks can proceed while GitHub Actions is blocked. Commercial payment activation still requires pricing, payment provider and DE/EU legal/tax approval.

## Validation evidence

- PR #15 (local PostDestination contract): merged 2026-10-08 at `06944b6d98a24f1fc4ad9024b582b65e5aca11e8` after tests/TypeScript/production build succeeded.
- PR #14 (Phase 3 local calendar/date work): passed automated tests, TypeScript and production build. Its manual browser acceptance is **still open**.
- PR #16 (Supabase schema): **open with GitHub Actions failure before observable job steps/logs**; not a tested database deployment.
- PR #17: complete product/business/security/AI and experience planning is **OPEN**, GitHub Actions still blocked before job steps, not merged.
- PR #18: navigation/branding implementation **OPEN**, CI blocked; no claims of production-visible UI changes.
- GitHub Issue #19 records the runner issue for PRs #16–#18.
- Delivery plan/design/competition/release matrix documentation PR: validation pending until a GitHub Actions run is available. Documentation is not production feature acceptance.

## Phase transition

**PHASE 0 — FOUNDATION: COMPLETE (local foundations)**

**PHASE 1 — COMPOSER EXCELLENCE: COMPLETE (local Composer; real platform features deferred to Phase 5)**

**PHASE 2 — CONTENT OPERATIONS: COMPLETE (local workflow; cloud migration Phase 4)**

**PHASE 3 — CALENDAR: implementation complete, MANUAL BROWSER QA OPEN**

**PHASE 4 — BACKEND / AUTH / CLOUD: active, NOT COMPLETE**

**PHASE 5–8 — NOT COMPLETE**