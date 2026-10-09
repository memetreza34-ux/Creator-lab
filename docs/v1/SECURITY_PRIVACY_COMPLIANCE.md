# Creator Lab — Security, Privacy, Legal & AI Act Compliance Matrix

**Status: release requirements, not compliance certification.** Germany/EU-first planning reviewed 2026-10-09. Legal/tax/privacy obligations depend on actual owner, customer location, services and integration contracts. Qualified legal/data protection/tax review is a commercial-launch gate; this document is engineering guidance, not legal advice.

## Trust boundaries and data inventory

| Boundary | Examples | Risks | Owner / gate |
|---|---|---|---|
| Public web | Landing, pricing, signup | XSS, phishing, fake checkout, misleading claims | Secure frontend, authentic domains, consumer review |
| Authenticated browser | Session, editor, local draft, workspace picker | stolen session, cross-tenant read, local cache data | Supabase JWT, origin controls, RLS, logout cleanup |
| Server API | AI calls, provider OAuth, job commands | broken object authorization, injection, DoS/AI cost | Authn, RBAC, schema validation, audit and rate limit |
| Postgres | User/workspace/post/membership/usage | workspace forgery, privilege escalation, sensitive rows | RLS + server-only billing/provider mutations; A/B real tests |
| Object storage | Media/video previews, metadata, signed URLs | public URL leaks, upload malware, path traversal, quota abuse | private bucket, member ACL, MIME verification and expiry |
| Social providers | OAuth access/refresh tokens, provider IDs, metrics | token exfiltration, replay, revoked scopes, user overreach | encrypted secrets, OAuth PKCE/state, refresh/revoke/rotation |
| Payments | Customer IDs, subscription webhooks, invoices | webhook spoof/replay, wrong entitlements, card data | hosted checkout, signature verification, least privilege |
| AI models | user drafts and authorized metrics | sensitive disclosure, prompt injection, misuse, unchecked actions | scoped prompts, vendor DPA, safety and output validation |
| Operations | logs, backups, support, analytics tracking | accidental PII logging and long retention | minimal logs, strict access, retention and incident handling |

## Non-negotiable production security controls

### Identity and authorization

- User login and per-workspace membership checked server-side on **every** read/write and every background action. Never authorize from browser-provided plan, workspaceId, accountId or role.
- Prevent cross-workspace foreign keys and blind ID access. Actual A/B test matrix includes two separate Auth users, owner/editor/viewer and anonymous.
- Owner-only account deletion, billing management and invitations. No browser direct writes to membership or provider-verified publish states.
- Session refresh and logout revoke access where available, remove sensitive caches, safe reset/password recovery and optional MFA/strong auth as product supports it.
- Separate service role/secret from client completely, strict environment separation and secret rotation.

### API/network

- Positive-allowlist commands, maximum payload sizes, schema validation, bounded timeouts, IP + user + workspace rate limits and safe error codes.
- Protect state-changing routes against CSRF as appropriate for session mode; CORS/origin restrictions; no arbitrary redirect URLs.
- Webhook signature verification, timestamp tolerance, deduplication, atomic state transitions, replay/out-of-order tests.
- OAuth state/nonce/PKCE and strict allowed redirect URI, minimal scopes, encrypted token vault and revoke/refresh lifecycle.
- TLS, secure HTTP headers/CSP when viable, strict dependency/version checks, supply-chain review and vulnerability alerts; do not publish error stack traces/secrets.
- Provider uploads, scheduled jobs, analytics sync and billing must be idempotent, observable and recoverable.

### Data and storage

- Encrypt in transit/at rest with provider-supported controls; private object storage and authorized signed URLs, minimum TTL and scoped operations.
- Media MIME content sniffing, extension validation, size limits, quota reservation, safe metadata stripping where appropriate and malware risk handling for supported files.
- Backups and documented restore tests; destructive workspace/user deletion cascades do not leave public media, provider access or orphan jobs.
- Data export (posts, drafts, metrics, media list, experiments) before account deletion; define machine-readable output and rate/authorization constraints.
- Logs use IDs and error codes rather than full captions/access tokens/AI prompts by default. Restrict internal access and operational retention.

## Threat model test cases

| Attack / failure | Expected protection | Test |
|---|---|---|
| Guess another workspace/post UUID | RLS + server authorizer deny | Distinct JWT A/B read/write test |
| Reassign destination to foreign social account | Composite ownership FK + server check | Insert/update cross-workspace fixture |
| Spoof role/plan in client request | Server ownership and verified entitlement | Forge request body; expect 403 |
| Send fake provider success callback | Signature/provider response verify | Replay/invalid payload and missing provider id |
| Modify/replay billing webhook | Signature and unique event record | Out-of-order/duplicate event tests |
| Abuse free AI endpoint without account | Auth and cost cap before provider call | Concurrent anonymous abuse test |
| Inject instructions via pasted content/analytics | Untrusted context and no tool escalation | LLM red-team test |
| Upload executable disguised as image | MIME sniff + allowlist; private rendering | Malicious file fixture |
| Download private media after membership revoked | Storage RLS + short-lived URLs | Cross-tenant signed URL expiration test |
| Steal OAuth refresh token from browser | No token in browser/data API; server vault | Bundle/RLS/log inspection |
| User cancels plan during queued publish | Policy-consistent entitlement/job state | Concurrency/state machine test |
| Delete workspace with live jobs | Transactional cancellation + retention policy | End-to-end reconcile test |

**Existing gaps verified in repo:** browser localStorage is still the primary source for many records, providers are demo, Supabase SQL remains unexecuted PR #16, `server.ts` AI endpoint has process-local IP limit but no authenticated usage entitlement. Therefore no claim of present production-grade security is permitted.

## GDPR and privacy program (Germany/EU)

Privacy by design/default is an engineering and legal obligation, not a static document. Set up:
1. **Data mapping:** user emails/accounts, OAuth identifiers/tokens, captions/media, AI prompts, provider stats, analytics events, payment IDs, support contact, logs. Document owner, purpose, legal basis, retention and recipients for each type.
2. **Roles/contracts:** determine controller vs processor relationships for Creator Lab, hosted AI, Supabase, payment processor, cloud/monitoring, email and social APIs. Arrange appropriate Art. 28 processor terms, subprocessors and transfers; EU region alone does not prove full GDPR compliance.
3. **Transparency:** privacy notice, contact/DPO where applicable, lawful processing basis, precise purposes, retention, rights/complaints, vendor data transfers, AI-provider disclosure.
4. **Data subject requests:** access/export, correction, deletion, restriction and objection as applicable; identity verification, timelines, deletion propagation to storage, queue, cached copies, backups per policy.
5. **Security TOMs:** access logs, incident runbook, privacy impact assessment screening where relevant, least privilege, disaster recovery and secure dev practices.
6. **Cookies / local storage:** inventory all cookies, SDK trackers, localStorage and embedded third-party scripts. In Germany, determine essential vs nonessential under **§25 TDDDG**. Nonessential technologies require appropriate consent when applicable; easy refusal/withdrawal, no fake consent banners.
7. **Breach response:** classify incident and relevant notification deadlines (GDPR may require notification to regulator **within 72 hours** depending on risk); record evidence and postmortem.
8. **Vendor/content obligations:** legal basis to reuse social media/creator content; user grants appropriate license to process/upload to chosen provider, no unauthorized training by default. Social platform terms and disclosure requirements checked per platform.

### External legal/public pages

Before any public-facing commercial site, plan:
- Provider contact/imprint (**§5 DDG** where applicable), privacy notice, terms/AGB, accessibility statement if applicable, support contact.
- Clear hosting jurisdiction/transfer/cookies and analytics tracking consent, marketing email opt-in and unsubscribe.
- Transparent supported integration list and provider permission screens.
- Subscription price/tax/renewal, payment button **§312j BGB**, cancellation flow **§312k BGB** where applicable, withdrawal rights and invoice process; see `SUBSCRIPTIONS_AND_BILLING.md`.
- Copyright/trademark and platform content rules: no fake logos/testimonials, synthetic endorsement, unlicensed music/media scraping.
- German/EU accessibility law applicability (incl. BFSG where relevant) to be assessed alongside WCAG, not assumed away because team is small.
- Age eligibility and safeguards if minors may be allowed; initial target: adults, check contract/service terms.

## AI Act application gate

The EU AI Act's applicable rules are **use-case and role dependent**. Before launch determine whether Creator Lab is a provider/deployer of an AI system, scope of its third-party model use, AI-assisted text vs image/audio/video/deepfake outputs, and what is visible to the user's audience. Record:
- AI interaction disclosure and potential machine-readable generation marking obligations under Article 50.
- Which user-generated/social-post disclosures are the *deployer's* responsibility, including deepfakes or certain public-interest text, and how our UI assists compliance where relevant.
- AI literacy under Article 4 for staff/operators and documented risk mitigations.
- Vendor contracts and generation/model output traceability, without claiming every caption is automatically subject to the same watermark rule.
- Audit of new AI features before enabling: facial/emotion recognition, impersonation, biometric content and other higher-risk/forbidden uses must not slip into an innocent caption assistant.

See `AI_GOVERNANCE_AND_PRODUCT.md` for specific AI architecture and tests.

## Compliance deliverables and task owners

| ID | Task | Gate |
|---|---|---|
| **COM-01** | Build data inventory, retention schedule, controller/processor map and vendor DPA checklist | Approved inventory + verified vendor agreements |
| **COM-02** | Publish reviewed privacy notice, imprint, terms, cookie policy/preferences, AI disclosures | Legal sign-off, functional links and consent choices |
| **COM-03** | Data export, deletion, withdrawal of integrations, privacy request handling | Two-user tests and delete/export reconciliation |
| **COM-04** | Complete AI Act role/use-case transparency assessment, AI literacy and marking where applicable | Counsel-reviewed decision, UI/eval evidence |
| **SEC-01** | Per-user/workspace RLS, role checks and least-privilege model | Actual JWT two-user denial tests |
| **SEC-02** | OAuth token/vault lifecycle and private media hardening | Tests with revoke, file leaks, signed URLs |
| **SEC-03** | CI dependency audit, threat-model penetration regression, rate limiting, webhook signatures and incident tooling | Red-team negative tests + monitoring |
| **SEC-04** | Backups, restore drills, breach runbook, DSAR support, account/workspace deletion | Restore exercise and deletion evidence |
| **COM-05** | Prelaunch legal review of DE/EU B2C/B2B billing, BFSG/accessibility and marketing | Signed launch checklist |

All SEC/COM public-launch blocking requirements are **OPEN** until backed by evidence. This document alone does not make the company compliant.

## Authoritative references

- European Commission GDPR company obligations: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en
- EDPB data protection by design/default: https://www.edpb.europa.eu/topics/ai-and-technology/privacy-by-design-and-by-default_en
- EDPB breach guidance: https://www.edpb.europa.eu/topics/security-data-breaches/personal-data-breaches_en
- German DDG §5: https://www.gesetze-im-internet.de/ddg/__5.html
- German TDDDG §25: https://www.gesetze-im-internet.de/ttdsg/__25.html
- EU AI Act transparency: https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- AI literacy Article 4: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4
- OWASP Top 10 web: https://top10.owasp.org/2025/de/
- OWASP LLM threats: https://owasp.org/projects/top-10-for-large-language-model-applications
