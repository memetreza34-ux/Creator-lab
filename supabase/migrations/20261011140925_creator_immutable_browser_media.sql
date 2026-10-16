-- Browser uploads are insert-once (x-upsert:false). No client-side
-- overwrites or metadata retargeting: an UPDATE could otherwise rename an
-- attached Storage object despite the attachment deletion guard.
drop policy if exists creator_storage_update on storage.objects;
drop policy if exists creator_media_update on public.creator_media_assets;
revoke update on public.creator_media_assets from authenticated;
-- Future trusted backend migrations/jobs can perform reviewed changes using
-- an appropriately privileged server identity, never a browser credential.
