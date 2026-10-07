# Data Truth Boundaries

Creator Lab must make the origin and authority of data explicit.

## Workspace mode

`Workspace.dataMode` is one of:

- `demo` — seeded sample workspace. Accounts, publishing states, experiments, analytics, and performance are sample data.
- `standard` — user workspace. No provider connection is implied.

The UI shows a persistent banner for demo workspaces.

## Social account connection kind

`SocialAccount.connectionKind` is one of:

- `demo` — sample account for the demo workspace.
- `placeholder` — local destination reference used for planning and previews. It is not OAuth-authenticated.
- `provider` — reserved for an integration that has completed the real provider connection flow.

A manually entered handle must never become `provider`.

## Metric provenance

Analytics and post-performance records carry a `source`:

- `demo` — seeded sample data.
- `local` — deterministic data created from local Creator Lab state.
- `provider` — synchronized from a verified external provider.
- `derived` — deterministically calculated from other recorded evidence.

Creator Lab must not invent reach, engagement, follower growth, trend deltas, chart points, or best-time percentages when the evidence does not exist.

## AI boundary

AI output is interpretation or content assistance. It is never automatically a measured fact. A future evidence-based insight must link back to the recorded metrics/posts it is based on and must communicate sample size and limitations.

## Publishing truth

Until the durable publishing engine and a verified provider adapter exist:

- "Publish Now" cannot report provider success.
- local scheduling is planning state only;
- no external publish job is implied;
- demo published states remain sample data and are covered by the demo-workspace banner.

## Best-time truth

Hard-coded "best time" claims are not allowed in production UI. Best-time recommendations can return only when they are derived from sufficient real performance history and their evidence is explainable.
