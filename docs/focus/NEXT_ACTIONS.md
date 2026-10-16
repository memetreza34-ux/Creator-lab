# Creator Lab — execution control and handoff

Snapshot checked 2026-10-15. **This is a living work board, not a claim that checks have been executed.** Update after every substantive PR/merge and include links/evidence.

## Immediate objective
**Validate existing backend/cloud security work and integrate one real creator journey before building new features.** WIP limit: one principal implementation task; separate runner/admin triage may occur in parallel. No additional phase/feature ideas.

## NOW — single current priority (P0)
**F-002: Complete and document genuine 2-user JWT/Storage acceptance (#23/#32), after schema/catalog review (#16/#28/#30).**
- Status update 2026-10-15: the historical pre-step GitHub Actions failure (#19) is **not currently reproduced on new branch PR #35**. Actions [run #38776708630](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38776708630) completed Checkout, npm ci, **74/74 tests**, TypeScript and production build on commit `93a9aa6b0e4fc16d0484a7c0809e6c703281e64a`. This confirms runner capacity for that branch; the old root cause remains unknown and old PRs are **not** automatically validated.
- **Live read-only verified 2026-10-16:** dedicated project `aoyrijspyygqoyeajxpf` is active; six migration entries exactly match #16/#28/#30 version names, nine Creator public tables have RLS, `creator-media` is a private bucket (50 MiB limit), and there are zero Auth users/workspaces/posts/media. All four advisor warnings relate to authenticated-callable SECURITY DEFINER helper functions; review but do not mislabel as confirmed exploit.
- **CI confirmation:** PR #16 previous failed run [#37961296344](https://github.com/memetreza34-ux/Creator-lab/actions/runs/37961296344) retry succeeded (Checkout, npm ci, tests, TypeScript and build). CI PR #33 is now merged to main (`564005e92f3f2cb3e5976bae3ff922e5f457aae2`) for stacked base validation. This does not verify #23/#32 live JWT behavior.
- Next: validate the exact offline #32 harness on updated CI, then run real Auth-issued JWT tests **only with two safely provisioned disposable test accounts**, using publishable-only credentials in a secure runner; record cross-user denial and cleanup. Do not expose passwords in GitHub.
- Success is documented live database source match, two **genuine issued JWTs**, denied cross-user/workspace data and private media access, and reproducible evidence. Only then integrate existing cloud UI adapters.
- Do not add new product features while this P0 dependency is open.

## NEXT — ordered backlog with exact acceptance gates
| ID | Priority | Task (reuse PRs) | Done only when |
|---|---|---|---|
| F-002 | P0 | Reconcile six live schema migrations (#16/#28/#30); real Auth probes pending. | Versions and live RLS verified; deeper code diff + two-user permissions need signoff; do not rerun applied migrations. |
| F-003 | P0 | Run real issued-JWT 2-user RLS/private media tests (#23/#32). | Cross-tenant read/write/download/delete denied; own legitimate workflow succeeds; reproducible logs/evidence recorded. |
| F-004 | P0 | Integrate cloud Auth/session/pipeline/draft/media in dependency order (#24–#31). | Full real user flow persists after logout/reload/device change; no parallel local vs cloud data confusion; AI disabled safely if not auth-gated. |
| F-005 | P0 | Finish one M1 vertical slice: idea → draft → upload/preview → platform text → timezone-local plan → manual copy/export. | Clean browser E2E, correct empty/error recovery, no fake publication, accessible small/mobile screens. |
| F-006 | P0 | Private 5-user beta and critical defect fixes. | At least 5 task observations collected; 4/5 complete without direct help as a target; no known P0 bugs/data loss; privacy basics in place. |
| F-007 | P0 for M2 | YouTube developer feasibility/OAuth/test upload proof. | Scope/consent/revoke/refresh/quota/audit constraints recorded, actual private/public status and provider ID confirmed. |
| F-008 | P0 for M2 | Durable publication jobs and one real YouTube scheduling journey. | Real confirmed publication, delayed job, no duplicate on retries, recovery + provider audit status verified. |
| F-009 | P1 for M2 | Minimal real performance panel and publication evidence. | Values sourced from actual provider with timestamp/units; stale/unavailable state; no guessed winners or faux growth. |
| F-010 | Conditional | Deployment, accessibility/security/legal/operations signoff; monetization decision only after beta evidence. | Live URL passed release smoke, restore/revoke/data deletion, truthful public copy; payment optional only if commercial release chosen. |

The old master plan's many additional work items should **not** auto-enter this board. Founder-approved changes must state **what gets removed/deferred** to protect time and quality.

## Open decision gates (not authorization to stop safe work)
1. **Founder approval:** M1 (honest manual beta) vs M2 (first real YouTube release) scope, and solo creator as first persona.
2. Initial product language and first beta audience country — affects UX/legal work, not local code planning.
3. OAuth provider test-account and application access for M2 — no social tokens or privileged secrets in PRs.
4. Real public/paid launch terms, tax/legal review and any costs — separate explicit gate.

## Required per-task handoff record
- Checked date/time and branch `main` SHA; linked PRs/issue and active milestone.
- **Problem for user** and why this is the highest impact unblocked step.
- Exactly what changed (files/migrations/routes); unaffected behavior.
- Tests completed (commands and actual pass/fail), manual browser/provider/security proofs; explicitly NOT tested.
- Discovered risks, cost, blockers, reversible mitigation/rollback.
- **One next exact task** with acceptance criteria and why it is next.

## Release scorecard (start as NOT VERIFIED)
| Criterion | M1 | M2 | Evidence |
|---|---|---|---|
| Correct auth and 2-user authorization | NOT VERIFIED | Required | Genuine JWT + RLS/Storage test |
| Durable draft/media across devices | NOT VERIFIED | Required | Multi-session browser E2E |
| Clean end-to-end creator journey | NOT VERIFIED | Required | Observed M1 task |
| Usable accessible error/recovery states | NOT VERIFIED | Required | Mobile + keyboard + failure tests |
| CI validation on merged candidate | PR #35 branch GREEN (74/74); combined/merged candidate NOT VERIFIED | Required | Actual run #38776708630; old branches need independent checks |
| Real OAuth/provider upload | Not promised | NOT VERIFIED | Provider-side ID and verification |
| Safe durable scheduled jobs | Not promised | NOT VERIFIED | Delayed publish + duplicate retry |
| Truthful basic real analytics | Demo must be hidden | NOT VERIFIED | Dated provider evidence |
| User validation and launch compliance | NOT VERIFIED | Required as applicable | Findings, privacy/support/release review |

No calendar-date promises or fictitious % completion. Progress = verified completed end-to-end gates.

## Existing beta UI slice — do not recreate
- [PR #35](https://github.com/memetreza34-ux/Creator-lab/pull/35) (DRAFT, not merged): local-only UI focus, empty first run, accountless drafts/manual planning, planning-only YouTube/Instagram/TikTok text targets, copy/text export and local media downloads. Retains old advanced data/code. **Branch CI verified (74/74 tests, TS/build); real browser/cloud E2E NOT VERIFIED.**
- Before accepting #35, recheck current-head CI, manually verify mobile + persistence + no-account export flow, run genuine multiuser Auth/Storage tests, and reconcile with the stacked cloud integration PR chain. Do not copy this local-only implementation wholesale as a second cloud app.
- **Important:** #35 does not complete F-004/F-005 or the real M1 beta. It only advances the local-screen slice; production Auth/cloud is still unverified.
