-- Kova Health MVP schema (synthetic-data milestone)
-- Postgres with row-level security. Apply in Supabase SQL editor or `supabase db push`.
-- Retention: health content expires 15 days after first_stored_at; only approved
-- aggregate Insights persist longer. Expiry is enforced here AND in read paths.

create extension if not exists "pgcrypto";

-- ---------- Identity and consent ----------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'patient' check (role in ('patient','provider','operator')),
  display_name text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
  -- operational account metadata: no clinical payloads here
);

create table provider_profiles (
  id uuid primary key references profiles on delete cascade,
  professional_status text not null default 'pending'
    check (professional_status in ('pending','verified','rejected')),
  -- A provider cannot self-assign a trusted role: verification + operator approval.
  verified_by uuid references profiles,
  verified_at timestamptz
);

create table consent_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  category text not null check (category in ('source_access','provider_sharing','ai_processing')),
  purpose text not null,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

-- ---------- Clinical profile ----------
create table conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  label text not null,
  origin text not null check (origin in ('manual','imported','provider_authored')),
  source text not null,
  measured_at timestamptz,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  -- expiry immutable: reads/syncs/re-imports never extend it
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table allergies (like conditions including all);
create table medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  label text not null,
  dose text,
  origin text not null check (origin in ('manual','imported','provider_authored')),
  source text not null,
  review_state text not null default 'active' check (review_state in ('pending_review','active')),
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references medications on delete cascade,
  rrule text not null,              -- evaluated in patient timezone, DST-aware
  effective_from timestamptz not null default now(),
  effective_to timestamptz,         -- edits are prospective; history preserved
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table dose_events (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references medication_schedules on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'unrecorded' check (status in ('taken','skipped','unrecorded')),
  recorded_at timestamptz,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);

-- ---------- Tracking ----------
create table observations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  category text not null check (category in ('steps','activity','sleep','heart_rate','hydration','nutrition')),
  value numeric,                    -- null = unknown, never zero
  unit text not null,
  origin text not null check (origin in ('manual','imported','device_sync','provider_authored')),
  source text not null,
  source_record_id text,            -- dedupe with connection scope, never by patient name
  connection_id uuid,
  measured_at timestamptz,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create unique index observations_source_uidx
  on observations (connection_id, source_record_id) where source_record_id is not null;
create index observations_patient_cat_idx on observations (patient_id, category, measured_at desc);

create table hydration_logs (like observations including all);
create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  description text,
  photo_path text,                  -- private Supabase Storage object, short-lived URLs only
  measured_at timestamptz,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  category text not null,
  target numeric not null,
  unit text not null,
  set_by uuid not null references profiles, -- patient goal vs clinician plan are distinct
  created_at timestamptz not null default now()
);

-- ---------- Insights (the ONLY long-term store) ----------
create table insights (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  metric text not null,             -- allowlisted aggregate e.g. 'sleep_weekly_avg_hours'
  period_start date not null,
  period_end date not null,
  value numeric not null,
  unit text not null,
  source_category text not null,
  sample_count int not null,
  coverage numeric not null,        -- fraction of period with data
  calc_version text not null,
  created_at timestamptz not null default now()
  -- never raw values, transcripts, medication lists, snapshots or embeddings
);

-- ---------- External sources ----------
create table connections (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  kind text not null check (kind in ('ehr','phone_platform','vendor_cloud')),
  vendor text not null,
  state text not null default 'pending'
    check (state in ('pending','active','paused','expired','disconnected','error')),
  last_successful_sync_at timestamptz,
  created_at timestamptz not null default now()
);
create table protected_credentials (
  connection_id uuid primary key references connections on delete cascade,
  encrypted_payload bytea not null  -- server-only; never readable via user sessions
);
create table sync_cursors (
  connection_id uuid not null references connections on delete cascade,
  category text not null,
  cursor text not null,             -- advance only after server acknowledgement
  updated_at timestamptz not null default now(),
  primary key (connection_id, category)
);
create table source_tombstones (
  -- minimal non-content dedupe markers so expired records never resurrect
  connection_id uuid not null references connections on delete cascade,
  source_record_id text not null,
  first_stored_at timestamptz not null,
  primary key (connection_id, source_record_id)
);
create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references connections on delete cascade,
  state text not null default 'pending' check (state in ('pending','running','partial','complete','failed','canceled')),
  created_at timestamptz not null default now()
  -- raw retry payloads: encrypted, expire within 24h, never in logs
);

-- ---------- Care team ----------
create table provider_invites (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  token_hash text not null unique,  -- single-use, expiring; contains NO health details
  intended_recipient text not null,
  expires_at timestamptz not null,
  used_at timestamptz
);
create table care_relationships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  provider_id uuid not null references provider_profiles,
  created_at timestamptz not null default now(),
  unique (patient_id, provider_id)
);
create table access_grants (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references care_relationships on delete cascade,
  categories text[] not null,       -- checked at DB and server layers
  from_date date not null,
  to_date date,
  include_future boolean not null default false,
  expires_at timestamptz,
  revoked_at timestamptz            -- revocation applies to reads, writes, exports, realtime, agent
);
create table conversations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references care_relationships on delete cascade,
  created_at timestamptz not null default now()
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  sender_id uuid not null references profiles,
  body text not null,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  provider_id uuid references provider_profiles,
  adapter text not null,            -- 'demo' until a contracted network is integrated
  state text not null check (state in ('requested','confirmed','canceled','completed','failed','no_show')),
  scheduled_for timestamptz,
  fee_display text,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table care_plans (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references care_relationships on delete cascade,
  author_provider_id uuid not null references provider_profiles,
  title text not null,
  version int not null default 1,
  published_at timestamptz not null default now(),
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table care_plan_items (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references care_plans on delete cascade,
  label text not null,
  position int not null default 0
);

-- ---------- Sharing and governance ----------
create table health_summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  categories text[] not null,
  from_date date not null,
  to_date date not null,
  pdf_path text,                    -- private storage; deleted within 24h and never beyond source expiry
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint export_within_24h check (expires_at <= first_stored_at + interval '24 hours')
);
create table share_grants (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references health_summaries on delete cascade,
  recipient_label text not null,
  expires_at timestamptz not null,  -- <= 7 days and never beyond underlying data
  revoked_at timestamptz,
  constraint share_within_7d check (expires_at <= now() + interval '7 days')
);
create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  at timestamptz not null default now()
  -- access/permission metadata only; never health payloads
);
create table deletion_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  scope text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);
create table retention_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  state text not null default 'pending' check (state in ('pending','running','complete','failed')),
  dry_run boolean not null default false,
  ran_at timestamptz
);

-- ---------- Add-on (Guidance Plus) ----------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  product text not null default 'guidance_plus',
  billing_source text not null check (billing_source in ('stripe_test','apple_sandbox','google_sandbox')),
  state text not null check (state in ('active','past_due','canceling','expired')),
  current_period_end timestamptz
  -- billing identifiers only; never symptoms or medical records
);
create table entitlements (
  patient_id uuid primary key references profiles on delete cascade,
  guidance_plus boolean not null default false,
  -- updated ONLY from server-verified billing events; never from checkout URLs or client booleans
  updated_at timestamptz not null default now()
);
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique, -- idempotent, out-of-order safe
  payload jsonb not null,
  received_at timestamptz not null default now()
);
create table symptom_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  state text not null default 'intake',
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table symptom_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references symptom_sessions on delete cascade,
  question_id text not null,
  answer text not null,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);
create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references symptom_sessions on delete cascade,
  vendor text not null,             -- 'simulated' until a contracted vendor is integrated
  urgency text not null check (urgency in ('emergency','urgent','routine','self_care')),
  disposition_text text not null,
  is_simulated boolean not null default true,
  first_stored_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint expiry_within_15d check (expires_at <= first_stored_at + interval '15 days')
);

-- ---------- Row-level security ----------
alter table profiles enable row level security;
alter table provider_profiles enable row level security;
alter table consent_events enable row level security;
alter table conditions enable row level security;
alter table allergies enable row level security;
alter table medications enable row level security;
alter table medication_schedules enable row level security;
alter table dose_events enable row level security;
alter table observations enable row level security;
alter table hydration_logs enable row level security;
alter table meal_logs enable row level security;
alter table goals enable row level security;
alter table insights enable row level security;
alter table connections enable row level security;
alter table protected_credentials enable row level security;
alter table sync_cursors enable row level security;
alter table import_jobs enable row level security;
alter table provider_invites enable row level security;
alter table care_relationships enable row level security;
alter table access_grants enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table appointments enable row level security;
alter table care_plans enable row level security;
alter table care_plan_items enable row level security;
alter table health_summaries enable row level security;
alter table share_grants enable row level security;
alter table audit_events enable row level security;
alter table deletion_requests enable row level security;
alter table subscriptions enable row level security;
alter table entitlements enable row level security;
alter table billing_events enable row level security;
alter table symptom_sessions enable row level security;
alter table symptom_answers enable row level security;
alter table assessment_results enable row level security;

-- Patients own their rows. Expired rows are invisible even before cleanup runs.
create policy patient_own_conditions on conditions
  using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid());
create policy patient_own_allergies on allergies
  using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid());
create policy patient_own_medications on medications
  using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid());
create policy patient_own_observations on observations
  using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid());
create policy patient_own_insights on insights
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());
create policy patient_own_connections on connections
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());
create policy patient_own_messages on messages
  using (
    expires_at > now() and exists (
      select 1 from conversations c
      join care_relationships r on r.id = c.relationship_id
      where c.id = messages.conversation_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid())
    )
  );
-- Provider reads: only within an active, unrevoked, unexpired grant (example for observations)
create policy provider_grant_observations on observations
  for select using (
    expires_at > now() and exists (
      select 1 from care_relationships r
      join access_grants g on g.relationship_id = r.id
      where r.patient_id = observations.patient_id
        and r.provider_id = auth.uid()
        and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
        and ('all' = any(g.categories) or observations.category = any(g.categories))
        and observations.measured_at >= g.from_date
        and (g.to_date is null or observations.measured_at <= g.to_date)
    )
  );
-- protected_credentials: no client reads at all (service role only, server-side)
create policy no_client_credentials on protected_credentials using (false);
