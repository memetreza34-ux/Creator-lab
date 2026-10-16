# Creator Lab — active M1 execution handoff

**Verified 2026-10-16.** This file overrides outdated work-in-progress notes in earlier phase documents. Main at handoff: `a24d67671b3c92dd80272afe0eff871120c13776`. Re-check HEAD, CI and open PRs before acting.

## One current objective — F-003 P0
**Prove real two-user Supabase Auth / Postgres RLS / private Storage isolation.**
Track with [issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36); exact reproducible guide is [LIVE_AUTH_RLS_ACCEPTANCE.md](../v1/LIVE_AUTH_RLS_ACCEPTANCE.md).

**Why now:** Production database schema is already installed and source-controlled, and the independent HTTP acceptance harness is tested offline, but the actual project had **zero confirmed Auth users** at inspection. Simulated database subjects and mock HTTP fixtures do not demonstrate real access isolation. Do not activate cloud user data before this gate.

**Next exact action requiring project-owner secure setup:** Provision two **separate confirmed disposable Supabase Auth test users** in the already existing Creator Lab project (not via direct SQL insertion) and run `npm run test:auth-rls:live` from a trusted environment with the existing opt-in and publishable-only configuration. Credentials must not be entered in GitHub issues or chat. The harness creates/removes only temporary data; confirm cleanup. If no secure confirmed accounts are available, mark this action BLOCKED and do not claim success.

**Acceptance:** Genuine issued tokens for A and B independently verified; own workspace/ideas/drafts/private media operations succeed; cross-account SELECT/INSERT/UPDATE/DELETE/download/upload/link fail; no fabricated provider state accepted; attachment deletion protection and cleanup tested. Review existing four SECURITY DEFINER linter WARNs with the real results. Record the outcome without secrets.

## Already delivered to `main` (do not redo)
| PR | Status | Evidence |
|---|---|---|
| [#33](https://github.com/memetreza34-ux/Creator-lab/pull/33) | MERGED | Stack-aware and read-only CI; historical no-runner [issue #19](https://github.com/memetreza34-ux/Creator-lab/issues/19) recovered/closed |
| [#34](https://github.com/memetreza34-ux/Creator-lab/pull/34) | MERGED | Agent instructions, scope freeze, competitor/PR assessment |
| [#20](https://github.com/memetreza34-ux/Creator-lab/pull/20) | MERGED | Unauthenticated Gemini endpoint disabled by default |
| [#16](https://github.com/memetreza34-ux/Creator-lab/pull/16) | MERGED | Core schema, initial RLS, private Storage source, SQL/static tests |
| [#28](https://github.com/memetreza34-ux/Creator-lab/pull/28) | MERGED | Browser cannot forge connected/scheduled/published provider states |
| [#30](https://github.com/memetreza34-ux/Creator-lab/pull/30) | MERGED | Workspace-safe draft-media FKs, attached-file protection, insert-once Storage |
| [#32](https://github.com/memetreza34-ux/Creator-lab/pull/32) | MERGED | Corrected HTTP acceptance harness, default offline tests. [CI](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38849401989): **92 main tests, 9 explicit offline tests, 0 failures**, TS and build PASS |
| [#24](https://github.com/memetreza34-ux/Creator-lab/pull/24) | MERGED | Fail-closed authenticated Cloud data adapter source (not yet activated). [Main CI](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38849645708): PASS |
| [#23](https://github.com/memetreza34-ux/Creator-lab/pull/23) | CLOSED / SUPERSEDED | Older HTTP test harness replaced by corrected #32 |

**Live Supabase read-only findings 2026-10-16:** project `aoyrijspyygqoyeajxpf` active/healthy, six migration versions (core, ACL, indexes, provider status, draft/media FKs, immutable media) match source history, **nine** creator public tables RLS enabled, private `creator-media` bucket (50 MiB), **zero** Auth users/workspaces/posts/media. Four authenticated-callable SECURITY DEFINER helper WARNs require review; these findings are not proof of exploitation or security acceptance.

## UI/Media completion checkpoint 2026-10-16

- [PR #35](https://github.com/memetreza34-ux/Creator-lab/pull/35) merged into main: simplified local Creator workflow, empty first-run workspace, accountless draft/plan, manual text copy/export. Combined [CI](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38850132131): 109/109 automated tests and 9/9 separate offline acceptance tests, TypeScript and build PASS. **Not** a working authenticated Cloud beta.
- [PR #21](https://github.com/memetreza34-ux/Creator-lab/pull/21) merged into main: IndexedDB upload/delete resolve only after transaction commits, preserving previews after abort. CI succeeded. Browser storage QA remains.
- Feature-creep master plan #17 and duplicate branding PR #18 closed, no history or user data deleted.
- The next release blocker remains the **real two-account Auth/RLS/Storage test** [#36](https://github.com/memetreza34-ux/Creator-lab/issues/36). Do not substitute another UI redesign for this security proof.

## Backlog after F-003 — no parallel new feature work
| Order | Gate | Scope and evidence |
|---|---|---|
| F-004 | Cloud integration | Reuse stacked [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25) → [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26) → [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27) → [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29) → [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31) Auth, idea, draft and private media. **No permanent second Cloud app**; unify data/source of truth and enforce real Auth on the main M1 journey. |
| F-005 | Honest V1 beta flow | Adapt [merged local #35](https://github.com/memetreza34-ux/Creator-lab/pull/35) local simplification into authenticated Cloud journey: Idea → draft → upload/preview → manual platform copy → timezone-local plan → export. Cloud provider `scheduled_at` and `status=scheduled` are **server-controlled**: add separate legitimate **manual planning storage** or approved independent entity, never forge these fields. |
| F-006 | QA & pilot | Clean-account browser E2E, second-device reload, 375px mobile, keyboard, DST gap/overlap, failed network, file upload/download, data deletion, and five real prospective users. |
| M2 | Verified provider release | One YouTube OAuth/upload/robust jobs integration after real provider proof. Analytics and billing later as warranted. |

**Explicitly NOT in M1:** broad analytics, experiments/statistical claims, competitor tracking, teams, billing, social inbox, AI virality scoring, platform-parity promises, new rebrand. Never delete existing user data silently. Default paid AI remains unavailable until authenticated quota and spending limits exist.

## M1 release scorecard
| Acceptance | Current status | Proof needed |
|---|---|---|
| Versioned DB schema + RLS installed | VERIFIED structurally | Six migration IDs / live catalog |
| CI for backend and default offline tests | VERIFIED | Main [run #38849645708](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38849645708) |
| Two genuinely authenticated isolated users | **BLOCKED — issue #36** | Real A/B JWT REST + Storage API |
| Authenticated Cloud UI session and cross-device data | NOT VERIFIED | Logged-in full browser journey |
| Manual local plan persisted separately from provider job | NOT IMPLEMENTED for Cloud | Cloud schema/UI + timezone tests |
| Human-readable manual export/copy | LOCAL MAIN (#35), CI VERIFIED | Integrated Cloud E2E |
| Mobile/accessibility + error recovery | NOT VERIFIED | Browser QA |
| Production AI | DISABLED, correctly | Metered JWT service before enabling |
| Real automatic provider publish | NOT IN M1 | M2 separate gate |

## Per-task report contract
Record exact main SHA and open branches, one concrete user-facing problem, actions/files changed, actual CI/test result links, what remains unverified, security/rollback risks, and **one next exact action**. Do not mark a phase DONE because a PR has merged or a unit test is green. No promise of work running unattended.
