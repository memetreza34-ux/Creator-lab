# Creator Lab — Product Experience Blueprint and Customer Journey

**2026-10-09 | Product design spec, not implemented UI.** Canonical tasks live in [DELIVERY_MASTER_PLAN.md](../DELIVERY_MASTER_PLAN.md); shared tokens/routes in [DESIGN_SYSTEM_UX.md](DESIGN_SYSTEM_UX.md).

## The paying customer's question

> "Can I get from a vague idea to a good-looking, correctly published post faster, see what worked, and trust that this app will not lose my content, charge me unexpectedly or post without my permission?"

Every product decision is measured against that question. A professional tool feels fast and coherent because the **next action is obvious**, not because it has the greatest number of dashboards, decorative stats or AI buttons.

## Target customer and job to be done

**Primary:** solo creator publishing regularly to a verified supported channel. They typically have limited time, a mix of ideas/media/drafts, need predictable scheduling, and want to improve their content. A willingness-to-pay hypothesis requires actual customer interviews and testing; it is **not proven demand**.

**Secondary:** small creator brand or 2–3-person team. Team workflows are a future growth path, not reason to delay solo V1.

**Not V1:** agency social inbox, listening, competitor espionage, omnichannel automation without provider permissions, managed paid advertising, native mobile apps, automated bot posting.

### Job map

| Moment | Their fear | Minimum satisfying experience | Evidence required |
|---|---|---|---|
| Discover | "Is this another generic AI dashboard?" | Landing hero demonstrates idea → channel-ready post → evidence, without invented wins | 5-second message comprehension test |
| Sign up | "Will this steal data or surprise-charge me?" | Clear free entry, explicit privacy, no credit card to try Free | 2-user onboarding usability |
| First use | "Where do I start?" | One primary Create action + import idea/sample *clearly demo* | First useful draft without tutorial |
| Connect | "Will it post without asking?" | Verified platform identity, scope explanation, test connection, visible status | OAuth disconnect/revoke tests |
| Create | "Will AI overwrite my work?" | Base/variant editor, preview, undo, versions, selective AI apply | Restore content after reject/refresh |
| Schedule | "Did it really go out?" | Distinct local plan / queued job / provider accepted / published and precise timestamps | Test provider + job history |
| Analyze | "Are those numbers real?" | Freshness/source/sample linked to actual posts | API vs UI reconciliation |
| Upgrade | "What am I paying for?" | Plan comparison, real limits, taxes/billing cadence, simple cancellation | End-to-end payment/reconciliation |
| Return | "What do I do today?" | Dashboard shows meaningful next action, not empty decoration | Return user can resume a draft |
| Leave | "Can I get my content/data back?" | Export, cancel, account deletion, data-retention clarity | Restore/export/delete test |

## Product architecture in the user's mind

Do not expose database tables, AI orchestration jargon, or a long list of unrelated experiments. Show a simple mental model:

- **Today / Home:** what is next, what needs review, and a single quick action.
- **Create:** Composer with ideas, platform-specific variants, media and optional AI assistant.
- **Plan:** Pipeline and Calendar as two views of the same content; no duplicate truth.
- **Library:** searchable media, reusable post drafts/versions, previous posts.
- **Learn:** Analytics and Experiments connected to real publication evidence.
- **Connections & Settings:** accounts, billing/usage, permissions, privacy, help.

Desktop can show more navigation; mobile should use the most relevant destinations plus an explicit More menu. No "Settings only visible on desktop" or hidden logout. Do not add a second "AI Lab" that fragments the Composer without a demonstrated customer need.

## Mandatory screen-level storyboards (implement + visually test)

### 1. Landing and pricing

Visual hero: clear title explaining measurable outcome, **real product screen capture**, restrained benefit proof (not fake social proof), how-it-works 3 stages, honest supported provider list, plan comparison, common questions, legal/footer links. Primary CTA "Start free". Secondary "See how it works". Landing can start as a focused public route while app remains authenticated. English/German copy to be reviewed as an i18n decision.

### 2. First session

Login/email verification → welcome → create workspace name/timezone → optional real YouTube connection OR clearly-labeled sample exploration → first idea → first draft. Stepper shows progress but user may skip connection and save a local draft. Never auto-connect accounts, invent metrics, or make the user configure analytics first. On first visit, the dashboard must show useful empty-state instructions.

### 3. Home

A top priority/action area ("Draft waiting", "Scheduled today", "Failed publish", "Connect channel"), not 6 unrelated vanity-stat cards. **Real next publication** list by workspace time; evidence summary only when provider metrics exist. Visible "Create post" CTA, error notices and last sync. Clear data origin.

### 4. Composer

Three-step task logic within one screen:
1. Content: source idea, caption, media, format.
2. Destinations: eligible connected accounts, per-platform overrides, constraint errors and previews.
3. Delivery: save draft, plan, publish; confirm live action and destination accounts.

AI actions are contextual (improve hook, adapt, rewrite, diagnose), use a **diff/preview + Apply/Discard** interaction, never silent overwrite. Show the cost/remaining AI allowance before heavy operations; preserve editing if API quota/network fails. User need not understand Gemini/LLM details.

### 5. Calendar + Posts

Calendar visualizes commitments. Status chips must distinguish "Local plan", "Queued for delivery", "Sending", "Provider confirmed", "Needs review", "Failed". Never use just green color to indicate provider success. On drag of already-queued content, the backend must atomically update/recreate the scheduled job and return an explicit success/failure. Posts details show target account, local time and UTC-derived provider time, evidence link and retry options.

### 6. Analytics + Experiments

Start with source, freshness, comparable metric definitions and sample count. Charts should answer a question; offer "Create an experiment from this" anchored to real data. No winner from a tiny sample. Keep an empty state that explicitly says "No provider statistics imported yet" rather than random demo charts.

### 7. Billing and account

Separate **Usage** (AI requests/credits, media GB, accounts, next reset), **Plan & invoices**, **Upgrade/Downgrade**, **Payment method**, **Cancel subscription**, **Privacy & data**, **Help**. Don't make subscription cancellation harder than signup. State retention/export consequences before deletion; keep subscriptions and product accounts separate.

## Visual direction — design critique and decisions

**Existing code reality:** `src/index.css` uses near-black sidebar, warm-light surface, violet accent, serif headers and Jakarta Sans body; many pages contain hard-coded colors and compact `text-[10px]` labels. Header currently contains deceptive dead bells/avatar (tracked by D-01 PR #18, not merged), while app shell is desktop-biased.

**Recommended premium direction:** retain the recognizable dark/neutral/violet identity but move toward restrained productivity software:
- Comfortable body copy **14–16px**; readable metadata typically **12–13px** and only tiny text for non-critical, non-interactive metadata. Never make core labels 10px.
- Use serif for key editorial headlines only, not every dense chart/table/form heading; test legibility.
- Single saturated accent reserved for primary actions/active states; success/error palette only for true states.
- 8px-centered spacing rhythm, deliberate information density, consistent cards/tables/buttons/radius/shadows, no unnecessary gradients/ornamental animations.
- Empty states with examples and one next action; stop confusing a brand new user's zero activity with a system failure.
- Focused Compose editor; previews use real content, correct platform dimensions and media ratio; no fake engagement counts.
- Reduced motion and keyboard access are requirements, not design extras.

**Design validation:** create low-fidelity wireframes for new/auth/billing flows before committing all screens. Use screenshot snapshots (375/768/1024/1440 widths) and 5 target-user tasks. Current visual aesthetic remains a *direction* pending actual screenshot/browser testing, not an approved final design.

## Customer research and success metrics

Before finalizing paid packaging, conduct **at least 5 structured target-customer interviews** and 5 first-session task tests. Avoid inventing competitor churn, willingness-to-pay or conversion numbers. Track privacy-respecting aggregate signals:
- signup → first draft saved → verified provider connected → first *provider-confirmed* publish;
- time to first draft, percentage of successful jobs, editing-rescue rate, AI suggestion applied/rejected;
- plan limit hits with user explanation, checkout conversion, failed billing resolution, voluntary churn;
- errors and support resolution time; measure without profiling or sharing raw content by default.

A customer is not "activated" because the dashboard was opened. Activation hypothesis: first valuable draft saved **and** at least one genuine plan or verified publish (depending on available provider connection).

## Operational UX cases not allowed to be forgotten

- slow/no network, upload rejected, credentials expire, account disconnected, unpaid invoice;
- provider quota, unsupported post format, API review/access not granted, DST ambiguous hour;
- workspace switched mid-upload, browser refreshed mid-edit, user starts import then cancels;
- downgrade below limits, deleting a workspace with scheduled jobs, undo/restoration and export;
- B2C billing cancellation outside a logged-in session where legally required, email receipt and accessible support.

## Acceptance gates

1. Every top-level page has a user job, primary action and appropriate empty/loading/error state.
2. Two usability rounds must show a new user can save a draft and understand whether anything was actually published.
3. No visual/interaction control without behavior; route name and product brand consistent.
4. Live claims backed by provider data, billing claims backed by payment provider, AI claims labeled as diagnostic.
5. Responsive + keyboard/focus screen audit is recorded rather than assumed.
