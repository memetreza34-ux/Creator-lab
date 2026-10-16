-- Creator Lab security preflight. Run after schema migration, before user data.
-- Catalog assertions only; real two-user RLS tests are a separate requirement.
do $check$
declare
  table_name text;
  missing_count integer;
begin
  foreach table_name in array array[
    'creator_workspaces',
    'creator_workspace_members',
    'creator_content_items',
    'creator_posts',
    'creator_social_accounts',
    'creator_post_destinations',
    'creator_media_folders',
    'creator_media_assets'
  ]
  loop
    if not exists (
      select 1 from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = table_name
        and c.relkind = 'r'
        and c.relrowsecurity = true
    ) then
      raise exception 'Creator Lab RLS missing or disabled: %', table_name;
    end if;

    if not exists (
      select 1 from pg_catalog.pg_policies p
      where p.schemaname = 'public'
        and p.tablename = table_name
        and p.cmd = 'SELECT'
        and 'authenticated' = any(p.roles)
    ) then
      raise exception 'Creator Lab authenticated SELECT policy missing: %', table_name;
    end if;
  end loop;

  select count(*) into missing_count
  from storage.buckets
  where id = 'creator-media' and public = false;
  if missing_count <> 1 then
    raise exception 'Creator Lab private media bucket missing or public';
  end if;

  if exists (
    select 1 from pg_catalog.pg_policies p
    where p.schemaname = 'public'
      and p.tablename in (
        'creator_workspaces', 'creator_workspace_members',
        'creator_content_items', 'creator_posts',
        'creator_social_accounts', 'creator_post_destinations',
        'creator_media_folders', 'creator_media_assets'
      )
      and p.cmd = 'ALL'
      and p.qual = 'true'
  ) then
    raise exception 'Unrestricted Creator Lab policy detected';
  end if;

  -- A workspace-owner update can bypass the workspace creation RPC, so the
  -- timezone validator must be attached as a database trigger.
  if not exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'creator_workspaces'
      and t.tgname = 'creator_workspaces_timezone_guard'
      and not t.tgisinternal
      and t.tgenabled in ('O','A')
  ) then
    raise exception 'Creator Lab timezone guard missing or disabled';
  end if;

  -- Per-workspace foreign keys alone do not ensure a destination's
  -- platform/connection_mode agrees with the referenced social account.
  if not exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'creator_post_destinations'
      and t.tgname = 'creator_destinations_account_identity_guard'
      and not t.tgisinternal
      and t.tgenabled in ('O','A')
  ) then
    raise exception 'Creator Lab destination account guard missing or disabled';
  end if;

  -- Every Creator Lab function is an RPC-like object as far as Supabase
  -- default privileges are concerned; anon must never receive EXECUTE.
  foreach table_name in array array[
    'public.creator_is_member(uuid)',
    'public.creator_can_edit(uuid)',
    'public.creator_is_owner(uuid)',
    'public.creator_create_workspace(text,text)',
    'public.creator_storage_workspace(text)',
    'public.creator_guard_workspace_timezone()',
    'public.creator_guard_destination_identity()'
  ]
  loop
    if pg_catalog.has_function_privilege('anon', table_name, 'EXECUTE') then
      raise exception 'Anonymous EXECUTE privilege remains on: %', table_name;
    end if;
  end loop;

  raise notice 'Creator Lab schema/RLS catalog preflight passed';
end
$check$;
