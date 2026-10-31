"use client";
import { useState } from "react";
import { BarChart, Card, DemoBanner, PageHeader, PrimaryButton, StatePill } from "@/components/ui";
import { DEMO_PATIENT, GOALS, MESSAGES, WEEK_METRICS } from "@/lib/demo-data";

export function PatientDetail() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<string[]>(["Walk 8,000+ steps on 5 days/week"]);
  return (
    <>
      <PageHeader title={DEMO_PATIENT.name} subtitle="Permitted data only · grant: activity, sleep, hydration · expires Nov 14" />
      <DemoBanner />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Steps (shared category)</h2>
          <BarChart values={WEEK_METRICS.map((d) => d.steps)} goal={GOALS.steps} labels={WEEK_METRICS.map((d) => d.day)} unit="steps" />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Sleep (shared category)</h2>
          <BarChart values={WEEK_METRICS.map((d) => d.sleepHours)} goal={GOALS.sleepHours} labels={WEEK_METRICS.map((d) => d.day)} unit="hours" />
          <p className="mt-2 text-xs text-ink-faint">Medications, records and messages are outside this grant and hidden.</p>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Publish care plan item</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!task.trim()) return;
            setTasks((t) => [...t, task.trim()]);
            setTask("");
          }}
        >
          <label htmlFor="plan-item" className="sr-only">New plan item</label>
          <input id="plan-item" value={task} onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Add a 10-minute evening walk"
            className="min-h-[44px] flex-1 rounded-full border border-surface-sunken bg-surface-overlay px-4 text-sm" />
          <PrimaryButton type="submit">Publish</PrimaryButton>
        </form>
        <ul className="mt-3 space-y-1 text-sm text-ink-body">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <span aria-hidden className="text-brand-teal">•</span>{t}
              {i === 0 ? <span className="text-xs text-ink-faint">(v2, published Oct 29)</span> : <StatePill state="demo" />}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">
          Plans carry authorship and version history. A plan can never overwrite a prescription.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Message thread</h2>
        <div className="space-y-3">
          {MESSAGES.map((m) => (
            <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "provider" ? "ml-auto bg-brand-blue text-white" : "bg-surface-sunken text-ink-body"}`}>
              <p>{m.text}</p>
              <p className={`mt-1 text-[11px] ${m.from === "provider" ? "text-white/70" : "text-ink-faint"}`}>{m.at}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
