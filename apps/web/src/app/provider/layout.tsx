import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { LiveTestBanner } from "@/components/ui";
import { SignOutButton, WhoAmI } from "@/components/sign-out";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav aria-label="Provider" className="flex items-center justify-between border-b border-surface-sunken bg-surface-raised px-4 py-3 md:px-8">
        <Link href="/provider" className="text-lg font-bold text-ink-strong">
          Kova <span className="text-brand-blue">Provider</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <WhoAmI />
          <Link href="/today" className="font-medium text-brand-teal">Patient view →</Link>
          <SignOutButton className="font-medium text-status-danger" />
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8"><LiveTestBanner /><AuthGate requireRole="provider">{children}</AuthGate></main>
    </div>
  );
}
