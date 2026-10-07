# Platform API Feasibility

Research refresh: 2026-10-07. API behavior changes frequently; re-verify official documentation immediately before each integration.

## V1 priority

### YouTube — V1 target, high confidence

Official YouTube Data API supports video upload via videos.insert and metadata including privacy state and publishAt. OAuth is required. Unverified API projects created after July 2020 have uploaded videos restricted to private until the project passes Google's audit.

YouTube Analytics API supports authorized reports with metrics including views, likes, comments, shares, watch time, and subscriber changes. Analytics data commonly has 48–72 hour latency, so Creator Lab must show freshness rather than imply real-time data.

Sources:
- https://developers.google.com/youtube/v3/docs/videos/insert
- https://developers.google.com/youtube/analytics/reference
- https://developers.google.com/youtube/analytics/data_model
- https://developers.google.com/youtube/analytics/metrics

### Instagram — V1 target behind feasibility gate

Instagram is strategically important for the target creator. Before implementation, re-verify Meta's current official Instagram API publishing, account eligibility, permissions, media container flow, review requirements, and Insights access. Do not implement from stale examples and do not mark the integration "supported" until a real OAuth + publish + metrics proof succeeds.

Meta developer documentation was not reliably retrievable during this research pass, so this plan intentionally does not claim unsupported specifics.

## Candidate after V1 core

### TikTok

TikTok's official Content Posting API supports direct posting and draft upload. Unaudited clients are restricted to private viewing for Direct Post, so audit/compliance access is a release dependency.

Sources:
- https://developers.tiktok.com/products/content-posting-api
- https://developers.tiktok.com/docs/en/content-posting-api-get-started

### LinkedIn

The official Posts API supports organic text, image, video, document, multi-image, poll, and article posts with permission requirements. Some read permissions are restricted/approval-based.

Source:
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

### Pinterest

The official API supports creating Pins and boards on behalf of authenticated users, with access rules that must be verified for the intended account type.

Source:
- https://developers.pinterest.com/docs/work-with-organic-content-and-users/create-boards-and-pins/

### X, Threads, Facebook

Potential later integrations. Re-research official current access, pricing/review constraints, publishing capabilities, analytics access, and account eligibility before scoping.

## Integration gate

A platform enters production support only after all of these pass:
1. Official API capability verified.
2. OAuth/authentication verified.
3. Required review/audit path understood.
4. Publish proof completed with a real test account.
5. Error and retry behavior understood.
6. Metrics availability and freshness understood.
7. Terms/policy obligations documented.
