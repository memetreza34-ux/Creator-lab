# Media Storage Boundary

## Current V1 prototype behavior

Creator Lab currently uses two explicit media storage modes:

- `demo_remote` — sample assets loaded from remote demo URLs.
- `indexeddb` — user-uploaded binary files stored locally in the browser via IndexedDB.

A third domain value, `remote`, is reserved for the production object-storage phase.

## Truth rules

- Demo assets must never be presented as user-owned cloud media.
- Local IndexedDB assets must be labeled as local browser storage.
- Persisted application state stores media metadata only.
- IndexedDB assets must not persist runtime `blob:` URLs.
- Runtime object URLs are resolved again from IndexedDB after reload.
- If IndexedDB storage fails, Creator Lab must not create metadata that pretends the upload succeeded.

## Current limitations

IndexedDB storage is device/browser-local.

That means local assets:
- do not sync between devices,
- can disappear if browser storage is cleared,
- are not suitable for production publishing workers,
- cannot be accessed by a server-side social publishing job.

## Production migration boundary

Phase 4 must migrate uploaded media to durable object storage.

Target behavior:
1. Upload binary to authenticated object storage.
2. Store only durable asset metadata and object reference in the database.
3. Enforce workspace ownership server-side.
4. Use signed/private access where appropriate.
5. Make publishing workers read the durable object, not browser storage.
6. Migrate or clearly retire local-only IndexedDB assets during production cutover.

## Non-goal for Phase 0

Phase 0 does not introduce cloud object storage. Its job is to make current storage semantics explicit, safe, and non-misleading.
