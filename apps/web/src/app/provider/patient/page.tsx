"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Card, PageHeader, PrimaryButton, StatePill } from "@/components/ui";
import { useSession } from "@/lib/use-session";
import { fetchProviderPatients, fetchSharedMetrics, publishPlanItem, fetchGoals, type PatientRow, type WeekPoint } from "@/lib/live";

function LivePatientDetail() {
  const params = useSearchParams();
  const patientId = params.get("id");
  const session = useSession();
  const live = session.status === "signed-in" && session.role === "provider";
  const uid = live ? session.userId : null;
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [week, setWeek] = useState<WeekPoint[]>([]);
  const [goals, setGoals] = useState({ steps: 8000, sleepHours: 7.5, waterMl: 2000 });
  const [task, setTask] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!uid || !patientId) return;
    fetchProviderPatients(uid).then((rows) => {
      const p = rows.find((r) => r.patientId === patientId) ?? null;
      setPatient(p);
      if (!p) return setDenied(true);
      if (!p.categories.length) return setDenied(true);
      fetchSharedMetrics(patientId, p.categories).then(setWeek);
    });
    fetchGoals(patientId).then((g) => setGoals({ steps: g.steps, sleepHours: g.sleepHours, waterMl: g.waterMl })).catch(() => {});
  }, [uid, patientId]);

  if (!live) {
    return (
      <>
        <PageHeader title="Patient detail" />
        <Card><p className="text-sm text-ink-muted">Sign in with a verified provider account to view shared patient data.</p></Card>
      </>
    );
  }
  if (denied || !patient) {
    return (
      <>
        <PageHeader title="Patient detail" subtitle="Permitted data only" />
        <Card>
          <StatePill state="unavailable" />
          <p className="mt-2 text-sm text-ink-body">
            No active grant covers this patient. Ask them to share specific categories from their
            Care Team page. Without a grant you cannot see any of their data.
          </p>
        </Card>
      </>
    );
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !patient || !task.trim()) return;
    const res = await publishPlanItem(patient.relationshipId, uid, task.trim());
    setNotice(res.error ?? "Plan item published to the patient's Today page.");
    if (!res.error) setTask("");
  }

  const canSee = (c: string) => patient.categories.includes("all") || patient.categories.includes(c);

  return (
    <>
      <PageHeader title={patient.name} subtitle={`Permitted data only · grant: ${patient.categories.join(", ") || "none"}`} />
      {notice && <p className="mb-3 text-sm text-status-ok" role="status">{notice}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Steps {canSee("steps") ? "(shared category)" : "(not shared)"}</h2>
          {canSee("steps") ? (
            <BarChart values={week.map((d) => d.steps)} goal={goals.steps} labels={week.map((d) => d.day)} unit="steps" />
          ) : (
            <p className="text-sm text-ink-muted">Outside this patient's grant and hidden.</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Sleep {canSee("sleep") ? "(shared category)" : "(not shared)"}</h2>
          {canSee("sleep") ? (
            <BarChart values={week.map((d) => d.sleepHours)} goal={goals.sleepHours} labels={week.map((d) => d.day)} unit="hours" />
          ) : (
            <p className="text-sm text-ink-muted">Outside this patient's grant and hidden.</p>
          )}
          <p className="mt-2 text-xs text-ink-faint">Medications, records and messages are outside data grants and always hidden.</p>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-strong">Hydration {canSee("hydration") ? "(shared category)" : "(not shared)"}</h2>
          {canSee("hydration") ? (
            <BarChart values={week.map((d) => d.waterMl)} goal={goals.waterMl} labels={week.map((d) => d.day)} unit="ml" />
          ) : (
            <p className="text-sm text-ink-muted">Outside this patient's grant and hidden.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-ink-strong">Publish care plan item</h2>
        <form className="flex gap-2" onSubmit={publish}>
          <label htmlFor="plan-item" className="sr-only">New plan item</label>
          <input id="plan-item" value={task} onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Add a 10-minute evening walk"
            className="min-h-[44px] flex-1 rounded-full border border-surface-sunken bg-surface-overlay px-4 text-sm" />
          <PrimaryButton type="submit">Publish</PrimaryButton>
        </form>
        <p className="mt-2 text-xs text-ink-faint">Plans carry authorship and version history. A plan can never overwrite a prescription.</p>
      </Card>
    </>
  );
}

export default function PatientDetailPage() {
  return (
    <Suspense fallback={null}>
      <LivePatientDetail />
    </Suspense>
  );
}
