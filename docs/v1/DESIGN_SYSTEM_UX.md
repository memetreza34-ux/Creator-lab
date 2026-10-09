# Creator Lab — Design System & UX Acceptance Spec

**Status:** design requirements for implementation and review; not a claim that all components exist. **Source files:** `src/index.css`, `src/components/layout/`, `src/components/composer/`, `src/pages/`. Updated 2026-10-09.

## Product design goal

A clear, modern, **premium creator workspace**, not a generic admin template: focused creation area, visible publishing state, trustworthy analytics, calm typography, strong hierarchy and high-quality interaction feedback. Good appearance alone is insufficient: every visual pattern must make the next action obvious.

## Design fundamentals

- **Brand name:** Creator Lab. The sidebar/header still contain the old label **Creator OS**; this is a tracked implementation bug (D-01).
- **Current visual baseline:** light warm-neutral application canvas; near-black navigation sidebar; white surfaces; vivid violet accent. Do not randomly replace this established visual identity.
- **Existing tokens:** in `src/index.css`: `brand-50 … brand-900`, `surface-bg/card/hover`, `border-subtle/strong`, `text-main/muted/faint`, and `status-success/warning/danger`.
- **Fonts:** body `Plus Jakarta Sans`; display headings `Playfair Display`. Verify loading/fallbacks and visual legibility before a redesign.
- **Style:** clean functional density, deliberate whitespace, crisp lines, comfortable typographic contrast, subtle depth; never use decorative charts pretending to be measured data.
- **Design ownership:** consolidate duplicate hard-coded Tailwind color/spacing patterns into reusable tokens/components gradually, **not** by a risky cross-repo rewrite.

## Token and component contract

| Concern | Rule | Check |
|---|---|---|
| Type hierarchy | Clear page title, section heading, control label and supporting metadata; consistent across routes | 320/768/1024/1440px visual review |
| Color | Existing violet for actions/active selection; semantic warning/error/success tied to real states only | WCAG AA text contrast; never communicate state using color alone |
| Spacing | Shared 4px-derived increments; align titles/toolbars/cards/form controls | Same behavior for same control across all pages |
| Corners/surfaces | Consistent radius and border per button/input/card/modal; no arbitrary drift | Screenshot diff/checklist |
| Icons | Lucide icons of consistent weight; tooltip/accessible label for icon-only controls | Keyboard and screen reader |
| Buttons | Primary, secondary, text, danger, loading, disabled; click performs its claim | No dead affordances |
| Inputs | Label, hint/requirements, error, focus, disabled; reset confirmation | Validation without losing draft |
| Overlays | Dialog semantics, focus management/restore, Escape when safe, scroll lock | Tab-cycle/modal QA |
| Notices | Authentic local/real/draft/scheduled/failed/published wording | No fake live publish notification |
| Media | Stable aspect ratio, no broken remote image as success state, useful placeholder | IndexedDB/cloud, offline, failed load |
| Data visuals | Source, date range, freshness, sample limits, no fabricated metrics | Empty/lagging/sync-error checks |
| Motion | Short and purposeful; `prefers-reduced-motion` supported | Reduced-motion browser QA |
| Branding | Creator Lab in navigation, auth, title/meta and outbound communications | Site title and routes review |

## Page-by-page design blueprint

### Global app shell (`AppLayout`, `Sidebar`, `TopHeader`)

- Sidebar groups: **Overview, Studio, Intelligence**; add account/integration/settings access that is discoverable.
- Desktop: persistent primary navigation with an optional collapsed rail; focus/active states, tooltips and workspace context.
- Tablet/mobile: collapsible drawer or equivalent reachable navigation; **no horizontal clipping, hiding entire navigation, or inaccessible settings**.
- Header: visible active workspace, page title, search/command UX, account/profile, connection status where relevant. Global search must either search real data or be labeled "Go to page" rather than pretending to index content.
- Route changes preserve browser back behavior; unsaved Composer edits get guard.

### Onboarding and authentication (new in Phase 4)

- 1) Welcome, 2) sign up/login/email verification, 3) create first workspace with timezone, 4) explain real-vs-demo social connectivity, 5) connect supported provider, 6) create first post.
- Returning users resume last selected authorized workspace; users with no workspace see create state, **not** a seeded fake company.
- Session expired: clear action to sign in again, protect unsaved user data; sensitive secrets never appear in browser state.

### Dashboard (`DashboardPage`)

- Answer: "What needs my attention?", "What is scheduled?", "What performed?", "What should I do next?"
- Priority: upcoming planned/published distinction, failed destination jobs requiring review, performance evidence/last sync, quick create.
- No fake percentage growth or static success claims; genuine empty/new workspace state.

### Pipeline (`PipelinePage`)

- Kanban stages Ideas → Research → Script → Recording → Editing → Ready → Scheduled → Published.
- Card: title, format/platform, target date, latest linked post; no duplicate status source.
- Drag/drop must work with keyboard or have an accessible alternative. Reordering cannot lose order on refresh.
- Moving an idea to Ready should make **Create post** easy and preserve source traceability.

### Composer (`CreatePostPage`, `src/components/composer/`)

- Three conceptual regions, responsive by viewport: destinations, actual editable content/media/AI suggestions, and destination preview/validation.
- Base text vs platform override visible; AI **suggest → review → apply/discard** without silently replacing text.
- Media selection/preview: variant-specific asset selection, file constraints and clear invalid media messages.
- Post status: **Save draft**, **Schedule (local vs real)**, **Publish now (only if verified)**. Never enable actions for unsupported adapters.
- On mobile, navigation between editor and preview retains selection, input and unsaved state.

### Calendar (`CalendarPage`)

- Month/Week/Day views show active workspace IANA timezone; drag/drop never relies on browser timezone.
- Use accessible interaction/keyboard alternative to move posts; clarify unavailable DST times.
- Show destination status (local planned / queued / published / error), not just decorative colors.
- Confirm destructive rescheduling effects when a live background publish job is already queued.

### Posts and Social Accounts (`PostsPage`, `SocialAccountsPage`)

- Filter by actual status and platform; make failed/needs-review conditions prominent and recoverable.
- Per-destination publish state, provider result link only if ID exists, error code/retry semantics.
- Account card shows **demo vs OAuth verified**, sync time, relevant permissions, disconnect impact on scheduled posts.

### Media Library (`MediaLibraryPage`)

- Grid/list search, upload progress and file limits; indicate usage count before deletion.
- Make storage and loading failures actionable; preview uses signed/object URLs only when authorized.
- Folder actions should not silently delete files; support quota and recoverability policies.

### Analytics (`AnalyticsPage`)

- Filters: workspace/account/platform/time range. Graph legend and units must match actual provider metrics.
- Each metric has source, freshness, period and provenance; new accounts get meaningful `No synced data yet` state.
- Highlight one evidence-backed "next action" instead of claiming universal virality.

### Experiment Lab (`ExperimentLabPage`)

- Hypothesis + linked post(s) + A/B variant + primary metric + observation window + explicit outcome/insufficient data.
- Clear distinction between user-entered assumptions, AI interpretation and measured results.
- From insight → create experiment → link variant to Composer with minimal friction.

### Pricing, billing & usage (new paid SaaS views)

- Marketing pricing: Free and only *actually released* paid plans, supported platforms and real feature caps. Show total with tax where applicable, renewal term, cancellation and trial conditions; no false comparison badges.
- Signed-in plan manager: current plan with source/period, usage meters and reset dates (AI requests, private media quota, channel allowance), invoices, payment method, upgrade/downgrade/cancel actions.
- Handle payment processing/3-D Secure, failed invoices, grace periods, past-due, refunds, webhook delay and downgrade-below-limit honestly without wiping data.
- Checkout and cancellation UI must work on mobile, keyboard, screen reader and non-logged-in cancellation path where legally required. Support link always reachable.
- Plans/quotas displayed from server-authoritative entitlements rather than optimistic client state; never show a green paid badge from unverified redirect.

### AI assist, accountability & legal transparency

- A contextual creator-facing assistant, not a separate generic AI app. Clear suggestion context, limits, revision history, Apply/Discard/diff, and no autonomous publishing controls.
- Explain AI origin and heuristics vs measurement; if future synthetic media/deepfake capabilities require metadata/disclosure under applicable AI Act provisions, show a review workflow at generate/export/publish.
- Show remaining allowance/cost estimate before expensive calls, errors/retries without content loss, and practical AI misuse report/help affordance.
- Create a design-review state matrix for failure, model refusal, privacy-sensitive content, wrong metrics and quota exhaustion.

### Settings, errors and support (`SettingsPage`, new account views)

- Workspace name/timezone, member role/permissions (when enabled), connected channels, privacy and account/data deletion.
- Clear ownership of dangerous actions, including preservation/cancel/rollback when possible.
- Error boundary, offline/network retry, expired token, quota, rate limits and provider status pages.

## Responsive implementation rubric

| Width | Layout behavior | Must stay reachable |
|---|---|---|
| `< 640px` | Single-column, reachable navigation drawer, no fixed-width off-screen dialogs; editor↔preview switch | Create/save, workspace picker, calendar day view, settings, account logout |
| `640–1023px` | Compact sidebar or overlay, two regions at most, touch-safe controls | Calendar editing, media, Composer AI |
| `≥ 1024px` | Sidebar + full work surface; Composer editor/preview split when viable | Keyboard workflows and denser analytics |

Breakpoint values are design QA targets, not claims about current tested implementation. Use natural wrapping and content-based sizing, not extra scrollbars that obscure calls to action.

## Universal per-feature UX states

Every core module must provide **initial loading**, **empty/new account**, **populated**, **validation error**, **network failure/retry**, **permission denied**, **expired session**, **in-progress**, and **confirmed success**. Demo/local-vs-live is a distinct semantic state wherever data or publishing are involved.

A feature fails design review if (a) a button implies functionality it does not execute, (b) false data looks live, (c) important action disappears on mobile, (d) modal cannot be used by keyboard, or (e) a network error discards the user's work.

## Review artifacts and deliverables

- **D-01:** branded app shell + real navigation QA evidence.
- **D-02:** shared tokens and component patterns (forms, dialogs, buttons, states).
- **D-03:** screenshots/notes at 375px, 768px, 1024px and 1440px with keyboard checks.
- **D-04:** real sign-up/onboarding from empty account; never mock persistence.
- **D-05:** YouTube publish job success/failure feedback tied to backend confirmation.
- **D-06:** release UX audit by route, including reduced motion, headings, loading skeletons and mobile data tables.

Record actual screenshot/browser acceptance in STATUS, not just the existence of a CSS class. **Visual QA has not yet been performed as part of this design-spec documentation PR.**
