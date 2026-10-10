-- Synthetic SQL role/JWT-claim probe. This is NOT an actual Auth-issued token.
-- Run ONLY on the dedicated, EMPTY Creator Lab database. All data rolls back.
-- Expected: authenticated workspace editor can draft, but cannot forge
-- scheduled posts/destinations, connected accounts or sync timestamps.

begin;

insert into auth.users(id,aud,role)
values ('a0000000-0000-4000-8000-0000000000a1','authenticated','authenticated');

set local role authenticated;

do $creator_truth$
declare
  w uuid;
  p uuid;
  a uuid;
  d uuid;
begin
  perform pg_catalog.set_config(
    'request.jwt.claim.sub','a0000000-0000-4000-8000-0000000000a1',true
  );
  w := public.creator_create_workspace('Provider Truth Probe', 'UTC');

  -- Positive controls: local drafts and disconnected demo accounts still work.
  insert into public.creator_posts(workspace_id,title,status)
  values(w,'Valid draft','draft') returning id into p;
  insert into public.creator_social_accounts(
    workspace_id,platform,display_name,username,connection_mode,connection_status
  ) values(w,'youtube','Demo','demo','demo','disconnected') returning id into a;
  insert into public.creator_post_destinations(
    workspace_id,post_id,social_account_id,platform,connection_mode,status
  ) values(w,p,a,'youtube','demo','draft') returning id into d;

  update public.creator_posts set title='Edited draft' where id=p;
  if not found then raise exception 'Legitimate draft update was blocked'; end if;

  -- A browser must not create a scheduled record without a real job.
  begin
    insert into public.creator_posts(workspace_id,title,status,scheduled_at)
    values(w,'Forged schedule','scheduled',now()+interval '1 day');
    raise exception 'Browser inserted a forged scheduled post';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.creator_posts
    set status='scheduled',scheduled_at=now()+interval '1 day'
    where id=p;
    if found then raise exception 'Browser marked draft scheduled'; end if;
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.creator_social_accounts(
      workspace_id,platform,display_name,username,connection_mode,connection_status
    ) values(w,'instagram','Forged Connection','fake','demo','connected');
    raise exception 'Browser inserted a fake connected account';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.creator_social_accounts
    set connection_status='connected',last_sync_at=now()
    where id=a;
    if found then raise exception 'Browser forged an account connection/sync'; end if;
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.creator_post_destinations(
      workspace_id,post_id,social_account_id,platform,connection_mode,
      status,scheduled_at
    ) values(
      w,p,a,'youtube','demo','scheduled',now()+interval '1 day'
    );
    raise exception 'Browser inserted fake scheduled destination';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.creator_post_destinations
    set status='scheduled',scheduled_at=now()+interval '1 day'
    where id=d;
    if found then raise exception 'Browser scheduled a demo destination'; end if;
  exception when insufficient_privilege then null;
  end;

  if not exists (
    select 1 from public.creator_posts where id=p and status='draft'
  ) then raise exception 'Draft was damaged by denied update'; end if;
  if not exists (
    select 1 from public.creator_social_accounts
    where id=a and connection_status='disconnected' and last_sync_at is null
  ) then raise exception 'Account was damaged by denied update'; end if;
  if not exists (
    select 1 from public.creator_post_destinations where id=d and status='draft'
  ) then raise exception 'Destination was damaged by denied update'; end if;

  raise notice 'Provider-truth synthetic RLS probe PASSED';
end
$creator_truth$;

rollback;
