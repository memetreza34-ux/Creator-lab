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

## AI and user trust
- Public AI endpoint is authenticated, workspace-authorized and guarded by quotas, safe structured outputs and rate/expense controls.
- AI suggestions and heuristic scores are clearly different from actual metrics; no unsupervised AI publish authority.
- EU AI Act role/use-case transparency/marking and literacy obligations have been assessed, applicable controls implemented and reviewed.
- Provider terms, data transfer, prompt/data retention and relevant processor agreements reviewed.

## Security, privacy and user rights
- Real authenticated two-user RLS and private storage tests pass; malicious uploads/cross-tenant access denied.
- Threat-model review, secret handling, dependency/security scan, logging and incident response recorded.
- Privacy/contact/legal pages, consent where required, export/delete and personal-data breach process operational.
- Backup restoration tested and destructive deletion/revoke jobs reconcile safely.

## Customer and launch
- A new user can sign up, save draft, connect **verified** supported provider and understand what happens next.
- Public landing/integrations/help is accurate; no unsupported provider logo or counterfeit testimonials.
- Mobile, keyboard, focus, legible font sizes and color/accessibility checked on running browsers, not assumed by CSS.
- Support contact, onboarding/transactional email, billing incident help, staging/prod, rollback and monitoring verified.

## Commercial launch only (blocking if selling subscriptions)
- Paid plan feature/usage quotas and exact prices approved using measured costs and customer evidence; business entity/territory determined.
- Signed payment webhooks drive server-owned entitlements and invoices; upgrade, trial, payment failure, cancel/downgrade/refund/replay tested in sandbox.
- Clear taxes, duration/renewal, consumer payment and cancellation paths, privacy, withdrawal and contractual information reviewed for target EU/DE customers.
- Founder explicitly approves billing provider, final sale terms, live prices and switching from test to real payment mode.

**A closed/free beta may precede commercial launch while checkout remains disabled.** This does not waive the auth, security, media, provider truth or privacy gates appropriate to that beta. Full commercial launch must satisfy both core and paid criteria.
