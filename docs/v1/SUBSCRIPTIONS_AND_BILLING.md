# Creator Lab — Subscription, Pricing & Entitlements Specification

**2026-10-09. Planning only: no payment provider is connected and no paid tier is active.** Design for customers in Germany/EU first. All sample prices and quotas below are **experiments, not final offers or approved costs**. Commercial/legal/tax review before sales.

## 1. Monetization strategy

Principle: A free tier demonstrates real workflow value, Pro monetizes time savings and creator-specific insight, Studio handles larger volumes and small teams **only after memberships are implemented safely**. Avoid selling artificial "AI magic" or unreleased social platforms.

### Suggested plan packaging for market testing (NOT final pricing)

| | Free | Creator Pro | Studio (later gated) |
|---|---|---|---|
| Indicative monthly list price | €0 | **€19/month hypothesis** | **€39/month hypothesis** |
| Annual billing | n/a | optional with clearly disclosed total and discount | optional, subject to supported roles |
| Users/workspace | 1 user; limited workspaces | 1 user initially; higher workspace allowance | 2–3 seats only when secure invitations/roles exist |
| Publishing channels | 1 verified supported channel, only after API/plan gate | Several verified supported channels | More supported channels; never sell unsupported platform |
| Content planning | Core idea/pipeline/drafts | More saved/scheduled posts and calendar control | Higher limits |
| Media storage | Small quota | Higher private quota | Higher private quota |
| AI | Small monthly **metered** allowance | Larger allowance, predictable cap | Higher shared allowance |
| Analytics/experiments | Basic provider metrics only where available | Evidence-backed analytics/insights, experiments | More history/export where operationally supported |
| Support | Self-serve | Standard support | Only promise priority support if capacity exists |

**Avoid fake plan parity:** if YouTube is the only verified provider at launch, plan limits must be expressed as eligible supported accounts, not "10 social platforms." Do not hide a feature behind Pro if it cannot actually work in production. Team tier cannot be sold until invitation/role policies exist.

### Plan numbers remain hypotheses

Start with a research matrix of 0 / 19 / 39 EUR; interview creators about target willingness-to-pay, usage frequency and perceived value. Then simulate actual hosting, AI, provider quota, payment, taxes, refunds and support costs. If paid/free-unit economics are unhealthy, adjust allocation and published price **before** enabling checkout. Annual discounts and trial duration require approval and accounting review.

## 2. Design a fair usage system

Use **entitlements and usage meters**, not hard-coded `if (plan === 'pro')` conditions scattered in React.

### Authoritative data model

- `billing_customers(workspace_id, provider, provider_customer_id)`
- `subscriptions(workspace_id, provider_subscription_id, price_id, status, currency, current_period_start/end, cancel_at_period_end, trial_end, last_verified_at)`
- `plan_features(plan_key, feature_key, value/type)` — versioned server-side plan catalog
- `workspace_entitlements(workspace_id, feature_key, value, source, valid_until)` — derived from verified subscription data, not client state
- `usage_events(id, workspace_id, meter, quantity, occurred_at, request_id UNIQUE)` — deduplicated accounting
- `usage_period_totals(workspace_id, meter, period_start, consumed)`
- `billing_webhook_events(provider_event_id UNIQUE, received_at, processed_at, status)` — replay/out-of-order tolerance

A **workspace** is the billing unit; a user can be an owner/member. Only an authenticated **workspace owner** can change billing. The server rejects any attempt to attach another person's subscription/customer by IDs from the browser.

### Entitlement enforcement points

| Action | Where to check | Customer message when limited |
|---|---|---|
| Create/select another social channel | backend before OAuth connect | "Your plan supports N connected channels" + upgrade/link |
| Add media | server **before** signed upload/commit | remaining storage, file cap, safe recovery action |
| Generate AI response | authenticated AI gateway **before** call and before recording usage | balance/cost or "next allowance reset date", no surprise charge |
| Schedule/publish | server job creation, entitlement snapshot for execution | clear limit reason; do not silently drop existing queued work |
| Add workspace/seat | server membership/workspace creation | seat limit and safe invitation failure |
| Analytics lookback/export | server query/capabilities | visible capped range; export upgrade when honestly supported |

Use an atomic reservation/commit/refund mechanism for AI and upload quotas to prevent double spending during concurrency; idempotency keys for retries. Display predicted allowance costs where measurable and account for model-output variation; never promise exact token burn before call.

## 3. Billing lifecycle and user journeys

### First purchase

From in-app plan card → show monthly/annual **full price**, renewal schedule, cancellation process, tax treatment, any trial requirements, feature availability, and relevant EU consumer information → provider-hosted Checkout → return `payment processing` state → **verified server webhook** grants entitlement. Browser redirect alone **never** activates Pro.

### Manage and cancel

Visible Billing & Usage settings. Show next renewal, payment source, current invoice/status, plan, tax, cancel effective date, downgrade options and data consequences. Provider-hosted portal can manage payment methods if it meets the applicable cancellation rules. For German consumer subscriptions potentially in scope of **§312k BGB**, ensure a constantly accessible compliant cancellation control/confirmation flow independent of obscure login steps. Legal counsel should assess exact applicability and wording.

### Failure/suspend/downgrade

- Trialing → active, trial ends, invoice paid, payment requires action, past due, unpaid, canceled, renewed.
- Grace policy **explicit and documented**: suggested temporary read-only/usage freeze for premium actions rather than data deletion.
- Do **not** delete any existing posts/media on downgrade. Prevent new over-limit actions and offer clear export/cleanup; preserve scheduled provider jobs or prompt for owner decision with explicit policy.
- Duplicate/out-of-order webhooks and repeated browser requests must not double bill or double grant features.
- Refunds, disputes, tax adjustments, invoice delivery and retention are owned by billing backend/provider; expose honest links/history.
- Self-service customer support handles missing entitlement even when card was charged; reconcile against provider rather than assuming callback success.

## 4. Payment provider selection gate

**Stripe Billing + Checkout + Customer Portal** is the first technical candidate because of managed subscription status, entitlements/webhooks, and billing portal tooling; **not yet selected/connected.** If minimizing VAT compliance/merchant administration is essential, compare a Merchant of Record option such as Paddle/Lemon Squeezy using current official contract/fee/market support before making the choice. A Merchant of Record may assume different merchant/tax responsibilities, subject to contract; do not claim it automatically resolves all legal duties.

Mandatory comparison:
- Supported founder country/company type and accepted currencies/payment methods.
- Merchant of record vs own seller: who invoices, remits tax, supports refunds/disputes, handles consumer cancellation.
- Trial, proration, coupons, invoices, VAT ID B2B, EU B2C/OSS flows, failed-payment recovery.
- API/webhook semantics, signature, idempotency, replay and sandbox testing.
- Subscription cost + transaction + tax service fees + settlement timing.
- GDPR/processor agreements and data transfers.
- Accessible cancellation path and German B2C compliance.

**Never activate real money flows without founder approval**, final plan/price/tax/terms sign-off and verified sandbox acceptance.

## 5. Legal purchase experience requirements (Germany/EU)

Review with qualified counsel and accountant before paid launch:
- Contract/price/period/renewal/tax and accepted payment methods clearly shown before confirmation.
- Consumer-order button wording and information requirements under **§312j BGB** ("zahlungspflichtig bestellen" or legally equivalent); ensure the hosted checkout actually complies.
- Cancellation control under **§312k BGB** where applicable, with accessible confirmation and durable receipt.
- Withdrawal rights, digital service exceptions, contractual notices, AGB and customer identity/contact information; consumer rights under the EU Consumer Rights Directive.
- Correct VAT/invoice/OSS/B2B-VAT ID handling; provider billing tools alone are not legal/tax advice.
- No dark patterns: preselected trial-to-paid, hidden fees, misleading scarcity, false "cancel anytime" claims or secret renewal.

Official references:
- BGB §312i: https://www.gesetze-im-internet.de/bgb/__312i.html
- BGB §312j: https://www.gesetze-im-internet.de/bgb/__312j.html
- BGB §312k: https://www.gesetze-im-internet.de/bgb/__312k.html
- EU Consumer Rights Directive: https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en
- Stripe webhook event reference: https://docs.stripe.com/api/events
- Stripe portal docs: https://docs.stripe.com/customer-management/configure-portal
- Stripe Tax docs: https://docs.stripe.com/tax

## 6. Detailed execution tasks and release gates

- **PAY-01 [READY for planning, BLOCKED for payment]** Validate audience/pricing with real interviews and financial model. Gate: draft margins and approved feature/limit matrix.
- **PAY-02 [BLOCKED until backend B-03]** Implement server-owned subscription, entitlement and metering schema with RLS; billing writes only from verified backend/webhooks. Gate: user cannot self-promote plan.
- **PAY-03 [BLOCKED until founder chooses provider]** Set up test billing products/prices/Checkout/portal (test mode first), secure webhook signature and deduplication. Gate: complete positive/negative/signed/replay tests.
- **PAY-04 [after PAY-02/03]** Build Pricing, Usage, Billing, Invoices and Upgrade/Downgrade/Cancel UX. Gate: users can understand the true total and cancel legally.
- **PAY-05 [after PAY-04]** Simulate lifecycle: trial, active, failed payment, past due, change plan, refund, cancel, duplicate events, out-of-order events, subscription recovery; grace/scheduled jobs policy. Gate: no unauthorized entitlement, double bill or lost customer data.
- **PAY-06 [before commercial launch]** Founder approves exact live prices, accepted territories, contract/tax/privacy documents, payment provider and test results. Gate: real purchases blocked until signed off.

**Not V1 launch blockers unless selling paid on day one:** the core product may undergo private free beta without charge, with paid purchase routes disabled. A commercial public launch with advertised paid plans must pass PAY-01..06.
