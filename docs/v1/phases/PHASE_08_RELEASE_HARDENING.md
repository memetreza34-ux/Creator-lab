# Phase 08 — Release Hardening

## Goal

Make V1 trustworthy for external users.

## Work

- security review
- secret/config review
- accessibility QA
- responsive QA
- onboarding
- empty/error/recovery states
- integration failure recovery
- observability/logging
- performance
- production deployment checklist
- remove or clearly label remaining demo behavior
- full release regression

## Acceptance

All criteria in ../10_RELEASE_CRITERIA.md pass and no V1 MUST item remains ambiguous.

## Public customer / paid SaaS release gate

- Product user journey (landing → account → first valuable draft → verified channel → actual post → evidence) reviewed with real users.
- Final premium design tested on desktop/mobile with keyboard, screen reader and reduced motion.
- Auth and workspace isolation, provider tokens, private media, AI quota and publishing worker tested against real staging.
- GDPR processing notices/DSAR/export/delete, cookie settings, AI Act disclosures/marking where applicable, support contact and security procedures reviewed.
- Production staging/deploy/rollback, restore proof, provider/AI/billing monitoring and support/email events operational.
- **If charging subscriptions:** final prices/feature gates approved; sandbox payment/renewal/failure/cancel/downgrade/refund and replay tested; German/EU consumer checkout/cancellation and tax/invoicing reviewed; only then activate live checkout.
- Privacy and operational approval require an actual organization/contract, not placeholder legal text copied into the app.

See: `../PRODUCT_EXPERIENCE_BLUEPRINT.md`, `../SUBSCRIPTIONS_AND_BILLING.md`, `../AI_GOVERNANCE_AND_PRODUCT.md`, `../SECURITY_PRIVACY_COMPLIANCE.md`, `../SAAS_OPERATIONS_AND_GROWTH.md`, and `../RELEASE_TEST_MATRIX.md`.
