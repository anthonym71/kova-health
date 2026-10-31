"use client";
import { useState } from "react";
import { Card, DemoBanner, PageHeader, PrimaryButton, StatePill } from "@/components/ui";
import { EMERGENCY_COPY } from "@/lib/demo-data";

/**
 * Module 6: Guidance Plus (paid symptom guidance).
 * Safety rules from the spec, implemented as UI behavior:
 * - Emergency help is OUTSIDE the paywall and visible through any failure.
 * - The intake never diagnoses, never recommends treatment, never downgrades urgency.
 * - The assessment shown here is SIMULATED and labeled as such.
 * - Red-flag answers escalate immediately to the emergency pathway.
 */

const RED_FLAG_IDS = new Set(["chest_pain", "breathing", "stroke", "severe_bleeding"]);

const QUESTIONS = [
  {
    id: "q1",
    text: "Are you currently experiencing any of these?",
    options: [
      { id: "chest_pain", label: "Chest pain or pressure" },
      { id: "breathing", label: "Severe trouble breathing" },
      { id: "stroke", label: "Sudden weakness, numbness or trouble speaking" },
      { id: "severe_bleeding", label: "Severe bleeding" },
      { id: "none", label: "None of these" },
    ],
  },
  {
    id: "q2",
    text: "How long have you had your main symptom?",
    options: [
      { id: "today", label: "Started today" },
      { id: "days", label: "A few days" },
      { id: "weeks", label: "More than a week" },
    ],
  },
];

export default function GuidancePage() {
  const subscribed = false; // demo: no real billing; entitlement comes from server-verified events only
  const [step, setStep] = useState(0);
  const [emergency, setEmergency] = useState(false);
  const [done, setDone] = useState(false);

  const answer = (optionId: string) => {
    if (RED_FLAG_IDS.has(optionId)) {
      setEmergency(true);
      return;
    }
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  return (
    <>
      <PageHeader title="Symptom Guidance" subtitle="Guidance Plus add-on" />

      {/* Emergency help: always visible, never behind paywall or login */}
      <div className="mb-4 rounded-card border-2 border-status-danger bg-status-dangersoft p-4">
        <p className="font-semibold text-status-danger">Emergency help</p>
        <p className="mt-1 text-sm text-ink-body">{EMERGENCY_COPY}</p>
      </div>

      <DemoBanner />

      {!subscribed ? (
        <Card>
          <div className="flex items-start justify-between">
            <h2 className="font-semibold text-ink-strong">Guidance Plus</h2>
            <StatePill state="demo" />
          </div>
          <p className="mt-2 text-sm text-ink-body">
            A monthly add-on with guided intake, a clinical assessment from a contracted vendor, education
            and help preparing a clinician handoff. In this demo the intake and result are simulated
            and unvalidated - do not enter real symptoms. Price and trial policy are not set yet - no real billing in
            this demo, and core tracking, your records and emergency help never require it.
          </p>
          <div className="mt-4">
            <PrimaryButton onClick={() => {}} >Try the simulated intake</PrimaryButton>
          </div>
        </Card>
      ) : null}

      {!emergency && !done && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-lilac">Simulated demo intake - unvalidated, not for real symptoms</p>
            <StatePill state="demo" />
          </div>
          <h2 className="mb-3 text-lg font-semibold text-ink-strong">{QUESTIONS[step].text}</h2>
          <div className="space-y-2">
            {QUESTIONS[step].options.map((o) => (
              <button
                key={o.id}
                onClick={() => answer(o.id)}
                className="block min-h-[44px] w-full rounded-xl border border-surface-sunken bg-surface-overlay px-4 py-3 text-left text-sm font-medium text-ink-body hover:border-brand-teal hover:bg-brand-tealsoft"
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            This intake collects and summarizes. It does not diagnose, recommend treatment or change
            medication, and it cannot lower the urgency set by the clinical assessment vendor.
          </p>
        </Card>
      )}

      {emergency && (
        <Card className="mt-4 border-2 border-status-danger">
          <h2 className="text-lg font-bold text-status-danger">Get emergency care now</h2>
          <p className="mt-2 text-sm text-ink-body">{EMERGENCY_COPY}</p>
          <p className="mt-2 text-sm text-ink-body">
            Do not wait for an app message or a routine reply. If you cannot call, ask someone nearby
            to call for you.
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            This escalation triggers regardless of subscription, login, vendor or model availability.
          </p>
        </Card>
      )}

      {done && (
        <Card className="mt-4">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold text-ink-strong">Simulated assessment result</h2>
            <StatePill state="demo" />
          </div>
          <p className="mt-2 text-sm text-ink-body">
            SIMULATED OUTPUT - in the live product this step is returned by a contracted clinical
            assessment vendor (Healthily and ApiMedic are candidates pending contracts and clinical
            review), never invented by a language model.
          </p>
          <p className="mt-2 text-sm text-ink-body">
            Suggested next step in this demo: routine follow-up. You can prepare a summary for a
            clinician or request an appointment - both need your explicit confirmation before anything
            is sent or booked.
          </p>
        </Card>
      )}
    </>
  );
}
