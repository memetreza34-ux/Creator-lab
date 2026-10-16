# GitHub Actions runner pre-step failure and stacked PR coverage

**Observed on 2026-10-11. Infrastructure blocker #19 is OPEN, not fixed.**

## Confirmed evidence

- Default branch file '.github/workflows/validate.yml' previously ran on
  pull requests targeting main only. Stacked Cloud PRs whose base is another
  feature branch therefore do not receive the full validation workflow.
- A failed check from run 38046888888, job 114198110704, was inspected via
  GitHub repository API. It finished after about two seconds with
  'runner_id:0', empty runner name and zero job steps. It has
  **annotations_count=2**, but the connected GitHub API tools cannot read
  the annotations endpoint. No Checkout, npm ci, tests or build ran.
- Older runs in issue #19 show the same missing-runner/no-steps behavior.
- The cause (billing/permissions/runner availability/policy) is **unknown**.
  Do not claim an npm or TypeScript failure when no runner was assigned.

## Recovery verification — 2026-10-16

The original historical runner-provisioning blocker is **no longer reproduced on new retries**.
- Schema PR #16's previous failed [run #37961296344](https://github.com/memetreza34-ux/Creator-lab/actions/runs/37961296344) was retried on its same head commit (`443ea264ff07e650d2f684d60408eda7f0e67a30`) and returned **success**: Checkout, npm ci, Automated tests, TypeScript check and Production build all executed successfully.
- PR #35 run #38776708630 had 74/74 automated tests pass, TypeScript and production build on 2026-10-15. This confirms actual runners are assigned.
- On this CI PR #33, existing [run #38147580581](https://github.com/memetreza34-ux/Creator-lab/actions/runs/38147580581) was also retried on 2026-10-16. Confirm its final result and first diagnostic step independently.
- **Root cause of the earlier pre-step failure remains unknown.** Do not assert that billing, YAML syntax or permissions were the cause. Historical pre-step failures do not imply application test failures.
- **Still not done:** live-issued two-user Auth JWT/Storage acceptance. Green CI is not proof of production authorization.

## New workflow behavior (this PR)

- Validate pull requests targeting ANY base branch, not only main. Keeps
  push-on-main verification and adds manual 'workflow_dispatch'.
- Restrict token to contents:read, checkout without persisting credentials.
  No service keys or test-user credentials enter default CI.
- Add an explicitly labeled first 'Runner diagnostics' step, to distinguish
  the runner actually launching from failure before any step.
- Reduce unnecessary duplicate costs by canceling older runs for the same PR.
  Timeout any running CI job after 20 minutes.
- Preserve npm ci, npm test, npm run lint and npm run build gates.
- Once main has this workflow, rebase/update earlier feature branches as
  needed; workflows executing for pull_request events use the code/ref
  supplied by the event and must include the workflow configuration.

## Required repository owner diagnosis

1. Open the failed run:
   https://github.com/memetreza34-ux/Creator-lab/actions/runs/38046888888
2. Look for the top-level workflow/job banner or the two check annotations
   explaining the failure. The annotations can also be queried from a
   locally authenticated GitHub CLI without exposing tokens in chat:
   gh api repos/memetreza34-ux/Creator-lab/check-runs/114198110704/annotations
3. Check repository Settings > Actions > General for disabled workflows or
   runner restrictions; check account Billing and licensing / Actions
   budgets, included minutes and payment. Those are hypotheses, not
   verified root causes.
4. Fix the account-side restriction if present. Manually rerun a failed
   run or dispatch the workflow after this CI PR is merged.
5. Issue #19 can close only after a real job shows Runner diagnostics,
   Checkout, successful npm ci, npm test, npm run lint, and npm run build
   with accessible logs and an overall successful GitHub check.

No change to the workflow file alone can repair an account-side billing or
runner availability restriction. Do not treat this PR as an infrastructure
resolution until an actual job executes and passes.

## Fresh PR #33 confirmation (2026-10-11)

New validation workflow run 38147480046 was automatically triggered by
this very CI change. It again **failed in three seconds before the first
step**. Job 114493763966 returned steps:null and logs_url:null; GitHub
check-run output shows annotations_count=2. The new Runner diagnostics first
step could not print anything because no job step was ever started.

This is positive evidence that the workflow event was registered, but the
runner/startup problem persists independent of the new workflow YAML.
Resolve the owner-visible annotations/account billing and runner controls
before attributing these results to npm, CI syntax or source-code tests.

Run: https://github.com/memetreza34-ux/Creator-lab/actions/runs/38147480046
Job annotations via authenticated CLI:
'gh api repos/memetreza34-ux/Creator-lab/check-runs/114493763966/annotations'
