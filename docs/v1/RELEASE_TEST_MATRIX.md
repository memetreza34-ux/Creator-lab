# Creator Lab — Release Test Matrix & Acceptance Ledger

**Last review:** 2026-10-09. These are **required checks**, not previously executed test results. Links: `docs/DELIVERY_MASTER_PLAN.md` and `docs/v1/10_RELEASE_CRITERIA.md`.

## 1. Evidence levels

- **L0 static:** schema/code inspection and unit tests; proves targeted rules only.
- **L1 application:** running browser with realistic seeded isolated test data; tests navigation, errors, responsive behavior and persistence.
- **L2 integration:** authenticated test Supabase project with two users, actual RLS/storage and real network failure conditions.
- **L3 provider:** real permitted YouTube (and optional Instagram) test connection, upload, publish/schedule response and metrics.
- **L4 production:** deployed environment with health, monitoring, backups, rollback plan and smoke tests.

A route screenshot is **L1 visual evidence only**, not L2 data security or L3 publishing proof.

## 2. Critical E2E flows — must pass before public release

| ID | Flow | Expected evidence | Blocked by |
|---|---|---|---|
| E2E-01 | Fresh signup → verification → create workspace → logout/login | Verified user identity and stable workspace | B-01..B-05 |
| E2E-02 | User A accesses B's workspace/post/media using guessed IDs and direct requests | All unauthorized reads/writes denied server-side | B-02..B-03 |
| E2E-03 | User without workspace sees empty onboarding, not demo account metrics | No fake account or published data | B-04..B-05 / D-04 |
| E2E-04 | Idea → stage changes → Composer draft with source link → save → reload | Identical content and traceability, no data loss | B-05 |
| E2E-05 | Base caption + platform override + media → edit draft after reload | Variant inheritance preserved and media reachable | B-05..B-06 |
| E2E-06 | Local 18:30 Berlin schedule in browser using New York timezone | Same wall-clock time and UTC instant across Calendar/Posts/Dashboard/Composer | Phase 3 browser gate |
| E2E-07 | Drag Month across DST, Week/Day hour, reject missing/repeated DST hour | No implicit timezone drift | Phase 3 browser gate |
| E2E-08 | Upload image/video → attach post → sign in on second device | Signed media survives device change and unauthorized requests fail | B-06 |
| E2E-09 | Delete media linked to a post; cancel/confirm | Affected references disclosed; cancel preserves state | B-06 |
| E2E-10 | Connect YouTube verified account, revoke/reconnect | OAuth tokens stay server-side; status truthful; expired permission handled | P-02 |
| E2E-11 | Post valid video and get provider ID | No success until real provider response; link points to correct post | P-03 |
| E2E-12 | Schedule video; worker executes once; force duplicate delivery attempt | Exactly one provider post; durable job persists restarts | P-04..P-05 |
| E2E-13 | Transient quota/network failure, retry then permanent failure | Bounded retries, useful status/error/action, no false publish | P-04 |
| E2E-14 | Disconnect active account with scheduled content and historical posts | Future actions require review; historical identity retained | B-05 / P-01 |
| E2E-15 | Sync real analytics, change filters, inspect contributing posts | Source/freshness/units correct, no empty-data inventions | A-01..A-03 |
| E2E-16 | Create experiment from real insight → variants → observation → outcome | Evidence IDs, sample limits and no unsupported certainty | A-04..A-05 |
| E2E-17 | Workspace owner/editor/viewer actions and membership enforcement | Least-privilege server authorization | B-03 |
| E2E-18 | Expired session, browser refresh, network outage during save/upload | Clear recovery and no silent data loss | B-04..B-06 |
| E2E-19 | User data/account delete and irreversible action confirmation | Defined policy, no orphan files/jobs | R-04 |
| E2E-20 | Fresh onboarding and critical flows on 375px mobile viewport | All essential controls reachable without unsupported overflow | D-03..D-06 |

## 3. Module test depth

| Module | Unit | Integration | Browser/manual | Provider/production |
|---|---|---|---|---|
| Auth/RLS | role predicates where appropriate | A/B JWT and cross-workspace FK/storage | login/refresh/logout | Supabase real test |
| Composer | normalization/overrides/validation | CRUD and signed URLs | draft/AI apply/navigation guard | publishable provider validation |
| Pipeline | move/order/cascade | cross-workspace CRUD | drag or accessible move | none |
| Calendar | IANA DST/reschedule state | job creation | Month/Week/Day/timezone | scheduled job execution |
| Publishing | transitions/idempotency/backoff | DB worker jobs | job status/retry UI | YouTube actual response |
| Analytics | metric normalization/trend math | metrics sync/upsert | filters/empty/freshness | actual provider API |
| Experiments | observations/sample thresholds | linked evidence rows | compare and explain | measured live posts |
| Media | reference cleanup | Storage RLS/MIME/quota | upload/preview/delete | cross-device and expiring URL |
| Design | component state/keyboard semantics | none | viewport, focus, contrast, reduced motion | production browser smoke |

## 4. Nonfunctional release gates

**Security:** RLS applied and tested with distinct authenticated users, service-role secrets never in frontend, provider OAuth server-only, protected account deletion, provider data retention policy and rate limits.

**Reliability:** accepted/publishing/completed/retry/failed states are durable; scheduled workers are idempotent; no successful publish toast before provider acknowledgment; retry policies observable.

**Performance:** route transitions and Composer interactions remain usable on mid-range mobile/desktop, virtualize lists when needed, trim bundle/large media previews, render loading skeletons. Record measured baseline before setting numeric budgets.

**Accessibility:** keyboard all essential actions, visible focus, labeled fields/buttons, dialog focus management, no color-only statuses, reduced motion. Perform an actual axe/manual pass.

**Data quality:** no simulated analytics in real account views, sample and freshness labels, no made-up boost/winner, provider metric definitions respected.

**Experience:** every core route must support loading, empty, populated, error, offline/retry, success, session-expired and permission-denied conditions.

**Operations:** deployment environment separation, migrations and rollback, backed-up data, logs/traces/alerts, support contact and privacy/account deletion documentation.

## 5. Acceptance record template

Add one row to the relevant task/PR notes for each gate:

```text
Task:
Commit / PR:
Environment + browser / viewport:
Data setup (demo/test user/provider):
Test IDs:
Result: PASS | FAIL | BLOCKED
Evidence: CI run URL; screenshots/log IDs; provider record IDs (non-secret)
Failures and reproduction:
Reviewer:
Next action:
```

Never close a blocked test as passed. A failed GitHub Actions run with no usable steps/logs is **BLOCKED infrastructure/validation**, not evidence that the app code passed or failed a particular unit test.

## 6. Final launch decision

Release checklist must be signed off against all MUST items in `docs/v1/05_V1_SCOPE.md` and `docs/v1/10_RELEASE_CRITERIA.md`. A V1 exception requires an explicit changed-scope decision in `docs/v1/DECISIONS.md` and truthful public messaging. "Looks finished" cannot replace account authorization, provider execution, metrics provenance or uptime.
