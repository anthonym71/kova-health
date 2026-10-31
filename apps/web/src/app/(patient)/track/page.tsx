"use client";
import { useState } from "react";
import { BarChart, Card, DemoBanner, PageHeader, PrimaryButton } from "@/components/ui";
import { GOALS, WEEK_METRICS } from "@/lib/demo-data";

const RANGES = ["7 days", "15 days"] as const;

export default function TrackPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("7 days");
  const [water, setWater] = useState(1500);
  const data = WEEK_METRICS; // synthetic fixture; a 15-day view reuses the same demo set
  return (
    <>
      <PageHeader title="Track" subtitle="Log today and review detailed history" />
      <DemoBanner />

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Quick log</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-body">Water</span>
              <span className="font-semibold text-ink-strong">{water} ml</span>
            </div>
            <div className="flex gap-2">
              <PrimaryButton onClick={() => setWater((w) => w + 250)}>+250 ml</PrimaryButton>
              <button className="min-h-[44px] rounded-full border border-surface-sunken px-4 text-sm text-ink-muted" onClick={() => setWater(0)}>Reset</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Log meal", "Log activity", "Log sleep", "Log BP (optional)"].map((a) => (
              <button key={a} className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-3 text-sm font-medium text-ink-body hover:bg-surface-sunken">
                {a}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Meal photos go to private storage and need your confirmation. Barcode lookup is a planned
          integration - manual entry always works. Kova never invents nutrients from a photo.
        </p>
      </Card>

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
          <h3 className="mb-3 font-semibold text-ink-strong">Sleep</h3>
          <BarChart values={data.map((d) => d.sleepHours)} goal={GOALS.sleepHours} labels={data.map((d) => d.day)} unit="hours" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Hydration</h3>
          <BarChart values={data.map((d) => d.waterMl)} goal={GOALS.waterMl} labels={data.map((d) => d.day)} unit="ml" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Active minutes</h3>
          <BarChart values={data.map((d) => d.activeMinutes)} goal={GOALS.activeMinutes} labels={data.map((d) => d.day)} unit="min" />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-ink-strong">Sources and freshness</h3>
          <ul className="space-y-2 text-sm text-ink-body">
            <li className="flex justify-between"><span>Manual entries</span><span className="text-ink-muted">just now</span></li>
            <li className="flex justify-between"><span>Apple Health</span><span className="text-ink-muted">needs iOS app</span></li>
            <li className="flex justify-between"><span>Epic / MyChart</span><span className="text-ink-muted">sandbox only</span></li>
          </ul>
          <p className="mt-3 text-xs text-ink-faint">Measurement time is shown separately from last transfer. Missing data is never shown as zero.</p>
        </Card>
      </div>
    </>
  );
}
