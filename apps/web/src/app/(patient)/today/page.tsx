"use client";
import { useEffect, useState } from "react";
import { BarChart, Card, DemoBanner, PageHeader, PrimaryButton, ProgressBar, SecondaryButton, StatePill } from "@/components/ui";
import { APPOINTMENTS, CARE_PLAN, DEMO_PATIENT, DEMO_PROVIDER, GOALS, RETENTION_NOTICE, WEEK_METRICS } from "@/lib/demo-data";
import { useSession } from "@/lib/use-session";
import { fetchGoals, fetchPlanItems, fetchTodayMetrics, fetchWeekMetrics, type TodayMetrics, type WeekPoint } from "@/lib/live";

export default function TodayPage() {
  const session = useSession();
  const [metrics, setMetrics] = useState<TodayMetrics | null>(null);
  const [week, setWeek] = useState<WeekPoint[] | null>(null);
  const [goals, setGoals] = useState(GOALS);
  const [plan, setPlan] = useState<{ title: string; author: string; items: { id: string; label: string }[] } | null>(null);
  const live = session.status === "signed-in";

  useEffect(() => {
    if (!live) return;
    const uid = session.userId;
    fetchTodayMetrics(uid).then(setMetrics);
    fetchWeekMetrics(uid, 7).then(setWeek);
    fetchGoals(uid).then(setGoals);
    fetchPlanItems(uid).then(setPlan);
  }, [live, session.status === "signed-in" ? session.userId : null]);

  const today = live
    ? metrics ?? { steps: null, sleepHours: null, waterMl: null, activeMinutes: null }
    : WEEK_METRICS[WEEK_METRICS.length - 1];
  const weekData = live ? week ?? [] : WEEK_METRICS;
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" });
  const firstName = live ? session.displayName.split(" ")[0] : DEMO_PATIENT.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Good day, ${firstName}`} subtitle={`${dateStr} · Your daily overview`} />
      {!live && <DemoBanner />}

      {!live && (
        <Card className="mb-4 border-brand-teal/20 bg-gradient-to-br from-surface-raised to-brand-tealsoft/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">Care team</p>
              <h2 className="mt-1 text-lg font-semibold text-ink-strong">{DEMO_PROVIDER.name}</h2>
              <p className="text-sm text-ink-muted">{DEMO_PROVIDER.responseExpectation}</p>
              <p className="mt-2 text-sm text-ink-body">
                Next visit: <strong>{APPOINTMENTS[0].when}</strong> · {APPOINTMENTS[0].specialty}
              </p>
              <p className="mt-1 text-xs text-ink-faint">{APPOINTMENTS[0].adapter}</p>
            </div>
            <StatePill state="demo" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton href="/care-team">Message care team</PrimaryButton>
            <SecondaryButton href="/care-team">View plan</SecondaryButton>
          </div>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Steps", value: today.steps, goal: goals.steps, unit: "" },
          { label: "Sleep", value: today.sleepHours, goal: goals.sleepHours, unit: "h" },
          { label: "Water", value: today.waterMl, goal: goals.waterMl, unit: "ml" },
          { label: "Active", value: today.activeMinutes, goal: goals.activeMinutes, unit: "min" },
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
            <a href="track/" className="text-sm font-medium text-brand-teal">7/15-day views →</a>
          </div>
          {weekData.length ? (
            <BarChart values={weekData.map((d) => d.steps)} goal={goals.steps} labels={weekData.map((d) => d.day)} unit="steps" />
          ) : (
            <p className="text-sm text-ink-muted">No readings yet. Log your first day on the Track page.</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">
            {live ? (plan ? `Your plan from ${plan.author}` : "Your care plan") : `Your plan from ${DEMO_PROVIDER.name.split(",")[0]}`}
          </h3>
          {live ? (
            plan && plan.items.length ? (
              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="text-ink-faint">☐</span>
                    <span className="text-ink-body">{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No plan items published by your care team yet.</p>
            )
          ) : (
            <ul className="space-y-2">
              {CARE_PLAN.items.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <span aria-hidden className={item.done ? "text-status-ok" : "text-ink-faint"}>{item.done ? "☑" : "☐"}</span>
                  <span className={item.done ? "text-ink-muted line-through" : "text-ink-body"}>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
          {!live && <p className="mt-3 text-xs text-ink-faint">Published {CARE_PLAN.publishedAt} · v{CARE_PLAN.version} · clinician-authored plan, not a prescription change</p>}
        </Card>
      </div>

      <Card className="mt-4 !p-4">
        <p className="text-xs leading-relaxed text-ink-muted">{RETENTION_NOTICE}</p>
      </Card>
    </>
  );
}
