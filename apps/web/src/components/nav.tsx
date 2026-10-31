"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out";

const TABS = [
  { href: "/today", label: "Today", icon: "◐" },
  { href: "/track", label: "Track", icon: "✚" },
  { href: "/medications", label: "Meds", icon: "▣" },
  { href: "/care-team", label: "Care Team", icon: "♡" },
  { href: "/more", label: "More", icon: "⋯" },
];

export function PatientNav() {
  const path = usePathname();
  const item = (active: boolean) =>
    `flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs ${
      active ? "font-semibold text-brand-teal" : "text-ink-muted"
    }`;
  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label="Patient" className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-surface-sunken bg-surface-raised p-4 md:flex">
        <Link href="/today" className="mb-6 text-lg font-bold text-ink-strong">
          Kova <span className="text-brand-teal">Health</span>
        </Link>
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`${item(path.startsWith(t.href))} !flex-row !justify-start gap-3 rounded-xl px-3 py-2.5 text-sm ${path.startsWith(t.href) ? "bg-brand-tealsoft" : ""}`}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </Link>
        ))}
        <div className="mt-auto space-y-2">
          <Link href="/provider" className="block rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken">
            Provider workspace →
          </Link>
          <SignOutButton />
          <p className="px-3 text-[11px] leading-snug text-ink-faint">Kova Health. Not for real clinical use.</p>
        </div>
      </nav>
      {/* Mobile bottom tabs */}
      <nav aria-label="Patient" className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-surface-sunken bg-surface-raised pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={item(path.startsWith(t.href))}>
            <span aria-hidden className="text-base">{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
