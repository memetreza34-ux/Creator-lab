# Current State Audit

Audit baseline: main at 8e49147e174e15c8655f41f956879c98ec752613.

## What exists and is useful

- React 19 + TypeScript + Vite frontend.
- Express server and server-side Gemini access.
- Workspace model with timezone and local persistence migration.
- Workspace-scoped posts, accounts, media, pipeline, experiments, analytics, and performance data.
- Composer with destination selection, base content, platform-specific variants, media, previews, draft/schedule actions, AI assistance, content analysis, variations, and experiment creation.
- Calendar with scheduling workflow and drag/drop behavior.
- Pipeline with staged content workflow.
- Media library and folder model.
- Analytics UI with post performance model.
- Experiment domain model and UI route.
- CI workflow for TypeScript validation and production build.
- No client-side Gemini API key exposure.

## Major production gaps

- App state is primarily local browser state, not authenticated cloud data.
- Social accounts are modeled data, not verified real OAuth connections.
- "Publish" is not a production publishing engine.
- Analytics are not yet synchronized from real social APIs.
- Scheduling has no durable background job system.
- No production authentication/authorization boundary.
- No durable integration token storage/refresh lifecycle.
- No reliable publish job retry/idempotency model.
- No automated test suite in package scripts.
- AI scores are heuristic diagnostics and must not be presented as measured performance.
- Scheduling timestamps need an explicit workspace-timezone-to-UTC contract.

## Product risk

The UI is ahead of the backend. The next work must convert the strongest existing workflows into trustworthy production behavior instead of adding more surface area.

## Rule

Do not delete working advanced UI simply because it appears ahead of the roadmap. Classify it, harden it when its phase arrives, and prevent it from pretending that unavailable backend capabilities are live.
