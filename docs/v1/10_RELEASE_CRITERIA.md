# V1 Release Criteria

V1 is releasable only when all MUST criteria in 05_V1_SCOPE.md are either complete or explicitly removed from V1 through a recorded decision.

## Product
- Idea -> creation -> schedule/publish -> measure -> learning loop works.
- No core navigation destination is a misleading shell.
- Demo data is clearly distinguishable from real data.

## Accounts and data
- Authentication works.
- Server-side authorization protects workspace data.
- Durable database and media storage are in place.
- Migrations are reproducible.
- Account deletion/disconnect behavior is defined.

## Publishing
- At least YouTube passes real connection and publish/schedule verification.
- Instagram is either verified or explicitly not advertised as supported.
- Publish jobs are durable and idempotent.
- Failed jobs expose a useful reason and retry path.
- UI does not mark success before provider confirmation.

## Analytics
- Real metrics are imported for supported integration(s).
- Metric source and freshness are visible.
- Data latency is handled honestly.
- Insights link to supporting evidence.
- Insufficient sample size produces an insufficient-data state.

## Experiments
- Hypothesis, variants, metric, and outcome are traceable.
- No unsupported statistical significance claims.

## Engineering
- TypeScript validation green.
- Production build green.
- Critical automated tests green.
- No secrets in client bundle/repository.
- Rate limits and provider failures handled.
- Basic accessibility and responsive QA completed.
- Production logging/observability covers auth, jobs, integrations, and sync failures.
