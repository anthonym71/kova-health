"use client";
import { Card, DemoBanner, PageHeader, StatePill } from "@/components/ui";
import { LiveDemoNotice } from "@/components/ui";
import { useSession } from "@/lib/use-session";
import { CONNECTIONS } from "@/lib/demo-data";

const SECTIONS = [
  { kind: "ehr" as const, title: "Health records (EHR)", note: "Authorization always happens on your health system's real sign-in page. Kova never collects MyChart passwords." },
  { kind: "phone_platform" as const, title: "Phone health platforms", note: "Apple Health and Health Connect are on-device stores. The website can show already-uploaded data but cannot read the phone - setup happens in the Kova mobile app." },
  { kind: "wearable" as const, title: "Wearables and companion apps", note: "Routes verified in the capability registry (Oct 31, 2026). A brand card is not a guarantee every metric is available; unsupported routes stay disabled and manual entry always works." },
];

export default function ConnectionsPage() {
  const __session = useSession();
  return (
    <>
      <PageHeader title="Connections" subtitle="Records, phone health platforms and wearables" />
      {__session.status === "signed-in" && <LiveDemoNotice />}
      <DemoBanner />
      {SECTIONS.map((sec) => (
        <div key={sec.kind} className="mb-6">
          <h2 className="mb-1 text-lg font-semibold text-ink-strong">{sec.title}</h2>
          <p className="mb-3 text-sm text-ink-muted">{sec.note}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CONNECTIONS.filter((c) => c.kind === sec.kind).map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink-strong">{c.name}</h3>
                  <StatePill state={c.state} />
                </div>
                <p className="mt-1 text-sm text-ink-body">{c.route}</p>
                <p className="mt-2 text-xs text-ink-muted">{c.stateDetail}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.categories.map((cat) => (
                    <span key={cat} className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-ink-muted">{cat.replace("_", " ")}</span>
                  ))}
                </div>
                {c.helpUrl ? (
                  <a href={c.helpUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-brand-blue underline">
                    Official setup guidance
                  </a>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      ))}
      <Card className="!p-4">
        <p className="text-xs leading-relaxed text-ink-muted">
          Read-only MVP. Initial import covers at most the most recent 15 days. Sync is on connection,
          on foreground/manual refresh and where the OS allows background work - never promised as
          real-time. Disconnecting, pausing uploads and deleting imported data are separate controls.
        </p>
      </Card>
    </>
  );
}
