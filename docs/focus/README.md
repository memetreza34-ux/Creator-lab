# Creator Lab — V1 Focus Reset

**Decision draft created 2026-10-15.** This focus layer deliberately shrinks the current project without deleting previously implemented code or existing roadmap evidence. Founder sign-off and PR merge are required before treating it as an approved scope change.

## 1. What happened
Features, analytics, experiments, multiple platforms, design and monetization requirements accumulated ahead of the first fully working customer experience. As of 2026-10-15, `main` is a mainly local browser prototype; multiple real backend/cloud implementation slices exist in **open, stacked PRs**, not merged `main`. In addition, GitHub Actions has an unresolved pre-runner failure (issue #19). Delivery risk is now integration, proof and scope control, **not lack of screens**.

## 2. One user, one job, one differentiator
**Proposed first persona (hypothesis, validate with interviews):** solo creators publishing recurring short/long videos and repurposing descriptions/captions across YouTube and Instagram. No teams/agencies in the initial experience.

**Job to be done:** "I have an idea or a finished video; help me prepare the right copy and media, keep track of what is next, and publish without losing work."

**Positioning hypothesis:** a calm, creator-first workflow with reviewable AI adaptations and honest publish status. Do not compete on number of networks, AI novelty, or having every enterprise feature.

The content-loop aspiration survives long term, but the release must be **vertically sliced**, not feature-saturated.

## 3. Two explicit milestones, with narrow gates
### M1 — Invite-only usable creator beta (no social API claims)
One real person can:
1. Sign up / log in, create a workspace and return after logout.
2. Create an idea; turn it into a saved draft with a caption/title and optional supported file.
3. Adjust text for a chosen platform using human-controlled AI (only after auth and spend protection), or edit manually if AI is unavailable.
4. Plan a publication date in the workspace timezone, change it and see the same date in Calendar and Posts.
5. Export/copy the finished text and download the original media so it can be **published manually**. Show "Local plan / Manual export" everywhere; never pretend it was auto-posted.
6. Use a second device to recover work; a second authenticated user cannot read/change it.

Scope: simple onboarding, one workspace per user initially, a reliable idea→draft→plan→export flow, media upload/preview, a small navigation, real empty/error states, accessible desktop and mobile web. Keep advanced old UI only if honestly labeled; remove/de-emphasize unrelated navigation and fake metrics from the normal beta journey. No payment required for closed usability testing.

M1 release evidence: authenticated two-user RLS and private media access tests pass; browser walkthrough with real login and data reload; file/format handling, blocked AI, timezone and upload failures visibly recover; no critical bugs; tests/typecheck/build verifiably pass.

### M2 — First verified automatic publishing release
M1 plus:
1. One provider only: **YouTube first**, subject to current provider verification and test-account feasibility. OAuth connect/revoke/refresh and secure token handling.
2. One real upload flow using supported video media, verified provider response, provider video ID and truthful success/error state.
3. Durable UTC scheduling/publish jobs, at-least-once execution safety and idempotency to avoid duplicate publishes; retry/reconciliation and logs.
4. Basic real post metrics **only when available**; label platform source, observation timestamp, metric meaning, and unavailable/late data. Do not release fabricated analytics or inferred experiment winners.
5. Independent release proof: real account, real permitted upload and scheduled release, expiry/reconnect, failures/retries, no duplicate jobs. Official provider audit/review must be cleared if required.

Public/general release remains separately gated on privacy/legal review, support, monitoring, backups, deletion/export and dependable deployment. Paid billing is a later business gate **unless explicitly approved as part of a commercial launch**; no artificial urgency to implement subscriptions before validating the core.

**Contingency:** If public YouTube publishing is blocked by provider access/audit, do not fake an integration or silently substitute Instagram. Finish an honest M1 beta, record the blocker and seek a conscious owner decision on alternate validated network vs postponement. `publishAt`, quotas and private/public upload restrictions must be re-checked against live official API docs/test account.

## 4. Strict inclusion and exclusions
**M1 MUST:** authenticated workspace + durable cloud data, media, focused composer, clear AI suggestions (optional if quota not ready), local calendar, posts list, manual export, truth labels, data safety, responsive/accessibility baseline, QA.

**M2 MUST:** one real verified connection, provider-backed publication and reliable job system, verified basic metrics if in scope, operational and legal release gates.

**NOT NOW:** advanced Experiment Lab/statistical winners; broad Analytics charts; competitor dashboards; auto-generating images/videos; multi-platform publishing parity; agency collaboration; inbox; social listening; price pages and Stripe production billing; elaborate onboarding tours; major rebrand; speculative "AI virality" scores. Keep usable code; de-emphasize/hide unfinished modules rather than deleting without migration.

## 5. Structure and user-experience discipline
Primary journey and navigation should emphasize: **Workspace / Ideas → Create → Plan → Posts** with Media available where needed; Account/Settings as utility. A single clear CTA at each step; visible draft and plan state; recoverable delete; mobile layout, keyboard focus; honest unavailable features. Existing Pipeline and Composer are assets to integrate, **not invitations to build another separate cloud app**. Cloud pilot routes should transition into a single authoritative experience only after acceptance tests pass.

No component redesign without a defined customer pain. No "more functions" as a measure of progress.

## 6. Methods for speed with quality
- **Lean MVP / vertical slices:** first complete the customer action end to end, then harden and extend. Minimize work in progress.
- **Shape Up appetite discipline:** timebox task investigation and cut scope before expanding; small slices independently testable. Reference: https://basecamp.com/shapeup/1.2-chapter-03
- **Risk-first sequencing:** auth/RLS/CI before expensive social integration; external API feasibility checked early with isolated proof.
- **Kanban WIP limit = 1 primary implementation slice**, with independent review/CI repair as the only parallel exception. Avoid 10 concurrent PRs.
- **Acceptance criteria + Definition of Done:** measured behaviors, failed paths, E2E evidence; no "looks finished" status.
- **Weekly founder review (when invoked):** demo of one complete user journey, bug list and single next milestone; not an automatic background update.

## 7. Decision log — proposal not yet approved
- F-001: Freeze feature expansion and distinguish M1 manual beta from M2 real publishing.
- F-002: Target solo creators first; test with five suitable users rather than assume a paying market.
- F-003: Preserve code already built; do not merge untested stacked PRs or rebuild same feature.
- F-004: Only YouTube is first candidate; no promise of Instagram parity before provider proof.
- F-005: Do not implement billing or full experiments before a usable, verified core unless founder explicitly changes scope.
- F-006: Every future agent checks focus + `main` + PR dependencies + CI before work.

These proposed focus decisions narrow the larger aspirational plans in `docs/v1/` and in PR #17. If adopted, revise those old documents to clearly separate **now, beta, first verified V1, later** instead of having contradictory MUST lists.

## 8. User validation, not fiction
Recruit ~5 prospective solo creators; observe them starting from a clean account, drafting, finding media, planning, exporting. Record task completion, major confusion, time-to-first-completed-draft and willingness to re-use/pay. No claim of demand until observed. Success bar proposal: 4/5 complete the main beta task without direct intervention and no loss or exposure of data. Record failures and fix highest-impact friction before feature expansion.
