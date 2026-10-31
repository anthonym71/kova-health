"use client";
import { Card, DemoBanner, PageHeader, StatePill } from "@/components/ui";
import { LiveDemoNotice } from "@/components/ui";
import { useSession } from "@/lib/use-session";
import { IMPORTED_RECORDS } from "@/lib/demo-data";

export default function RecordsPage() {
  const __session = useSession();
  return (
    <>
      <PageHeader title="Records" subtitle="Imported clinical records with provenance" />
      {__session.status === "signed-in" && <LiveDemoNotice />}
      <DemoBanner />
      <Card className="mb-4">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-body">
          <li>Choose your health system</li>
          <li>Authorize on its genuine sign-in page (SMART on FHIR, PKCE)</li>
          <li>Return to Kova and watch import progress</li>
          <li>Review what arrived before it creates any reminders</li>
        </ol>
        <p className="mt-2 text-xs text-ink-faint">
          Imported medications stay pending review before a reminder schedule is created.
          Overlapping records from two systems are preserved for review, never merged by name alone.
        </p>
      </Card>
      <div className="space-y-3">
        {IMPORTED_RECORDS.map((r) => (
          <Card key={r.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink-strong">{r.title}</p>
                <p className="text-xs text-ink-muted">{r.type} · {r.source} · measured {r.measuredAt}</p>
              </div>
              <StatePill state={r.source.includes("sandbox") ? "sandbox" : "demo"} />
            </div>
            <p className="mt-1 text-xs text-status-warn">Expires in {r.expiresInDays} days (15-day retention)</p>
          </Card>
        ))}
      </div>
    </>
  );
}
