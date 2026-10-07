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
