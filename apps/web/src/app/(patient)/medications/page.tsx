"use client";
import { useEffect, useState } from "react";
import { Card, DemoBanner, PageHeader, PrimaryButton, SecondaryButton, StatePill } from "@/components/ui";
import { adherenceRate } from "@kova/domain";
import { DOSE_HISTORY, MEDICATIONS } from "@/lib/demo-data";
import { useSession } from "@/lib/use-session";
import { addMedication, fetchMedications, markDoseTaken, type LiveMedication } from "@/lib/live";

export default function MedicationsPage() {
  const session = useSession();
  const live = session.status === "signed-in";
  const uid = live ? session.userId : null;
  const [meds, setMeds] = useState<LiveMedication[]>([]);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [sched, setSched] = useState("daily with breakfast");
  const [notice, setNotice] = useState<string | null>(null);
  const adherence = adherenceRate(DOSE_HISTORY);

  useEffect(() => {
    if (uid) fetchMedications(uid).then(setMeds);
  }, [uid]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !name.trim()) return;
    const res = await addMedication(uid, name.trim(), dose.trim(), sched.trim() || "daily");
    setNotice(res.error ?? `Added ${name.trim()}.`);
    if (!res.error) {
      setName("");
      setDose("");
      fetchMedications(uid).then(setMeds);
    }
  }

  async function taken(m: LiveMedication) {
    if (!uid || !m.scheduleId) return;
    const res = await markDoseTaken(m.scheduleId);
    setNotice(res.error ?? `${m.name} marked taken.`);
    if (!res.error) fetchMedications(uid).then(setMeds);
  }

  return (
    <>
      <PageHeader title="Medications" subtitle="Schedules and dose tracking" />
      {!live && <DemoBanner />}
      {notice && <p className="mb-3 text-sm text-status-ok" role="status">{notice}</p>}

      {live && (
        <Card className="mb-4">
          <h2 className="mb-3 font-semibold text-ink-strong">Add a medication</h2>
          <form onSubmit={add} className="grid gap-2 sm:grid-cols-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Vitamin D)" aria-label="Medication name"
              className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-3 text-sm" />
            <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dose (e.g. 1000 IU)" aria-label="Dose"
              className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-3 text-sm" />
            <input value={sched} onChange={(e) => setSched(e.target.value)} placeholder="Schedule" aria-label="Schedule"
              className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-3 text-sm" />
            <PrimaryButton type="submit">Add</PrimaryButton>
          </form>
        </Card>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {(live ? meds : MEDICATIONS).map((med) => (
          <Card key={med.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-ink-strong">
                  {"name" in med ? med.name : ""} {"dose" in med ? med.dose : ""}
                </h2>
                <p className="text-sm text-ink-muted">
                  {"schedule" in med ? med.schedule : ""}
                  {!live && "provenance" in med ? ` · source: ${med.provenance}` : ""}
                </p>
              </div>
              {!live && "provenance" in med && <StatePill state={med.provenance === "imported" ? "sandbox" : "demo"} />}
              {live && "takenToday" in med && med.takenToday && <StatePill state="connected" />}
            </div>
            {live ? (
              <div className="mt-3 flex items-center gap-3">
                <SecondaryButton onClick={() => taken(med as LiveMedication)}>
                  {"takenToday" in med && med.takenToday ? "Taken today ✓" : "Mark taken"}
                </SecondaryButton>
                {"total14" in med && (med as LiveMedication).total14 > 0 && (
                  <span className="text-xs text-ink-muted">
                    Taken {(med as LiveMedication).taken14} of the last {(med as LiveMedication).total14} doses
                  </span>
                )}
              </div>
            ) : (
              <>
                {"supplyDaysLeft" in med && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-ink-body">Supply: {med.supplyDaysLeft} days left</span>
                    <span className={med.supplyDaysLeft <= 7 ? "font-medium text-status-warn" : "text-ink-muted"}>
                      Refill by {"refillBy" in med ? med.refillBy : ""}
                    </span>
                  </div>
                )}
                {"expiresInDays" in med && (
                  <p className="mt-2 text-xs text-status-warn">
                    Record expires in {med.expiresInDays} days under the 15-day policy. You will be asked to
                    renew or re-enter it; reminders stop when the source expires.
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <SecondaryButton>Mark taken</SecondaryButton>
                  <SecondaryButton>Skip dose</SecondaryButton>
                </div>
              </>
            )}
          </Card>
        ))}
        {live && !meds.length && (
          <Card><p className="text-sm text-ink-muted">No medications yet. Add your first above.</p></Card>
        )}
      </div>

      {!live && (
        <Card>
          <h3 className="mb-2 font-semibold text-ink-strong">Adherence (last 14 days)</h3>
          <p className="text-3xl font-bold text-brand-teal">{adherence.rate ?? 0}%</p>
          <p className="mt-1 text-sm text-ink-muted">Based on recorded dose events. Skipped doses stay visible - they are never rewritten.</p>
        </Card>
      )}
    </>
  );
}
