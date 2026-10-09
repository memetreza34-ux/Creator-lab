-- Creator Lab / Phase 4A
-- Apply only to a dedicated Creator Lab Supabase project.
-- SECURITY CONTRACT: client RLS for workspace membership; OAuth credentials and
-- actual provider publishing are exclusively server responsibilities.
-- Requires Supabase Auth, Postgres 15+ and Supabase Storage.

create table public.creator_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reject invalid timezone values on *every* write, including owner updates.
-- The workspace RPC alone is insufficient: a workspace owner can UPDATE the row.
create function public.creator_guard_workspace_timezone()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.timezone is null or not exists (
    select 1 from pg_catalog.pg_timezone_names
    where name = new.timezone
  ) then
    raise exception 'Invalid IANA timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger creator_workspaces_timezone_guard
before insert or update of timezone on public.creator_workspaces
for each row execute function public.creator_guard_workspace_timezone();

create table public.creator_workspace_members (
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index creator_workspace_members_user on public.creator_workspace_members(user_id, workspace_id);

-- SECURITY DEFINER helpers avoid circular membership RLS recursion. The table
-- owner owns these functions; no caller-provided "user_id" is trusted.
create function public.creator_is_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.creator_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
  );
$$;

create function public.creator_can_edit(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.creator_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'editor')
  );
$$;

create function public.creator_is_owner(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.creator_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.role = 'owner'
  );
$$;

revoke all on function public.creator_is_member(uuid) from public;
revoke all on function public.creator_can_edit(uuid) from public;
revoke all on function public.creator_is_owner(uuid) from public;
grant execute on function public.creator_is_member(uuid) to authenticated;
grant execute on function public.creator_can_edit(uuid) to authenticated;
grant execute on function public.creator_is_owner(uuid) to authenticated;

create function public.creator_create_workspace(
  workspace_name text,
  workspace_timezone text default 'UTC'
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  new_workspace uuid;
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if workspace_name is null or char_length(btrim(workspace_name)) not between 2 and 100 then
    raise exception 'Invalid workspace name';
  end if;
  if workspace_timezone is null or not exists (
    select 1 from pg_catalog.pg_timezone_names
    where name = workspace_timezone
  ) then
    raise exception 'Invalid IANA timezone';
  end if;

  insert into public.creator_workspaces(name, timezone)
  values (btrim(workspace_name), workspace_timezone)
  returning id into new_workspace;

  insert into public.creator_workspace_members(workspace_id, user_id, role)
  values (new_workspace, current_user_id, 'owner');

  return new_workspace;
end;
$$;

revoke all on function public.creator_create_workspace(text,text) from public;
grant execute on function public.creator_create_workspace(text,text) to authenticated;

create table public.creator_content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 240),
  stage text not null default 'ideas'
    check (stage in ('ideas', 'research', 'script', 'recording', 'editing', 'ready', 'scheduled', 'published')),
  platforms text[] not null default '{}',
  format text not null default 'short'
    check (format in ('short', 'long', 'image', 'carousel', 'text')),
  owner_label text not null default '',
  target_date date,
  tags text[] not null default '{}',
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, id)
);

create table public.creator_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 240),
  original_content jsonb not null default '{"caption":"","mediaIds":[]}'::jsonb
    check (jsonb_typeof(original_content) = 'object'),
  platform_content jsonb not null default '[]'::jsonb
    check (jsonb_typeof(platform_content) = 'array'),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'failed', 'needs_review')),
  source_content_item_id uuid,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, id),
  foreign key (workspace_id, source_content_item_id)
    references public.creator_content_items(workspace_id, id)
    on delete set null (source_content_item_id),
  check (status <> 'scheduled' or scheduled_at is not null)
);

create table public.creator_social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  platform text not null
    check (platform in ('youtube','instagram','tiktok','twitter','linkedin','facebook','pinterest','threads')),
  display_name text not null,
  username text not null,
  connection_mode text not null default 'demo'
    check (connection_mode in ('demo','oauth')),
  connection_status text not null default 'disconnected'
    check (connection_status in ('connected','disconnected','error')),
  provider_account_id text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  unique(workspace_id, id),
  check (connection_mode <> 'demo' or provider_account_id is null)
);

create table public.creator_post_destinations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  post_id uuid not null,
  social_account_id uuid,
  platform text not null
    check (platform in ('youtube','instagram','tiktok','twitter','linkedin','facebook','pinterest','threads')),
  account_label text not null default '',
  account_handle text not null default '',
  connection_mode text not null default 'demo'
    check (connection_mode in ('demo','oauth')),
  status text not null default 'draft'
    check (status in ('draft','scheduled','published','failed','needs_review')),
  scheduled_at timestamptz,
  published_at timestamptz,
  provider_post_id text,
  last_error text,
  created_at timestamptz not null default now(),
  unique(workspace_id, id),
  foreign key (workspace_id, post_id)
    references public.creator_posts(workspace_id, id) on delete cascade,
  foreign key (workspace_id, social_account_id)
    references public.creator_social_accounts(workspace_id, id)
    on delete set null (social_account_id),
  check (status <> 'scheduled' or scheduled_at is not null)
);

-- Cross-workspace FKs prevent foreign account references, but do NOT prevent a
-- client from mislabeling an OAuth account as a "demo" destination or attaching
-- a destination to an unrelated platform. Guard the immutable account identity
-- at the database boundary for both browser and trusted backend writes.
create function public.creator_guard_destination_identity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.social_account_id is not null and not exists (
    select 1
    from public.creator_social_accounts a
    where a.id = new.social_account_id
      and a.workspace_id = new.workspace_id
      and a.platform = new.platform
      and a.connection_mode = new.connection_mode
  ) then
    raise exception 'Destination does not match its connected account identity'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger creator_destinations_account_identity_guard
before insert or update of social_account_id, workspace_id, platform, connection_mode
on public.creator_post_destinations
for each row execute function public.creator_guard_destination_identity();

create table public.creator_media_folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  unique(workspace_id, id)
);

create table public.creator_media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_workspaces(id) on delete cascade,
  folder_id uuid,
  object_path text not null
    check (split_part(object_path, '/', 1) = workspace_id::text),
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check(size_bytes >= 0),
  created_at timestamptz not null default now(),
  unique(workspace_id, id),
  unique(object_path),
  foreign key (workspace_id, folder_id)
    references public.creator_media_folders(workspace_id, id)
    on delete set null (folder_id)
);

create index creator_content_items_workflow on public.creator_content_items(workspace_id, stage, sort_order);
create index creator_posts_schedule on public.creator_posts(workspace_id, scheduled_at) where status = 'scheduled';
create index creator_post_destinations_post on public.creator_post_destinations(workspace_id, post_id);
create index creator_media_assets_workspace on public.creator_media_assets(workspace_id, created_at);

-- No token columns appear in any browser-facing table. Provider credentials
-- are introduced later in a private schema via trusted backend operations.

alter table public.creator_workspaces enable row level security;
alter table public.creator_workspace_members enable row level security;
alter table public.creator_content_items enable row level security;
alter table public.creator_posts enable row level security;
alter table public.creator_social_accounts enable row level security;
alter table public.creator_post_destinations enable row level security;
alter table public.creator_media_folders enable row level security;
alter table public.creator_media_assets enable row level security;

create policy creator_workspaces_select on public.creator_workspaces
  for select to authenticated using (public.creator_is_member(id));
create policy creator_workspaces_update on public.creator_workspaces
  for update to authenticated
  using (public.creator_is_owner(id))
  with check (public.creator_is_owner(id));
create policy creator_workspaces_delete on public.creator_workspaces
  for delete to authenticated using (public.creator_is_owner(id));
-- No client insert to creator_workspaces. The RPC adds owner membership atomically.

create policy creator_members_select on public.creator_workspace_members
  for select to authenticated using (public.creator_is_member(workspace_id));
-- No browser-driven membership writes. A dedicated vetted invite flow comes later.

create policy creator_items_select on public.creator_content_items
  for select to authenticated using (public.creator_is_member(workspace_id));
create policy creator_items_insert on public.creator_content_items
  for insert to authenticated with check (public.creator_can_edit(workspace_id));
create policy creator_items_update on public.creator_content_items
  for update to authenticated
  using (public.creator_can_edit(workspace_id))
  with check (public.creator_can_edit(workspace_id));
create policy creator_items_delete on public.creator_content_items
  for delete to authenticated using (public.creator_can_edit(workspace_id));

create policy creator_posts_select on public.creator_posts
  for select to authenticated using (public.creator_is_member(workspace_id));
create policy creator_posts_insert on public.creator_posts
  for insert to authenticated
  with check (
    public.creator_can_edit(workspace_id) and
    status in ('draft','scheduled','needs_review') and published_at is null
  );
create policy creator_posts_update on public.creator_posts
  for update to authenticated
  using (public.creator_can_edit(workspace_id) and status not in ('published','failed'))
  with check (
    public.creator_can_edit(workspace_id) and
    status in ('draft','scheduled','needs_review') and published_at is null
  );
create policy creator_posts_delete on public.creator_posts
  for delete to authenticated using (public.creator_can_edit(workspace_id));

create policy creator_accounts_select on public.creator_social_accounts
  for select to authenticated using (public.creator_is_member(workspace_id));
-- Browser clients can only write demo accounts. Live OAuth state is server-owned.
create policy creator_accounts_insert_demo on public.creator_social_accounts
  for insert to authenticated with check (
    public.creator_can_edit(workspace_id) and
    connection_mode = 'demo' and provider_account_id is null
  );
create policy creator_accounts_update_demo on public.creator_social_accounts
  for update to authenticated
  using (public.creator_can_edit(workspace_id) and connection_mode = 'demo')
  with check (
    public.creator_can_edit(workspace_id) and
    connection_mode = 'demo' and provider_account_id is null
  );
create policy creator_accounts_delete_demo on public.creator_social_accounts
  for delete to authenticated using (
    public.creator_can_edit(workspace_id) and connection_mode = 'demo'
  );

create policy creator_destinations_select on public.creator_post_destinations
  for select to authenticated using (public.creator_is_member(workspace_id));
create policy creator_destinations_insert_local on public.creator_post_destinations
  for insert to authenticated
  with check (
    public.creator_can_edit(workspace_id) and
    connection_mode = 'demo' and
    status in ('draft','scheduled','needs_review') and
    published_at is null and provider_post_id is null
  );
create policy creator_destinations_update_local on public.creator_post_destinations
  for update to authenticated
  using (
    public.creator_can_edit(workspace_id) and
    status not in ('published','failed') and
    connection_mode = 'demo'
  )
  with check (
    public.creator_can_edit(workspace_id) and
    connection_mode = 'demo' and
    status in ('draft','scheduled','needs_review') and
    published_at is null and provider_post_id is null
  );
create policy creator_destinations_delete_local on public.creator_post_destinations
  for delete to authenticated using (
    public.creator_can_edit(workspace_id) and
    status not in ('published','failed') and
    connection_mode = 'demo'
  );

create policy creator_folders_select on public.creator_media_folders
  for select to authenticated using (public.creator_is_member(workspace_id));
create policy creator_folders_insert on public.creator_media_folders
  for insert to authenticated with check (public.creator_can_edit(workspace_id));
create policy creator_folders_update on public.creator_media_folders
  for update to authenticated
  using (public.creator_can_edit(workspace_id))
  with check (public.creator_can_edit(workspace_id));
create policy creator_folders_delete on public.creator_media_folders
  for delete to authenticated using (public.creator_can_edit(workspace_id));

create policy creator_media_select on public.creator_media_assets
  for select to authenticated using (public.creator_is_member(workspace_id));
create policy creator_media_insert on public.creator_media_assets
  for insert to authenticated with check (public.creator_can_edit(workspace_id));
create policy creator_media_update on public.creator_media_assets
  for update to authenticated
  using (public.creator_can_edit(workspace_id))
  with check (public.creator_can_edit(workspace_id));
create policy creator_media_delete on public.creator_media_assets
  for delete to authenticated using (public.creator_can_edit(workspace_id));

-- Storage objects live under <workspace_uuid>/<asset_uuid>/<safe_filename>.
-- No public bucket and no access to arbitrary object paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-media', 'creator-media', false, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime']
)
on conflict (id) do nothing;

create function public.creator_storage_workspace(path text)
returns uuid language sql immutable set search_path = ''
as $$
  select case
    when split_part(path,'/',1) ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(path,'/',1)::uuid
    else null::uuid
  end;
$$;

revoke all on function public.creator_storage_workspace(text) from public;
grant execute on function public.creator_storage_workspace(text) to authenticated;

create policy creator_storage_read on storage.objects
  for select to authenticated using (
    bucket_id = 'creator-media' and
    public.creator_is_member(public.creator_storage_workspace(name))
  );
create policy creator_storage_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'creator-media' and
    public.creator_can_edit(public.creator_storage_workspace(name))
  );
create policy creator_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'creator-media' and
    public.creator_can_edit(public.creator_storage_workspace(name))
  )
  with check (
    bucket_id = 'creator-media' and
    public.creator_can_edit(public.creator_storage_workspace(name))
  );
create policy creator_storage_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'creator-media' and
    public.creator_can_edit(public.creator_storage_workspace(name))
  );
