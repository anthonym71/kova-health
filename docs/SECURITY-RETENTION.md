# Security and retention notes

## 15-day retention (confirmed policy)

- Every health-content table carries immutable `first_stored_at` and `expires_at`
  (`expires_at <= first_stored_at + 15 days`, enforced by DB check constraints).
- Reads, syncs and re-imports never extend expiry. RLS read policies include
  `expires_at > now()`, so expired rows are invisible even if cleanup is delayed.
- Active medications and care plans are NOT exempt: the UI shows expiry, reminders
  stop at expiry, and renewal is a deliberate user action.
- Raw import retry payloads: <= 24h. Generated PDFs: <= 24h and never beyond their
  underlying records. Share grants: <= 7 days, short-lived download URLs.
- Source tombstones (non-content) prevent expired records resurrecting via resync
  or reinstall. Kova never deletes Apple Health / Health Connect source records.

## Insights

Only allowlisted aggregates (weekly sleep average, goal completion, adherence %)
with period, units, sample count, coverage and calc version. No raw readings,
transcripts, medication lists, snapshots or embeddings under an Insights label.
Deleted on user/account deletion. Provider access to an aggregate requires a grant
covering its full source category and period.

## Access control

- RLS on every table; patients read their own rows; providers read only within an
  active, unrevoked grant (categories + date range + expiry) - enforced at the
  database, not just the UI.
- `protected_credentials` has a deny-all client policy; service role is server-only.
- A provider cannot self-assign a trusted role: pending verification + operator
  approval; MFA for provider/operator production access.
- Audit events record access/permission changes only - never health payloads.
- Private patient pages send `Cache-Control: private, no-store`; no PHI in
  analytics, session replay, URLs, error telemetry, build logs or CI screenshots.

## Consent

Three separate purposes: source access, provider sharing, AI processing. Each is
recorded with category, purpose, policy version, timestamp and withdrawal. Jobs
re-check consent before reading a source or publishing results.

## Compliance posture (not legal advice)

No compliance certification is claimed because hosting vendors offer healthcare
agreements. Kova's role and obligations depend on the operating model (consumer app
vs provider business associate) and must be determined before real-patient use.
This demo uses synthetic data only.
