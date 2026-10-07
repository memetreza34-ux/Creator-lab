# Media Persistence

## Current Phase 0 browser architecture

Creator Lab currently uses two distinct storage layers:

1. **Versioned application metadata** in `localStorage` under `creator_lab_state`.
2. **Binary user media** in browser IndexedDB database `creator_lab_media_db`, store `media_blobs`.

A local upload is represented by a `MediaAsset` with:

- `storageKind: 'indexeddb'`
- lightweight metadata in app state
- the binary Blob/File in IndexedDB
- a runtime-only `blob:` URL for rendering

## Object URL rule

A `blob:` URL is not durable storage.

Creator Lab therefore:

- never intentionally persists a runtime `blob:` URL for an IndexedDB asset;
- strips the URL when serializing app state;
- resolves a fresh runtime URL from IndexedDB after reload;
- revokes cached object URLs when an IndexedDB asset is deleted.

If the IndexedDB write fails, the media metadata must not be added as though the upload succeeded.

## Seed/demo and remote media

`MediaAsset.storageKind` distinguishes:

- `indexeddb` — browser-local binary.
- `demo-remote` — remote sample asset used by the demo workspace.
- `remote` — non-demo remote asset metadata.

This field describes storage location; it does not grant provider or cloud ownership.

## Limitations of the current implementation

Browser-local media:

- does not sync between devices or browsers;
- can disappear if the user clears site storage;
- is subject to browser quota/eviction behavior;
- cannot be used by a server-side publishing worker;
- is not a production multi-user media system.

These limitations are intentional during the local prototype phase and must not be hidden from product architecture.

## Phase 4 production migration boundary

Backend/Auth/Cloud Data must replace browser-local media authority with:

- authenticated server-side ownership;
- durable object storage;
- database media metadata;
- upload authorization;
- content-type/size validation;
- server-readable media URLs or signed access;
- deletion/lifecycle cleanup;
- migration/import strategy for browser-local assets where feasible.

IndexedDB may remain as an optional browser cache, but it must not be the production source of truth once real publishing jobs run on the server.
