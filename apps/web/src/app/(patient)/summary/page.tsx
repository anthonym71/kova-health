"use client";
import { useState } from "react";
import { Card, DemoBanner, PageHeader, PrimaryButton, StatePill } from "@/components/ui";

const CATEGORIES = ["Conditions", "Allergies", "Medications", "Activity", "Sleep", "Hydration"];

export default function SummaryPage() {
  const [selected, setSelected] = useState<string[]>(["Medications"]);
  const toggle = (c: string) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  return (
    <>
      <PageHeader title="Health summary" subtitle="Compose and share a snapshot with expiring access" />
      <DemoBanner />
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Choose what to include</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => toggle(c)} aria-pressed={selected.includes(c)}
              className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${selected.includes(c) ? "bg-brand-teal text-white" : "bg-surface-sunken text-ink-muted"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-surface-sunken p-3 text-sm text-ink-body">
          Preview: {selected.length ? selected.join(", ") : "Nothing selected"} · last 15 days (detailed data limit)
          <p className="mt-1 text-xs text-ink-faint">
            The export uses the same permission-filtered queries as your charts and includes reporting
            period, missing-data context and provenance.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <PrimaryButton>Generate PDF (demo)</PrimaryButton>
          <StatePill state="demo" />
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold text-ink-strong">Sharing rules</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-body">
          <li>Share links expire within 7 days and never outlive the underlying data</li>
          <li>Download URLs last minutes; files live in private storage</li>
          <li>Revoking blocks future app access immediately</li>
          <li>Downloaded copies cannot be recalled - Kova says this plainly before you share</li>
          <li>Generated PDFs are deleted within 24 hours</li>
        </ul>
      </Card>
    </>
  );
}
