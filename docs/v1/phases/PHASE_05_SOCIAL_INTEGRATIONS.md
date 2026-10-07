# Phase 05 — Real Social Integrations

## Goal

Publish for real without pretending unsupported platforms work.

## Order

1. YouTube.
2. Instagram after official feasibility gate.
3. TikTok only if audit access is realistic and does not delay core V1.

## Work

- OAuth connection lifecycle
- provider capability model
- token refresh/revocation
- provider media upload
- durable publish jobs
- idempotency
- retries and permanent failures
- provider post IDs/status
- truthful UI capability/error states

## Acceptance

A real test account can connect and publish/schedule successfully, provider confirmation is stored, duplicate job execution cannot create accidental duplicate posts, and failures are actionable.
