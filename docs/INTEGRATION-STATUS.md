# Integration status matrix

Verified-on dates refer to documentation review in the planning docs (Oct 31, 2026).
Nothing below is a live, contracted, production integration.

| Integration | State | What exists | What's missing |
| --- | --- | --- | --- |
| Supabase Auth/Postgres/Storage | Ready to wire | Migrations + RLS, env contract | A project + env values (SETUP.md) |
| Vercel deploy | Ready to wire | next.config, CI, monorepo layout | Vercel project import |
| Epic / MyChart (SMART on FHIR) | Sandbox-planned | Adapter interface, connection UI, OAuth/PKCE spec | Epic developer registration + sandbox client, then production validation |
| Oracle Health | Unavailable | Same adapter interface | Registered Oracle client credentials |
| Apple HealthKit | Requires mobile app | Capability registry, permission spec | Native bridge in a dev build; physical-device tests |
| Android Health Connect | Requires mobile app | Same | Same |
| Apple Watch / Samsung / Fitbit-Pixel / Garmin / Oura | Requires mobile app (phone-health route) | Route catalog + setup recipes | Per-route device validation |
| WHOOP / Oura / Garmin cloud OAuth | Unavailable | Candidate notes + limitations | Vendor developer access/contracts |
| Telehealth network (Wheel / SteadyMD / OpenLoop) | Demo adapter | Booking/appointment UI with demo label | Partner selection, contract, sandbox, real booking acceptance test - REQUIRED before customer launch |
| Symptom assessment (Healthily / ApiMedic) | Simulated, labeled | Intake UI, escalation, entitlement seam | Vendor contract, docs verification, clinical review |
| Drug interaction DB (First Databank / Medi-Span) | Unavailable | Honest unavailable state | Paid license |
| Stripe subscriptions | Test-mode planned | Entitlement model (server-verified events only) | Stripe test keys |
| MedlinePlus Connect | Candidate | Education-link note | Wiring with attribution |

Rule: a missing credential produces the explicit unavailable state shown in the UI.
A demo or sandbox adapter is never presented as a live service.
