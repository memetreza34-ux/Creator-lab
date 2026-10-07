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

## Research standard

External platform behavior must be implemented from current official documentation. Re-verify before integration work because permissions, reviews, quotas, and endpoints change.
