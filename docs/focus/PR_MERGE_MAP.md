# Creator Lab — live PR map, 2026-10-16

Primary execution source: [NEXT_ACTIONS.md](NEXT_ACTIONS.md). This page documents **actual** merged versus unmerged code to avoid duplicate agent work.

## Merged and verified in GitHub CI
- **#33** CI stacked-PR validation and runner diagnostics; historic issue #19 closed after successful runner and complete validation.
- **#34** V1 scope and root `AGENTS.md` adviser rules.
- **#20** fail-closed unauthenticated paid AI.
- **#16** first 3 Supabase migrations, schema types and RLS probes; original PR merge conflict resolved while retaining newer main.
- **#28** 4th previously installed migration: server-controlled social/publish states.
- **#30** 5th/6th previously installed migrations: protected draft-media FKs, private asset deletion/overwrite constraints.
- **#32** corrected actual-JWT test harness and offline fixtures. Main tests run it by default. **Actual live user JWT test has NOT run.**
- **#24** JWT-only fail-closed data adapter, no enabled Cloud UI.

These merges **did not apply** already installed SQL again, create users, turn on OAuth/AI, or publish the app. They were tested with npm test, npm run lint and npm run build. The live database has 4 SECURITY DEFINER authenticated-executable advisor warnings pending safety signoff.

## Remaining scope-critical PRs — not in main
| PR | State | Decision |
|---|---|---|
| [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25) | DRAFT; stacked on old #24 | Reconcile real Auth/session; do not ship separate user-facing `/cloud` product |
| [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26) | DRAFT on #25 | Cloud ideas/pipeline |
| [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27) | DRAFT on #26 | Cloud draft caption/platform variants |
| [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29) | DRAFT on #27 | Private Cloud media client, previews, delete |
| [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31) | DRAFT on #29 | Relational draft/media attachments |
| [#35](https://github.com/memetreza34-ux/Creator-lab/pull/35) | DRAFT on older main | Narrow local V1 UI; may need a focused rebase onto unified Cloud flow (not safe to merge as Cloud release by itself) |

## Other PRs: assess, don't reimplement
- **#23** closed without merge: old security test harness superseded by corrected merged #32. Never remerge old version.
- **#17** expansive SaaS/master plan still open, reference only: conflicts with tighter M1 freeze. Do not merge wholesale as implementation instruction.
- **#18** visual branding/navigation: coordinate with #35, avoid duplicate redesign.
- **#21** local IndexedDB safety: evaluate remaining local→cloud handoff; don't introduce duplicate storage.
- **#22** experiment honesty labeling: relevant only when advanced Experiment Lab is reintroduced.
- **#4/#8** older audits: compare to merged code, close if redundant, do not blind merge.

## Real external blockers
- [Issue #36](https://github.com/memetreza34-ux/Creator-lab/issues/36): two distinct confirmed test users, genuine issued-JWT/Storage isolation and cleanup test. **Do not treat merged static SQL and offline mocks as production authorization proof.**
- Local planning is not Cloud provider scheduling. Browser clients are correctly forbidden from `creator_posts.status=scheduled` and `scheduled_at`; design separate real manual planning persistence for M1 instead of bypassing RLS.
- Public AI is intentionally disabled; sign-in alone is not enough without server-enforced usage limits.
