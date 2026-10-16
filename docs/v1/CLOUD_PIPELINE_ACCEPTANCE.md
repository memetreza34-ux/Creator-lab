# B-05 — Authenticated Cloud Pipeline CRUD (staged pilot)

**Implementation branch:** `backend/cloud-pipeline-crud-20261010` (stacked onto PR #25 → #24 → #16). This feature is **not merged, deployed, or live-user tested**.

## User journey

1. Visit `/cloud`, sign in with a real Supabase Auth account.
2. Select or create your **own** server-authorized workspace.
3. Add a content idea with title, notes, format, planned platforms, and optional target date.
4. See the item on the cloud workflow board: Ideas, Research, Script, Recording, Editing, Ready, Planned, Published (manual).
5. Move a card between stages; edit its title, notes, format, platforms and target date; or delete it after confirmation.
6. Reload from the server (or log out/in on a separate device) to verify persistence.

**Every board result comes from Postgres via an authenticated user JWT.** The local `/` Composer/Calendar/Media/Pipeline remain a prototype and are **not** automatically synchronized or imported. The “planned” and “published” stages are manual labels, not working publishing/scheduling integrations.

## Technical contract

- PostgREST `creator_content_items` `GET` by workspace ID, deterministic sort.
- Single atomic `POST` with all creation fields (no multi-request partial new ideas).
- `PATCH` and `DELETE` both constrain **workspace_id and item id** and request `Prefer: return=representation`.
- An empty `200 []` is **not** a successful update/delete: this can indicate RLS denied or a stale item.
- Local allowlists for title, notes, stage, format, platforms and target date reject unknown/privileged columns and malicious IDs before the request.
- Server RLS remains the security authority. Browser checks never substitute for membership/role permissions.
- No service key, provider OAuth token or account billing data in the frontend.
- After a mutation, reread the server state. In ambiguous failures, show a warning and **Reload from cloud** before retrying.
- Workspace selection and user identity form the React component key: switching workspace or account resets local board state rather than reusing another user's list.

## Validation required before merging

1. `npm test`, `npm run lint`, `npm run build` in a working GitHub Actions runner (infrastructure blocker [#19](https://github.com/memetreza34-ux/Creator-lab/issues/19)).
2. Fake-network regression tests in `src/cloud/creatorCloudClient.test.ts`: atomic POST payload, scoped PATCH/DELETE, zero-row RLS failures, field allowlists, ownership mismatch and server confirmation.
3. Browser keyboard/responsive QA: all eight stages, form validation, moving multiple cards, switching workspaces, creating/editing/deleting and reloading; empty/loading/error messages.
4. Two actual Auth users and the independent RLS/private-Storage test [#23](https://github.com/memetreza34-ux/Creator-lab/pull/23). As last checked, the dedicated Supabase project still had **zero Auth users**.
5. Review collision handling for retry-after-timeout, cross-tab changes, audit logs, authorization roles, and undo/soft-delete options before broad rollout.
6. After acceptance, integrate the same cloud domain operations into the full Composer/Calendar/Posts, then private Storage, OAuth and provider-confirmed publish jobs.

## Truthful limitations

This delivers a **separate authenticated cloud planning workflow** only, not complete Creator Lab cloud parity. The main demo remains local; subscription management, actual publishing and analytics sync are out of scope. The CI blocker and absent real-user E2E prevent a “production-ready” label.
