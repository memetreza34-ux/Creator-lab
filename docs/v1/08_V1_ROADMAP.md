# V1 Roadmap

Phases are sequential. Existing UI from later phases may remain, but new work must follow the current phase unless a documented dependency requires otherwise.

## Phase 0 — Foundation
Harden domain contracts, time handling, persistence versioning, test infrastructure, workspace isolation, and demo-vs-real truth boundaries.

Exit: critical local domain behavior is tested; lint/build pass; scheduling time semantics are explicit.

## Phase 1 — Composer Excellence
Make Composer the strongest reliable creation surface: destination capabilities, validation, platform overrides, media behavior, previews, draft lifecycle, and AI apply/reject UX.

Exit: a creator can produce a valid destination-aware draft without hidden/dead controls.

## Phase 2 — Content Operations
Unify Pipeline, Media, Posts, and Composer traceability. Ensure item/post/media lifecycle and workspace ownership are coherent.

Exit: idea -> ready -> composer -> draft is reliable and reversible.

## Phase 3 — Calendar & Scheduling Engine
Make month/week/day scheduling reliable, timezone-correct, reschedulable, and ready for durable backend jobs. Add queue slots only if they simplify core scheduling.

Exit: schedule state has one canonical model and UI behavior.

## Phase 4 — Backend, Auth & Cloud Data
Introduce production authentication, server-side authorization, database persistence, object storage, migrations, and secure integration credential model.

Exit: two users cannot access each other's data; browser localStorage is no longer the production source of truth.

## Phase 5 — Real Social Integrations
Implement YouTube first. Implement Instagram only after the official feasibility gate passes. Add durable publishing jobs, provider IDs, retries, and truthful capability/error UI.

Exit: verified end-to-end real publish/schedule path exists.

## Phase 6 — Real Analytics & Learning Loop
Ingest real metrics, expose freshness, build evidence-linked insights, and connect insights back to creation.

Exit: a creator can answer "what worked, based on what evidence, and what should I try next?"

## Phase 7 — Experiment System
Harden hypothesis, variants, metric selection, evidence, outcomes, and insufficient-data states.

Exit: experiments are traceable and do not overclaim significance.

## Phase 8 — Release Hardening
Security, accessibility, responsive QA, error recovery, onboarding, observability, performance, release checklist, and removal of misleading demo behavior.

Exit: all release criteria pass.

## Cross-cutting paid SaaS and regulatory tracks (added 2026-10-09)

The eight engineering phases remain unchanged. **Commercial paid release needs additional product/business gates**, coordinated through `docs/DELIVERY_MASTER_PLAN.md` rather than invented extra phases:

- **Customer and design (CX/D):** wireframes/new creator journeys before backend onboarding; actual responsive/accessible tasks before release. `PRODUCT_EXPERIENCE_BLUEPRINT.md`.
- **AI governance (AI):** safe authenticated AI gateway, quota/cost limits and use-case-specific AI Act assessment as soon as Auth is implemented; no uncapped public endpoint. `AI_GOVERNANCE_AND_PRODUCT.md`.
- **Monetization (PAY):** pricing research can begin independently, but server entitlements require Phase 4 RLS, and real billing requires verified sandbox webhooks, company/tax/legal sign-off. `SUBSCRIPTIONS_AND_BILLING.md`.
- **Security/legal (SEC/COM):** privacy-by-design starts with backend; contracts, deletion/retention/AI disclosures and verified security gate before production. `SECURITY_PRIVACY_COMPLIANCE.md`.
- **Operations/business (OPS/GTM/I18N):** staging/prod, backup, support, transactional email, truthful marketing and cost metrics start alongside Phase 4 and are release acceptance gates. `SAAS_OPERATIONS_AND_GROWTH.md`.

**Paid-launch distinction:** Closed or free beta may open *without* checkout when appropriate security/platform/privacy conditions are satisfied and paid plans are not advertised as live. Commercial subscription activation additionally requires the full PAY/COM gates; it cannot be merged as a fake pricing-only page.
