# Creator Lab — dated competitor / API market evidence

**Checked:** 2026-10-15 (public official vendor pages). Prices are advertised entry amounts, often annual billing and currency-dependent; verify again before commercial pricing decisions. These are **not** audited feature comparisons and do not establish commercial demand.

| Provider | Official entry snapshot | Strength / buyer expectation | Our response |
|---|---|---|---|
| Buffer | Free up to 3 channels and 10 scheduled posts per channel; Essentials starts at USD 5/channel/month when annually billed | Fast, simple multi-channel publishing, ideas and AI | Simpler creator handoff; do not imitate every channel |
| Metricool | Free 1 brand, 20 monthly planned contents; Starter from EUR 16/month annual billing | Analytics, scheduling, competitor monitoring, reports | Do not compete on breadth or generic analytics without evidence |
| Publer | Free up to 3 social accounts (with exclusions); Professional starts USD 5/month at one account | Scheduling, automation, many channels | Build dependable one-platform delivery before queues |
| Planable | First 50 posts free; Basic USD 39/workspace/month monthly, USD 390/year | Approvals and team collaboration | Explicitly exclude agency approvals from first release |
| Predis.ai | Core USD 24/month annual billing; other tiers add auto-posting and generated media | AI multimedia creation and paid credits | AI quality should assist the workflow, not become an expensive generative studio |
| Canva Pro Content Planner | Available with Canva Pro; public planner supports design, scheduling and some insights | Existing design distribution + convenience | Media workflow should be clean; not build a Canva clone |

Official sources:
- https://buffer.com/pricing
- https://metricool.com/de/preisliste/
- https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh
- https://help.planable.io/hc/en-us/articles/21715370520092-Questions-on-pricing
- https://predis.ai/pricing/
- https://www.canva.com/pro/content-planner/

**Inference:** "AI captions", "calendar", "cross-platform scheduling" and "analytics" alone are commodity features. Differentiation **hypothesis** is a calm, specialized, end-to-end creator workflow with reviewable AI improvements and clear provenance. Validate via customer tasks and interviews; do not claim a market gap is proven.

## First customer discovery script and decision gate
Speak to five active independent creators who publish at least weekly. Ask them to **show** their current workflow (do not lead with the Creator Lab idea): how they create captions, manage versions/files, plan releases, handle failures and check results. Record tools, weekly volume, paid spend, the last frustrating incident, what they wish were simpler, whether they would switch, and their concrete price reaction. Then show the M1 workflow; record observed success, not "looks cool" reactions.

Evidence log template:
`date | persona/weekly posts | tools/cost | actual obstacle | current workaround | beta task success/failure | payment signal | source/consent`.

Stop/adjust positioning if fewer than 3 of 5 users experience the supposed preparation/coordination problem, or if the workflow doesn't demonstrably improve task completion. These are **decision heuristics**, not scientific market estimates.

## Official platform feasibility (update before engineering)
- YouTube upload/metadata: https://developers.google.com/youtube/v3/docs/videos/insert
- YouTube quota change June 2026: https://developers.google.com/youtube/v3/revision_history
- YouTube privacy and scheduling: https://developers.google.com/youtube/v3/docs/videos
- Google audit/quota: https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits
- Instagram Professional APIs, official Meta Postman docs:
  https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login

**Important 2026 documentation risk:** Google's YouTube docs recently moved `videos.insert` to a granular quota bucket; older documents/search summaries can still mention 1600 units while newer endpoint docs state 100 upload calls/day by default. Some official pages are also inconsistent on private/public restrictions of unverified clients, including localized versions. **Do not hardcode business assumptions from search snippets.** Confirm current console quotas, consent permissions, public publishing and audit with a real test API project before committing the release.

### Technical platform recommendation
Supabase Auth/Postgres with RLS and private Storage matches the already-provisioned dedicated Creator Lab backend (open PR #16 onwards). Do not create a second backend. Confirm secure ownership, refresh sessions and original media uploads on real user credentials before trusting the cloud pilot. Sources: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/storage/security/access-control

## What research does **not** establish
No competitor account was purchased and manually tested; no performance, conversion, churn, pricing elasticity, customer count, addressable market size or support cost has been established. No reliable revenue estimate should be generated from these observations alone.
