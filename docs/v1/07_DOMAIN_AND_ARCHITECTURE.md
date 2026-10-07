# Domain and Architecture

## Current domain

Workspace
- owns social accounts, posts, media, pipeline items, experiments, analytics/performance.

ContentItem
- represents pre-publication workflow state.

Post
- represents publishable content with base content, destinations, per-platform overrides, status, schedule, and source traceability.

SocialAccount
- must evolve from mock connection data into verified integration identity + capabilities.

PostPerformance
- must evolve into timestamped/source-aware metric snapshots rather than a single timeless row.

Experiment
- links hypothesis and variants to measurable outcomes.

## Target architecture

### Frontend
React UI remains responsible for composition, previews, workflow, and decision support. It must not hold provider secrets or be authoritative for ownership/publish state.

### Application API
Server owns authentication, authorization, validation, workspace membership, scheduling commands, integration lifecycle, and AI proxying.

### Database
Cloud relational persistence is preferred for users, workspaces, memberships, posts, destinations, pipeline items, experiments, integration accounts, publish jobs, and metric snapshots.

### Object storage
Media files should move to durable object storage. Database stores metadata and ownership.

### Integration adapters
Use a provider adapter boundary instead of platform-specific conditionals across UI:
- connect / refresh
- validate content/capabilities
- publish
- fetch publish status
- fetch metrics

### Job system
Scheduling and analytics sync require durable background execution. Jobs need idempotency keys, retry classification, attempt history, and observable failure state.

## Time contract

- User edits schedule in workspace IANA timezone.
- Backend converts to UTC for canonical execution.
- Store enough timezone context to render/edit correctly.
- Never rely on the browser timezone as the business rule.

## Data truth levels

Every relevant UI datum should be one of:
- demo/mock
- user-entered
- provider-synced
- AI-derived

Do not visually blur these categories.

## AI boundary

AI may transform content, explain patterns, and generate hypotheses. Deterministic code must handle permissions, platform limits, scheduling state, ownership, metrics math, and publish status.
