import type { ReactNode } from "react";
import type { IntegrationState } from "@kova/domain";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-card border border-surface-sunken bg-surface-raised p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold text-ink-strong">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}

const STATE_STYLES: Record<IntegrationState | "verified" | "pending", { bg: string; text: string; label: string }> = {
  demo: { bg: "bg-brand-lilacsoft", text: "text-brand-lilac", label: "Demo data" },
  sandbox: { bg: "bg-brand-bluesoft", text: "text-brand-blue", label: "Sandbox" },
  connected: { bg: "bg-status-oksoft", text: "text-status-ok", label: "Connected" },
  unavailable: { bg: "bg-status-warnsoft", text: "text-status-warn", label: "Unavailable" },
  requires_mobile_app: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Needs mobile app" },
  unsupported: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Unsupported" },
  verified: { bg: "bg-status-oksoft", text: "text-status-ok", label: "Verified" },
  pending: { bg: "bg-status-warnsoft", text: "text-status-warn", label: "Pending" },
};

export function StatePill({ state }: { state: keyof typeof STATE_STYLES }) {
  const s = STATE_STYLES[state];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export function DemoBanner() {
  return (
    <div className="mb-4 rounded-card border border-brand-lilac/30 bg-brand-lilacsoft px-4 py-3 text-sm text-ink-body">
      <strong className="font-semibold text-brand-lilac">Synthetic demo.</strong>{" "}
      All people, measurements, messages and appointments here are fabricated. No real health
      data, no live clinical service.
    </div>
  );
}

export function LiveTestBanner() {
  return (
    <div className="mb-4 rounded-card border border-status-warn/40 bg-status-warn/10 px-4 py-3 text-sm text-ink-body">
      <strong className="font-semibold text-status-warn">Hackathon test build.</strong>{" "}
      Fictional test accounts and data only. Not for real health data or clinical use.
    </div>
  );
}

export function ProgressBar({ value, goal, color = "bg-brand-teal" }: { value: number; goal: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function BarChart({
  values,
  goal,
  labels,
  unit,
}: {
  values: (number | null)[];
  goal?: number;
  labels: string[];
  unit: string;
}) {
  const max = Math.max(goal ?? 0, ...values.map((v) => v ?? 0)) * 1.15 || 1;
  return (
    <div>
      <div className="flex h-32 items-stretch gap-2" role="img" aria-label={`Bar chart of ${unit} by day`}>
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            {v === null ? (
              <div className="flex h-full w-full items-center justify-center rounded-t-md border border-dashed border-ink-faint/40 text-[10px] text-ink-faint">
                no data
              </div>
            ) : (
              <div
                className={`w-full rounded-t-md ${goal !== undefined && v >= goal ? "bg-brand-teal" : "bg-brand-blue"}`}
                style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                title={`${labels[i]}: ${v} ${unit}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {labels.map((l) => (
          <div key={l} className="flex-1 text-center text-[11px] text-ink-muted">
            {l}
          </div>
        ))}
      </div>
      {goal !== undefined ? <p className="mt-1 text-xs text-ink-muted">Goal: {goal} {unit}. Missing readings are unknown, never zero.</p> : null}
    </div>
  );
}

export function PrimaryButton({ children, href, onClick, type }: { children: ReactNode; href?: string; onClick?: () => void; type?: "submit" }) {
  const cls =
    "inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-tealdark";
  if (href) return <a className={cls} href={href}>{children}</a>;
  return <button className={cls} onClick={onClick} type={type ?? "button"}>{children}</button>;
}

export function SecondaryButton({ children, href, onClick }: { children: ReactNode; href?: string; onClick?: () => void }) {
  const cls =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-teal px-5 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-tealsoft";
  if (href) return <a className={cls} href={href}>{children}</a>;
  return <button className={cls} onClick={onClick} type="button">{children}</button>;
}
