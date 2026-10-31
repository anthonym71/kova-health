# Wearable connections and data synchronization

Kova should help users connect the health data their wearable already records, without requiring a separate Kova watch app. Start with Apple Health on iPhone and Health Connect on Android. Add vendor cloud connections when the user needs browser-only access or information that the phone health platform does not expose. All connections are read-only for the MVP.

This is an implementation specification, not a claim that these connections are already built. Vendor capabilities were researched on October 31, 2026; validate the exact model, app version, territory, account/membership and data types before advertising support. Retain Kova health data for at most 15 days; only approved derived Insights may remain long term.

## 1 Connection methods

| Method | Data path | User requirement | Kova implementation |
| --- | --- | --- | --- |
| iPhone health connection | Wearable → vendor app/Apple Watch integration → Apple Health → Kova iOS app → backend | Wearable is synced; selected categories reach Apple Health; user allows Kova to read/upload them | Native HealthKit adapter |
| Android health connection | Wearable → vendor app → Health Connect → Kova Android app → backend | Vendor app can write the selected categories; user permits both links | Native Health Connect adapter |
| Vendor cloud connection | Wearable → vendor app/cloud → vendor API → Kova backend | Supported vendor account, consent and available developer access | Server-side OAuth adapter with supported polling/webhooks |
| Manual fallback | User enters a measurement in Kova | No compatible integration needed | Source explicitly labeled manual |

The phone platforms are local data stores, not cloud APIs that Vercel can query. A user can view already uploaded data on the website, but a web Sync action cannot force an offline iPhone to read HealthKit. Vendor cloud connections can work without Kova running on the phone, but the wearable still has to deliver its data to the vendor first.

Direct Bluetooth pairing, continuous sensor streaming and separate watchOS/Wear OS applications are outside this MVP. A Bluetooth connection alone does not grant access to a wearable's historical database. If these features are later requested, plan device-specific SDKs/protocols, permissions, pairing and battery tests separately. Do not scrape vendor apps, collect vendor passwords or use undocumented private APIs.

## 2 Supported ecosystem catalog

The UI lists brands in familiar terms but explains the actual connection route. A brand card is not a guarantee that every metric is available. For each route, store supported platform, supported categories, setup instructions, known limitations, required account conditions and a verified-on date in a capability registry.

| Wearable or app | Recommended initial path | Direct connection or limitation |
| --- | --- | --- |
| Apple Watch | Apple Watch → Apple Health → Kova on iPhone | No general browser HealthKit connection; no Kova watch app required for this route |
| Samsung Galaxy Watch / Samsung Health | Samsung Health → Health Connect → Kova on Android | Validate device-specific export; do not promise Samsung-only scores or medical features |
| Fitbit / Pixel Watch | Google Health companion app → Health Connect on Android; supported Apple Health sharing on iPhone | Evaluate Google Health API for direct cloud access; do not build a new legacy Fitbit Web API integration |
| Garmin | Garmin Connect → Apple Health on iPhone, or Health Connect on supported Android versions | Garmin cloud integration is conditional on current developer-program access and terms |
| Oura Ring | Oura app → Apple Health or Health Connect | Oura OAuth API for supported vendor-specific data; membership and application approval conditions need checking |
| WHOOP | Direct WHOOP OAuth API candidate; offer phone-health routing only after confirming the current vendor integration and categories | Sleep/workout/recovery are distinct from continuous raw heart-rate streaming |
| Other supported health apps | Apple Health/Health Connect, only for categories the app actually writes | Show an unsupported-route state when no verified path exists |

Samsung documents the Galaxy Watch → Samsung Health → Health Connect path, including activity, sleep and heart rate. Phone and watch sync timing can differ. [Samsung integration FAQ](https://developer.samsung.com/health/health-connect-faq.html).

Google's current documentation identifies Google Health API as the successor to Fitbit Web API. Keep the UI searchable by Fitbit and Pixel Watch while using current API contracts. [Google Health API](https://developers.google.com/health/about). Google also documents both [Health Connect sharing](https://support.google.com/googlehealth/answer/14506680?hl=en) and [Apple Health sharing](https://support.google.com/googlehealth/answer/17037331).

Garmin supports selected exports to [Apple Health](https://support.garmin.com/en-US/?faq=lK5FPB9iPF5PXFkIpFlFPA) and [Health Connect](https://support.garmin.com/en-US/?faq=JToBEy0jfe6pIygark2Ui5). Its Health Connect support page specifies Android 14 or later. Its Apple route has limitations, including reduced detail for heart rate during timed activities and no GPS track export. The Garmin developer Health API page could not be reliably retrieved during this review; do not promise access, pricing or approval time for that cloud route.

Oura documents [Apple Health](https://support.ouraring.com/hc/en-us/articles/360025438734-Apple-Health-Integration) and [Health Connect](https://support.ouraring.com/hc/en-us/articles/10786105824531-Health-Connect-by-Android-Integration) sharing. Membership and device-generation conditions apply. For direct access, use the current API and OAuth; verify application review and user-limit requirements before a multi-user launch. [Oura API registration](https://cloud.ouraring.com/docs/), [OAuth](https://cloud.ouraring.com/docs/authentication).

WHOOP provides user-authorized cloud endpoints, but its support documentation says continuous heart-rate data is not provided through that API. Do not imply a complete heart-rate time series from summary endpoints. [WHOOP API](https://developer.whoop.com/api/), [WHOOP limitations](https://developer.whoop.com/docs/developing/support/).

## 3 User journey in Kova

1. User opens More → Connections → Add wearable or health app. Show this shortcut during onboarding and beside empty dashboard metrics.
2. Ask which wearable/app they use and identify the phone platform. Offer a platform switch for someone browsing on a computer. Do not infer ownership by silently inspecting installed apps.
3. Recommend a verified route and show it plainly, such as “Garmin Connect → Apple Health → Kova.” Explain which categories can arrive, that syncing may be delayed, and that manufacturer-specific scores may require a direct integration.
4. User selects steps, activity/workouts, sleep and/or heart rate. Show optional categories separately. Explain Kova cloud storage, provider sharing as a separate opt-in, the initial recent-data import and the 15-day retention limit before requesting OS/vendor permission.
5. Provide the relevant vendor setup recipe. Offer Open app/Open settings only when the link is documented and supported; otherwise show instructions and the official help link. Do not fabricate settings deep links.
6. Launch the OS permission sheet or the genuine vendor OAuth screen. Users may skip or grant only some categories. A callback alone is not proof of data access.
7. Import the permitted recent records. Show progress by category, source, latest measurement and last successful transfer; partial results can appear without waiting for every category.
8. Let the user review the first results and resolve preferred-source conflicts. Show “No data received yet” for empty results, not zero or an invented connected reading.
9. The connection detail screen provides Sync now, setup help, permission management, preferred sources, Pause uploads, Disconnect and Delete imported data. Deleting Insights is a separate explicit choice.

On the website, local phone routes show “Set up in the Kova mobile app.” Provide an app link or QR code without credentials or health data. Direct cloud routes can launch OAuth from the website. After mobile sync, the shared backend makes the same authorized data visible on web.

Required screens: connection catalog; brand/platform route picker; category/consent selection; vendor setup instructions; native authorization or OAuth return; import progress/results; connection detail; source-priority editor; troubleshooting; disconnect/delete confirmation. Keep the design consistent with the main app rather than showing technical API settings to patients.

Connection states include available, setup needed, requesting access, importing, receiving data, partially available, no recent data, paused, reconnect required, unsupported and service unavailable. Track authorization state and data freshness separately. On iOS, read permission can be unknown; do not display a precise granted/denied status when HealthKit does not reveal it.

## 4 Platform and vendor setup recipes

### Apple Watch on iPhone

1. Pair the watch using Apple's normal setup and confirm a recent measurement is visible in the iPhone Health app.
2. In Kova, choose Apple Watch → Connect through Apple Health.
3. Choose categories, accept Kova's cloud-processing consent and complete the HealthKit read-permission sheet.
4. Return to Kova and run the initial sync. Review the latest measurement and source.
5. If empty, check recent measurements and Kova access in Health settings. Do not direct users to repeatedly reinstall or promise that every empty result means permission denial.

Read requests need individual sample types, app capabilities and purpose descriptions. HealthKit protects read-authorization status; a successful authorization request does not prove every category is readable. [Apple authorization](https://developer.apple.com/documentation/HealthKit/authorizing-access-to-health-data).

### Samsung and other Android companion apps

1. Sync the wearable in its own app and confirm the desired measurement there.
2. Enable that app's write access to the relevant Health Connect categories. Samsung documents Settings → Health Connect → App permissions → Samsung Health; menu labels can change.
3. In Kova, select the wearable/app → Connect through Health Connect, choose categories and grant Kova read access.
4. Run Kova sync and check actual records. The vendor-to-Health Connect permission and Health Connect-to-Kova permission are independent.
5. If missing, inspect each link in order; granting Kova access cannot make a vendor export a category it does not support.

Check SDK availability, required updates and feature-level support. Foreground reads are the dependable starting path; background reading needs supported permissions. Request only the history required by the initial 15-day lookback rather than blanket historical access. [Android read guidance](https://developer.android.com/health-and-fitness/health-connect/read-data).

### Fitbit and Pixel Watch through the Google Health app

Sync the wearable, then use the companion app's Connections → Partner apps flow to configure the phone-health integration. Enable exports for selected fitness categories and grant Kova the matching reads. Keep older Fitbit naming as a search alias. Exact menu labels and category availability must be checked against the installed version; the product should link to Google's current setup instructions rather than assume old Fitbit screens remain available.

### Garmin through the phone health platform

Sync the wearable in Garmin Connect, enable Apple Health sharing on iPhone or supported Health Connect sharing on Android, then grant Kova reads. On iPhone, Garmin's guide notes that Connect needs to be foregrounded for transfer to Apple Health. In troubleshooting, prompt the user to open and sync Garmin Connect before retrying Kova. Display available dates; do not promise all 15 days of history if the vendor exports a shorter window.

### Oura through the phone health platform

Sync the ring, open Oura Settings → Data Sharing and select Apple Health or Health Connect. Choose the categories to export, then allow Kova to read those categories. Check the ring/account's membership eligibility. If a score visible in Oura does not appear in the phone health store, explain the limitation rather than inventing an equivalent score.

### A direct vendor connection

Choose a live supported cloud connector, review scopes and retention, and select Continue to vendor. Authenticate only on the vendor's screen, approve access and return to Kova. Kova validates the callback, binds the vendor account to the signed-in Kova account and starts import. Show the account being linked and require deliberate confirmation before replacing an existing account. A successful direct connection does not require granting access to unrelated phone health categories.

## 5 What data to import

| Metric | MVP representation | Normalization rule |
| --- | --- | --- |
| Steps | Interval/day count with coverage and source | Do not add overlapping phone/watch/vendor daily totals |
| Exercise | Sessions, type, start/end and duration | Keep exercise minutes distinct from proprietary activity/strain points |
| Sleep | Sessions, asleep duration and stages when available | Separate time in bed, awake time and asleep time; count naps explicitly |
| Heart rate | Supported timestamped samples or explicitly labeled summaries | Preserve bpm units and sample resolution; never turn an average into a continuous signal |
| Optional later | Distance, energy, resting heart rate and supported HRV | Preserve active versus total energy; distinguish HRV methods and measurement context |
| Vendor scores | Optional direct-API fields with vendor attribution | Preserve score scale/version; do not combine different brands' recovery scores as equivalent |

Water, meals and medication adherence remain manual/imported through their own features unless a verified source exposes exactly those data types. A wearable is not evidence that a medication was taken. Do not request GPS routes, reproductive data, ECG, oxygen saturation or other sensitive categories merely because a connector offers them. Expand permissions only for an approved feature.

## 6 Native synchronization implementation

The first import reads at most the most recent 15 days of available, consented measurements; it is a lookback limit, distinct from the maximum 15 days of Kova storage after first ingestion. Show incomplete history honestly. No full-history import should be performed merely to manufacture long-term Insights on first connection.

For iOS, use incremental HealthKit queries with per-type anchors and deletion handling. Background notifications should trigger bounded reads when the OS allows; they are not a real-time service guarantee. For Android, use per-type Changes tokens, pagination, updates/deletions and a bounded recovery import if a token expires. Persist cursor advancement only after the corresponding batch is acknowledged by the server. [Health Connect synchronization](https://developer.android.com/health-and-fitness/health-connect/sync-data).

Upload bounded batches over authenticated HTTPS. Validate category consent, timestamp, units, source ownership, size and record identity server-side. Recheck consent on commit so revocation during upload cannot publish records. Advance retry-safe cursors, return accepted/rejected counts and do not log raw payloads. Keep data in memory for processing; pause uploads when offline rather than accumulating an unbounded plaintext queue.

Recommended product triggers are first connection, app foreground/resume, explicit Sync now and supported background events. Coalesce repeated requests, serialize work per source, and back off when battery/network/platform restrictions apply. A configurable freshness label is a product indicator, not a claim of continuous monitoring. Show both the latest measurement time and the last successful transfer; retrying an empty connection must not make old data look fresh.

## 7 Cloud synchronization implementation

Each live cloud adapter requires registered credentials, approved redirect URLs, vendor terms and verified scopes. Use authorization-code OAuth with state validation, PKCE where supported, encrypted server-side tokens, refresh rotation with a per-connection lock and explicit reconnect handling. Do not force all vendors into an identical scope or token-expiry model.

Webhook handling should validate vendor-specific authenticity, persist minimal delivery metadata, acknowledge promptly, then enqueue a bounded fetch. Treat events as notifications unless the documented contract supplies authoritative records. Support duplicate, delayed, reordered, updated and deleted events, as well as pagination, rate limiting and Retry-After. Recheck consent before fetch and before publication. Reconcile periodically where vendor terms permit, because webhooks can be missed. WHOOP documents this notification-plus-fetch pattern and its limitations. [WHOOP webhooks](https://developer.whoop.com/docs/developing/webhooks/).

Use durable job records and bounded workers; avoid long-running loops inside Vercel requests. Cancellation stops queued imports. Ignore stale callbacks/events after disconnect. Never let a forged vendor account ID select a patient. Cloud raw payloads should be transient; any retry storage follows the existing shorter 24-hour limit.

## 8 Data model and backend contracts

Extend existing connections and observations; do not create a disconnected second health database.

| Entity | Required information |
| --- | --- |
| wearable_capabilities | Route/platform, categories, availability, help URL, verified date and conditions |
| connections | Patient, adapter, platform, external account binding, consent version, status, sync times and cancellation generation |
| connection_scopes | Requested/known-granted categories, upload consent, observed data availability and unknown authorization states |
| sync_cursors | Connection, device/type, opaque cursor, acknowledged position and reset status |
| sync_jobs and webhook_events | Idempotency key, attempt/backoff/status, minimal vendor event identity; no clinical log payload |
| observations and exercise/sleep sessions | Source ID/version, originating app/device when available, measurement interval/timezone, value/unit, first_stored_at and expires_at |
| source_preferences | Patient, metric, chosen authoritative route/source and effective dates |
| source_tombstones | Minimal protected non-content IDs/hashes needed to prevent duplicate resurrection |
| insights | Approved derived metrics with period, coverage, provenance category and calculation version |

Proposed application endpoints: GET /api/connections/catalog; POST /api/connections; POST /api/connections/{id}/oauth/start; vendor-specific callback endpoints; POST /api/wearables/batches; POST /api/connections/{id}/sync; PATCH /api/connections/{id}/preferences; POST /api/connections/{id}/pause; DELETE /api/connections/{id}; and signed POST /api/webhooks/wearables/{vendor}. Define delete-data and delete-Insights operations explicitly rather than overloading disconnect.

Every patient endpoint verifies identity and connection ownership. The web sync endpoint schedules a cloud pull or explains the mobile dependency; it must not pretend to remotely read an unavailable phone. Provider reads continue through the existing permission-filtered views, never direct provider access to patient vendor tokens.

## 9 Avoid double counting and misleading comparisons

Deduplicate identical records using the source's stable record ID/version and patient/source identity. Treat transport connections and real measurement origin separately: reconnecting must not reset a record's retention or identity. A single measurement can travel both through a vendor API and a phone health store without sharing an ID.

Use one authoritative source/route per metric and interval. Prefer platform aggregation when its supported semantics fit the calculation; Health Connect recommends aggregate reads for cumulative steps to avoid duplicate counting. Do not add those totals again to raw or cloud totals. For Apple and vendor streams, verify their aggregation semantics with overlapping phone/watch fixtures; never assume raw sums match the native dashboard.

When identities cannot be reconciled reliably, keep the chosen source, flag the overlap and let the user change the preference. Do not silently merge based only on matching timestamps or values. Use source-aware session overlap rules for sleep/workouts; do not sum two brands' descriptions of the same sleep. Preserve different HRV methods and vendor scores as different metrics.

Keep UTC timestamps and source timezone/offsets. Apply a documented local-day rule for steps and sleep, including midnight, naps, DST and travel. Recompute affected recent aggregates on correction; do not silently re-bin all historical Insights when the user travels. Raw vendor daily summaries are still health records with 15-day expiry, not automatically exempt Insights.

## 10 Retention and disconnection behavior

Each record retains its original Kova first-stored expiry across refresh, reconnect, duplicated routes and reinstallation. Retention rules apply to temporary files, batch payloads, caches and server storage. Preserve only allowlisted derived Insights, such as weekly sleep averages and goal-completion rates. They must not be disguised raw time series, copied vendor reports or full transcript summaries.

Build Insights incrementally and idempotently before raw data expires. Track calculation version and coverage without retaining raw contributions long term. When a source correction/deletion arrives within the live window, repair the data and affected Insights. If a previously retained aggregate can no longer be corrected without deleted detail, mark it invalid/remove it rather than refetching expired history or presenting it as verified.

Pause stops new Kova uploads. Disconnect stops jobs and removes/revokes cloud tokens where supported; explain how to revoke OS/vendor access too. Delete imported data removes Kova's copies and dependent non-exempt derivatives; an explicit delete-all/account deletion also removes Insights. Never erase original records from Apple Health, Health Connect or the vendor merely to apply Kova retention.

Minimal deduplication markers are protected operational metadata, not public identifiers or clinical archives. Define their lifecycle and remove them with account deletion. Explain that Kova retention does not control the user's wearable app or independent provider records.

## 11 Troubleshooting and acceptance tests

The user-facing troubleshooting order is: measurement exists on wearable → appears in vendor app → appears in chosen phone health store or vendor cloud → Kova has appropriate consent/access → last Kova transfer succeeded → preferred-source policy includes the record. Do not conflate “device paired,” “account authorized” and “data received.”

Test at least one physical Apple Watch/iPhone path and one Android wearable/companion-app path before claiming those routes work. Use Oura/Garmin/Google companion samples as available for additional certified routes. Test cloud adapters with authorized vendor accounts; simulator fixtures alone cannot certify them.

Required scenarios:

- Partial permission, no records, unsupported type, locked phone, low-power state and vendor not yet synced.
- Data arriving late, source correction/deletion, pagination, expired cursor, repeated batch and network loss before acknowledgement.
- Apple Watch plus iPhone overlapping steps; the same vendor connected through both cloud and platform routes; two sleep trackers.
- DST/travel, overnight sleep, naps, missing samples, differing units and active/total calories.
- Wrong-account callback, forged webhook, replay, token refresh race, expired/revoked token and disconnect during import.
- Exact 15-day boundary, no expired reads during cleanup failure, reconnect/reinstall not restoring expired data, retained Insights and account deletion.
- Revoked provider grant blocking wearable values, aggregate views, exports and agent access.

A route is ready only when an actual test measurement arrives with correct origin, value, units and time; repeated sync does not double-count; a failure produces an honest status; disconnect stops future ingestion; and expiry removes the record while an allowed Insight behaves as specified.

## 12 Delivery sequence and required access

1. Build the connection catalog, setup screens and synthetic adapters with all states.
2. Implement HealthKit and Health Connect for the four core categories; validate on physical devices and preserve manual tracking.
3. Certify selected vendor-to-platform routes and publish only the tested category matrix in the app.
4. Add one direct cloud adapter after choosing the target audience. Oura/WHOOP are candidates for vendor-specific information; Google Health API is the current Fitbit/Pixel route; Garmin requires current program confirmation. The remaining cloud connectors stay clearly unavailable until implemented.
5. Add permission/source-conflict, retention and device tests to release gates; monitor connection success, consented import success, duplicate suppression and failures without health-payload analytics.

No MCP is required for users to connect wearables or for runtime data transfer. Native SDKs and vendor OAuth/APIs perform these operations. At implementation time request the necessary Apple/Google app setup, scoped cloud-vendor developer access, approved callback domain and test accounts/devices. Keep credentials in secure configuration, never chat or Git. A development connector cannot substitute for vendor approval or patient consent.
