-- Forward-only hardening after Supabase advisor findings.
-- Remove direct authenticated RPC access to internal trigger-only functions.
-- Trigger execution is authorized at CREATE TRIGGER time by PostgreSQL.
revoke execute on function public.creator_guard_workspace_timezone() from authenticated;
revoke execute on function public.creator_guard_destination_identity() from authenticated;

-- Index workspace-scoped nullable FK columns for parent updates/deletions.
create index if not exists creator_posts_source_item
  on public.creator_posts(workspace_id, source_content_item_id);
create index if not exists creator_destinations_social_account
  on public.creator_post_destinations(workspace_id, social_account_id);
create index if not exists creator_assets_folder
  on public.creator_media_assets(workspace_id, folder_id);
