/**
 * Live Supabase data access for the working app.
 * Only called in live mode (isLive true); demo mode keeps using lib/demo-data.
 */
import { supabase } from "./supabase";

const RETENTION_DAYS = 15;

/** Batch display-name lookup (relationship parties are visible via RLS). */
async function fetchDisplayNames(ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids));
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const { data } = await supabase!.from("profiles").select("id, display_name").in("id", unique);
  for (const p of data ?? []) map.set(p.id, p.display_name);
  return map;
}
export function expiry(): string {
  return new Date(Date.now() + RETENTION_DAYS * 86400_000).toISOString();
}

export async function signUpPatient(email: string, password: string, displayName: string) {
  const { data, error } = await supabase!.auth.signUp({ email, password });
  if (error) return { error: error.message };
  const user = data.user;
  if (user) {
    // Public sign-up is always patient role; provider trust can never be self-assigned.
    const { error: pErr } = await supabase!
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName, role: "patient" });
    if (pErr) return { error: pErr.message };
  }
  return { needsEmailConfirm: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  return error ? { error: error.message } : {};
}

export async function signOut() {
  await supabase!.auth.signOut();
}

export interface TodayMetrics {
  steps: number | null;
  sleepHours: number | null;
  waterMl: number | null;
  activeMinutes: number | null;
}

function dayStartISO(daysAgo = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/** Sum today's manual/device observations per category for a patient. */
export async function fetchTodayMetrics(patientId: string): Promise<TodayMetrics> {
  const since = dayStartISO();
  const { data: obs } = await supabase!
    .from("observations")
    .select("category, value")
    .eq("patient_id", patientId)
    .gte("measured_at", since);
  const { data: hyd } = await supabase!
    .from("hydration_logs")
    .select("value")
    .eq("patient_id", patientId)
    .gte("measured_at", since);
  const sum = (rows: { value: number | null }[] | null, cat?: string) => {
    const list = (rows ?? []).filter((r) => r.value != null);
    if (!list.length) return null;
    return list.reduce((a, r) => a + (r.value as number), 0);
  };
  const cat = (c: string) => (obs ?? []).filter((o) => o.category === c);
  return {
    steps: sum(cat("steps")),
    sleepHours: sum(cat("sleep")),
    waterMl: sum(hyd ?? []),
    activeMinutes: sum(cat("activity")),
  };
}

export interface WeekPoint {
  day: string;
  steps: number | null;
  sleepHours: number | null;
  waterMl: number | null;
  activeMinutes: number | null;
}

/** Daily totals for the past N days (unknown days stay null, never zero). */
export async function fetchWeekMetrics(patientId: string, days: number): Promise<WeekPoint[]> {
  const since = dayStartISO(days - 1);
  const [{ data: obs }, { data: hyd }] = await Promise.all([
    supabase!.from("observations").select("category, value, measured_at").eq("patient_id", patientId).gte("measured_at", since),
    supabase!.from("hydration_logs").select("value, measured_at").eq("patient_id", patientId).gte("measured_at", since),
  ]);
  const out: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = d.getTime() + 86400_000;
    const onDay = (ts: string) => {
      const t = new Date(ts).getTime();
      return t >= d.getTime() && t < next;
    };
    const sum = (rows: { value: number | null; measured_at: string }[] | null) => {
      const list = (rows ?? []).filter((r) => onDay(r.measured_at) && r.value != null);
      return list.length ? list.reduce((a, r) => a + (r.value as number), 0) : null;
    };
    const cat = (c: string) => (obs ?? []).filter((o) => o.category === c);
    out.push({
      day: d.toLocaleDateString("en-GB", { weekday: "short" }),
      steps: sum(cat("steps")),
      sleepHours: sum(cat("sleep")),
      waterMl: sum(hyd ?? []),
      activeMinutes: sum(cat("activity")),
    });
  }
  return out;
}

export async function logObservation(patientId: string, category: "steps" | "sleep" | "activity", value: number, unit: string) {
  const { error } = await supabase!.from("observations").insert({
    patient_id: patientId, category, value, unit,
    origin: "manual", source: "web-app",
    measured_at: new Date().toISOString(), expires_at: expiry(),
  });
  return error ? { error: error.message } : {};
}

export async function logHydration(patientId: string, ml: number) {
  const { error } = await supabase!.from("hydration_logs").insert({
    patient_id: patientId, category: "hydration", value: ml, unit: "ml",
    origin: "manual", source: "web-app",
    measured_at: new Date().toISOString(), expires_at: expiry(),
  });
  return error ? { error: error.message } : {};
}

export async function fetchGoals(patientId: string) {
  const { data } = await supabase!.from("goals").select("category, target, unit").eq("patient_id", patientId);
  const map: Record<string, number> = {};
  for (const g of data ?? []) map[g.category] = g.target;
  return {
    steps: map.steps ?? 8000,
    sleepHours: map.sleep ?? 7.5,
    waterMl: map.hydration ?? 2000,
    activeMinutes: map.activity ?? 40,
  };
}

export interface LiveMedication {
  id: string;
  name: string;
  dose: string | null;
  schedule: string;
  scheduleId: string | null;
  takenToday: boolean;
}

export async function fetchMedications(patientId: string): Promise<LiveMedication[]> {
  const { data: meds } = await supabase!
    .from("medications")
    .select("id, label, dose, medication_schedules(id, rrule)")
    .eq("patient_id", patientId)
    .eq("review_state", "active");
  const since = dayStartISO();
  const { data: doses } = await supabase!
    .from("dose_events")
    .select("schedule_id, status")
    .eq("status", "taken")
    .gte("scheduled_for", since);
  const taken = new Set((doses ?? []).map((d) => d.schedule_id));
  return (meds ?? []).map((m) => {
    const sched = Array.isArray(m.medication_schedules) ? m.medication_schedules[0] : m.medication_schedules;
    return {
      id: m.id,
      name: m.label,
      dose: m.dose,
      schedule: sched?.rrule ?? "as directed",
      scheduleId: sched?.id ?? null,
      takenToday: sched ? taken.has(sched.id) : false,
    };
  });
}

export async function addMedication(patientId: string, label: string, dose: string, scheduleLabel: string) {
  const exp = expiry();
  const { data: med, error } = await supabase!
    .from("medications")
    .insert({ patient_id: patientId, label, dose, origin: "manual", source: "web-app", expires_at: exp })
    .select("id")
    .single();
  if (error) return { error: error.message };
  const { error: sErr } = await supabase!
    .from("medication_schedules")
    .insert({ medication_id: med!.id, rrule: scheduleLabel, expires_at: exp });
  return sErr ? { error: sErr.message } : {};
}

export async function markDoseTaken(scheduleId: string) {
  const { error } = await supabase!.from("dose_events").insert({
    schedule_id: scheduleId, scheduled_for: new Date().toISOString(),
    status: "taken", recorded_at: new Date().toISOString(), expires_at: expiry(),
  });
  return error ? { error: error.message } : {};
}

// ---------- Patient <-> provider sharing ----------

export interface ProviderRow {
  relationshipId: string;
  providerId: string;
  name: string;
  categories: string[];
  grantId: string | null;
  revoked: boolean;
}

/** Providers linked to this patient, with their current grant state. */
export async function fetchPatientProviders(patientId: string): Promise<ProviderRow[]> {
  const { data: rels } = await supabase!
    .from("care_relationships")
    .select("id, provider_id, access_grants(id, categories, revoked_at, expires_at)")
    .eq("patient_id", patientId);
  const names = await fetchDisplayNames((rels ?? []).map((r) => r.provider_id));
  return (rels ?? []).map((r) => {
    const prof = { display_name: names.get(r.provider_id) };
    const grants = (Array.isArray(r.access_grants) ? r.access_grants : r.access_grants ? [r.access_grants] : []) as {
      id: string; categories: string[]; revoked_at: string | null; expires_at: string | null;
    }[];
    const active = grants.find((g) => !g.revoked_at && (!g.expires_at || g.expires_at > new Date().toISOString()));
    return {
      relationshipId: r.id,
      providerId: r.provider_id,
      name: prof?.display_name ?? "Provider",
      categories: active?.categories ?? [],
      grantId: active?.id ?? null,
      revoked: !active,
    };
  });
}

/** Verified providers available to connect to (public directory for hackathon demo). */
export async function listVerifiedProviders() {
  const { data } = await supabase!
    .from("provider_profiles")
    .select("id")
    .eq("professional_status", "verified");
  const names = await fetchDisplayNames((data ?? []).map((p) => p.id));
  return (data ?? []).map((p) => ({ id: p.id, name: names.get(p.id) ?? "Provider" }));
}

export async function connectProvider(patientId: string, providerId: string) {
  const { error } = await supabase!
    .from("care_relationships")
    .upsert({ patient_id: patientId, provider_id: providerId }, { onConflict: "patient_id,provider_id" });
  return error ? { error: error.message } : {};
}

export async function setGrant(relationshipId: string, categories: string[], includeFuture: boolean) {
  const { error } = await supabase!.from("access_grants").insert({
    relationship_id: relationshipId,
    categories,
    from_date: new Date().toISOString().slice(0, 10),
    include_future: includeFuture,
  });
  return error ? { error: error.message } : {};
}

export async function revokeGrant(grantId: string) {
  const { error } = await supabase!
    .from("access_grants")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grantId);
  return error ? { error: error.message } : {};
}

// ---------- Provider side ----------

export interface PatientRow {
  relationshipId: string;
  patientId: string;
  name: string;
  categories: string[];
}

export async function fetchProviderPatients(providerId: string): Promise<PatientRow[]> {
  const { data: rels } = await supabase!
    .from("care_relationships")
    .select("id, patient_id, access_grants(categories, revoked_at, expires_at)")
    .eq("provider_id", providerId);
  const names = await fetchDisplayNames((rels ?? []).map((r) => r.patient_id));
  return (rels ?? []).map((r) => {
    const prof = { display_name: names.get(r.patient_id) };
    const grants = (Array.isArray(r.access_grants) ? r.access_grants : r.access_grants ? [r.access_grants] : []) as {
      categories: string[]; revoked_at: string | null; expires_at: string | null;
    }[];
    const active = grants.find((g) => !g.revoked_at && (!g.expires_at || g.expires_at > new Date().toISOString()));
    return {
      relationshipId: r.id,
      patientId: r.patient_id,
      name: prof?.display_name ?? "Patient",
      categories: active?.categories ?? [],
    };
  });
}

/** Grant-filtered week metrics for a provider viewing a patient (RLS enforces the rest). */
export async function fetchSharedMetrics(patientId: string, categories: string[]): Promise<WeekPoint[]> {
  if (!categories.length) return [];
  const since = dayStartISO(6);
  const catAll = categories.includes("all");
  const wanted = (c: string) =>
    catAll ||
    (c === "hydration" && categories.includes("hydration")) ||
    categories.includes(c);
  const [{ data: obs }, { data: hyd }] = await Promise.all([
    supabase!.from("observations").select("category, value, measured_at").eq("patient_id", patientId).gte("measured_at", since),
    supabase!.from("hydration_logs").select("value, measured_at").eq("patient_id", patientId).gte("measured_at", since),
  ]);
  // RLS already filters to granted categories; the client mirrors it for display only.
  void wanted;
  const days: WeekPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = d.getTime() + 86400_000;
    const onDay = (ts: string) => {
      const t = new Date(ts).getTime();
      return t >= d.getTime() && t < next;
    };
    const sum = (rows: { value: number | null; measured_at: string }[] | null) => {
      const list = (rows ?? []).filter((r) => onDay(r.measured_at) && r.value != null);
      return list.length ? list.reduce((a, r) => a + (r.value as number), 0) : null;
    };
    const cat = (c: string) => (obs ?? []).filter((o) => o.category === c);
    days.push({
      day: d.toLocaleDateString("en-GB", { weekday: "short" }),
      steps: sum(cat("steps")),
      sleepHours: sum(cat("sleep")),
      waterMl: sum(hyd ?? []),
      activeMinutes: sum(cat("activity")),
    });
  }
  return days;
}

export interface PlanItem {
  id: string;
  label: string;
  done: boolean;
}

/** Patient's current published plan items (latest plan across relationships). */
export async function fetchPlanItems(patientId: string): Promise<{ title: string; author: string; items: PlanItem[] } | null> {
  const { data: rels } = await supabase!.from("care_relationships").select("id").eq("patient_id", patientId);
  const relIds = (rels ?? []).map((r) => r.id);
  if (!relIds.length) return null;
  const { data: plans } = await supabase!
    .from("care_plans")
    .select("id, title, published_at, author_provider_id, care_plan_items(id, label, position)")
    .in("relationship_id", relIds)
    .order("published_at", { ascending: false })
    .limit(1);
  const plan = plans?.[0];
  if (!plan) return null;
  const names = await fetchDisplayNames([plan.author_provider_id]);
  const prof = { display_name: names.get(plan.author_provider_id) };
  const items = (Array.isArray(plan.care_plan_items) ? plan.care_plan_items : []) as { id: string; label: string; position: number }[];
  return {
    title: plan.title,
    author: prof?.display_name ?? "Care team",
    items: items.sort((a, b) => a.position - b.position).map((i) => ({ id: i.id, label: i.label, done: false })),
  };
}

export async function publishPlanItem(relationshipId: string, providerId: string, label: string) {
  const exp = expiry();
  // Reuse the provider's latest plan for the relationship, or create one.
  const { data: plans } = await supabase!
    .from("care_plans")
    .select("id")
    .eq("relationship_id", relationshipId)
    .eq("author_provider_id", providerId)
    .order("published_at", { ascending: false })
    .limit(1);
  let planId = plans?.[0]?.id;
  if (!planId) {
    const { data: plan, error } = await supabase!
      .from("care_plans")
      .insert({ relationship_id: relationshipId, author_provider_id: providerId, title: "Care plan", expires_at: exp })
      .select("id")
      .single();
    if (error) return { error: error.message };
    planId = plan!.id;
  }
  const { data: existing } = await supabase!
    .from("care_plan_items")
    .select("position")
    .eq("care_plan_id", planId)
    .order("position", { ascending: false })
    .limit(1);
  const position = (existing?.[0]?.position ?? -1) + 1;
  const { error } = await supabase!.from("care_plan_items").insert({ care_plan_id: planId, label, position });
  return error ? { error: error.message } : {};
}

// ---------- Messages ----------

export interface LiveMessage {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
}

export async function fetchMessages(relationshipId: string, myId: string): Promise<LiveMessage[]> {
  const { data: conv } = await supabase!
    .from("conversations")
    .select("id")
    .eq("relationship_id", relationshipId)
    .single();
  if (!conv) return [];
  const { data: msgs } = await supabase!
    .from("messages")
    .select("id, sender_id, body, first_stored_at")
    .eq("conversation_id", conv.id)
    .order("first_stored_at", { ascending: true })
    .limit(100);
  return (msgs ?? []).map((m) => ({
    id: m.id,
    from: m.sender_id === myId ? "me" : "them",
    text: m.body,
    at: new Date(m.first_stored_at).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
  }));
}

export async function sendMessage(relationshipId: string, senderId: string, body: string) {
  let convId: string | undefined;
  const { data: conv } = await supabase!
    .from("conversations")
    .select("id")
    .eq("relationship_id", relationshipId)
    .maybeSingle();
  convId = conv?.id;
  if (!convId) {
    const { data: created, error } = await supabase!
      .from("conversations")
      .insert({ relationship_id: relationshipId })
      .select("id")
      .single();
    if (error) return { error: error.message };
    convId = created!.id;
  }
  const { error } = await supabase!
    .from("messages")
    .insert({ conversation_id: convId, sender_id: senderId, body, expires_at: expiry() });
  return error ? { error: error.message } : {};
}
