/**
 * SYNTHETIC DEMO DATA ONLY.
 * Every person, measurement and message below is fabricated for the MVP demo.
 * Never present these fixtures under a live-connection label.
 */
import type { DoseEvent, IntegrationState, MetricCategory } from "@kova/domain";
import { HEALTH_DATA_RETENTION_DAYS } from "@kova/domain";

export const DEMO_PATIENT = {
  id: "demo-patient-1",
  name: "Alex Morgan",
  initials: "AM",
  timezone: "America/New_York",
  synthetic: true,
};

export const DEMO_PROVIDER = {
  id: "demo-provider-1",
  name: "Dr. Priya Nair, MD",
  role: "Primary care (synthetic)",
  verification: "verified" as const,
  responseExpectation: "Typically replies within 1 business day. Not continuously monitored.",
};

export interface DayMetric {
  day: string; // Mon, Tue...
  steps: number | null;
  sleepHours: number | null;
  waterMl: number | null;
  activeMinutes: number | null;
}

export const WEEK_METRICS: DayMetric[] = [
  { day: "Sun", steps: 6210, sleepHours: 7.2, waterMl: 1500, activeMinutes: 32 },
  { day: "Mon", steps: 4105, sleepHours: 7.8, waterMl: 1250, activeMinutes: 18 },
  { day: "Tue", steps: 7832, sleepHours: 6.9, waterMl: 1750, activeMinutes: 41 },
  { day: "Wed", steps: 5240, sleepHours: 7.1, waterMl: 1500, activeMinutes: 25 },
  { day: "Thu", steps: 8910, sleepHours: 7.5, waterMl: 2000, activeMinutes: 48 },
  { day: "Fri", steps: 6680, sleepHours: 6.8, waterMl: 1750, activeMinutes: 30 },
  { day: "Sat", steps: 7234, sleepHours: 7.0, waterMl: 1500, activeMinutes: 36 },
];

export const GOALS = {
  steps: 8000,
  sleepHours: 7.5,
  waterMl: 2000,
  activeMinutes: 40,
};

export interface DemoMedication {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  supplyDaysLeft: number;
  refillBy: string;
  provenance: "manual" | "imported";
  expiresInDays: number; // retention countdown shown to the user
}

export const MEDICATIONS: DemoMedication[] = [
  {
    id: "med-1",
    name: "Vitamin D3",
    dose: "1000 IU",
    schedule: "Daily, 8:00 AM",
    supplyDaysLeft: 24,
    refillBy: "Nov 24",
    provenance: "manual",
    expiresInDays: 9,
  },
  {
    id: "med-2",
    name: "Loratadine",
    dose: "10 mg",
    schedule: "Daily, 9:00 PM",
    supplyDaysLeft: 6,
    refillBy: "Nov 6",
    provenance: "imported",
    expiresInDays: 4,
  },
];

export const DOSE_HISTORY: DoseEvent[] = [
  { id: "d1", medicationId: "med-1", scheduledFor: "2026-10-27T08:00:00Z", status: "taken", recordedAt: "2026-10-27T08:05:00Z" },
  { id: "d2", medicationId: "med-1", scheduledFor: "2026-10-28T08:00:00Z", status: "taken", recordedAt: "2026-10-28T08:11:00Z" },
  { id: "d3", medicationId: "med-1", scheduledFor: "2026-10-29T08:00:00Z", status: "skipped", recordedAt: "2026-10-29T09:00:00Z" },
  { id: "d4", medicationId: "med-1", scheduledFor: "2026-10-30T08:00:00Z", status: "taken", recordedAt: "2026-10-30T08:02:00Z" },
  { id: "d5", medicationId: "med-1", scheduledFor: "2026-10-31T08:00:00Z", status: "unrecorded" },
  { id: "d6", medicationId: "med-2", scheduledFor: "2026-10-28T21:00:00Z", status: "taken", recordedAt: "2026-10-28T21:07:00Z" },
  { id: "d7", medicationId: "med-2", scheduledFor: "2026-10-29T21:00:00Z", status: "taken", recordedAt: "2026-10-29T21:01:00Z" },
  { id: "d8", medicationId: "med-2", scheduledFor: "2026-10-30T21:00:00Z", status: "taken", recordedAt: "2026-10-30T21:12:00Z" },
];

export interface DemoMessage {
  id: string;
  from: "patient" | "provider";
  text: string;
  at: string;
}

export const MESSAGES: DemoMessage[] = [
  {
    id: "m1",
    from: "provider",
    text: "Hi Alex - I reviewed the sleep and activity summaries you shared. I published a two-week walking goal to your Today page.",
    at: "Oct 29, 4:12 PM",
  },
  {
    id: "m2",
    from: "patient",
    text: "Thanks! Should I keep the evening dose timing the same?",
    at: "Oct 29, 6:03 PM",
  },
  {
    id: "m3",
    from: "provider",
    text: "Yes, keep it as prescribed. Message me here if anything changes - I check this inbox once per business day.",
    at: "Oct 30, 9:41 AM",
  },
];

export const CARE_PLAN = {
  title: "Two-week activity plan",
  publishedBy: DEMO_PROVIDER.name,
  publishedAt: "Oct 29, 2026",
  version: 2,
  items: [
    { id: "cp1", label: "Walk 8,000+ steps on at least 5 days per week", done: false },
    { id: "cp2", label: "Keep a consistent 11:00 PM bedtime", done: false },
    { id: "cp3", label: "Log water intake daily", done: true },
  ],
};

export interface DemoAppointment {
  id: string;
  clinician: string;
  specialty: string;
  when: string;
  state: "confirmed" | "requested";
  adapter: string;
}

export const APPOINTMENTS: DemoAppointment[] = [
  {
    id: "appt-1",
    clinician: "Demo Telehealth Network",
    specialty: "On-demand primary care",
    when: "Tue Nov 3, 2:30 PM ET",
    state: "confirmed",
    adapter: "Demo adapter - no real clinician, no real booking",
  },
];

export interface ConnectionCard {
  id: string;
  name: string;
  kind: "ehr" | "phone_platform" | "wearable";
  route: string;
  state: IntegrationState;
  stateDetail: string;
  helpUrl?: string;
  categories: MetricCategory[];
}

export const CONNECTIONS: ConnectionCard[] = [
  {
    id: "epic",
    name: "Epic / MyChart",
    kind: "ehr",
    route: "SMART on FHIR OAuth - authorization happens on your health system's real sign-in page. Kova never asks for your MyChart password.",
    state: "sandbox",
    stateDetail: "Sandbox adapter implemented; production endpoint not yet validated.",
    categories: ["activity"],
  },
  {
    id: "oracle",
    name: "Oracle Health",
    kind: "ehr",
    route: "SMART on FHIR OAuth via the same internal adapter interface.",
    state: "unavailable",
    stateDetail: "Requires registered Oracle client credentials - not yet configured.",
    categories: ["activity"],
  },
  {
    id: "apple-health",
    name: "Apple Health",
    kind: "phone_platform",
    route: "iPhone: wearable/vendor app -> Apple Health -> Kova iOS app -> backend.",
    state: "requires_mobile_app",
    stateDetail: "A browser cannot read Apple Health. Set up in the Kova iOS app.",
    helpUrl: "https://developer.apple.com/documentation/healthkit",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "health-connect",
    name: "Android Health Connect",
    kind: "phone_platform",
    route: "Android: wearable/vendor app -> Health Connect -> Kova Android app -> backend.",
    state: "requires_mobile_app",
    stateDetail: "A browser cannot read Health Connect. Set up in the Kova Android app.",
    helpUrl: "https://developer.android.com/health-and-fitness/health-connect/get-started",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "apple-watch",
    name: "Apple Watch",
    kind: "wearable",
    route: "Apple Watch -> Apple Health -> Kova on iPhone",
    state: "requires_mobile_app",
    stateDetail: "Verified route per capability registry (Oct 31, 2026). No browser path exists.",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "samsung",
    name: "Samsung Health / Galaxy Watch",
    kind: "wearable",
    route: "Samsung Health -> Health Connect -> Kova on Android",
    state: "requires_mobile_app",
    stateDetail: "Documented by Samsung; validate device-specific export before advertising.",
    helpUrl: "https://developer.samsung.com/health/health-connect-faq.html",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "fitbit",
    name: "Fitbit / Pixel Watch",
    kind: "wearable",
    route: "Google Health companion app -> Health Connect (Android) or Apple Health sharing (iPhone)",
    state: "requires_mobile_app",
    stateDetail: "Cloud route would use Google Health API (legacy Fitbit Web API not used). Not yet implemented.",
    helpUrl: "https://developers.google.com/health/about",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "garmin",
    name: "Garmin",
    kind: "wearable",
    route: "Garmin Connect -> Apple Health (iPhone) or Health Connect (Android 14+)",
    state: "requires_mobile_app",
    stateDetail: "Cloud access conditional on Garmin developer-program approval - not secured.",
    categories: ["steps", "activity", "sleep", "heart_rate"],
  },
  {
    id: "oura",
    name: "Oura Ring",
    kind: "wearable",
    route: "Oura app -> Apple Health or Health Connect",
    state: "requires_mobile_app",
    stateDetail: "Direct Oura OAuth API is a candidate for vendor-specific scores; membership conditions apply.",
    helpUrl: "https://cloud.ouraring.com/docs/",
    categories: ["sleep", "activity", "heart_rate"],
  },
  {
    id: "whoop",
    name: "WHOOP",
    kind: "wearable",
    route: "Direct WHOOP OAuth API (candidate) or phone-health routing",
    state: "unavailable",
    stateDetail: "WHOOP API does not provide continuous heart-rate series; route not yet verified.",
    helpUrl: "https://developer.whoop.com/api/",
    categories: ["sleep", "activity"],
  },
];

export interface ImportedRecord {
  id: string;
  type: string;
  title: string;
  source: string;
  measuredAt: string;
  expiresInDays: number;
}

export const IMPORTED_RECORDS: ImportedRecord[] = [
  { id: "r1", type: "Condition", title: "Seasonal allergic rhinitis", source: "Epic sandbox (synthetic)", measuredAt: "Oct 24, 2026", expiresInDays: 8 },
  { id: "r2", type: "Allergy", title: "Peanut allergy", source: "Epic sandbox (synthetic)", measuredAt: "Oct 24, 2026", expiresInDays: 8 },
  { id: "r3", type: "Medication", title: "Loratadine 10 mg", source: "Epic sandbox (synthetic)", measuredAt: "Oct 24, 2026", expiresInDays: 8 },
  { id: "r4", type: "Observation", title: "Resting heart rate 62 bpm", source: "Manual entry", measuredAt: "Oct 30, 2026", expiresInDays: 14 },
];

export const RETENTION_NOTICE = `Kova keeps detailed health data for ${HEALTH_DATA_RETENTION_DAYS} days. Only derived Insights (approved aggregates like weekly averages) are kept longer. Deleting a source, a provider's access and imported data are separate controls.`;

export const EMERGENCY_COPY =
  "If this is an emergency, call your local emergency number now (911 in the US, 112/999 in the UK and EU). This app cannot call emergency services for you.";
