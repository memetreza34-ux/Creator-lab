# B-06 — Private Cloud Media Library Pilot

**Status:** Code staged in a DRAFT PR, not deployed or live-JWT-tested.
The existing project's bucket and RLS policies were **inspected, not changed**.

## What is implemented

The Auth-separated '/cloud' page now has an authenticated, workspace-specific media
panel alongside its Cloud Pipeline and Cloud Draft Composer.

- Upload one image or **small** video from the browser to the **existing private**
  'creator-media' bucket, then write the associated row into
  'public.creator_media_assets'. Supports JPEG, PNG, WEBP, GIF, MP4, MOV.
- File MIME + extension + basic magic bytes are checked locally. A file is capped
  to 6 MiB despite the bucket's configured 50 MiB maximum. Standard uploads are
  recommended for files up to ~6 MB; large resumable TUS uploads are a later milestone.
- Every object key is generated, workspace-scoped and unique:
  '<workspaceUUID>/<mediaUUID>/<sanitized-basename.ext>'. No upsert/overwrite.
- The object path, generated media ID, original display filename, MIME and
  byte count are persisted to RLS-protected asset metadata. Storage and metadata
  reads are made using the **signed-in user's** fresh Auth JWT.
- List and private preview through an authenticated Storage GET. No public bucket
  URL and no signed sharing URL. Browser blob: URLs are revoked when the preview
  closes, another preview opens, or the panel unmounts.
- Delete only after confirmation: request deletion via the **Storage API**, confirm
  its response names exactly the requested path, then delete exactly one scoped
  metadata row with PostgREST return=representation.
- The UI exposes Reload, loading/empty/error states, and a reconciliation warning.
- Existing demo files/localStorage/IndexedDB are neither read nor imported.
  This pilot **does not attach media to cloud posts or enable any publishing**.

## Verified existing RLS/bucket configuration

Live read-only inspection on 2026-10-11 confirms:

- Bucket 'creator-media': **public=false**, size ceiling 52,428,800 bytes,
  MIME allowlist JPEG/PNG/WEBP/GIF/MP4/MOV.
- 'storage.objects' RLS: SELECT only for workspace members; INSERT/UPDATE/DELETE
  only for editors/owners. The workspace UUID is parsed from the path's first
  segment using 'creator_storage_workspace(name)'.
- 'creator_media_assets' RLS: SELECT for members, INSERT/UPDATE/DELETE for
  editors/owners, with a DB check that the object's first path segment matches
  its workspace ID. Client requests also validate UUIDs and path structure.
- **0 Auth users, 0 stored objects, 0 indexed media** at pre-implementation check.
  Consequently no live Auth-issued end-to-end test can be claimed.

## Non-atomic Storage / metadata transaction

Supabase Storage and PostgREST are separate services; a two-request browser
operation is **not atomic**. This code uses a cautious best-effort saga:

**Upload:**
1. Generate new UUID object path and validate file locally.
2. Upload with JWT and 'x-upsert:false' to private Storage. If upload response
   is lost, inspect the exact path with authenticated Storage HEAD.
3. Insert metadata and require exactly one returned row with matching ID,
   workspace and path. On a lost/failed insert reply, query by exact path.
4. If metadata really is missing, try deleting the Storage object via its API,
   and confirm the returned name. If outcome cannot be verified, show a
   **reconciliation required** error; never silently report success.

**Deletion:**
1. Delete the *exact* Storage path via Storage API.
2. Once Storage confirms its removal, DELETE metadata constrained by
   workspace ID, media ID and path, and require exactly one returned row.
3. If step 2 fails, the metadata row may remain and require administrator
   reconciliation. Never silently claim full deletion or issue repeated deletes.

Unindexed Storage objects or dangling metadata are still possible after
network/server outages. Before general release, implement a **trusted
server-side media coordinator and scheduled reconciliation job** that can
safely inventory metadata and Storage without exposing service secrets.
Do not claim that this client-only pilot guarantees zero orphans.

## Security / compliance boundaries

- Do NOT expose Supabase service_role/sb_secret keys to Vite/browser, publish
  objects via the public endpoint, or write directly to 'storage.objects'.
- MIME/extension/magic checking is NOT an antivirus scan or content moderation.
  Server-side MIME sniffing, media scanning, quotas, rate limiting,
  per-workspace storage caps, abuse controls and billing are launch gates.
- Large videos require TUS resumable upload and ideally transcoding/processing.
- No public sharing, signed download links, social accounts, provider tokens,
  cross-workspace migration or automatic attachments are supported yet.
- Review XSS/CSP, previews on mobile, filename privacy and retention/deletion
  policy before accepting real user media.

## Test gates

1. Run 'npm test', 'npm run lint', 'npm run build'. GitHub Actions runner blocker
   [#19](https://github.com/memetreza34-ux/Creator-lab/issues/19) currently
   prevents CI verification. The committed unit tests are not yet executed.
2. Verify 'src/cloud/creatorMediaClient.test.ts': no service JWT accepted,
   invalid/mismatched file rejection, binary upload, scoped metadata insertion,
   lost upload response+HEAD, metadata readback/cleanup compensation, ambiguous
   cleanup failures, authenticated preview, storage-first delete, zero-row
   metadata denial, invalid cross-workspace object path.
3. Run the separate actual two-user JWT + private Storage RLS probe
   [#23](https://github.com/memetreza34-ux/Creator-lab/pull/23) using confirmed
   disposable Auth users, both reader and editor/viewer roles.
4. Browser E2E: sign in, two workspaces, upload real files, reload, preview,
   delete, verify no public access, offline/timeout, temporary object URLs
   revoked, unmount/workspace switch during a fetch, and inaccessible foreign
   media. Verify upload recovery after uncertain DB replies.
5. Validate server-side maintenance/reconciliation, quotas, support procedures
   and actual media MIME security before customer deployment.

**Merge order:** base schema PR #16 → Cloud API #24 → Auth #25 → Pipeline
#26 → Composer #27 → this PR; include separately applied provider-state
security migration PR #28 in every release environment.
