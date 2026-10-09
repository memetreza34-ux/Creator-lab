# Decisions

## D-001 — Product category
Creator Lab is a creator operating system / content intelligence workspace, not primarily a scheduler.

## D-002 — Primary V1 user
Serious solo creators and small creator brands. Enterprise and agency workflows are secondary/post-V1.

## D-003 — Learning loop
The product must connect creation, publishing, performance, insights, and experiments. Isolated tools do not satisfy the product vision.

## D-004 — Integration order
YouTube is the first verified production integration target. Instagram is the second strategic target but must pass a current official API feasibility gate before implementation is promised.

## D-005 — Truth over breadth
A single real supported integration is better than multiple fake/partial integrations.

## D-006 — AI claims
AI scores are heuristic diagnostics. Creator Lab must not claim predicted virality or statistical certainty without evidence.

## D-007 — Time semantics
Workspace IANA timezone is the editing/display context; canonical execution time is UTC. Browser timezone must not silently determine scheduled publishing.

## D-008 — Current UI
Working later-phase UI may remain. It should be hardened in its phase rather than removed merely to make the roadmap look sequential.

## D-009 — Phase discipline
Before implementation, verify the task belongs to the current phase in STATUS.md. Out-of-phase work is deferred unless a dependency is documented here.

## D-010 — V1 Content DNA
Full Content DNA is post-V1. V1 should collect the clean real data and evidence links needed to support it later.


## D-011 — One executable delivery source of truth (2026-10-09)
`docs/DELIVERY_MASTER_PLAN.md` is the task/dependency/review index; `docs/v1/STATUS.md` remains the progress record. Detailed existing V1 docs and phase specs are requirements, not competing roadmaps. New work must carry a task ID and acceptance proof.

## D-012 — Product quality before competitor feature parity (2026-10-09)
Differentiation is the idea→content→publish→evidence→experiment learning loop. Official competitor capabilities are tracked in `docs/v1/COMPETITIVE_GAP_MATRIX.md`. Recycle, bulk scheduling, agency approvals, inbox, listening and full Content DNA stay post-V1 unless an explicit scope change is documented.

## D-013 — Visual identity and UX gates (2026-10-09)
Keep the existing warm-neutral/violet/near-black design baseline but unify it under **Creator Lab** branding. Responsive mobile use, keyboard/accessibility, empty/error/permissions states and truthful publishing labels are part of feature completion, not optional launch polish. Detailed design rubric: `docs/v1/DESIGN_SYSTEM_UX.md`.

## D-014 — Supabase and external approvals (2026-10-09)
Supabase is the selected backend technology. No existing inactive Supabase project may be repurposed without explicit confirmation; a new dedicated Creator Lab project requires selected organization and actual cost approval. SQL in open PR #16 is not applied and its GitHub Actions failure still blocks merging/rollout.

## D-015 — Evidence-based releases (2026-10-09)
Release gates are tracked by test level (static/unit, browser, authenticated DB, real provider and production) in `docs/v1/RELEASE_TEST_MATRIX.md`. Runner failures with missing steps/logs are not accepted as code validation. Manual browser and provider proofs cannot be replaced by successful TypeScript compilation.

## D-016 — Customer-first SaaS scope and commercial readiness (2026-10-09)
The V1 must be useful to an actual new creator, not a visually polished prototype with empty integrations. The customer journey and design are specified in `PRODUCT_EXPERIENCE_BLUEPRINT.md`. Commercial paid launch requires `SUBSCRIPTIONS_AND_BILLING.md` gates; free/private beta may precede charging but must not advertise unimplemented entitlements.

## D-017 — Pro/Studio packages are hypotheses, not offers (2026-10-09)
Free / Creator Pro / optional Studio are candidates for interviews; illustrative prices and usage in `SUBSCRIPTIONS_AND_BILLING.md` have **not** been approved or enabled. No "unlimited" usage or billing provider is committed. Workspace subscriptions and limits must be authoritative on the server.

## D-018 — AI with explicit human control and cost/safety boundaries (2026-10-09)
AI in the Composer remains a suggestion/review workflow; it must never write to foreign workspaces or publish without an independent authorized action. Production AI requests require Auth, rate/cost caps, bounded prompt/response and provenance/evaluation. Article 50/AI Act duties are determined per actual role and use case, not asserted universally. See `AI_GOVERNANCE_AND_PRODUCT.md`.

## D-019 — GDPR/security and commercial compliance are launch gates (2026-10-09)
Privacy-by-design, storage isolation, verified provider tokens, data export/deletion, retention, processor agreements, German/EU commerce rules, legal text and breach processes are tracked in `SECURITY_PRIVACY_COMPLIANCE.md`. No compliance certification is claimed by a document.

## D-020 — Real business operations and evidence (2026-10-09)
Operational product includes actual staging/prod boundaries, support, transactional notifications, monitoring/incident response, backups/restore, truthful marketing, and a cost-based plan. See `SAAS_OPERATIONS_AND_GROWTH.md`; a feature is not accepted simply because a route renders.
