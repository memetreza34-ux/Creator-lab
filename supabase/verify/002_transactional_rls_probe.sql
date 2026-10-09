-- Creator Lab: transactional RLS sanity probe on a dedicated, EMPTY test DB.
-- IMPORTANT: This is SQL role/JWT-claim simulation, not real Supabase Auth
-- signup/token verification. Rollback must execute; no test records survive.
-- Do not run on a customer/populated database.
begin;

-- Test-only Auth identities exist solely to satisfy workspace_members FKs.
insert into auth.users (id, aud, role) values
  ('a0000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated'),
  ('b0000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated');

set local role authenticated;

do $probe$
declare
  workspace_a uuid;
  workspace_b uuid;
  post_b uuid;
  account_b uuid;
begin
  perform pg_catalog.set_config(
    'request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true
  );
  if (select auth.uid()) <> 'a0000000-0000-4000-8000-0000000000a1'::uuid then
    raise exception 'Simulated auth.uid() for A is not active';
  end if;
  workspace_a := public.creator_create_workspace('Temporary A', 'Europe/Berlin');
  insert into public.creator_content_items(workspace_id, title)
  values (workspace_a, 'Only A sees this');

  perform pg_catalog.set_config(
    'request.jwt.claim.sub', 'b0000000-0000-4000-8000-0000000000b2', true
  );
  workspace_b := public.creator_create_workspace('Temporary B', 'UTC');
  if exists (select 1 from public.creator_workspaces where id = workspace_a) then
    raise exception 'B can read workspace A';
  end if;
  if exists (select 1 from public.creator_content_items where workspace_id = workspace_a) then
    raise exception 'B can read A content';
  end if;
  if not exists (select 1 from public.creator_workspaces where id = workspace_b) then
    raise exception 'B cannot read its own workspace';
  end if;

  -- A guessed UUID does not confer write access.
  begin
    insert into public.creator_content_items(workspace_id, title)
    values (workspace_a, 'Unauthorized B item');
    raise exception 'B inserted into workspace A';
  exception when insufficient_privilege then
    null; -- Expected: RLS denies cross-workspace INSERT.
  end;

  insert into public.creator_posts(workspace_id, title)
  values (workspace_b, 'B draft')
  returning id into post_b;
  insert into public.creator_social_accounts(
    workspace_id, platform, display_name, username
  ) values (workspace_b, 'youtube', 'Demo', 'demo')
  returning id into account_b;

  begin
    insert into public.creator_post_destinations(
      workspace_id, post_id, social_account_id, platform, connection_mode
    ) values (workspace_b, post_b, account_b, 'instagram', 'demo');
    raise exception 'Mismatched account platform was accepted';
  exception when check_violation then
    null; -- Expected: account platform/mode guard rejects.
  end;

  insert into public.creator_post_destinations(
    workspace_id, post_id, social_account_id, platform, connection_mode
  ) values (workspace_b, post_b, account_b, 'youtube', 'demo');

  perform pg_catalog.set_config(
    'request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true
  );
  if exists (select 1 from public.creator_posts where workspace_id = workspace_b) then
    raise exception 'A can read B posts';
  end if;
  begin
    update public.creator_workspaces
    set timezone = 'Mars/NoTimezone'
    where id = workspace_a;
    raise exception 'Invalid timezone update was accepted';
  exception when invalid_parameter_value then
    null; -- Expected: timezone trigger blocks invalid names.
  end;
  raise notice 'Creator Lab synthetic two-user SQL RLS probe PASSED';
end
$probe$;

rollback;
