# Phase 03 — Calendar & Scheduling Engine

## Goal

Create one trustworthy scheduling model before real provider jobs are introduced.

## Work

- month/week/day consistency
- workspace timezone display/edit
- UTC canonical schedule conversion
- drag/drop reschedule rules
- published-post locking
- failed/needs-review states
- queue slots only if they simplify the core model
- prepare schedule commands for durable backend jobs

## Acceptance

The same post shows the same intended local publish time everywhere and can be rescheduled without timezone drift.

## Scheduling truth contract

- `Post.scheduledAt` is UTC. A user's selected calendar date/time is a workspace-local civil time.
- Calendar Month, Week, Day, Composer, Posts, Dashboard, and any analytics date group must agree on the active workspace IANA timezone.
- Post list timestamps derive from post status: `scheduled` → scheduledAt, `published` → publishedAt, otherwise createdAt; corrupt legacy records explicitly degrade to a "Created" or unavailable label.
- The nonexistent local hour during spring DST transition and ambiguous repeated local hour during autumn transition must be rejected until a UI for offset selection exists.
- Calendar drag/drop is local planning, not social API publication. Published, failed and needs-review posts are not draggable.
- Suggested best-time slots are *prototype planning suggestions*, not predictions, boosts or provider-derived metrics.

## Queue-slot scope decision

**Defer simple per-account queue slots beyond this phase.** A queue without durable per-destination publishing jobs risks looking like a functioning auto-publisher while only rearranging local plans. Reassess queue slots alongside `PostDestination`, durable jobs, and first provider OAuth/publishing integration. Advanced evergreen/recycling queues remain post-V1.

## Manual Phase 3 acceptance — still required

Automated unit tests and CI are necessary but are not browser interaction evidence. Run the following before marking Phase 3 fully accepted:

1. Set workspace timezone to **Europe/Berlin** and use a browser/device set to **America/New_York**. In Composer, plan for 2026-10-08 18:30. Confirm the same local date/time appears in Posts, Calendar Month/Week/Day, Dashboard, and edit mode.
2. Drag that post to 2026-12-15 in **Month** view; confirm 18:30 remains selected in the workspace even though the UTC offset changed.
3. In **Week/Day**, drag it to a different hour and verify exact workspace-local time in Posts, Dashboard and Composer.
4. Verify dropping on 2026-03-29 at 02:00 Europe/Berlin is blocked with a clear message (nonexistent spring hour). Verify 2026-10-25 at 02:30 is rejected as ambiguous.
5. Verify posts with status **published**, **failed**, or **needs_review** cannot be moved via drag-and-drop.
6. Change active workspaces and verify the same UTC instant displays under each workspace's timezone without cross-workspace data leaks.
7. Check a workspace with no posts and/or no provider connection: no invented engagement, publishing success, or misleading real-time claims.
8. Verify narrow/mobile rendering of Month/Week/Day is usable and icon controls can be operated with keyboard where supported.

**Gate:** Record date, environment, result, and any failing screenshots/issues. Do not mark this gate passed from unit tests alone.
