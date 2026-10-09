# Creator Lab V1

Creator Lab is a creator operating system that connects planning, creation, publishing, measurement, and learning.

## Product loop

Idea -> Pipeline -> Create -> Optimize -> Schedule/Publish -> Measure -> Learn -> Experiment -> Improve

## V1 outcome

A solo creator or small creator brand can move a content idea through a reliable workflow, create platform-specific content, schedule or publish it to supported real accounts, inspect real performance, and turn evidence into a concrete next action or experiment.

V1 is not "another scheduler" and not "ChatGPT with social buttons". The product differentiator is the connection between content, publishing, performance, experiments, and accumulated creator-specific learning.

## Source of truth and execution entry point

**Start every development session with [../DELIVERY_MASTER_PLAN.md](../DELIVERY_MASTER_PLAN.md), then [STATUS.md](STATUS.md).** The plan supplies tasks/IDs/dependencies, while STATUS records verified progress, current blockers and the next exact task. These two files must agree.

Read the detailed requirements by topic:
1. [01_PRODUCT_VISION.md](01_PRODUCT_VISION.md) — who this product is for and its differentiator.
2. [05_V1_SCOPE.md](05_V1_SCOPE.md) — MUST/SHOULD/POST-V1 boundary.
3. [06_USER_FLOWS.md](06_USER_FLOWS.md) — end-to-end journeys.
4. [07_DOMAIN_AND_ARCHITECTURE.md](07_DOMAIN_AND_ARCHITECTURE.md) — production contracts.
5. [08_V1_ROADMAP.md](08_V1_ROADMAP.md) and [phases/](phases/) — phase gates.
6. [DESIGN_SYSTEM_UX.md](DESIGN_SYSTEM_UX.md) — visual system, screens, responsive/a11y acceptance.
7. [COMPETITIVE_GAP_MATRIX.md](COMPETITIVE_GAP_MATRIX.md) and [03_COMPETITOR_RESEARCH.md](03_COMPETITOR_RESEARCH.md) — competitor lessons and scope decisions.
8. [RELEASE_TEST_MATRIX.md](RELEASE_TEST_MATRIX.md), [09_QUALITY_STANDARD.md](09_QUALITY_STANDARD.md), [10_RELEASE_CRITERIA.md](10_RELEASE_CRITERIA.md) — quality and launch proof.
9. [DECISIONS.md](DECISIONS.md) — explicit architectural/product choices; [../POST_V1_BACKLOG.md](../POST_V1_BACKLOG.md) — deferred features.

The current source-code audit baseline in 02_CURRENT_STATE_AUDIT.md is historical (2026-09 era), not a claim that no later engineering has occurred. Prefer the actual code and latest merged PRs to stale prose.

**Execution rule:** choose the highest-priority unblocked task from the master plan. Verify actual code; implement one testable slice; run its checks; merge only when validation is credible; record PR, commit, user behavior, residual risk and one next exact task in STATUS. Work blocked by user approvals or third-party APIs does not justify randomly expanding the frontend.
