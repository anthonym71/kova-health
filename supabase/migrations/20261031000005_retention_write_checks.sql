-- Retention must hold on writes too: patient_own policies previously carried
-- expires_at > now() only in USING, so a patient could insert already-expired
-- rows. Recreate with matching WITH CHECK. (Behavioral test: POST an expired
-- observation as a patient now returns 42501.)
drop policy if exists patient_own_observations on public.observations;
create policy patient_own_observations on public.observations
  for all using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid() and expires_at > now());

drop policy if exists patient_own_hydration on public.hydration_logs;
create policy patient_own_hydration on public.hydration_logs
  for all using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid() and expires_at > now());

drop policy if exists patient_own_medications on public.medications;
create policy patient_own_medications on public.medications
  for all using (patient_id = auth.uid() and expires_at > now())
  with check (patient_id = auth.uid() and expires_at > now());

drop policy if exists patient_own_dose_events on public.dose_events;
create policy patient_own_dose_events on public.dose_events
  for all using (exists (
    select 1 from medication_schedules s join medications m on m.id = s.medication_id
    where s.id = dose_events.schedule_id and m.patient_id = auth.uid() and dose_events.expires_at > now()))
  with check (exists (
    select 1 from medication_schedules s join medications m on m.id = s.medication_id
    where s.id = dose_events.schedule_id and m.patient_id = auth.uid() and dose_events.expires_at > now()));

drop policy if exists patient_own_messages on public.messages;
create policy patient_own_messages on public.messages
  for all using (expires_at > now() and exists (
    select 1 from conversations c join care_relationships r on r.id = c.relationship_id
    where c.id = messages.conversation_id and (r.patient_id = auth.uid() or r.provider_id = auth.uid())))
  with check (expires_at > now() and exists (
    select 1 from conversations c join care_relationships r on r.id = c.relationship_id
    where c.id = messages.conversation_id and (r.patient_id = auth.uid() or r.provider_id = auth.uid())));
