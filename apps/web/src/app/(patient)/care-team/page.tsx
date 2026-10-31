"use client";
import { useState } from "react";
import { Card, DemoBanner, PageHeader, PrimaryButton, SecondaryButton, StatePill } from "@/components/ui";
import { APPOINTMENTS, CARE_PLAN, DEMO_PROVIDER, MESSAGES } from "@/lib/demo-data";

export default function CareTeamPage() {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<typeof MESSAGES>([]);
  return (
    <>
      <PageHeader title="Care Team" subtitle="Provider Connect - invitations, sharing, messages and plans" />
      <DemoBanner />

      <Card className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-ink-strong">{DEMO_PROVIDER.name}</h2>
            <p className="text-sm text-ink-muted">{DEMO_PROVIDER.role}</p>
            <p className="mt-1 text-sm text-ink-body">{DEMO_PROVIDER.responseExpectation}</p>
          </div>
          <StatePill state="verified" />
        </div>
        <div className="mt-3 rounded-xl bg-surface-sunken p-3 text-sm text-ink-body">
          Sharing: activity, sleep, hydration · Oct 17 onward · expires Nov 14 ·{" "}
          <button className="font-medium text-status-danger underline">Revoke access</button>
          <p className="mt-1 text-xs text-ink-faint">
            Revocation blocks future reads, messages about new data, exports and realtime updates immediately.
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <SecondaryButton>Invite another provider</SecondaryButton>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Invitations are single-use, expiring links with no health details. Providers are independently
          verified before they can accept. Doctors must join Kova - this is not a MyChart inbox.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">{CARE_PLAN.title}</h2>
          <ul className="space-y-2">
            {CARE_PLAN.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <span aria-hidden className={item.done ? "text-status-ok" : "text-ink-faint"}>{item.done ? "☑" : "☐"}</span>
                <span className={item.done ? "text-ink-muted line-through" : "text-ink-body"}>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-faint">
            Published by {CARE_PLAN.publishedBy} · {CARE_PLAN.publishedAt} · v{CARE_PLAN.version}. Clinician
            plans are distinct from your own goals and cannot change prescriptions.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Appointments</h2>
          {APPOINTMENTS.map((a) => (
            <div key={a.id} className="mb-3 rounded-xl border border-surface-sunken p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-strong">{a.when}</p>
                <StatePill state="demo" />
              </div>
              <p className="text-sm text-ink-muted">{a.clinician} · {a.specialty}</p>
              <p className="mt-1 text-xs text-ink-faint">{a.adapter}</p>
              <div className="mt-2">
                <SecondaryButton>Join video (partner-hosted, demo)</SecondaryButton>
              </div>
            </div>
          ))}
          <p className="text-xs text-ink-faint">
            On-demand booking runs on a demo adapter. A contracted clinician network
            (Wheel / SteadyMD / OpenLoop) is required before any real patient launch.
          </p>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Messages</h2>
        <div className="mb-3 space-y-3">
          {[...MESSAGES, ...sent].map((m) => (
            <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "patient" ? "ml-auto bg-brand-teal text-white" : "bg-surface-sunken text-ink-body"}`}>
              <p>{m.text}</p>
              <p className={`mt-1 text-[11px] ${m.from === "patient" ? "text-white/70" : "text-ink-faint"}`}>{m.at}</p>
            </div>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            setSent((s) => [...s, { id: `local-${Date.now()}`, from: "patient", text: draft.trim(), at: "Just now (demo, not delivered)" }]);
            setDraft("");
          }}
        >
          <label htmlFor="msg" className="sr-only">Message your care team</label>
          <input
            id="msg"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            className="min-h-[44px] flex-1 rounded-full border border-surface-sunken bg-surface-overlay px-4 text-sm"
          />
          <PrimaryButton type="submit">Send</PrimaryButton>
        </form>
        <p className="mt-2 text-xs text-ink-faint">
          Demo thread - messages are not delivered. In the live product every send needs your deliberate
          confirmation of the actual recipient.
        </p>
      </Card>
    </>
  );
}
