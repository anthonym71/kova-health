import { Card, DemoBanner, PageHeader, StatePill } from "@/components/ui";
import { DEMO_PATIENT } from "@/lib/demo-data";

const PATIENTS = [
  {
    ...DEMO_PATIENT,
    sharedWith: "activity, sleep, hydration · expires Nov 14",
    lastActive: "Today",
    plan: "Two-week activity plan (v2)",
  },
];

export default function ProviderDashboard() {
  return (
    <>
      <PageHeader title="My patients" subtitle="Provider workspace - synthetic demo" />
      <DemoBanner />
      <Card className="mb-4 !p-4">
        <p className="text-sm text-ink-body">
          You see only what each patient has explicitly granted. Grants carry categories, date ranges
          and expiry, and patients can revoke at any time. This inbox is reviewed once per business
          day - it is not continuously monitored.
        </p>
      </Card>
      <div className="space-y-3">
        {PATIENTS.map((p) => (
          <a key={p.id} href={`/provider/patients/${p.id}`} className="block">
            <Card className="hover:border-brand-blue">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink-strong">{p.name}</p>
                  <p className="text-sm text-ink-muted">Sharing: {p.sharedWith}</p>
                  <p className="text-sm text-ink-muted">Active plan: {p.plan}</p>
                </div>
                <div className="text-right">
                  <StatePill state="demo" />
                  <p className="mt-1 text-xs text-ink-faint">Last active: {p.lastActive}</p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}
