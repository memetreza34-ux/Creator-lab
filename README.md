# Creator Lab

**Creator Operating System** — plan, create, adapt, publish, measure and learn from social content in one workspace.

> **Current status:** substantial local prototype; **not** yet a production-connected publishing service. Demo social accounts, local scheduled posts and demo analytics are not provider-confirmed real social activity.

## Start here — authoritative execution plan

1. **[Complete delivery plan](docs/DELIVERY_MASTER_PLAN.md)** — milestone order, task IDs, dependencies, technical blockers and definition of done.
2. **[Live project status](docs/v1/STATUS.md)** — merged evidence, next exact task and external approvals.
3. **[V1 requirements and roadmap](docs/v1/README.md)** — product vision, end-to-end workflows and phase specs.
4. **[Design and UX rules](docs/v1/DESIGN_SYSTEM_UX.md)** — coherent premium visual language, responsive layouts, accessibility, screen-by-screen acceptance.
5. **[Competitor research and decisions](docs/v1/COMPETITIVE_GAP_MATRIX.md)** — Buffer, Metricool, Later, Planable, Publer, Sprout: which lessons are V1 vs later.
6. **[Release QA matrix](docs/v1/RELEASE_TEST_MATRIX.md)** — exact security, browser, provider and production tests.
7. **[Customer experience](docs/v1/PRODUCT_EXPERIENCE_BLUEPRINT.md)** — paying-user journey, every screen's job, onboarding and usable design.
8. **[Subscriptions & plans](docs/v1/SUBSCRIPTIONS_AND_BILLING.md)** — sample Free/Pro/Studio concepts, usage limits, payments, invoices, cancellation. **No live tariffs yet.**
9. **[AI product & governance](docs/v1/AI_GOVERNANCE_AND_PRODUCT.md)** — safe AI UX, model costs, usage caps, AI Act and human editorial control.
10. **[Security, privacy & compliance](docs/v1/SECURITY_PRIVACY_COMPLIANCE.md)** — cross-user protections, GDPR/legal notices, cookie controls, rights and security tests.
11. **[SaaS operations & business](docs/v1/SAAS_OPERATIONS_AND_GROWTH.md)** — landing, customer support, email, costs, localization, monitoring and commercial launch.

**Rule:** no new feature without a master-plan task, functional user value, correct ownership/truth semantics, tests and STATUS update. The V1 must be reliable before expansion into other networks, social inbox, competitor listening or full Content DNA.

## Technology

- React 19 + TypeScript + Vite + Tailwind for the UI.
- Express and server-side Gemini proxy for AI assistance.
- Local prototype persists to localStorage/IndexedDB; production Auth, relational data and private media are **planned on Supabase**, not deployed yet.
- Node test runner via `tsx --test` for deterministic checks; TypeScript and Vite build in GitHub Actions.

## Local development

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

Copy `.env.example` into your local environment and provide only the server-side `GEMINI_API_KEY` if using AI functions. Never put service-role keys, provider OAuth tokens or other privileged credentials into `VITE_*` variables or commit them.

## Backend release gate

[Open PR #16](https://github.com/memetreza34-ux/Creator-lab/pull/16) proposes the first Supabase schema and RLS rules. **It is not merged or applied.** Create a *separate Creator Lab Supabase project* only after confirming the user's chosen organization and actual project cost. The two existing inactive Supabase projects must not be repurposed without consent.

Details: [Phase 4 requirements](docs/v1/phases/PHASE_04_BACKEND_AUTH.md) and, once PR #16 is validated/merged, [Supabase deployment runbook](docs/v1/SUPABASE_SETUP.md).

## Product principle

**Truth over fake breadth.** A supported integration is real only after OAuth, publishing, retry behavior and provider-backed data verification. AI advice is a reviewable hypothesis, not measured virality.
