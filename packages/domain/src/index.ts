/**
 * Kova domain model - shared types, retention rules and calculations.
 * Source of truth for rules the web app, native app and backend must all
 * apply identically (15-day retention, adherence denominators, provenance).
 */

// ---------- Retention (founder-confirmed: 15 days, Insights excepted) ----------
export const HEALTH_DATA_RETENTION_DAYS = 15;
export const RAW_IMPORT_RETRY_RETENTION_HOURS = 24;
export const EXPORT_RETENTION_HOURS = 24;
export const SHARE_GRANT_MAX_DAYS = 7;

export function computeExpiresAt(firstStoredAt: Date): Date {
  return new Date(
    firstStoredAt.getTime() + HEALTH_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );
}

/** Expiry is immutable: reads, syncs and re-imports must never extend it. */
export function isExpired(firstStoredAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= computeExpiresAt(firstStoredAt).getTime();
}

// ---------- Provenance ----------
export type DataOrigin = "manual" | "imported" | "provider_authored" | "device_sync";

export interface Provenance {
  origin: DataOrigin;
  /** e.g. "manual-entry", "epic-sandbox", "apple-health", "demo-fixture" */
  source: string;
  measuredAt: string; // ISO - when the measurement happened
  ingestedAt: string; // ISO - when Kova first stored it (drives expiry)
  /** Missing data is represented as unknown, never zero. */
  valueUnknown?: boolean;
}

// ---------- Tracking ----------
export type MetricCategory = "steps" | "activity" | "sleep" | "heart_rate" | "hydration" | "nutrition";

export interface Observation extends Provenance {
  id: string;
  patientId: string;
  category: MetricCategory;
  unit: string;
  value: number | null; // null = unknown
}

// ---------- Medications ----------
export type DoseStatus = "taken" | "skipped" | "unrecorded";

export interface DoseEvent {
  id: string;
  medicationId: string;
  scheduledFor: string; // ISO, patient timezone resolved to UTC instant
  status: DoseStatus;
  recordedAt?: string;
}

/**
 * Adherence = taken / (taken + skipped + unrecorded) for the window.
 * The denominator is always stated in the UI; unrecorded is not treated
 * as taken and not silently dropped.
 */
export function adherenceRate(doses: DoseEvent[]): {
  taken: number;
  skipped: number;
  unrecorded: number;
  rate: number | null; // null when no doses scheduled in window
} {
  const taken = doses.filter((d) => d.status === "taken").length;
  const skipped = doses.filter((d) => d.status === "skipped").length;
  const unrecorded = doses.filter((d) => d.status === "unrecorded").length;
  const total = taken + skipped + unrecorded;
  return { taken, skipped, unrecorded, rate: total === 0 ? null : taken / total };
}

// ---------- Consent ----------
export type ConsentCategory =
  | "source_access" // connecting an external source (EHR, wearable)
  | "provider_sharing" // sharing with a care-team provider
  | "ai_processing"; // symptom-guidance agent processing

export interface ConsentEvent {
  id: string;
  patientId: string;
  category: ConsentCategory;
  purpose: string;
  policyVersion: string;
  grantedAt: string;
  withdrawnAt?: string;
}

// ---------- Care team / Provider Connect ----------
export interface AccessGrant {
  id: string;
  patientId: string;
  providerId: string;
  categories: MetricCategory[] | "all";
  fromDate: string;
  toDate?: string;
  includeFutureData: boolean;
  expiresAt?: string;
  revokedAt?: string;
}

export function grantAllows(grant: AccessGrant, category: MetricCategory, at: Date = new Date()): boolean {
  if (grant.revokedAt) return false;
  if (grant.expiresAt && new Date(grant.expiresAt).getTime() <= at.getTime()) return false;
  if (grant.categories !== "all" && !grant.categories.includes(category)) return false;
  return true;
}

// ---------- Integration states (honest states, never fake success) ----------
export type IntegrationState =
  | "demo" // running on synthetic fixture, clearly labeled
  | "sandbox" // real vendor sandbox
  | "connected" // live and verified
  | "unavailable" // credential/contract missing - explicit, not silent
  | "requires_mobile_app" // HealthKit / Health Connect cannot run in a browser
  | "unsupported";
