-- Providers may read a patient's goals only for categories covered by an
-- active (unrevoked, unexpired) grant on a relationship with that patient.
-- Mirrors provider_grant_hydration; goals have no measured window.
create policy provider_grant_goals on public.goals
  for select
  using (
    exists (
      select 1
      from care_relationships r
      join access_grants g on g.relationship_id = r.id
      where r.patient_id = goals.patient_id
        and r.provider_id = auth.uid()
        and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
        and ('all' = any (g.categories) or goals.category = any (g.categories))
    )
  );
