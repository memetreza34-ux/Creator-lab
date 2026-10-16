# B-07 — Safe draft/media relations (database)

Applied live on 2026-10-11 to the dedicated Creator Lab Supabase Frankfurt project.
Exact applied migration versions:
- 20261011140325_creator_draft_media_links
- 20261011140925_creator_immutable_browser_media

## Purpose and design

Draft attachments use a new authoritative relational table, creator_post_media,
rather than arbitrary unverified mediaIds inside creator_posts JSONB.
Both original_content.mediaIds and each platform_content mediaIds remain
empty for this pilot. Display links through creator_post_media, not JSON.

The composite primary key is (workspace_id, post_id, media_asset_id).
The two composite foreign keys enforce post/asset ownership by the SAME
workspace. Post removal cascades its link rows; asset deletion is RESTRICTed
while linked. Users must detach an asset from every draft before deleting it.

Server RLS allows workspace members to SELECT links and owner/editor users to
INSERT/DELETE links only when the associated post is still a draft.
No UPDATE grant is made for client-side link mutations. The Storage DELETE
policy denies removing objects that have attached media metadata. Storage
and metadata UPDATE policies have also been removed: browsers cannot rename,
move or overwrite existing private media (new x-upsert:false uploads work).

These constraints secure metadata membership but do not guarantee Storage
and PostgREST atomicity. Binary reconciliation, scanning, quotas and media
abuse controls must be handled by a trusted backend before launch.

## Live verification

- Both migrations applied and read back in Supabase migration history.
- RLS enabled, private storage bucket retained and three new link policies
  confirmed; authenticated UPDATE on creator_media_assets revoked.
- SQL rollback test: supabase/verify/006_media_links_rollback.sql passed.
  It verifies authorized linking, rejection of a cross-workspace composite FK,
  another synthetic user's inability to read/write, FK restriction on deleting
  linked assets and successful unlink. All temporary rows were rolled back.
- This test simulated JWT claims; it was NOT an Auth-issued two-user HTTP test.
  Real Auth users are not configured yet.

## Release gates

- Full npm test, npm run lint and npm run build (Actions issue #19).
- Real issued JWT and private Storage cross-user HTTP proof (PR #23).
- Browser QA: two workspaces, owner/editor/viewer accounts, upload, attach,
  logout and restore, authenticated preview, detach, deletion, no public URL.
- Concurrency review: Storage DELETE versus attachment INSERT; server-side
  reconciliation needed if storage and metadata ever diverge.
- Do not present media attachments as published provider assets.

Stack this PR on existing security DB PR #28 and core schema PR #16.
