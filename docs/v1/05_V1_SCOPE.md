# V1 Scope

## MUST

### Workflow
- Workspaces with correct isolation and timezone.
- Pipeline from idea through ready/scheduled/published.
- Media library usable from composer.
- Composer with base content and platform-specific variants.
- Calendar with reliable scheduling/rescheduling.
- Posts list with trustworthy statuses.

### Production foundation
- Authentication.
- Cloud persistence with ownership enforced server-side.
- Durable media storage.
- Explicit data migrations.
- Durable publish/schedule jobs with retries and idempotency.
- Secure integration token storage and refresh handling.

### Integrations
- YouTube real connection, publish/schedule path, and analytics.
- Instagram real connection, publish/schedule path, and analytics only if the official feasibility gate passes.
- If Instagram cannot pass the gate in time, V1 must remain honest and ship YouTube as the verified integration rather than fake parity.

### Intelligence
- Real post-performance ingestion.
- Analytics that distinguish source platform, time range, freshness, and sample size.
- Evidence-based insights that link back to supporting posts/metrics.
- AI content assistance with user-controlled apply/reject.
- Experiments that record hypothesis, variants, primary metric, outcome, and limitations.

### Quality
- Loading/empty/error/success states.
- Accessibility baseline.
- Responsive desktop-first experience.
- Automated tests for critical domain behavior.
- TypeScript and production build green.
- No fake live integrations.

### AI trust and economics
- Authenticated, workspace-authorized AI gateway, safe output rendering and no unauthorized model tool use.
- Accountable AI usage limits/quotas by plan, cost controls, honest heuristic-vs-measured labeling, AI provider processing review.
- AI Act transparency/marking and AI literacy review **where applicable to the actual use case and role**.

### Customer and SaaS operations
- First-session onboarding and honest supported platform explanations, not mock connected accounts in real workspaces.
- Factual public product/help/contact/legal links and support/error recovery.
- Security/privacy data inventory, GDPR processing rights, export/deletion, vendor agreements, backups and incident response.
- Stage/prod separation, observability of jobs, AI costs and provider incidents, actual restore drills.
- Usable navigation on mobile, accessible key flows and a professional consistent brand.

### Additional MUST for a public **paid** launch (may defer during closed/free beta with payments disabled)
- Reviewed Free/paid plan catalogue and clearly published eligible features, limits and pricing.
- Verified server-owned billing subscriptions/entitlements/usage, hosted checkout and signed webhook reconciliation.
- Full upgrade/downgrade/trial/past-due/cancel/invoice/refund user journeys without loss of existing customer content.
- Germany/EU consumer purchase/cancellation, taxes/invoices and privacy/legal review for chosen sales geography.

## SHOULD

- Posting queue / reusable posting slots.
- Best-time recommendations derived from actual historical data when sample size is sufficient.
- Simple export of analytics/experiment evidence.
- Additional team plan or annual discount only after secure membership and billing approval.
- TikTok integration only if audit access is realistically available without delaying V1 core.

## POST-V1

- Full Content DNA / creator memory model.
- Advanced statistical experiment engine.
- Unified social inbox.
- Social listening.
- Competitor intelligence.
- Large-team approvals/roles.
- Agency client management.
- Bulk CSV/RSS automation.
- White-labeling.
- Mobile native apps.
- Link-in-bio.
- All remaining social networks.

## Scope test

If a proposed feature does not improve the V1 loop from idea to measurable learning, or is not required for production trust/reliability, it should not interrupt the current phase.
