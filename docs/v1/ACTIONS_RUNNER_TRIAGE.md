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
