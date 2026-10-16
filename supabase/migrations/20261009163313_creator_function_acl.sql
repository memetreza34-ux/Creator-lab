-- Forward-only security correction for the Creator Lab project created on 2026-10-09.
-- Supabase automatically grants EXECUTE on new public functions directly to
-- anon; removing PUBLIC alone does not revoke these explicit grants.
-- This file is harmless for fresh installs that already contain the revokes.

revoke execute on function public.creator_is_member(uuid) from anon;
revoke execute on function public.creator_can_edit(uuid) from anon;
revoke execute on function public.creator_is_owner(uuid) from anon;
revoke execute on function public.creator_create_workspace(text,text) from anon;
revoke execute on function public.creator_storage_workspace(text) from anon;

revoke execute on function public.creator_guard_workspace_timezone() from public, anon;
revoke execute on function public.creator_guard_destination_identity() from public, anon;
