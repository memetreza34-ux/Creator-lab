# V1 User Flows

## Flow A — Idea to scheduled content

1. Creator creates or selects a pipeline item.
2. Item moves through research/script/recording/editing/ready.
3. "Create post" opens Composer with traceability to the source item.
4. Creator selects real connected destinations.
5. Creator writes base content and adapts per platform.
6. Creator adds media from the workspace library.
7. Creator previews platform output and resolves validation issues.
8. Creator saves draft, queues, schedules, or publishes where supported.
9. Post status reflects actual backend state.
10. Calendar and pipeline update from the same source of truth.

## Flow B — Connect a social account

1. Creator starts connection from Social Accounts.
2. App explains required permissions.
3. OAuth redirects through the backend.
4. Backend stores encrypted/secured tokens and platform account identity.
5. App verifies capabilities.
6. Connection shows verified status, last sync, and capability limits.
7. Disconnect revokes/cleans local credentials where supported.

## Flow C — Scheduled publish

1. Creator schedules in workspace local time.
2. Backend converts/stores canonical UTC plus timezone context.
3. Durable job becomes due.
4. Publisher performs idempotent platform request.
5. Success stores platform post ID and published timestamp.
6. Retryable failure retries with bounded backoff.
7. Permanent failure becomes failed with actionable reason.
8. UI never reports published before platform confirmation.

## Flow D — Performance to learning

1. Analytics sync imports platform metrics.
2. Creator sees freshness and source.
3. Creator opens a post or comparison.
4. System identifies patterns only when evidence threshold is met.
5. Insight cites the posts/metrics behind it.
6. Creator can create similar content or an experiment from the insight.

## Flow E — Experiment

1. Creator chooses a hypothesis and primary metric.
2. Creates meaningful A/B variants.
3. Publishes/records variants with traceability.
4. Metrics sync.
5. System shows delta, sample size, and limitations.
6. Winner is not declared when evidence is insufficient.
7. Learning can be reused in future creation.
