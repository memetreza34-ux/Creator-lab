-- Read-only contract check for the directly authenticated Data API.
-- Fail if any browser-writable provider status can be falsified.
-- Must be run after 20261010151402 migration, on a dedicated test project.

do $creator_verify$
declare
  expected record;
  expression_text text;
  required text;
begin
  for expected in
    select * from (values
      ('creator_posts_insert', 'check', array['status = ''draft''', 'scheduled_at IS NULL', 'published_at IS NULL']),
      ('creator_posts_update', 'using', array['status = ''draft''', 'scheduled_at IS NULL', 'published_at IS NULL']),
      ('creator_posts_update', 'check', array['status = ''draft''', 'scheduled_at IS NULL', 'published_at IS NULL']),
      ('creator_posts_delete', 'using', array['status = ''draft''']),
      ('creator_destinations_insert_local', 'check', array['connection_mode = ''demo''', 'status = ''draft''', 'scheduled_at IS NULL', 'published_at IS NULL', 'provider_post_id IS NULL', 'last_error IS NULL']),
      ('creator_destinations_update_local', 'using', array['connection_mode = ''demo''', 'status = ''draft''', 'scheduled_at IS NULL']),
      ('creator_destinations_update_local', 'check', array['connection_mode = ''demo''', 'status = ''draft''', 'scheduled_at IS NULL', 'published_at IS NULL', 'provider_post_id IS NULL', 'last_error IS NULL']),
      ('creator_destinations_delete_local', 'using', array['connection_mode = ''demo''', 'status = ''draft''']),
      ('creator_accounts_insert_demo', 'check', array['connection_mode = ''demo''', 'connection_status = ''disconnected''', 'provider_account_id IS NULL', 'last_sync_at IS NULL']),
      ('creator_accounts_update_demo', 'using', array['connection_mode = ''demo''', 'connection_status = ''disconnected''']),
      ('creator_accounts_update_demo', 'check', array['connection_mode = ''demo''', 'connection_status = ''disconnected''', 'provider_account_id IS NULL', 'last_sync_at IS NULL'])
    ) as contract(policy_name, expression_side, fragments)
  loop
    select case expected.expression_side
      when 'check' then p.with_check
      else p.qual
    end
    into expression_text
    from pg_catalog.pg_policies p
    where p.schemaname = 'public'
      and p.policyname = expected.policy_name;

    if expression_text is null then
      raise exception 'Policy side is missing: % (%)', expected.policy_name, expected.expression_side;
    end if;

    foreach required in array expected.fragments loop
      if position(required in expression_text) = 0 then
        raise exception 'Provider truth guard missing from policy %: %',
          expected.policy_name, required;
      end if;
    end loop;
  end loop;
end;
$creator_verify$;
