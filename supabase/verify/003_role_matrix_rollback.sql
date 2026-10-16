-- Rollback-only authenticated SQL role matrix; no real Supabase JWTs issued.
-- Run exclusively on an empty, dedicated Creator Lab project.
begin;
insert into auth.users(id, aud, role) values
 ('a0000000-0000-4000-8000-0000000000a1','authenticated','authenticated'),
 ('b0000000-0000-4000-8000-0000000000b2','authenticated','authenticated'),
 ('c0000000-0000-4000-8000-0000000000c3','authenticated','authenticated');
insert into public.creator_workspaces(id, name, timezone)
values ('d0000000-0000-4000-8000-0000000000d4','Temporary Role Workspace','UTC');
insert into public.creator_workspace_members(workspace_id,user_id,role) values
 ('d0000000-0000-4000-8000-0000000000d4','a0000000-0000-4000-8000-0000000000a1','owner'),
 ('d0000000-0000-4000-8000-0000000000d4','b0000000-0000-4000-8000-0000000000b2','viewer'),
 ('d0000000-0000-4000-8000-0000000000d4','c0000000-0000-4000-8000-0000000000c3','editor');
insert into public.creator_content_items(id,workspace_id,title) values
 ('e0000000-0000-4000-8000-0000000000e5','d0000000-0000-4000-8000-0000000000d4','Owner created idea');

set local role authenticated;

do $roles$
declare
  w uuid := 'd0000000-0000-4000-8000-0000000000d4';
  item uuid := 'e0000000-0000-4000-8000-0000000000e5';
begin
  -- Viewer can read and cannot write content, membership or workspace settings.
  perform pg_catalog.set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-0000000000b2',true);
  if not public.creator_is_member(w) or public.creator_can_edit(w) or public.creator_is_owner(w) then
    raise exception 'Viewer membership helpers returned wrong privileges';
  end if;
  if (select count(*) from public.creator_content_items where workspace_id=w) <> 1 then
    raise exception 'Viewer cannot read permitted content';
  end if;
  begin
    insert into public.creator_content_items(workspace_id,title) values(w,'Forbidden viewer item');
    raise exception 'Viewer inserted content';
  exception when insufficient_privilege then null;
  end;
  update public.creator_content_items set title='Viewer changed item' where id=item;
  if found then raise exception 'Viewer updated content'; end if;
  update public.creator_workspace_members set role='owner'
  where workspace_id=w and user_id='b0000000-0000-4000-8000-0000000000b2';
  if found then raise exception 'Viewer escalated membership'; end if;

  -- Editor can write content but cannot rename workspace or alter membership.
  perform pg_catalog.set_config('request.jwt.claim.sub','c0000000-0000-4000-8000-0000000000c3',true);
  if not public.creator_can_edit(w) or public.creator_is_owner(w) then
    raise exception 'Editor membership helpers returned wrong privileges';
  end if;
  insert into public.creator_content_items(workspace_id,title) values(w,'Editor-created idea');
  update public.creator_workspaces set name='Editor renamed workspace' where id=w;
  if found then raise exception 'Editor renamed an owner-only workspace'; end if;
  update public.creator_content_items set title='Editor changed item' where id=item;
  if not found then raise exception 'Editor could not update content'; end if;

  -- Owner can edit workspace metadata.
  perform pg_catalog.set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-0000000000a1',true);
  if not public.creator_is_owner(w) then raise exception 'Owner permission missing'; end if;
  update public.creator_workspaces set name='Updated by owner' where id=w;
  if not found then raise exception 'Owner unable to rename workspace'; end if;
  raise notice 'Creator Lab owner/editor/viewer synthetic SQL role matrix PASSED';
end
$roles$;
rollback;
