"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/use-session";

/**
 * Live-mode guard: unauthenticated visitors go to /signin; the provider area
 * additionally requires the provider role. Demo mode renders children as-is.
 */
export function AuthGate({ children, requireRole }: { children: React.ReactNode; requireRole?: "provider" }) {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status === "signed-out") router.replace("/signin");
    if (session.status === "signed-in" && requireRole && session.role !== requireRole) router.replace("/today");
  }, [session, requireRole, router]);
  if (session.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink-muted">Loading…</p>
      </main>
    );
  }
  if (session.status === "signed-out") return null;
  if (session.status === "signed-in" && requireRole && session.role !== requireRole) return null;
  return <>{children}</>;
}
