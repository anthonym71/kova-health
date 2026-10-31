"use client";
import { useRouter } from "next/navigation";
import { isLive } from "@/lib/supabase";
import { signOut } from "@/lib/live";
import { useSession } from "@/lib/use-session";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const session = useSession();
  if (!isLive || session.status !== "signed-in") return null;
  return (
    <button
      className={className || "block rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken"}
      onClick={async () => {
        await signOut();
        router.replace("/signin");
      }}
    >
      Sign out
    </button>
  );
}

export function WhoAmI() {
  const session = useSession();
  if (session.status === "signed-in") {
    return <span className="text-ink-muted">{session.displayName}{session.role === "provider" ? " (provider)" : ""}</span>;
  }
  return <span className="text-ink-muted">Synthetic demo</span>;
}
