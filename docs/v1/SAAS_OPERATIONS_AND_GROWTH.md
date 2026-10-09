# Creator Lab — SaaS Operations, Marketing & Business Readiness

**Plan from 2026-10-09.** Creator Lab will be evaluated as a genuine subscription service, not only as a frontend demo. No statements in this file mean the listed business systems are deployed.

## 1. Commercial positioning and message

Offer: "Create and plan content for supported channels, publish reliably and understand what actually worked — from one workspace." Differentiating feature: close the loop from original idea to real measured evidence and a better next experiment. Avoid "AI guarantees virality", "autopost to every platform" and unsupported network logos.

**Audience entry points:**
- Solo creator overwhelmed by many drafts, media files and manually switching platforms.
- Small creator brand that needs repeatable planned content and evidence about topics/CTAs.
- Later: a small team when seat/membership safety and multi-user auditing are complete.

Initial go-to-market hypothesis (not proven): content creators who publish multiple times per week and pay for time saved are stronger candidates than casual once-per-month posters.

## 2. Site map for the whole paid product

### Public

- `/` marketing/landing (only when deployment routes are clearly separated from private app).
- `/features`, `/pricing`, `/how-it-works`, `/integrations` showing **verified** channels.
- `/login`, `/signup`, `/reset-password`, `/verify-email`.
- `/legal/imprint`, `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/ai` as applicable; accessible from site and checkout.
- `/help`, `/status`, `/contact`; `/cancel-subscription` and confirmation path for applicable German consumer contracts.
- Error/not found and maintenance pages; no leaked workspace content.

### Authenticated application

- `/app`: dashboard, `/app/create`, `/app/calendar`, `/app/pipeline`, `/app/posts`, `/app/media`, `/app/analytics`, `/app/experiments`.
- `/app/accounts`: verified integrations/scopes, reconnect/revoke.
- `/app/settings`: workspace, timezone, billing/usage, members only when safe, privacy/exports, security, help.

Final routing plan must support existing routes with explicit redirects and protect auth-only data. Do not break old draft/edit deep links silently; safe upgrades and website migration path required.

## 3. Acquisition and first activation

### Landing page content blocks

1. Clear creator-focused headline + product screenshot or tested demo clip, not fictional testimonials.
2. "How it works" in three screens: make a draft → send via verified provider → learn from actual metrics.
3. Useful distinction: AI helps create, creator approves publishing; dates and provider state are real.
4. Feature explanations with transparent supported/coming-soon labels; avoid generic feature-grid bloat.
5. Pricing Free/Pro/Studio (Studio only when ready), allowances, terms, billing cadence and cancellation.
6. FAQ: how supported YouTube works, media limits, data use/AI policy, cancel anytime, provider permissions, GDPR.
7. Trust links: contact, business identity, privacy, security explanation, honest roadmap.

### Retention and customer lifecycle emails

- Signup verification/confirmation and welcome with next step.
- Security-sensitive login/reset/account changes.
- Verified channel connected/disconnected and OAuth refresh failure.
- Publication succeeded/failed (send only on confirmed provider event), no speculative green alerts.
- Optional weekly progress digest **only with appropriate marketing preference or service necessity** and honest metrics.
- Trial ending / billing renewal, payment failure, invoice available, downgrade/cancel confirmations.
- Export ready and deletion confirmation consistent with retention/legal requirements.

Use templates with event idempotency, delivery status, language preference, unsubscribe where applicable, bounded retry, and no sensitive content in subject lines by default.

## 4. Internationalization and accessibility

- Initial operating hypothesis: launch **English as product UI default** with German localization for German/EU audience; founder chooses final language priorities before polishing copy.
- Avoid hard-coded punctuation/date/number/currency/timezone; use localized Intl formats, proper decimal and plural handling, translated email/billing/legal content.
- Make right-to-left/larger font extensible without claiming V1 full localization.
- Implement accessible keyboard operations, error announcements, reduced motion, color contrast, form state and help. German BFSG applicability must be verified before public consumer sales.
- Brand names and provider labels remain constant; translated user-facing date/time respects workspace time, not browser time.

## 5. Customer support and trust

- In-app "Help" and clear contact method with response expectations that the team can actually fulfill.
- Human-readable error codes, self-serve setup articles: Auth, connect YouTube, failed upload, scheduled job, changing plan, export/delete.
- Incident classification P0 security/data leak, P1 publishing loss/double post, P2 major editor failures, P3 cosmetic; on-call owner and escalation path.
- Visible status/error announcements and affected operations where possible, with accurate ETAs (do not invent).
- Document refund/dispute handling, privacy requests, takedown/IP reports and provider policy compliance.
- Use a user feedback loop: reproducible issue, affected browser/route, consented diagnostics and roadmap triage.

## 6. Business economics and limits

Track without exposing personal content:
- Revenue: MRR/ARR after confirmed payments, free-to-paid activation, conversion and voluntary/involuntary churn; do not count checkout redirects as paid users.
- Hosting/AI/database/storage/egress/email/worker/monitoring/payment provider/service fees per active workspace.
- Operational reliability: publishing job success, delayed jobs, duplicate attempts, auth errors, failed media uploads, stale metrics.
- Product: first-use activation, draft save success, publish time to confirmation, AI suggestion use and cost, experiment reuse.

**Unit economics worksheet inputs:**
```text
monthly_revenue_per_workspace
- payment/billing/tax platform fees
- AI input/output model inference + retries
- database + storage + bandwidth + scheduled workers
- provider integration operational overhead
- monitoring/email/support + abuse/refunds
= gross_contribution_per_workspace (estimate)
```
No quote of "unlimited AI", "unlimited storage" or "unlimited auto posts" before stress/cost measurements. Monthly caps and fair-use explanation should protect both customer and service.

## 7. Production infrastructure and SRE

### Environments

- `local` with local Supabase/dev mocks and no real payment/publish.
- `staging` with separate Auth/database/storage and payment test mode, verified test provider account.
- `production` with restricted secrets, domain, backups, monitoring and active billing only after acceptance.

### Delivery pipeline

- CI: tests/TypeScript/build; migration lint & SQL tests; E2E; dependency scan and secret scan.
- No merge on red/unknown CI. A job failing before first step should become an infrastructure ticket, not a speculative code rewrite.
- Secure environment variables and rotation; no shared production service role in frontend, staging or developer machines.
- Database migrations reversible via backup/forward strategy; staging rehearsal with realistic anonymized data.
- Release health: smoke login, workspace read, create draft, media upload, job enqueue, provider delivery in controlled test, billing test state.
- SLOs to be set after measuring load; until then require dashboards/alerts on failed/delayed publish jobs and degraded Auth/AI endpoints.

### Data and incident operations

- Restore backup in an isolated environment on a schedule, test media restoration and reconciling job state.
- Publish worker: durable queue, leased processing, idempotency and observable manual retry. Never rely on browser session timers.
- Traceable request/job/provider/billing event identifiers but minimal private content in logs.
- Procedure for API outage, compromised OAuth tokens, breached personal data and failed billed/entitlement mismatch.
- Explicit data retention policy for deleted account: what is immediate, what remains legally required (e.g. invoices), and when backups expire.

## 8. Release stages and checkpoints

| Gate | Who/what it proves | Do not do yet |
|---|---|---|
| Private internal test | local+staging, critical draft/calendar/AI UX passes | claim real integrated publishing |
| Closed beta | authorized test users and verified YouTube route, no fictitious metrics | sell unsupported social platforms |
| Free public beta | stable Auth/storage/YouTube, data security and support, real documented limitations | advertise paid plans not tested |
| Paid beta | sandbox billing life cycle passed, legal/tax/cancel policy approved, financial limits proven | launch recurring charges before provider reconciliation |
| Commercial release | complete applicable V1 MUST features incl. paying-user path, incident/restore runbooks, visual/accessibility QA | present prototype as production |

## 9. Execution task map

- **OPS-01:** staging/production separation, CI and secret scanning; backup/restore and migration rehearsal.
- **OPS-02:** production monitoring: auth, upload, AI cost, provider publishing queue, metric sync, billing errors.
- **OPS-03:** support/help content, issue triage, status/incident communications, privacy request workflow.
- **OPS-04:** email events, templates, preferences, deliverability/dedup/retry.
- **OPS-05:** GDPR-conscious product event measurement and cost/unit-economics dashboard.
- **GTM-01:** customer interviews, product messaging, pricing/page proof and onboarding task tests.
- **GTM-02:** build real public marketing pages, SEO metadata/screenshots, integration status, support/legal links.
- **GTM-03:** approve copy, supported claims, launch territories, payment/tax and legal public pages.
- **I18N-01:** language priority decision, date/number/currency translation infrastructure, accessible locales.

**No claim of completed business launch** until the gates above pass with evidence and founder approval. This is the part that prevents a beautiful app from becoming an expensive, noncompliant or unsupported SaaS.
