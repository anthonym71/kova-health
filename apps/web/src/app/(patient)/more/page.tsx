"use client";
import { Card, DemoBanner, PageHeader } from "@/components/ui";
import { RETENTION_NOTICE } from "@/lib/demo-data";

const LINKS = [
  { href: "/connections", title: "Connections", desc: "Records, phone health platforms and wearables" },
  { href: "/records", title: "Records", desc: "Imported clinical records and provenance" },
  { href: "/summary", title: "Health summary", desc: "Compose and share an expiring snapshot" },
  { href: "/guidance", title: "Symptom Guidance", desc: "Guidance Plus add-on (demo)" },
  { href: "/provider", title: "Provider workspace", desc: "Switch to the clinician view (demo)" },
  { href: "/signin", title: "Sign out", desc: "End the demo session" },
];

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" subtitle="Settings, connections and account" />
      <DemoBanner />
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="rounded-card border border-surface-sunken bg-surface-raised p-5 shadow-sm hover:border-brand-teal">
            <h2 className="font-semibold text-ink-strong">{l.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{l.desc}</p>
          </a>
        ))}
      </div>
      <Card className="mt-4">
        <h2 className="mb-2 font-semibold text-ink-strong">Your data</h2>
        <p className="text-sm text-ink-body">{RETENTION_NOTICE}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="min-h-[44px] rounded-full border border-surface-sunken px-4 text-ink-body">Export my data</button>
          <button className="min-h-[44px] rounded-full border border-status-danger px-4 text-status-danger">Delete my account</button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Account deletion also removes retained Insights within the declared process. Disconnecting a
          source, revoking a provider and deleting imported data are separate controls.
        </p>
      </Card>
    </>
  );
}
