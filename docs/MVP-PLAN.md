# Kova Health MVP plan

Planning draft, October 31, 2026. This is a proposed scope, not approval to launch with real patient data. No application has been built or deployed.

Kova Health helps patients collect health information, maintain daily habits and medications, and work with their care team. Provider Connect is the primary product: a patient grants access, a verified provider reviews the permitted information, and the provider publishes a care plan that becomes daily actions for the patient. Symptom guidance is a separately subscribed add-on.

## Proposed release boundary

Build a responsive web application on Vercel and native iOS/Android patient apps, sharing Supabase authentication, Postgres, private file storage and backend services. Use React Native with Expo development builds for mobile. Start with synthetic data and working patient/provider workflows. Show all six modules, with explicit demo, sandbox, unavailable, and connected states for external services. A feature being visible is not evidence that its underlying clinical service is live.

The founder confirmed a synthetic-data demo first, web first, and a functioning on-demand clinician network at the first customer launch, then explicitly added native apps to the plan. Keep the web demo as the first milestone, followed by native simulator builds, real-device health integration and beta distribution. Native apps are now an explicit deliverable. The demo precedes the live launch; a mocked network does not satisfy the customer-launch requirement. Partner selection, contracting and integration must run alongside app development. Follow with a controlled real-patient pilot once the selected integrations, providers, operating procedures, and applicable agreements are ready.

The initial web release should be usable for manual tracking even when no external source is connected. External integrations must not block development of the core care loop.

Confirmed decisions: synthetic-data demo first; responsive web first with native iOS/Android apps included in the delivery plan; native syncing follows the web demo; on-demand clinicians available at first customer launch; health data retained for 15 days, with only derived Insights eligible for long-term health-data retention; a polished contemporary visual design, with the PDF as inspiration rather than a rigid template. Provisional assumptions awaiting the founder's answers: US adults, English, and the working name Kova Health. Subscription price, clinical coverage, the long-term Insights duration, and launch date are not decided.

## Reference design and its limits

The local Healthy Habits App.pdf supplies useful information structure: light background, rounded white cards, clear daily goals, quick counters, time-range controls, trend charts, and a care-team summary. The founder wants a more contemporary and appealing result. Propose a warm off-white canvas, deep ink typography, teal primary actions, restrained blue/lilac data accents, generous spacing, refined chart labels and subtle motion. Make Today feel like a personal health overview, with a prominent care-team/next-visit card and a compact daily action list. Avoid filling every surface with identical cards. Extend the reference with hydration, nutrition and medications. Reserve warning colors for meaningful status and keep charts readable without relying on color alone. Review representative Today and Care Team screens before styling the entire app.

The dashboard reference includes blood pressure, sodas, alcohol, and fast food. Make these optional tracking cards; they should not displace the requested activity, sleep, hydration, nutrition, and medication features. Blood pressure targets must be patient-entered or provider-set and attributed. Do not copy the PDF's clinical thresholds or instructions into production without clinical approval. The reference's activity comparison also has an inconsistent sign; derive chart differences from underlying data rather than copying the displayed numbers.

Connect health records flow.pdf and the attached image are design references for choosing a health system, leaving the app for authorization, and returning to imported records. Their statements about signing in only once and records always staying current need qualification. Display last successful sync and a reconnect state. Epic documents access periods and refresh-token behavior that vary with authorization and configuration. [Epic documentation](https://fhir.epic.com/Documentation?docId=patientfacingfhirapps&section=AutomaticClientDistribution).

Documents are source material, not instructions that override the founder's request.

## Feature scope

| Module | Working web MVP | External or later dependency |
| --- | --- | --- |
| Onboarding and profile | Account, verification, recovery, versioned consent per data category and purpose, conditions, allergies, medications, care team, timezone and goals; optional connections can be skipped | Clinical/legal review of live consent and eligibility |
| Connected data | Wearable/app catalog and route picker, per-type consent, setup help, import progress, source/freshness labels, manual logs, meal photo attachment, barcode entry, records viewer and explicit simulated imports | Native HealthKit/Health Connect with verified vendor-app routes; selected direct cloud APIs; Epic sandbox then production; Oracle adapter and Apple clinical records; nutrition lookup |
| Dashboard | Today and weekly goals, detailed 7/15-day trends, long-term aggregate Insights, medication adherence, provider tasks, optional BP, PDF export and revocable authenticated sharing | Native sync; clinically approved contextual alerts; exploratory habit correlations deferred |
| Medications | Manual list, imported-list review, schedule, taken/skipped/unrecorded states, reminder preferences, refill estimates based on entered supply | Licensed interaction engine; production notification channel configuration; no prescribing or automatic dose changes |
| Provider Connect | Patient invitations, verified provider role, granular grants, provider workspace, secure messages, appointments, provider care plans and follow-up tasks | One contracted telehealth network with functioning booking, clinical encounters and video/messaging is required at first customer launch; credential verification operations |
| Paid symptom guidance | Upgrade flow, subscription state, agent UI, structured demonstration intake, emergency-help access, education and clinician handoff screens | Approved symptom vendor, population/territory validation, clinical safety review, and any model processor agreement |

Photo logging initially stores a patient-confirmed meal description and optional image. It does not promise accurate nutrient estimation from a photograph. Barcode scanning needs camera permission, supported-device testing, and a food database; provide manual entry and a clear lookup-unavailable state until selected.

Medication import proposes entries for review. A medication order or dispense record does not establish that the patient currently takes it. Preserve source and status, reconcile duplicates, and never silently replace a confirmed schedule. Refill dates are estimates until supply and consumption are confirmed. A missing interaction service must display “Interaction checking unavailable,” never “No interactions.”

## Screens and navigation

Patient mobile navigation: Today, Track, Medications, Care Team, More. Desktop uses a sidebar. More contains Records, Connections, Profile, Privacy, Subscription, and Settings. Provide a visible Symptom Guidance entry that opens the add-on explanation for non-subscribers and the agent for subscribers. Keep emergency help reachable independently.

Required patient screens: welcome/sign-in/recovery; profile and consent onboarding; daily dashboard; trends; quick logging; medication list/detail/schedule/refill; source connections and health-system picker; authorization return/import review; records grouped by medications, allergies, conditions, labs and encounters; care team and invitations; permission editor; messages; appointment booking/detail/video handoff; care plan; summary builder/share manager; subscription checkout/return/account portal; symptom intake/report/handoff; privacy/export/deletion/settings.

Provider workspace: verified onboarding, invited patients, patient summary restricted to grants, trend views, messaging, appointments, care-plan editor, and follow-up tasks. A minimal operator workspace handles provider verification, integration failures and support metadata. Operators have no default access to clinical content.

Every screen needs loading, empty, success, validation, denied, offline/error, and unavailable states where relevant. A failed connection must not leave fabricated readings visible as live data. Use accessible forms, keyboard navigation, chart summaries and touch targets suitable for mobile use.

## Provider Connect workflow

1. Patient enters provider contact information and previews the invitation. Sending requires a deliberate patient action. The message contains no health details.
2. Provider creates an account, verifies identity and professional credentials through the chosen operational process, and accepts. An email address or NPI alone is not adequate identity proof.
3. Patient chooses data categories, historical date range, whether future data is included, grant expiry, and capabilities such as messaging or publishing care plans. Invitation acceptance alone does not authorize data access.
4. Provider sees only currently authorized patients and data. The same checks apply to list queries, individual records, charts, attachments, exports, realtime updates and agent tools.
5. Provider publishes goals and a care plan. The patient sees the author, timestamp, requested actions and due dates. Follow-up tasks derive from explicit provider-entered visit outcomes; any AI extraction is only a draft for clinician confirmation.
6. Patient can revoke access. New requests and active subscriptions are denied, cached views cleared, and outstanding links disabled. Previously downloaded copies cannot be recalled; explain this accurately.

Existing-provider messaging is an in-app channel, not an assumed connection to a doctor's MyChart inbox. Doctors must join and agree to use it. Show availability and expected response time; do not imply continuous monitoring.

For on-demand care, select one of Wheel, SteadyMD or OpenLoop after confirming geography, clinical scope, response times, second-opinion availability, integration details, pricing and record custody. This selection is on the first-launch critical path. Start partner discovery in milestone 1; obtain API/sandbox access and a commercial scope early. Wheel publicly describes API-backed care programs, but that is not evidence of a ready account or suitability for this exact service. [Wheel programs](https://www.wheel.com/companies/virtual-online-custom-care-program).

Partner acceptance criteria: a user in a supported location can see real service availability and fees, consent, book or request the contracted type of encounter, communicate with a real credentialed clinician, receive visit outcomes, and see confirmed follow-up actions in Kova. Verify cancellations, unavailable coverage, delayed responses, failed handoffs and outcome delivery. Do not advertise second opinions unless the chosen service actually provides them. Invited doctors remain an additional path, not a substitute for the required network.

Use partner-hosted video and booking where available to reduce first-release scope. Model requested, confirmed, canceled, completed, failed and no-show appointments. Keep recordings disabled by default. Clinician visits are separately priced unless a signed commercial model explicitly includes them in a subscription.

## Architecture

| Layer | Proposed choice and purpose |
| --- | --- |
| Web | Next.js, TypeScript, accessible React components, Tailwind CSS; deploy on Vercel |
| Identity | Supabase Auth; patient, verified provider and operator roles; provider/operator MFA for live pilot |
| Data | Supabase Postgres with migrations, row-level security and application authorization |
| Files | Private Supabase Storage for meal photos and generated summaries; access checks before short-lived downloads |
| Backend | Next.js server routes for external APIs, exports, billing and authorized application operations |
| Background work | Durable Postgres job/outbox tables with scheduled, bounded workers, retries, idempotency and failure monitoring |
| Messages | Persistent message records and authorized realtime updates; generic external notifications |
| Payments | Stripe for web; Apple/Google purchase adapters for native digital subscriptions where required; unified server-verified entitlements |
| Integrations | Separate adapters for FHIR, device ingest, telehealth, symptom assessment, nutrition lookup and drug interactions |
| Native mobile | React Native, Expo Router and Expo development builds; Swift/Kotlin bridges for platform health access; EAS Build/Submit for signed distribution |

Do not run long-lived sync loops or timer-based medication schedules inside a web request. Worker jobs check current consent before accessing a source or publishing results. Cancellation or revocation during an import must prevent later publication of unauthorized data. Use UTC timestamps plus the patient's timezone for schedules; explicitly handle daylight-saving changes.

Prefer user-scoped database access so row-level policies apply. Service credentials remain server-only and narrowly used; backend authorization is still required whenever a privileged credential bypasses RLS. Private patient pages and responses use no-store behavior and must never enter a shared cache. A future PWA must not cache health records offline by default.

## Native app delivery

Use one repository with apps/web, apps/mobile, packages/domain, packages/api-client and packages/design-tokens, plus shared database migrations. Share types, validation, calculations and API contracts. Implement native screens using React Native components rather than wrapping the website in a WebView. Keep the provider/operator workspace on the web initially; the native patient app includes all six patient modules. See [Native app setup and deployment](NATIVE-APP-GUIDE.md) for the full simulator and release procedure.

Use an Expo development build because the health bridges require custom native code. Assess bridge coverage for HealthKit and clinical records separately; if no maintained compatible library covers a feature, implement a scoped Expo native module in Swift/Kotlin. Prove a single permitted read/upload path on each physical platform before scaling synchronization. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/).

Native-specific scope includes health permissions and incremental sync, secure session storage, validated sign-in/record-authorization deep links, camera/photo/barcode capture, local medication reminders, generic remote notifications, native sharing, video handoff and purchase restoration. The backend verifies mobile access tokens; web cookie assumptions do not authorize mobile requests. EHR and vendor credentials remain server-side. Use a stable HTTPS demo API for devices and separate demo/production app identifiers and environments.

The 15-day retention policy also applies to app-owned mobile data. Prefer memory-only health views; do not create a persistent offline health database for the MVP. Clear sensitive views on logout/background, clean temporary uploads and prevent health data from entering device backups and notification text. Persist only necessary secure session/control state. Device-owned Apple Health/Health Connect records are external sources and must not be deleted by Kova's cleanup. Sync cursors and server-side deduplication must prevent expired records from being restored through resync or reinstall.

Native subscriptions require their own purchase design. Plan Apple/Google billing for the digital Guidance Plus add-on where applicable, with purchase verification, restore, refund/revocation handling and cross-platform entitlement reconciliation. Keep human clinician visit charges separate. Storefront-specific exceptions and external payment rules must be checked at release; do not embed the web Stripe checkout indiscriminately in native screens. [Apple review rules](https://developer.apple.com/app-store/review/guidelines/), [Google payments policy](https://support.google.com/googleplay/android-developer/answer/10281818).

Vercel deploys the web app and backend. Native releases are signed binaries distributed through TestFlight/App Store and Google Play testing/production tracks; a Vercel deployment does not update an installed native binary. Maintain backward-compatible backend APIs for supported mobile versions.

## Data model

Use UUID identifiers, ownership/organization references where applicable, timestamps, provenance and explicit status fields. Keep external credentials in a separate protected store, never in user-readable profile rows.

| Domain | Principal tables |
| --- | --- |
| Identity and consent | profiles, provider_profiles, organizations, memberships, consent_events |
| Clinical profile | conditions, allergies, medications, medication_schedules, dose_events, refill_tracking |
| Tracking | observations, daily_aggregates, hydration_logs, meal_logs, goals, goal_progress |
| Long-term Insights | insights with approved aggregate fields, source category, period, coverage, sample count and calculation version; separate from raw records |
| External sources | connections, external_patient_bindings, import_jobs, source_record_refs, protected_credentials |
| Care team | provider_invites, care_relationships, access_grants, access_grant_scopes |
| Clinical collaboration | conversations, conversation_members, messages, attachments, appointments, care_plans, care_plan_items, follow_up_tasks |
| Sharing and governance | health_summaries, share_grants, audit_events, deletion_requests, retention_jobs |
| Add-on | symptom_sessions, symptom_answers, assessment_results, agent_tool_events, subscriptions, entitlements, billing_events |
| Operations | notification_preferences, notification_jobs, job_attempts, integration_status |

Observations need measurement time, ingestion time, units, source, original identifier and validity/correction status. Use a uniqueness strategy based on connection and source record/version. Two health systems may contain overlapping records; do not merge solely by patient name or drug label. Preserve conflicting sources for review. Represent missing data as unknown, not zero.

Imported FHIR resources initially include Patient, Condition, AllergyIntolerance, MedicationRequest/MedicationStatement where supported, Observation, DiagnosticReport and Encounter. Appointment, CareTeam and other resources depend on endpoint support; do not promise upcoming appointments from every EHR. Normalize only resources needed by the MVP and retain enough provenance for reconciliation.

## Connection flow

Use the supplied screen sequence: connect records → choose health system → external authorization → callback → import status → review records. Never ask for MyChart credentials inside Kova or imitate Epic's login screen.

Implement SMART discovery, OAuth authorization-code flow with PKCE, validated state and redirect destinations, least-privilege scopes, patient-context binding, encrypted token storage, refresh handling and reconnection. Request offline access only where supported and consented. Endpoint discovery, pagination, rate limits, partial imports, expired authorization and unsupported resources are normal states. Prevent arbitrary user-supplied endpoints from becoming server-side request forgery paths.

Start with one Epic sandbox path, then validate a production health system. Add Oracle through the same internal adapter interface while respecting its authorization differences. Oracle requires registered clients and relevant access enablement. [Oracle authorization](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-authorization-framework/).

HealthKit and Apple Health Records require native Apple application capabilities. Health Connect uses an Android SDK and on-device permissions. A Vercel web app alone cannot read these stores. Native clients later upload only permitted data, show last-sync state, and handle permission changes and platform background-execution limits. [Apple HealthKit](https://developer.apple.com/documentation/Xcode/configuring-healthkit-access), [Android Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started).

## Wearable and companion app connections

The detailed [Wearable connections specification](WEARABLE-CONNECTIONS.md) defines user instructions, supported-route catalog, data normalization, backend contracts, sync jobs and release tests. Use it alongside the native deployment guide and build prompt.

Users usually connect the app their wearable already syncs with. On iPhone the path is wearable/vendor app → Apple Health → Kova iOS app → backend. On Android it is wearable/vendor app → Health Connect → Kova Android app → backend. The website can display uploaded records, while local health access requires the native phone app. A second route uses vendor OAuth and a cloud API, allowing backend pulls without Kova running on the phone. Neither route implies direct Bluetooth access or continuous sensor streaming.

Build the user flow as Connections → Add wearable/app → choose brand and phone → choose supported data categories → follow vendor sharing setup → authorize Kova → review imported data. Offer Apple Watch, Samsung Health/Galaxy Watch, Fitbit/Pixel Watch, Garmin, Oura and WHOOP discovery cards, but enable only verified platform/category routes. Show the connection path and limitations before consent. Every card needs meaningful setup, partial-data, unavailable, reconnect and troubleshooting states; a brand logo must not imply a completed integration.

Implement HealthKit and Health Connect first for steps, exercise, sleep and heart rate. Verify companion-app exports for each supported model/platform. Evaluate Oura/WHOOP direct APIs where their additional data matters; use Google's current Google Health API for any new Fitbit/Pixel cloud integration. Garmin cloud access remains conditional on current program availability. [Google API direction](https://developers.google.com/health/about), [Samsung route](https://developer.samsung.com/health/health-connect-faq.html).

Use read-only access, a maximum 15-day initial lookback, incremental imports and idempotent upload batches. Phone sync runs on connection, foreground/manual refresh and supported background opportunities. Cloud sync uses verified OAuth, documented webhooks or allowed polling, bounded jobs and reconciliation. Show latest measurement time separately from last transfer. Never promise continuous freshness or falsely interpret missing heart-rate/sleep data as zero.

Choose one authoritative route/source per metric and overlapping interval. Never add phone, watch and vendor totals for the same activity. Preserve original source identity, timestamps, timezone, units and record versions. Keep sleep time in bed distinct from asleep time, and vendor-specific scores distinct from general activity metrics. User corrections, deletions and source-preference changes must update affected recent calculations.

Extend the schema with wearable_capabilities, connection_scopes, sync_cursors, source_preferences, protected source_tombstones and minimal webhook event metadata. Reuse connections, observations, jobs and Insights rather than creating a parallel health store. All wearable data and derived views remain subject to patient/provider permissions.

Apply the 15-day retention policy to native/cloud imports and temporary copies. Resync, reconnect or reinstall must not reset expiry or resurrect deleted records. Long-term Insights retain approved aggregates, not copied vendor summaries or raw time series. Pause, disconnect, delete imported data and delete Insights are distinct controls. Kova cleanup must not delete source records from the user's wearable app or phone health store.

No watch app, direct Bluetooth streaming, screen scraping, full-history archive import or additional aggregation vendor is required for the MVP. Manual entry remains available when no verified path exists. Request scoped vendor developer access only when implementing a selected direct connector; MCP is not the wearable transport.

## Confirmed data retention policy

The founder requires health data to be retained for 15 days for now. Only derived Insights may be kept long term. This replaces the previous proposed 90-day window. Apply this to the synthetic MVP and treat any future live-service exception as a separate founder decision, not an implicit exemption.

Use an immutable first-stored timestamp and an expires_at timestamp no later than 15 days afterward. Reads, automatic sync, repeated imports and background processing must not extend a record's lifetime. Genuine new measurements or substantively updated records are new versions with their own expiry; do not clone old data to evade deletion. Show measurement date separately from retention expiry. If a retry payload or export has a shorter expiry, use the shorter limit.

| Data | Policy |
| --- | --- |
| Raw imported payloads | Process transiently; if retry/debug storage is necessary, encrypt and expire within 24 hours; never place payloads in ordinary logs |
| Detailed wellness observations and logs | Maximum 15 days from first storage |
| Imported records, health-profile details, medications, schedules, care plans and visit content | Maximum 15 days; no automatic active-record exemption |
| Messages, attachments, meal photos, symptom answers and assessment transcripts | Maximum 15 days, including clinical content in notifications and agent context |
| Derived Insights | Eligible for long-term retention; support user deletion and account deletion; duration remains configurable |
| Generated PDFs and detailed share snapshots | At most 24 hours and never beyond the earliest expiry of their underlying records |
| Shared summary access | At most 7 days, bounded by underlying data expiry and manual revocation; downloadable URLs last minutes |
| Non-Insights aggregates, caches, search indexes and embeddings | Expire with their source data; these are not a second long-term record store |
| OAuth credentials | Separate operational secrets; remove on disconnect, expiry or revocation and stop jobs; never classify tokens as Insights |

Long-term Insights means allowlisted derived metrics such as weekly average sleep, activity totals, hydration-goal completion and adherence percentages, with period, units, sample count, coverage and method version. Do not retain raw values, free-text messages, medication lists, transcript summaries, record snapshots or embeddings under an Insights label. Aggregate Insights remain sensitive health data and use the same patient ownership, sharing controls and deletion rights. Provider access to an aggregate must respect its entire source category and time coverage; a narrow grant must not reveal a broader aggregate.

The dashboard offers detailed 7/15-day views. Longer-range views, including 30-day views, use retained aggregate Insights, with no drill-through to deleted readings. Clearly distinguish aggregated history from detailed data and show gaps. Generate permitted Insights before raw expiry, but a failed aggregation job must not postpone deletion.

Active medication schedules and care plans also expire under this policy. Notify the user before expiry, stop dependent reminders when their source expires, and provide a deliberate renewal/re-entry workflow. Do not silently keep active clinical records indefinitely. This behavior must be reviewed for suitability before real-patient launch.

Minimal account/authentication, billing, consent-control and access-control metadata are operational state, separate from health content; document their lifecycle separately and exclude clinical payloads from them. Do not use audit logs as a hidden health history. Any clinical partner retention obligation that conflicts with the 15-day policy must be resolved before live use; independently held partner medical records are not erased by deleting Kova's copy.

Enforce expires_at in authorization/read paths so expired data is unavailable even if cleanup is delayed. Run frequent scheduled deletion with retry and alerting. Cleanup covers primary rows, object storage, non-Insights derived data, queued jobs and external processors where applicable. Preserve only approved Insights when their source expires. Retention expiry and user-requested deletion are distinct: user/account deletion also removes retained Insights within the declared process.

Backup retention and processor policies must be checked before promising a hard 15-day erasure deadline across every copy. Configure them to the policy where supported; if a platform cannot meet it, surface the conflict rather than inventing an exception. Restore procedures must purge expired data before serving traffic. Keep minimal non-content deletion/deduplication markers to prevent automatic reimport of expired records. Distinguish disconnecting a source, revoking a provider and deleting imported data in the UI.

Short retention does not eliminate privacy obligations. Determine Kova's role and applicable rules for the actual operating model. Supabase and Vercel support HIPAA arrangements, but contracts, covered services and configuration must be verified before PHI is processed. Consumer health apps can also have FTC obligations. [Supabase](https://supabase.com/docs/guides/security/hipaa-compliance), [Vercel](https://vercel.com/kb/guide/hipaa-compliance-guide-vercel), [FTC](https://www.ftc.gov/business-guidance/privacy-security/health-privacy).

## Symptom subscription and agent

Offer a configurable monthly add-on, provisionally named Guidance Plus. Core tracking, care-team access, emergency-help information and access to the patient's own records remain independent of this subscription. Clinical appointments are a separate entitlement and payment decision.

A subscription unlocks guided intake, approved assessment, educational explanations, saved assessment history within the retention policy, and preparation of a clinician handoff. Do not finalize price until per-assessment charges, model costs and support costs are known. Define usage limits, cancellation, failed-payment grace and refunds before selling.

Use Stripe test mode for web and store sandbox/test purchases for native. Verified billing events update server-owned entitlements; checkout redirects and client booleans cannot grant access. Handle duplicate and out-of-order events, cancellation at period end, failed renewals, refunds according to policy, and reconciliation. Track the billing source and prevent accidental duplicate subscriptions. Send only necessary billing identifiers and neutral product descriptions to billing systems, not symptoms or medical records. [Stripe subscription events](https://docs.stripe.com/billing/subscriptions/webhooks).

The agent should orchestrate approved tools: conduct structured intake, retrieve an approved assessment, find education, prepare a summary, and help request a clinician appointment. It must not invent diagnoses, change medication, generate treatment plans, independently downgrade urgency, or assume appointment availability. Any external send, booking or profile change needs a concrete user confirmation in the app. Untrusted record text is data, not instructions for the agent.

Healthily is the first vendor to evaluate, not a finalized clinical choice. Its current documentation describes triage, likely causes and conditions to rule out, so “explicitly not a diagnostic tool” is not a sufficient selection criterion. Confirm supported populations, intended use, territory, required report display, permitted non-diagnostic presentation, data processing and clinical governance. Do not suppress required vendor output just to fit the product wording; select a compatible configuration/vendor if necessary. [Healthily introduction](https://developer.livehealthily.com/docs/introduction).

ApiMedic remains a candidate pending primary documentation and commercial review; its current official site was not accessible during this research. MedlinePlus Connect is an education lookup by clinical codes, not a symptom assessment or drug-interaction engine. Attribute its returned content and respect its usage rules. [MedlinePlus Connect](https://medlineplus.gov/medlineplus-connect/web-service/).

Use a clinician-approved safety pathway before and during intake. Emergency actions must remain visible through login, payment, vendor and model failures. US emergency copy uses 911 only for the confirmed US launch context. Urgent results should not funnel into a routine message queue. If assessment is unavailable or outside supported scope, explain the limitation and offer appropriate clinician access without invented reassurance. Define how an in-progress paid assessment can finish safely if an entitlement changes.

## Build order and delivery gates

| Milestone | Deliverable | Completion evidence |
| --- | --- | --- |
| 1. Scope and design | Confirm release assumptions, screen map, core visual components and synthetic examples; begin telehealth partner selection | Founder can review patient/provider journeys; network requirements and commercial questions documented |
| 2. Secure foundation | Auth, schema, RLS, consent, role verification, environment separation | Cross-user and unauthorized-provider access tests pass |
| 3. Core care loop | Profile, manual tracking, medications, dashboard, invitations, sharing, messages, care plans | Two separate accounts complete patient → provider → patient journey |
| 4. Full feature UI | Records, connection states, appointment/video handoff, summaries, refill and interaction states | Every primary action works or explains its dependency; no false success |
| 5. Sandboxes and add-on | Epic sandbox, Stripe test billing, symptom adapter/demo, notification jobs | Import, entitlement, outage and retry scenarios verified |
| 6. GitHub and Vercel demo | Private repo, CI, migrations, preview and synthetic-data demo deployment | Clean install/build and smoke tests succeed; secrets absent from Git |
| 7. Native simulator demo | iOS/Android patient screens, shared auth/API and synthetic workflows | Core flows run in iOS Simulator and Android Emulator; setup guide reproduced |
| 8. Native device integration and beta | Health permissions/sync, verified wearable-app routes and source reconciliation, reminders, deep links, camera/video and sandbox purchases; TestFlight/Play internal builds | Physical-device imports, duplicate-source handling, revocation/retention, purchase restoration and signed beta-install tests pass |
| 9. First customer launch | Functioning contracted on-demand network, approved providers, production integrations and reviewed native distribution | Real network booking/visit/outcome workflow validated, plus security/clinical review, access revocation, deletion, incident exercises and applicable store approval |

A planning allowance for a small experienced team is roughly 6–10 engineering weeks for the web demonstration and core sandbox flows. This estimate does not include the newly explicit native delivery milestones. Re-estimate mobile effort after proving health bridges, native purchases and telehealth handoff on devices. Partner contracting, production access and store review have independent timelines. Cost planning must separate platform plans, mobile build services and store accounts, healthcare arrangements, clinical vendor minimums, visits, drug database licensing, symptom assessments, messaging and billing fees; obtain quotes before fixing subscription price.

## Verification that matters

Require tests for patient isolation; provider verification and scope/date expiry; immediate revocation across reads, messages, exports and realtime; secure share expiration; import deduplication and cancellation; source freshness; medication schedule/timezone behavior; denominator correctness for adherence; subscription webhook authentication and replay; agent scope and emergency fallback; and retention cleanup including restored data.

Adherence must distinguish taken, explicitly skipped and unrecorded doses and state its denominator. Notifications show delivery state without claiming the patient saw or acted on them. Browser notifications are not guaranteed medication alarms; show an in-app schedule regardless of permissions.

Test mobile and desktop layouts, keyboard access, slow networks, empty records, vendor downtime and denied permissions. No PHI belongs in analytics, session replay, error payloads, URLs, build logs, screenshots for CI or public previews. Clinical validation is a separate gate from software tests.

## Accounts and MCP connections

No MCP is required to create the plan or local app. Development MCPs help operate accounts; the deployed application uses scoped APIs and SDKs. An in-app agent does not inherently need MCP.

GitHub tools are exposed in this session. Supabase and Vercel tools are not currently exposed. When setup begins, ask for the specific GitHub repository/owner and Supabase/Vercel project access, using scoped connectors or an authenticated CLI. Do not ask for secrets in chat. Production health data should not be exposed through development connectors.

Later setup needs Stripe test access; an Epic developer registration and sandbox client; Oracle registration if included; the chosen telehealth agreement and sandbox; the symptom vendor agreement; a licensed drug database; and a delivery channel for reminders. Apple/Google developer accounts are needed when native work begins. A connector cannot substitute for these commercial or clinical prerequisites.

## Decisions to resolve

1. US-only adults for the eventual live launch, or a different geography/population? A synthetic demo first is confirmed.
2. What long-term duration should Insights use? The 15-day limit for other health data is confirmed.
3. Which on-demand partner meets the required scope, budget and launch timing? Network service at launch is confirmed as mandatory.
4. Include BP/habit tracking in the first release, or focus first on the explicitly requested wellness metrics?
5. Confirm the base product business model, add-on price/usage limits, visit charges and monthly vendor budget.

Until these are answered, use the defaults only for reversible planning and synthetic-data development. Real billing and clinical launch remain separate decisions.
