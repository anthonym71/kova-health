-- Working-app policies: complete RLS for auth'd patient/provider flows.
-- Patients own their rows; providers read only within active grants;
-- providers can never self-assign their role (provider_profiles has no client insert).

-- Profiles: own row read/write; providers may read display names of relationship parties.
create policy profiles_own_select on profiles
  for select using (id = auth.uid());
create policy profiles_own_insert on profiles
  for insert with check (id = auth.uid() and role = 'patient'); -- public sign-up is patient-only
create policy profiles_own_update on profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = 'patient');
create policy profiles_party_select on profiles
  for select using (
    exists (
      select 1 from care_relationships r
      where (r.patient_id = auth.uid() and r.provider_id = profiles.id)
         or (r.provider_id = auth.uid() and r.patient_id = profiles.id)
    )
  );

-- Provider directory: any signed-in user may see VERIFIED providers (to connect).
create policy provider_directory_select on provider_profiles
  for select using (professional_status = 'verified' or id = auth.uid());
-- No client insert/update on provider_profiles: verification is operator-only (service role).

-- Goals: patient-owned.
create policy patient_own_goals on goals
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Hydration: same shape as observations.
create policy patient_own_hydration on hydration_logs
  using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid());
create policy provider_grant_hydration on hydration_logs
  for select using (
    expires_at > now() and exists (
      select 1 from care_relationships r
      join access_grants g on g.relationship_id = r.id
      where r.patient_id = hydration_logs.patient_id
        and r.provider_id = auth.uid()
        and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
        and ('all' = any(g.categories) or 'hydration' = any(g.categories))
        and hydration_logs.measured_at >= g.from_date
        and (g.to_date is null or hydration_logs.measured_at <= g.to_date)
    )
  );

-- Medication schedules and dose events: through medication ownership (patient-only; never shared).
create policy patient_own_med_schedules on medication_schedules
  using (exists (select 1 from medications m where m.id = medication_schedules.medication_id and m.patient_id = auth.uid() and m.expires_at > now()))
  with check (exists (select 1 from medications m where m.id = medication_schedules.medication_id and m.patient_id = auth.uid()));
create policy patient_own_dose_events on dose_events
  using (exists (
    select 1 from medication_schedules s join medications m on m.id = s.medication_id
    where s.id = dose_events.schedule_id and m.patient_id = auth.uid() and dose_events.expires_at > now()))
  with check (exists (
    select 1 from medication_schedules s join medications m on m.id = s.medication_id
    where s.id = dose_events.schedule_id and m.patient_id = auth.uid()));

-- Care relationships: patient creates a link to a VERIFIED provider; both parties can read.
create policy relationships_party_select on care_relationships
  for select using (patient_id = auth.uid() or provider_id = auth.uid());
create policy relationships_patient_insert on care_relationships
  for insert with check (
    patient_id = auth.uid()
    and exists (select 1 from provider_profiles p where p.id = provider_id and p.professional_status = 'verified')
  );

-- Access grants: both parties read; only the patient grants and revokes.
create policy grants_party_select on access_grants
  for select using (
    exists (select 1 from care_relationships r
      where r.id = access_grants.relationship_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid()))
  );
create policy grants_patient_insert on access_grants
  for insert with check (
    exists (select 1 from care_relationships r
      where r.id = access_grants.relationship_id and r.patient_id = auth.uid())
  );
create policy grants_patient_update on access_grants
  for update using (
    exists (select 1 from care_relationships r
      where r.id = access_grants.relationship_id and r.patient_id = auth.uid())
  );

-- Conversations: both parties read; the patient opens the conversation.
create policy conversations_party_select on conversations
  for select using (
    exists (select 1 from care_relationships r
      where r.id = conversations.relationship_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid()))
  );
create policy conversations_patient_insert on conversations
  for insert with check (
    exists (select 1 from care_relationships r
      where r.id = conversations.relationship_id and r.patient_id = auth.uid())
  );

-- Messages: read policy exists from 0001; add the missing INSERT check.
create policy messages_party_insert on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      join care_relationships r on r.id = c.relationship_id
      where c.id = messages.conversation_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid())
    )
  );

-- Care plans: both parties read; only the relationship's provider publishes.
create policy plans_party_select on care_plans
  for select using (
    exists (select 1 from care_relationships r
      where r.id = care_plans.relationship_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid()))
  );
create policy plans_provider_insert on care_plans
  for insert with check (
    author_provider_id = auth.uid()
    and exists (select 1 from care_relationships r
      where r.id = care_plans.relationship_id and r.provider_id = auth.uid())
  );
create policy plan_items_party_select on care_plan_items
  for select using (
    exists (select 1 from care_plans p
      join care_relationships r on r.id = p.relationship_id
      where p.id = care_plan_items.care_plan_id
        and (r.patient_id = auth.uid() or r.provider_id = auth.uid()))
  );
create policy plan_items_provider_insert on care_plan_items
  for insert with check (
    exists (select 1 from care_plans p
      where p.id = care_plan_items.care_plan_id and p.author_provider_id = auth.uid())
  );

-- Fix-up after live audit (2026-10-31): internal ops tables had no RLS and were
-- reachable via PostgREST default grants. Enabled with no client policies = service-role only.
alter table retention_jobs enable row level security;
alter table source_tombstones enable row level security;

-- One editable goal per category per patient (supports setGoal upsert).
create unique index if not exists goals_patient_cat_uidx on goals (patient_id, category);
