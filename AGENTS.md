# Creator Lab — standing instructions for all contributors and AI coding agents

**Read this before making plans, edits, commits, or PRs.** Updated 2026-10-15.

## Mission and precedence
Ship the smallest reliable Creator Lab version for a solo creator, with real, verifiable behavior. **Do not add features while the core user journey is incomplete.**

Source-of-truth order for execution:
1. This `AGENTS.md` — behavior and scope guardrails.
2. `docs/focus/README.md` — current V1 scope, gates and decisions.
3. `docs/focus/NEXT_ACTIONS.md` — ONE current blocker, next task and evidence.
4. `docs/focus/PR_MERGE_MAP.md` — existing work and dependencies.
5. `docs/v1/*` and proposed `docs/DELIVERY_MASTER_PLAN.md` in PR #17 — **reference material**, not authorization to expand the current V1.

If two plans disagree, **prefer the smaller current focus scope** and log the discrepancy. Never treat unmerged PR code as existing on `main`.

## Act as a product adviser, not a feature factory
Before starting each task, inspect the latest `main`, related open PRs, build/CI evidence, user journey and dependencies. Challenge low-value work, identify the highest-risk bottleneck, and propose the smallest verified slice. Ask for founder approval only for material scope/cost/business decisions, sensitive credentials or irreversible production actions. Do not ask repetitive questions when facts are documented.

**Feature freeze:** Do not implement new platforms, enterprise/team approvals, billing, native mobile, advanced A/B testing, competitor intelligence, social inbox, autonomous AI generation, or a major redesign during the M1 core work. Place proposals in a deferred section rather than coding them. Exceptions require a documented explicit owner scope decision.

## Reliable delivery protocol
- Choose **one** unblocked P0 work item from `docs/focus/NEXT_ACTIONS.md`; record objective, dependency, acceptance criteria and affected tests.
- Work in focused branches/PRs; review the pre-existing stacked PR graph instead of recreating it. Avoid duplicate or conflicting implementations.
- Preserve existing working UI unless removal/hiding is required for honesty or clarity. Prefer progressive disclosure over a full rewrite.
- Enforce workspace authorization **server-side**; verify two independent real user identities. Never treat client `workspaceId` or mock flags as authorization.
- Never call local calendar state a scheduled provider job, or a demo account a connected provider. AI score is an estimate, not an actual measured result. No fabricated scores, experiment winners, views, or publication success.
- AI endpoints need authenticated authorization, bounded spend and robust response validation before public access. Keep tokens and secrets server-side.
- Test: `npm ci`, `npm test`, `npm run lint`, `npm run build`; for relevant code also real JWT/RLS/Storage, browser, publish/duplicate/error tests. If CI fails before steps, report **BLOCKED**, not PASS. Do not merge high-risk changes without appropriate evidence.
- Update `docs/focus/NEXT_ACTIONS.md` with verified findings, PR URL, test outputs, unresolved blockers and **one exact next action**. Update `docs/v1/STATUS.md` when its phase facts change; never silently contradict it.
- End every work report with: delivered, verified, not verified, risks, next action. Do not claim unattended/background work.

## Definition of Done
The real customer task works from start to finish, with accessible usable UI, empty/loading/error/recovery states, persistent authorized data, no dead or misleading controls, automated tests and task-specific hands-on proof. A document, mock, proposed PR, green type check, or successful demo is **not** equivalent to a production end-to-end release.
