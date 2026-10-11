# B-07 — Cloud Draft media attachments acceptance

Draft code in stacked PR after private library PR #29. Not merged or deployed.

## Pilot functionality

1. Sign in to /cloud as a verified account.
2. Select a workspace and upload supported private media to its Media Library.
3. Create/save a written Cloud Draft in its composer. The post gets a real UUID.
4. In the new "Private media attachments" section, reload available media,
   choose an existing workspace asset and click Attach to draft.
5. The UI calls the authenticated Data API on public.creator_post_media;
   server RLS and composite FKs confirm the workspace, post and asset.
6. Reload the draft or browser; attachments appear in the same workspace.
   Click Preview for a temporary authenticated Blob URL.
7. Click Detach: only the join-table link is removed, not the stored file.
   A file cannot be deleted while linked to any draft.

The links are held in creator_post_media, NOT in original_content.mediaIds.
The existing mediaIds JSON remains empty for new drafts, preventing two
competing sources of truth. Media is shared by a post's draft; there is no
platform-specific media selection, provider publishing or scheduling.

## Technical assurances

- API GET limits workspace_id and post_id; INSERT/DELETE uses the exact
  workspace_id, post_id and media_asset_id triple.
- Mutations require exactly one confirmed returned record. A zero-row RLS
  result is a failure; ambiguous network replies require an explicit reload.
- The composer never sends a Storage object path from user-written text and
  never exposes service_role or public media URLs.
- Private media previews are downloaded with a user JWT; temporary browser
  object URLs are revoked on close/unmount.
- The server migration tracked in the separate draft media DB security PR
  is REQUIRED before this UI PR can work: composite FKs, RLS, Storage DELETE
  blocked while linked, and no browser Storage/metadata UPDATE policies.
- Media insertion is not coupled to upload; upload new files in the library
  and manually attach them to a saved draft.
- Draft deletion cascades the link rows; it does not delete the Storage files.
- Incompatible legacy JSON-media drafts stay protected by the prior text-only
  composer safeguard.

## Verification status

- Source contract checks and SQL rollback permission tests available.
- New client fake-network tests added for workspace/post/asset scoping,
  wrong returned rows, RLS empty results and malicious UUIDs.
- The SQL rollback probe was executed successfully, BUT it uses simulated JWT
  claims, not real registered Supabase Auth users.
- CI, TypeScript build, browser tests and Auth-issued JWT HTTP acceptance
  remain pending. GitHub Actions runner issue #19 and zero genuine test users
  are still release blockers.

## Required before public release

Run npm test, npm run lint, npm run build, and a real two-user/private Storage
test. Test viewer permissions and cross-workspace attacks, concurrent file
deletion versus attachment, offline mutations, session expiry, mobile UI,
data deletion requests and a trusted Storage reconciliation coordinator.

No claim of published content, provider login or monetization is implied.
