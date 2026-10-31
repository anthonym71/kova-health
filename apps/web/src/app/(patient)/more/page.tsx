"use client";
import { useRouter } from "next/navigation";
import { Card, DemoBanner, PageHeader } from "@/components/ui";
import { RETENTION_NOTICE } from "@/lib/demo-data";
import { useSession } from "@/lib/use-session";
import { signOut } from "@/lib/live";

const LINKS = [
  { href: "/connections", title: "Connections", desc: "Records, phone health platforms and wearables" },
  { href: "/records", title: "Records", desc: "Imported clinical records and provenance" },
  { href: "/summary", title: "Health summary", desc: "Compose and share an expiring snapshot" },
  { href: "/guidance", title: "Symptom Guidance", desc: "Guidance Plus add-on (demo)" },
  { href: "/provider", title: "Provider workspace", desc: "Clinician view for verified provider accounts" },
];

export default function MorePage() {
  const session = useSession();
  const live = session.status === "signed-in";
  const router = useRouter();

  async function doSignOut() {
    await signOut();
    router.replace("/signin");
  }

  return (
    <>
      <PageHeader title="More" subtitle="Settings, connections and account" />
      {!live && <DemoBanner />}
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="rounded-card border border-surface-sunken bg-surface-raised p-5 shadow-sm hover:border-brand-teal">
            <h2 className="font-semibold text-ink-strong">{l.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{l.desc}</p>
          </a>
        ))}
        {live ? (
          <button onClick={doSignOut} className="rounded-card border border-surface-sunken bg-surface-raised p-5 text-left shadow-sm hover:border-brand-teal">
            <h2 className="font-semibold text-ink-strong">Sign out</h2>
            <p className="mt-1 text-sm text-ink-muted">
              End this session{session.status === "signed-in" ? ` (${session.displayName})` : ""}
            </p>
          </button>
        ) : (
          <a href="/signin" className="rounded-card border border-surface-sunken bg-surface-raised p-5 shadow-sm hover:border-brand-teal">
            <h2 className="font-semibold text-ink-strong">Sign out</h2>
            <p className="mt-1 text-sm text-ink-muted">End the demo session</p>
          </a>
        )}
      </div>
      <Card className="mt-4">
        <h2 className="mb-2 font-semibold text-ink-strong">Your data</h2>
        <p className="text-sm text-ink-body">{RETENTION_NOTICE}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button disabled className="min-h-[44px] cursor-not-allowed rounded-full border border-surface-sunken px-4 text-ink-faint opacity-60">Export my data</button>
          <button disabled className="min-h-[44px] cursor-not-allowed rounded-full border border-surface-sunken px-4 text-ink-faint opacity-60">Delete my account</button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Not available in this hackathon build - these controls are shown for design review and do nothing yet.</p>
        <p className="mt-2 text-xs text-ink-faint">
          The full design also removes retained Insights when an account is deleted, and treats
          disconnecting a source, revoking a provider and deleting imported data as separate controls.
        </p>
      </Card>
    </>
  );
}
