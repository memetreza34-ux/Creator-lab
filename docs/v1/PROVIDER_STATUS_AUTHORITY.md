# Provider status authority — database guard (Phase 4)

**Applied to the existing Creator Lab Supabase project:** 2026-10-10, migration
'20261010151402_creator_server_owned_provider_statuses'.
**GitHub:** separate security branch stacked on open SQL schema PR #16.
This migration must reach main before shipping the Cloud Composer, publisher,
social account connections or any public authenticated workspace.

## Problem identified from actual deployed RLS policies

Before this correction, the directly browser-accessible Data API could, with
a real workspace editor JWT:

- write 'scheduled' into 'creator_posts' without a queued server job;
- write 'scheduled' into demo 'creator_post_destinations' without a provider job;
- set a demo 'creator_social_accounts.connection_status' to 'connected'
  (and an arbitrary 'last_sync_at'), despite no verified OAuth connection.

Although RLS already prevented a direct 'published' post and OAuth-mode demo
accounts in various paths, client-created 'scheduled' and 'connected' statuses
would still be **fabricated provider/automation evidence**. Hiding controls in
the React UI cannot close a Data API authorization gap.

## Policy correction

All eight changed **existing** RLS policies now reserve external/provider
outcomes to future trusted server integrations:

- Client post INSERT / UPDATE only for 'draft', with null scheduled_at and
  published_at. Client DELETE only of 'draft'.
- Client demo destination INSERT / UPDATE only for 'draft', null
  scheduled_at/published_at/provider_post_id/last_error; DELETE only draft demo.
- Client demo account INSERT/UPDATE only for 'disconnected', no provider account ID
  or sync timestamp. OAuth records were already protected from client edits.
- Preserve membership/role enforcement with 'creator_can_edit(workspace_id)'
  and per-row RLS. SELECT policies, membership helpers and private storage remain
  unchanged. Service-role/backend can later write confirmed states only after
  verifying provider replies, jobs, auth, quota and proper audit tracing.

This is **intentional product behavior**: a browser can plan, write and save
drafts, but cannot claim that external accounts or posts were connected,
scheduled or published. The local '/' demo still uses mock statuses,
clearly identified as a prototype.

## Proof performed

- Read-only before/after catalog inspection of 'pg_policy', including USING /
  WITH CHECK, verified the exact policy changes in the live database.
- 'supabase/verify/004_provider_truthfulness.sql': read-only anonymous DO
  contract assertion of required draft/disconnected fields across 11 policy
  sides **executed successfully** against the Frankfurt project.
- The four existing SECURITY DEFINER advisor warnings on intentionally callable
  authenticated helper functions remain separate work (review rationale;
  no false claim of clean security advisor).
- The database still needs **actual Auth-issued two-user JWT / HTTP /
  private Storage** acceptance, queued-provider tests, and browser QA.

## Merge / deployment sequence

The migration is applied in the dedicated Supabase instance already; its exact
versioned SQL is committed for reproducible deployment. PR #16 is still open and
the GitHub Actions runner issue #19 is not solved, so don't claim a green CI or
a production release. Merge schema PR #16 after its CI/security review, then
this security migration PR; align the migration history in each environment.

**Future publisher:** Use a trusted API/job worker and provider OAuth vault, verify
the user is entitled to publish for that workspace, persist durable jobs with
idempotency/retries, then let privileged backend code set scheduled/connected/
published states only after the appropriate provider/job event. Do not expose
service-role keys to the browser.
