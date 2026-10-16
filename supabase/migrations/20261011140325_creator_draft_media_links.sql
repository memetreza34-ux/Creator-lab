-- Creator Lab: private Cloud draft/media relationships.
-- Applied only after the core RLS and provider-status authority migrations.
-- The join table, not arbitrary JSON mediaIds, is the source of truth.
create table public.creator_post_media (
  workspace_id uuid not null,
  post_id uuid not null,
  media_asset_id uuid not null,
  sort_order integer not null default 0 check (sort_order between 0 and 99),
  created_at timestamptz not null default now(),
  primary key (workspace_id, post_id, media_asset_id),
  foreign key (workspace_id, post_id)
    references public.creator_posts(workspace_id, id) on delete cascade,
  foreign key (workspace_id, media_asset_id)
    references public.creator_media_assets(workspace_id, id) on delete restrict
);
create index creator_post_media_asset_fk
  on public.creator_post_media(workspace_id, media_asset_id);

alter table public.creator_post_media enable row level security;
revoke all on public.creator_post_media from public, anon;
grant select, insert, delete on public.creator_post_media to authenticated;

create policy creator_post_media_select
on public.creator_post_media for select to authenticated
using (public.creator_is_member(workspace_id));

create policy creator_post_media_insert
on public.creator_post_media for insert to authenticated
with check (
  public.creator_can_edit(workspace_id)
  and exists (
    select 1 from public.creator_posts p
    where p.workspace_id = creator_post_media.workspace_id
      and p.id = creator_post_media.post_id
      and p.status = 'draft'
  )
);

create policy creator_post_media_delete
on public.creator_post_media for delete to authenticated
using (
  public.creator_can_edit(workspace_id)
  and exists (
    select 1 from public.creator_posts p
    where p.workspace_id = creator_post_media.workspace_id
      and p.id = creator_post_media.post_id
      and p.status = 'draft'
  )
);

-- A browser must not remove an attached file even by bypassing the
-- application UI and calling the authenticated Storage API directly.
-- This is a policy on Storage objects, not a direct SQL DELETE of objects.
alter policy creator_storage_delete on storage.objects
using (
  bucket_id = 'creator-media'
  and public.creator_can_edit(public.creator_storage_workspace(name))
  and not exists (
    select 1 from public.creator_media_assets a
    join public.creator_post_media pm
      on pm.workspace_id = a.workspace_id
     and pm.media_asset_id = a.id
    where a.object_path = storage.objects.name
  )
);

comment on table public.creator_post_media is
  'Workspace-safe attachments to drafts; composite FKs protect both post and asset, browser can attach/detach draft only.';

-- No provider status, account, schedules, secrets or public Storage access.
