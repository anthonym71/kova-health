/**
 * Shared request/response contracts between web, native and the backend.
 * Integration adapters implement these interfaces; demo, sandbox and
 * production implementations are separate. A missing production credential
 * must produce an explicit unavailable state, never a silent fake success.
 */
import type { IntegrationState, Observation, Provenance } from "@kova/domain";

export interface AdapterStatus {
  state: IntegrationState;
  label: string;
  detail?: string;
  verifiedOn?: string; // ISO date the route was last verified
}

export interface RecordsConnector {
  status(): AdapterStatus;
  /** Starts the genuine external authorization (SMART on FHIR OAuth + PKCE). */
  beginAuthorization(patientId: string): Promise<{ authorizationUrl: string }>;
  handleCallback(params: { code: string; state: string }): Promise<{ importJobId: string }>;
  importStatus(importJobId: string): Promise<{ state: "pending" | "partial" | "complete" | "failed" }>;
}

export interface WearableBatchItem extends Omit<Observation, "id" | "patientId"> {}

export interface NativeHealthConnector {
  status(): AdapterStatus;
  /** Native batches are user-supplied data, not clinically verified device attestations. */
  uploadBatch(items: WearableBatchItem[], idempotencyKey: string): Promise<{ accepted: number; duplicates: number }>;
  requestSync(): Promise<{ jobId: string }>;
}

export interface TelehealthConnector {
  status(): AdapterStatus;
  availability(location: string): Promise<{ supported: boolean; fees?: string; nextSlots?: string[] }>;
  /** Booking happens only after deliberate in-app confirmation. */
  requestBooking(slotId: string): Promise<{ appointmentId: string; state: "requested" | "confirmed" | "failed" }>;
}

export interface SymptomAssessmentConnector {
  status(): AdapterStatus;
  /** Returns an approved assessment. Never a model-invented diagnosis. */
  assess(sessionId: string, answers: Record<string, string>): Promise<{
    urgency: "emergency" | "urgent" | "routine" | "self_care";
    dispositionText: string;
    isSimulated: boolean;
  }>;
}

export interface DrugInteractionConnector {
  status(): AdapterStatus;
  check(medicationIds: string[]): Promise<{
    available: boolean;
    findings?: { severity: string; summary: string; attribution: string }[];
    unavailableReason?: string;
  }>;
}

export interface ApiError {
  code: "unauthorized" | "forbidden" | "not_found" | "conflict" | "unavailable" | "validation";
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: ApiError };
