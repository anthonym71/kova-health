"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/use-session";
import { LiveTestBanner } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (session.status === "signed-in") {
      router.replace(session.role === "provider" ? "/provider" : "/today");
    } else if (session.status === "demo") {
      router.replace("/today");
    }
  }, [session, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10">
      <LiveTestBanner />
      <div>
        <h1 className="text-2xl font-bold text-ink-strong">Kova Health</h1>
        <p className="mt-1 text-sm text-ink-muted">Personal health manager. Choose how you want to sign in.</p>
      </div>
      <a
        href="/signin/?role=patient"
        className="block rounded-2xl border border-surface-sunken bg-surface-overlay p-5 shadow-sm transition hover:border-brand-teal"
      >
        <h2 className="font-semibold text-ink-strong">I'm a patient</h2>
        <p className="mt-1 text-sm text-ink-body">
          Track habits, medications and goals, and choose exactly what your care team can see.
        </p>
        <span className="mt-3 inline-block text-sm font-medium text-brand-teal">Sign in or create an account →</span>
      </a>
      <a
        href="/signin/?role=provider"
        className="block rounded-2xl border border-surface-sunken bg-surface-overlay p-5 shadow-sm transition hover:border-brand-teal"
      >
        <h2 className="font-semibold text-ink-strong">I'm a provider</h2>
        <p className="mt-1 text-sm text-ink-body">
          View only the data your patients have explicitly shared with you.
        </p>
        <span className="mt-3 inline-block text-sm font-medium text-brand-teal">Provider sign in →</span>
      </a>
      <p className="text-xs text-ink-faint">
        Provider accounts are verified separately. Sign-up always creates a patient account; no one can make
        themselves a provider.
      </p>
    </main>
  );
}
