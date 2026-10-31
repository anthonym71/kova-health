"use client";
import { useEffect, useState } from "react";
import { BarChart, Card, DemoBanner, PageHeader, PrimaryButton } from "@/components/ui";
import { GOALS as DEMO_GOALS, WEEK_METRICS } from "@/lib/demo-data";
import { useSession } from "@/lib/use-session";
import { deleteLog, fetchGoals, fetchTodayLogs, fetchWeekMetrics, logHydration, logObservation, setGoal, type TodayLog, type WeekPoint } from "@/lib/live";

const RANGES = ["7 days", "15 days"] as const;

export default function TrackPage() {
  const session = useSession();
  const live = session.status === "signed-in";
  const uid = live ? session.userId : null;
  const [range, setRange] = useState<(typeof RANGES)[number]>("7 days");
  const [water, setWater] = useState(0);
  const [data, setData] = useState<WeekPoint[]>(WEEK_METRICS);
  const [goals, setGoals] = useState(DEMO_GOALS);
  const [notice, setNotice] = useState<string | null>(null);
  const [todayLogs, setTodayLogs] = useState<TodayLog[]>([]);
  const [waterGoal, setWaterGoal] = useState("2000");

  const days = range === "7 days" ? 7 : 15;
  useEffect(() => {
    if (!uid) return;
    fetchWeekMetrics(uid, days).then(setData);
    fetchGoals(uid).then((g) => { setGoals(g); setWaterGoal(String(g.waterMl)); });
    fetchTodayLogs(uid).then(setTodayLogs);
  }, [uid, days]);

  async function removeLog(l: TodayLog) {
    const res = await deleteLog(l.table, l.id);
    setNotice(res.error ?? "Entry deleted.");
    if (!res.error && uid) { fetchTodayLogs(uid).then(setTodayLogs); fetchWeekMetrics(uid, days).then(setData); }
  }

  async function saveWaterGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    const t = Number(waterGoal);
    if (!Number.isFinite(t) || t <= 0) return setNotice("Enter a positive number of ml.");
    const res = await setGoal(uid, "hydration", t, "ml");
    setNotice(res.error ?? `Water goal updated to ${t} ml.`);
    if (!res.error) fetchGoals(uid).then(setGoals);
  }

  async function quickWater() {
    if (!uid) return setWater((w) => w + 250);
    const res = await logHydration(uid, 250);
    if (res.error) return setNotice(res.error);
    setNotice("Logged 250 ml of water.");
    fetchWeekMetrics(uid, days).then(setData);
    fetchTodayLogs(uid).then(setTodayLogs);
  }

  async function quickLog(category: "steps" | "sleep" | "activity", value: number, unit: string, label: string) {
    if (!uid) return;
    const res = await logObservation(uid, category, value, unit);
    setNotice(res.error ?? `Logged ${label}.`);
    if (!res.error) { fetchWeekMetrics(uid, days).then(setData); fetchTodayLogs(uid).then(setTodayLogs); }
  }

  return (
    <>
      <PageHeader title="Track" subtitle="Log today and review detailed history" />
      {!live && <DemoBanner />}
      {notice && <p className="mb-3 text-sm text-status-ok" role="status">{notice}</p>}

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Quick log</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-body">Water</span>
              <span className="font-semibold text-ink-strong">{live ? "+250 ml per tap" : `${water} ml`}</span>
            </div>
            <div className="flex gap-2">
              <PrimaryButton onClick={quickWater}>+250 ml</PrimaryButton>
              {!live && (
                <button className="min-h-[44px] rounded-full border border-surface-sunken px-4 text-sm text-ink-muted" onClick={() => setWater(0)}>Reset</button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(live
              ? [
                  { a: "Log 1,000 steps", fn: () => quickLog("steps", 1000, "count", "1,000 steps") },
                  { a: "Log 7h sleep", fn: () => quickLog("sleep", 7, "hours", "7 hours of sleep") },
                  { a: "Log 30 active min", fn: () => quickLog("activity", 30, "minutes", "30 active minutes") },
                  { a: "Log 20 active min", fn: () => quickLog("activity", 20, "minutes", "20 active minutes") },
                ]
              : ["Log meal", "Log activity", "Log sleep", "Log BP (optional)"].map((a) => ({ a, fn: undefined }))
            ).map((item) => (
              <button key={item.a} onClick={item.fn} className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-3 text-sm font-medium text-ink-body hover:bg-surface-sunken">
                {item.a}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          {live
            ? "Entries save to your account immediately and count toward today's totals and your weekly charts."
            : "Meal photos go to private storage and need your confirmation. Barcode lookup is a planned integration - manual entry always works."}
        </p>
      </Card>

      {live && (
        <Card className="mb-4">
          <h2 className="mb-3 font-semibold text-ink-strong">Water goal</h2>
          <form className="flex items-center gap-2" onSubmit={saveWaterGoal}>
            <label htmlFor="water-goal" className="text-sm text-ink-body">Daily target (ml)</label>
            <input id="water-goal" type="number" min={1} value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)}
              className="min-h-[44px] w-28 rounded-full border border-surface-sunken bg-surface-overlay px-4 text-sm" />
            <PrimaryButton type="submit">Save goal</PrimaryButton>
          </form>
        </Card>
      )}

      {live && (
        <Card className="mb-4">
          <h2 className="mb-3 font-semibold text-ink-strong">Today's entries</h2>
          {todayLogs.length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing logged yet today.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todayLogs.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-xl border border-surface-sunken px-3 py-2 text-sm">
                  <span className="text-ink-body">
                    {l.category} - {l.value} {l.unit} - {new Date(l.measured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button onClick={() => removeLog(l)} className="min-h-[44px] rounded-full px-3 text-sm font-medium text-status-danger hover:bg-surface-sunken">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Time range">
        {RANGES.map((r) => (
          <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)}
            className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${range === r ? "bg-brand-teal text-white" : "bg-surface-sunken text-ink-muted"}`}>
            {r}
          </button>
        ))}
      </div>
      {range === "15 days" && (
        <p className="mb-4 text-sm text-ink-muted">
          Detailed data is kept for 15 days. Views beyond that use retained aggregate Insights
          (weekly averages) with no drill-through to deleted readings.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Steps</h3>
          <BarChart values={data.map((d) => d.steps)} goal={goals.steps} labels={data.map((d) => d.day)} unit="steps" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Sleep</h3>
          <BarChart values={data.map((d) => d.sleepHours)} goal={goals.sleepHours} labels={data.map((d) => d.day)} unit="hours" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Hydration</h3>
          <BarChart values={data.map((d) => d.waterMl)} goal={goals.waterMl} labels={data.map((d) => d.day)} unit="ml" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Sources and freshness</h3>
          <ul className="space-y-2 text-sm text-ink-body">
            <li className="flex justify-between"><span>Manual entries</span><span className="text-ink-muted">{live ? "live" : "just now"}</span></li>
            <li className="flex justify-between"><span>Apple Health</span><span className="text-ink-muted">needs iOS app</span></li>
            <li className="flex justify-between"><span>Epic / MyChart</span><span className="text-ink-muted">sandbox only</span></li>
          </ul>
          <p className="mt-3 text-xs text-ink-faint">Measurement time is shown separately from last transfer. Missing data is never shown as zero.</p>
        </Card>
      </div>
    </>
  );
}
