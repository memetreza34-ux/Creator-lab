# Creator Lab — AI Product, Model Governance & Cost Architecture

**2026-10-09 | Planned behavior and release requirements, NOT implemented.** Technical baseline: `server.ts` exposes Gemini-assisted suggestions/diagnostics through `POST /api/ai/suggest`, with a simple in-memory IP rate limit. Authentication, per-user/workspace quotas and audited model usage are absent and **must be implemented before exposing an economically unbounded public AI endpoint**.

## AI's job in Creator Lab

Make the creator **faster and more thoughtful**, never replace their editorial control or claim predictive omniscience. AI should assist the real creator workflow:
- Turn an idea into several actionable hooks/outlines/angles.
- Draft/rewrite/shorten captions or scripts, switch tone and adapt to selected platform requirements.
- Suggest hashtags and CTAs, always as *proposals*, not performance guarantees.
- Identify weak points in clarity, call-to-action and topic positioning with explicitly heuristic reasoning.
- Summarize already measured provider analytics, support comparisons with actual evidence IDs, sample size and freshness.
- Propose *one small experiment* after a real finding, and link resulting variants to the original idea/post.
- Later: opt-in creator-specific style profile/memory after meaningful consent and enough examples; **full Content DNA postponed until post-V1**.

V1 excludes unreviewed autonomous publishing, impersonation, mass posting, synthetic celebrity testimonials and invented statistics.

## Product interaction and layout

### AI features visible inside workflows

- Composer side panel or action menu, not another isolated "AI studio" competing with the Composer.
- Prompt starters (improve hook, rewrite for channel, generate caption variants, explain weak points) with control for tone, language, length and target channel.
- User can choose between **Apply**, **Insert**, **Copy**, **Regenerate** and **Discard**; preserve the original draft and edit history. Expensive/regenerate actions expose remaining allowance.
- For diagnosis, show "AI feedback, not measured performance". Avoid percentage improvement, algorithmic "viral chance" or magic best-time predictions.
- For analytics insights, provide source post links and real metric source, last sync date, n/sample and limitations. No insight from empty mock data.
- Explain when platform instructions are heuristic and when constraints come from validated provider rules.
- Fail gracefully: timed out, invalid JSON, model refused, rate-limited, allowance used up, provider down. Don't lose user content.

### Flow example

Idea: "I made my home studio cheaper." → Creator chooses target YouTube → AI proposes 3 opening angles → creator selects one, sees title/description preview, attaches own media → validates platform format → saves draft → publishes through verified job → receives actual result → after provider metrics sync, app says "In N published videos, X observation appeared..." with explicit evidence → creator creates a new variant/experiment.

## Architecture: one authenticated AI gateway

**Client** → authenticated backend request + workspace authorization → entitlement and rate checks → input normalization + context-selection → provider adapter → structured output validation → safe rendering + user review → metering/audit.

### Every request must bind

`user_id`, `workspace_id`, `operation`, `request_id`, `selected_platform`, `model_policy_version`, `estimated_cost`, `limits`, `trace_id`; no client-provided ownership grants. Request IDs allow idempotent metering/retry when possible.

### Security and privacy contracts

- Authn/Authz at the API boundary, distinct workspace scopes, server-only API keys and billing entitlements.
- No arbitrary client-supplied developer/system prompt, provider tool call, URL fetching or database access. `server.ts` currently accepts a freeform `prompt` branch: review/remove or tightly constrain this before a public endpoint.
- Treat captions, pasted text, comments, documents and retrieved metrics as **untrusted data**. Prompt instructions inside them cannot change policies, workspace access, tools, payment or publish privileges.
- Strict type/schema output validation, escaping and sanitization: no unsanitized model HTML/Markdown rendered as privileged UI. Never execute model-provided code.
- Do not include tokens, API keys, customer personal data, billing/payment fields, or unnecessary third-party content in prompts.
- Restrict retention and logging: structured usage/error metadata, minimal content logs, configurable deletion/retention and vendor processing assessment.
- Model has **zero direct credential access and zero auto-post authority**. User-reviewed server-side command is required to change state, with normal authorization and idempotent jobs.
- Protect against harmful/illegal content, nonconsensual synthetic impersonation/deepfakes, harassment/fraud, copyright infringement and policy breaches; human escalation/review for edge cases.
- Configure timeouts, input/output limits, concurrency, cost circuit breaker, request budgets, retry cap and provider failure fallbacks.
- Assess privacy/terms of selected AI provider, region/data transfers, logging/training settings, subprocessor terms and deletion requests; do not assume private-by-default on all paid/free AI services.

## AI feature-by-feature safety matrix

| Feature | Data consumed | Output & risk | Human control | Required test |
|---|---|---|---|---|
| Hook and script ideas | User's draft only | Suggested text; possible hallucination/plagiarism | Apply/Reject, keep original | No draft overwrite or unauthorized context |
| Rewrite/shorten | User text and user-set tone | Fabricated specifics, lost claim/meaning | Diff/undo before apply | Core facts preserved or flagged |
| Platform adaptation | Draft + published platform capability registry | Wrong limits or unsupported tag/format | Validation and explicit confirmation | Capability adapter rejects unsupported post |
| Diagnostic score | Draft, non-provider heuristics | False perception of measured effectiveness | "Heuristic AI feedback" label | No numerical promise of virality |
| Analytics interpretation | Authorized provider metrics and post IDs | Confused metric definitions or invented sources | Evidence links + limitation | Cross-user isolation, zero-data state |
| Smart posting time | Authorized posts with real timestamps | Selection bias, insufficient evidence | Explain source, sample size, opt-in | No confident time from tiny samples |
| Future memory | Explicitly selected previous creator data | Sensitive style/profile accumulation | Opt-in and delete/export | Workspace ACL and removal cascade |

## AI Act / transparency / regulatory gate

Before EU launch, legal counsel must classify Creator Lab per use case: provider vs deployer of an AI system, and downstream relationship to any third-party GPAI model provider. **Not every AI-assisted rewrite is a high-risk AI system or a mandatory visibly labelled deepfake; applicability is purpose/role-specific.**

The European Commission's Article 50 transparency guidance applies from **2 August 2026** (subject to precise exceptions/transitional cases). Plan:
1. Explain when the user interacts with AI (label "AI suggestion"; never imply a human expert).
2. Determine if Creator Lab as AI provider must ensure machine-readable detection of generated/manipulated outputs and choose standards/metadata without stripping it; review any applicable transition.
3. If image/audio/video synthesis, deepfakes, or AI-generated public-interest text are supported in future, implement the applicable creator/deployer disclosure workflows; do not claim a universal rule for every caption.
4. Make user-facing disclosures clear and timely, and prevent accidental removal of legally required markings through media transform/export.
5. Define AI literacy processes for staff/operators (Article 4), vendor responsibility split, documentation and review ownership.
6. Maintain use-case inventory, risk register, model version, evaluation evidence, transparency UI and incident response. Refresh law/vendor API before release.

**Official EU references:** 
- EU Commission Article 50 guidelines: https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- Commission Article 50 FAQ: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- EU AI Act Service Desk timeline: https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline
- AI literacy Article 4: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4
- OWASP LLM security risks: https://owasp.org/projects/top-10-for-large-language-model-applications

## Economics: do not sell "unlimited AI" without a budget

Record per operation: input tokens, output tokens, model, region/provider, estimated cost, actual provider charge when available, request id and final outcome; aggregate by **workspace and month**. Introduce free/pro/studio allowances from a measured representative prompt set. Rate limits need user+workspace+IP/abuse dimensions rather than only process-local IP arrays.

Cost model to calculate before paid tiers:
- `model_cost = input_tokens * unit_input_price + output_tokens * unit_output_price`
- `monthly_ai_COGS = sum(model_cost for paid and free users) + retries + overhead`
- Add storage, data transfer, worker usage, billing/fees, analytics sync, support, reserve for abuse and FX changes.
- Cap both individual requests and total daily workspace expense; make expensive media models **opt-in and metered separately**, not included under an unbounded "Pro".
- AI quotas reset predictably per paid period; show allowance in Settings and explain failed/reserved/refunded attempts.
- Use smaller/faster model for constrained rewrites and larger model only when quality evaluation justifies price.
- Cost anomalies should trigger operational alerts/circuit breakers and user-facing graceful fallback.

## Evaluation and QA

Build a versioned dataset of anonymized/consented sample prompts (DE/EN, long/short, media contexts, common adversarial content). Test:
- **Grounding:** no cited provider statistic unless it exists and user is authorized.
- **Safety:** prompt injection cannot alter security policy, contact foreign workspace, leak keys or trigger publish; output sanitization.
- **Quality:** factual preservation, language appropriateness, useful hooks, diversity, no generic AI sludge or repeated clichéd phrasing.
- **Product:** apply/discard/undo consistently, latency, meaningful loading/error, draft remains unchanged if AI fails.
- **Costs:** bounded high-token inputs, abusive concurrency, retries, quota exhaustion and failed reservation rollback.
- **Compliance:** correct transparency labeling in each supported generation mode and documented legal role review.

Do not mark AI ready solely because an endpoint returns text.

## Execution tasks

- **AI-01 [READY]** Define exact feature catalogue and review/apply UX; quality rubric, German/English language support hypothesis; measure first-run utility.
- **AI-02 [BLOCKED until B-04]** Protect AI gateway with Supabase JWT, workspace membership, allowed operation registry, validated schemas and no arbitrary privileged prompt.
- **AI-03 [BLOCKED until PAY-02/B-05]** Server-authoritative quotas, reservation/refund, spend and rate caps, abuse protection, per-operation metering; informative remaining allowance.
- **AI-04 [READY for research]** Provider terms, privacy and AI Act role/use-case analysis; implement targeted labels/marking when applicable, document AI literacy.
- **AI-05 [after AI-02]** Add versioned eval and adversarial security tests plus source-grounded analytics interpretation.
- **AI-06 [before launch]** Review vendor security, operational alerts, incident response, customer content retention and deletion, model/version rollback.

**Acceptance:** AI is user-controlled, workspace-safe, economically bounded, transparent under applicable law, resilient and actually useful.
