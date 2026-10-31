"use client";
import { useCallback, useEffect, useState } from "react";
import { Card, PageHeader, PrimaryButton, SecondaryButton, StatePill } from "@/components/ui";
import {
  connectProvider, fetchMessages, fetchPatientProviders, fetchPlanItems, listVerifiedProviders,
  revokeGrant, sendMessage, setGrant, type LiveMessage, type ProviderRow,
} from "@/lib/live";

const SHAREABLE = ["steps", "activity", "sleep", "hydration"] as const;

export function LiveCareTeam({ uid }: { uid: string }) {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [directory, setDirectory] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<ProviderRow | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [planItems, setPlanItems] = useState<{ title: string; author: string; items: { id: string; label: string }[] } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pick, setPick] = useState<string[]>(["steps", "activity", "sleep", "hydration"]);

  const refresh = useCallback(() => {
    fetchPatientProviders(uid).then((rows) => {
      setProviders(rows);
      setSelected((cur) => (cur ? rows.find((r) => r.relationshipId === cur.relationshipId) ?? null : null));
    });
    fetchPlanItems(uid).then(setPlanItems);
  }, [uid]);

  useEffect(() => {
    refresh();
    listVerifiedProviders().then(setDirectory);
  }, [refresh]);

  useEffect(() => {
    if (selected) fetchMessages(selected.relationshipId, uid).then(setMessages);
  }, [selected?.relationshipId, uid]);

  async function connect(providerId: string) {
    const res = await connectProvider(uid, providerId);
    setNotice(res.error ?? "Provider connected. Now choose what to share.");
    refresh();
  }

  async function grant() {
    if (!selected) return;
    const res = await setGrant(selected.relationshipId, pick, true);
    setNotice(res.error ?? `Sharing updated: ${pick.join(", ")}.`);
    refresh();
  }

  async function revoke() {
    if (!selected?.grantId) return;
    const res = await revokeGrant(selected.grantId);
    setNotice(res.error ?? "Access revoked. Future reads are blocked immediately.");
    refresh();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    const res = await sendMessage(selected.relationshipId, uid, draft.trim());
    if (res.error) return setNotice(res.error);
    setDraft("");
    fetchMessages(selected.relationshipId, uid).then(setMessages);
  }

  const connectedIds = new Set(providers.map((p) => p.providerId));
  const available = directory.filter((d) => !connectedIds.has(d.id));

  return (
    <>
      <PageHeader title="Care Team" subtitle="Provider Connect - sharing, messages and plans" />
      {notice && <p className="mb-3 text-sm text-status-ok" role="status">{notice}</p>}

      {available.length > 0 && (
        <Card className="mb-4">
          <h2 className="mb-2 font-semibold text-ink-strong">Connect a provider</h2>
          <div className="flex flex-wrap gap-2">
            {available.map((d) => (
              <SecondaryButton key={d.id} onClick={() => connect(d.id)}>Connect: {d.name}</SecondaryButton>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">Only independently verified providers appear here.</p>
        </Card>
      )}

      {!providers.length && !available.length && (
        <Card className="mb-4"><p className="text-sm text-ink-muted">No verified providers are registered yet.</p></Card>
      )}

      {providers.length > 0 && (
        <Card className="mb-4">
          <h2 className="mb-2 font-semibold text-ink-strong">Your providers</h2>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <button key={p.relationshipId} onClick={() => setSelected(p)}
                className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${selected?.relationshipId === p.relationshipId ? "bg-brand-teal text-white" : "bg-surface-sunken text-ink-muted"}`}>
                {p.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <>
          <Card className="mb-4">
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-ink-strong">Sharing with {selected.name}</h2>
              <StatePill state={selected.grantId ? "connected" : "unavailable"} />
            </div>
            <p className="mt-1 text-sm text-ink-body">
              {selected.grantId ? `Sharing: ${selected.categories.join(", ")}` : "Nothing shared right now."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SHAREABLE.map((c) => (
                <label key={c} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm ${pick.includes(c) ? "border-brand-teal bg-brand-tealsoft text-ink-strong" : "border-surface-sunken text-ink-muted"}`}>
                  <input type="checkbox" className="sr-only" checked={pick.includes(c)}
                    onChange={(e) => setPick((cur) => (e.target.checked ? [...cur, c] : cur.filter((x) => x !== c)))} />
                  {c}
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton onClick={grant}>{selected.grantId ? "Update sharing" : "Start sharing"}</PrimaryButton>
              {selected.grantId && (
                <button onClick={revoke} className="min-h-[44px] rounded-full border border-status-danger px-4 text-sm font-medium text-status-danger">
                  Revoke access
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Revocation blocks future reads, messages about new data, exports and realtime updates immediately.
              Medications, records and messages are never part of a data grant.
            </p>
          </Card>

          <Card className="mb-4">
            <h2 className="mb-3 font-semibold text-ink-strong">Messages</h2>
            <div className="mb-3 max-h-72 space-y-2 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "ml-auto bg-brand-blue text-white" : "bg-surface-sunken text-ink-body"}`}>
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[11px] ${m.from === "me" ? "text-white/70" : "text-ink-faint"}`}>{m.at}</p>
                </div>
              ))}
              {!messages.length && <p className="text-sm text-ink-muted">No messages yet.</p>}
            </div>
            <form onSubmit={send} className="flex gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message your care team" aria-label="Message"
                className="min-h-[44px] flex-1 rounded-full border border-surface-sunken bg-surface-overlay px-4 text-sm" />
              <PrimaryButton type="submit">Send</PrimaryButton>
            </form>
          </Card>
        </>
      )}

      <Card>
        <h2 className="mb-3 font-semibold text-ink-strong">{planItems?.title ?? "Care plan"}</h2>
        {planItems && planItems.items.length ? (
          <ul className="space-y-2">
            {planItems.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="text-ink-faint">☐</span>
                <span className="text-ink-body">{item.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No plan items published yet.</p>
        )}
        {planItems && <p className="mt-3 text-xs text-ink-faint">Published by {planItems.author}. Clinician plans are distinct from your own goals and cannot change prescriptions.</p>}
      </Card>
    </>
  );
}
