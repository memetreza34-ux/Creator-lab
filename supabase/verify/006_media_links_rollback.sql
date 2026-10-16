-- ROLLBACK-ONLY two-workspace/roles test. Zero persistent identities or media.
-- Synthetic SQL/JWT claims are NOT actual Supabase Auth user tokens.
begin;
insert into auth.users(id,aud,role) values
 ('a0000000-0000-4000-8000-0000000000a1','authenticated','authenticated'),
 ('b0000000-0000-4000-8000-0000000000b2','authenticated','authenticated');
set local role authenticated;
do $probe$
declare
  w_a uuid;
  w_b uuid;
  p_a uuid;
  m_a uuid;
  m_b uuid;
begin
  perform pg_catalog.set_config('request.jwt.claim.sub',
    'a0000000-0000-4000-8000-0000000000a1',true);
  w_a := public.creator_create_workspace('Temporary media owner', 'UTC');
  insert into public.creator_posts(workspace_id,title)
    values(w_a,'Draft A') returning id into p_a;
  insert into public.creator_media_assets(
    workspace_id,object_path,file_name,mime_type,size_bytes
  ) values(w_a,w_a::text||'/a0000000-0000-4000-8000-0000000000a1/file.png',
    'file.png','image/png',16) returning id into m_a;

  -- Positive control: editor can link existing media in the same workspace.
  insert into public.creator_post_media(workspace_id,post_id,media_asset_id)
    values(w_a,p_a,m_a);
  if (select count(*) from public.creator_post_media
      where workspace_id=w_a and post_id=p_a) <> 1 then
    raise exception 'Owner link not visible';
  end if;

  -- Referenced metadata cannot be deleted. UI must unlink first.
  begin
    delete from public.creator_media_assets where id=m_a;
    raise exception 'Referenced asset deleted despite FK restrict';
  exception when foreign_key_violation then null;
  end;

  -- A different workspace is NEVER a valid media source for the draft.
  w_b := public.creator_create_workspace('Second workspace', 'UTC');
  insert into public.creator_media_assets(
    workspace_id,object_path,file_name,mime_type,size_bytes
  ) values(w_b,w_b::text||'/b0000000-0000-4000-8000-0000000000b2/file.png',
    'file.png','image/png',16) returning id into m_b;
  begin
    insert into public.creator_post_media(workspace_id,post_id,media_asset_id)
    values(w_a,p_a,m_b);
    raise exception 'Cross-workspace media reference accepted';
  exception when foreign_key_violation then null;
  end;

  -- Other, non-member user cannot read or attach to this workspace.
  perform pg_catalog.set_config('request.jwt.claim.sub',
    'b0000000-0000-4000-8000-0000000000b2',true);
  if exists (select 1 from public.creator_post_media where workspace_id=w_a) then
    raise exception 'Cross-user attachment metadata visible';
  end if;
  begin
    insert into public.creator_post_media(workspace_id,post_id,media_asset_id)
    values(w_a,p_a,m_b);
    raise exception 'Cross-user attachment accepted';
  exception when insufficient_privilege then null;
  end;

  -- Ownership restored: detach, then asset metadata may be deleted.
  perform pg_catalog.set_config('request.jwt.claim.sub',
    'a0000000-0000-4000-8000-0000000000a1',true);
  delete from public.creator_post_media where workspace_id=w_a and post_id=p_a and media_asset_id=m_a;
  if not found then raise exception 'Owner failed to detach'; end if;
  delete from public.creator_media_assets where id=m_a;
  if not found then raise exception 'Owner failed to remove unlinked asset metadata'; end if;

  raise notice 'Creator draft media RLS and composite FK probe PASSED';
end
$probe$;
rollback;
