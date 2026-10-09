# Quality Standard

A feature is not complete because the UI exists.

## Definition of Done

- Correct domain types; avoid avoidable any/casts.
- Workspace/user ownership enforced at the authoritative layer.
- Persistence and migration behavior defined.
- Loading, empty, error, and success states handled.
- Every visible control works or is removed/disabled with explanation.
- Keyboard and basic screen-reader accessibility considered.
- Responsive behavior checked for supported layouts.
- No fake production behavior.
- AI output is labeled appropriately and user-controlled.
- Important deterministic logic has automated tests.
- TypeScript validation passes.
- Production build passes.
- No known regression in adjacent core flows.
- STATUS.md updated.

## UX standard

Prefer clear state over decoration. Users must understand:
- what will happen
- where content will publish
- whether data is real/synced/demo
- when metrics were last updated
- whether an action succeeded
- what they can do after a failure

## Reliability standard

Publishing and scheduling require:
- idempotency
- explicit provider confirmation
- retryable vs permanent failure classification
- durable state
- timestamps
- actionable errors

## AI standard

Never promise virality. Never convert an AI opinion into a measured fact. AI diagnostic scores must be presented as heuristic feedback, not performance prediction.

## Paid product and customer standard

- Onboarding must deliver a real saved first draft without a fake social connection or false numbers.
- Pricing is clear about what currently works, invoice totals, tax and renewal cadence; no unverified Pro badge or deceptive scarcity.
- Subscription entitlements checked on the server, not read from untrusted browser plan metadata.
- Checkout success cannot activate paid access before a verified payment event; cancel/downgrade must preserve data as documented.
- No arbitrary LLM requests without account, workspace authorization, cost/abuse quota and safe output validation.
- Consent, data processing, AI transparency, cancellation and account/data rights are reviewed for target territory.
- Every customer-facing integration, legal link, contact, error recovery and notification must work.
- Stable support, monitoring, backups and testable rollback accompany a commercial deployment.

## Customer-driven design standard

- Start each route with the customer's next question and task, not visual decoration or a feature-count target.
- Use real drafts/media/metrics in visual validation; never invent sample numbers as proof.
- First-use and returning-user states are both usable; make the next CTA evident and accessible.
- Evaluate typography legibility, focus, reduced motion, mobile interactions and actual task completion with users.
- Wireframes and screenshots are specifications until independently reviewed on running browsers.

## Research standard

External platform behavior must be implemented from current official documentation. Re-verify before integration work because permissions, reviews, quotas, and endpoints change.
