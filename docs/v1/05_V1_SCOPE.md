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

## SHOULD

- Posting queue / reusable posting slots.
- Best-time recommendations derived from actual historical data when sample size is sufficient.
- Simple export of analytics/experiment evidence.
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
