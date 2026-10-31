"use client";
import { BarChart, Card, DemoBanner, PageHeader, PrimaryButton, ProgressBar, SecondaryButton, StatePill } from "@/components/ui";
import { APPOINTMENTS, CARE_PLAN, DEMO_PATIENT, DEMO_PROVIDER, GOALS, RETENTION_NOTICE, WEEK_METRICS } from "@/lib/demo-data";

export default function TodayPage() {
  const today = WEEK_METRICS[WEEK_METRICS.length - 1];
  const nextAppt = APPOINTMENTS[0];
  return (
    <>
      <PageHeader title={`Good afternoon, ${DEMO_PATIENT.name.split(" ")[0]}`} subtitle="Saturday, October 31 · Your daily overview" />
      <DemoBanner />

      {/* Care team / next visit - prominent, per build prompt */}
      <Card className="mb-4 border-brand-teal/20 bg-gradient-to-br from-surface-raised to-brand-tealsoft/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">Care team</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-strong">{DEMO_PROVIDER.name}</h2>
            <p className="text-sm text-ink-muted">{DEMO_PROVIDER.responseExpectation}</p>
            <p className="mt-2 text-sm text-ink-body">
              Next visit: <strong>{nextAppt.when}</strong> · {nextAppt.specialty}
            </p>
            <p className="mt-1 text-xs text-ink-faint">{nextAppt.adapter}</p>
          </div>
          <StatePill state="demo" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton href="/care-team">Message care team</PrimaryButton>
          <SecondaryButton href="/care-team">View plan</SecondaryButton>
        </div>
      </Card>

      {/* Compact daily actions */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Steps", value: today.steps, goal: GOALS.steps, unit: "" },
          { label: "Sleep", value: today.sleepHours, goal: GOALS.sleepHours, unit: "h" },
          { label: "Water", value: today.waterMl, goal: GOALS.waterMl, unit: "ml" },
          { label: "Active", value: today.activeMinutes, goal: GOALS.activeMinutes, unit: "min" },
        ].map((m) => (
          <Card key={m.label} className="!p-4">
            <p className="text-xs text-ink-muted">{m.label}</p>
            <p className="mt-1 text-xl font-bold text-ink-strong">
              {m.value ?? "—"}
              <span className="text-xs font-normal text-ink-muted"> / {m.goal}{m.unit}</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={m.value ?? 0} goal={m.goal} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink-strong">Steps this week</h3>
            <a href="/track" className="text-sm font-medium text-brand-teal">7/15-day views →</a>
          </div>
          <BarChart values={WEEK_METRICS.map((d) => d.steps)} goal={GOALS.steps} labels={WEEK_METRICS.map((d) => d.day)} unit="steps" />
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Your plan from {DEMO_PROVIDER.name.split(",")[0]}</h3>
          <ul className="space-y-2">
            {CARE_PLAN.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <span aria-hidden className={item.done ? "text-status-ok" : "text-ink-faint"}>{item.done ? "☑" : "☐"}</span>
                <span className={item.done ? "text-ink-muted line-through" : "text-ink-body"}>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-faint">Published {CARE_PLAN.publishedAt} · v{CARE_PLAN.version} · clinician-authored plan, not a prescription change</p>
        </Card>
      </div>

      <Card className="mt-4 !p-4">
        <p className="text-xs leading-relaxed text-ink-muted">{RETENTION_NOTICE}</p>
      </Card>
    </>
  );
}
