# Creator Lab — Competitive Feature Benchmark and Gap Decisions

**Research checked:** 2026-10-09. Official vendor pages and help centers, not hearsay. Vendor marketing describes product capabilities, **not** proof of platform API feasibility or internal architecture. Refresh provider documentation before implementing any external integration.

## Reference set and what we can learn

| Product | Publicly described strengths | Concrete design/feature lesson | Creator Lab scope decision |
|---|---|---|---|
| **Buffer** | Idea board/Kanban, AI-assisted content creation/adaptation, publishing, Insights and connected workflow. Its July 2026 announcement positions Insights around actionable next moves. | Simple navigation from idea → draft → channel publish → insight, with few clicks. Make learning actionable. | **V1 core**, not a feature-by-feature copy; unified inbox/link-in-bio **later** |
| **Metricool** | Planner, analytics, reporting, inbox, best times, competitor analysis, smart links and advertising features. | Every report should support a decision; cross-platform comparisons need proper units and definitions. | Planning + **real** metrics in V1; competitor listening/inbox/ads **later** |
| **Later** | Visual media library, scheduling, analytics, link-in-bio, platform-focused experience. | Visual media workflows and predictable previews must be first-rate for creators. | Composer/media/calendar quality **V1**; link-in-bio **later** |
| **Planable** | Feed, calendar, grid and list views; approval and collaboration workflows. | Preview context and calm calendar interaction matter. | Preview quality and calendar **V1**; complex approvals/agency **later** |
| **Publer** | Bulk scheduling, per-account schedules, post recycling and recurring content. | Durable scheduling reliability and slot semantics; distinguish scheduled from forecast/recycling. | Reliable actual scheduling **V1**; bulk imports/recycling/advanced queues **later** |
| **Sprout Social/Hootsuite class** | Wider social inbox, listening, enterprise monitoring/reporting and governance. | Scope restraint: broad feature coverage carries significant API/compliance and support cost. | No enterprise/listening/inbox parity promise in first release |

### Primary official sources

- Buffer create: https://buffer.com/de/create
- Buffer Insights release: https://buffer.com/resources/meet-insights/
- Buffer product features: https://buffer.com/
- Metricool feature index: https://metricool.com/de/
- Later getting started: https://help.later.com/hc/en-us/articles/360043246993-Getting-Started-With-Later-Social
- Planable overview: https://planable.io/
- Publer recycle: https://publer.com/features/recycling
- Publer bulk scheduling: https://publer.com/de/features/bulk-scheduling
- Sprout Social feature catalog: https://sproutsocial.com/de/features/

## How Creator Lab should differentiate

- **A linked history rather than disconnected screens:** Each idea can lead to a real destination-specific publication; every result can link back to its original draft, creative angle, platform adaptation and experiment.
- **Creator-specific evidence, not generic scores:** Show per-account, per-content performance and explain why the next suggested test follows from measured posts. Unsupported statistical certainty is never allowed.
- **Human-in-control AI:** Suggested hooks, rewrites and strategic variants that users can inspect, edit and apply; never quietly publish generated content.
- **Trustworthy operational status:** Local plan ≠ queued real job ≠ provider accepted ≠ published ≠ metrics synchronized. Expose this life cycle clearly.
- **Fewer but more polished screens:** Resolve real mobile usability, loading, errors and account connection before growing the navigation.
- **Honest external dependencies:** YouTube first, Instagram only behind official API proof; never label demo channels as live.

## Gap prioritization — features we must close

| Feature/gap | Current Creator Lab status (from repository) | Priority and task | Acceptance criterion |
|---|---|---|---|
| Identity + cloud DB | localStorage / IndexedDB is authoritative; Supabase SQL is still a non-merged, unexecuted PR | **P0** B-01..B-07 | Two independent real users, RLS verified and cross-device persistence |
| Real supported publishing | UI/adapter capability checks, no end-to-end YouTube OAuth & publish job | **P0** P-01..P-05 | Verified channel upload; durable UTC job; correct provider-backed status |
| Analytics that work | Analytics routes/model, not provider-synced evidence | **P0** A-01..A-03 | Provider metrics with source, freshness, sample and action link |
| Idea → measurement linkage | Existing pipeline/post relationships and local destination snapshots | **P0** B/P/A milestones | Open an insight and navigate to contributing published post and source idea |
| User onboarding | Settings/workspace UI but no production signup flow | **P0** D-04 | Empty account → verified account → draft workflow |
| Responsive and accessibility | Desktop-focused app shell and scattered components | **P0** D-01..D-06 | 375px–1440px, keyboard/screen-reader checks, no unreachable actions |
| Operational errors/status | Prototype truth labels, no durable jobs yet | **P0** P-04 / D-05 / R-03 | Retry, auth expiry, revoked permissions, media failure and honest states |
| Real experiments | Experiment Lab exists with user-entered fields, no provider-linked sample window proof | **P1** A-04..A-05 | Evidence-backed outcome, limitations, avoid unsupported winner |
| Instagram | Placeholder platform capability; official access gate not completed | **P1 conditional** P-06 | Complete official Meta feasibility, OAuth/publish/insights test |
| Bulk schedule and recycling | No reliable publish backend yet | **post-V1** | Re-evaluate after jobs and one platform prove reliable |
| Social inbox/listening/competitors | Not implemented as real provider integrations | **post-V1** | Only implement with legal API access and demonstrated user demand |
| Agency permissions/approvals | Not built | **post-V1** | Separate team/agency scope after creator workflow works |

## Feature change acceptance — anti-feature-creep rule

Every request to add a competitor-inspired feature must answer:

1. Which Creator Lab user problem and workflow stage does it solve?
2. Is it in V1 MUST, SHOULD or POST-V1, and does it have a provider/business dependency?
3. Can it be backed by real data and tested? What happens if OAuth/sync fails?
4. Does it improve end-to-end completion more than the highest-priority blocking task?
5. What will be explicitly deferred to keep delivery coherent?

**Example:** Buffer-style idea board is already represented by Pipeline; refine traceability and interactions rather than cloning another idea board. Publer-style recycling cannot be called functional while background publishing and idempotent jobs do not exist.

## Source freshness and uncertainty policy

These are public product descriptions as of the review date, **not** a laboratory feature-parity test, paid-plan entitlements, verified competitor accounts or review of proprietary code. Prices, features and permitted social API scopes change. Mark unknown instead of inventing pricing, exact limits or measured UX performance.

Research artifacts guide scope/UX only; `docs/v1/04_PLATFORM_API_FEASIBILITY.md` remains the authority for verified API integration gates.
