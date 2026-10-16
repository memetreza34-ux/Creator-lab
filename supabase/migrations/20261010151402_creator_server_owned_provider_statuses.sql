-- Limit client-controlled rows to unverifiable DRAFT/DISCONNECTED states.
-- Real provider OAuth, scheduling and publishing must use a separately
-- authenticated and audited server-only integration (service_role bypasses RLS).
-- Keeping user-facing local planning separate from provider-confirmed outcomes
-- prevents a direct PostgREST caller from manufacturing scheduling/connection
-- states before a durable provider adapter and job queue exist.

alter policy creator_posts_insert on public.creator_posts
  with check (
    public.creator_can_edit(workspace_id)
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
  );

alter policy creator_posts_update on public.creator_posts
  using (
    public.creator_can_edit(workspace_id)
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
  )
  with check (
    public.creator_can_edit(workspace_id)
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
  );

alter policy creator_posts_delete on public.creator_posts
  using (
    public.creator_can_edit(workspace_id)
    and status = 'draft'
  );

alter policy creator_destinations_insert_local on public.creator_post_destinations
  with check (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
    and provider_post_id is null
    and last_error is null
  );

alter policy creator_destinations_update_local on public.creator_post_destinations
  using (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
  )
  with check (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and status = 'draft'
    and scheduled_at is null
    and published_at is null
    and provider_post_id is null
    and last_error is null
  );

alter policy creator_destinations_delete_local on public.creator_post_destinations
  using (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and status = 'draft'
  );

alter policy creator_accounts_insert_demo on public.creator_social_accounts
  with check (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and connection_status = 'disconnected'
    and provider_account_id is null
    and last_sync_at is null
  );

alter policy creator_accounts_update_demo on public.creator_social_accounts
  using (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and connection_status = 'disconnected'
  )
  with check (
    public.creator_can_edit(workspace_id)
    and connection_mode = 'demo'
    and connection_status = 'disconnected'
    and provider_account_id is null
    and last_sync_at is null
  );

