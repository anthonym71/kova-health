"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader, PrimaryButton } from "@/components/ui";
import { isLive } from "@/lib/supabase";
import { signIn, signUpPatient } from "@/lib/live";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isLive) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <PageHeader title="Kova Health" subtitle="Synthetic demo build - not for real patient data" />
        <Card>
          <h2 className="mb-2 font-semibold text-ink-strong">Demo sign-in</h2>
          <p className="mb-4 text-sm text-ink-body">
            This build was exported without live credentials, so it shows fabricated data only.
          </p>
          <div className="flex flex-col gap-2">
            <PrimaryButton href="/today">Continue as demo patient</PrimaryButton>
            <PrimaryButton href="/provider">Continue as demo provider</PrimaryButton>
          </div>
        </Card>
      </main>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "signup") {
      const res = await signUpPatient(email, password, name || email.split("@")[0]);
      setBusy(false);
      if (res.error) return setError(res.error);
      if (res.needsEmailConfirm) {
        setInfo("Account created. Check your email for the verification link, then sign in.");
        setMode("signin");
        return;
      }
      router.replace("/today");
      return;
    }
    const res = await signIn(email, password);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.replace("/today");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <PageHeader title="Kova Health" subtitle="Sign in to your account" />
      <Card>
        <h2 className="mb-4 font-semibold text-ink-strong">
          {mode === "signin" ? "Sign in" : "Create a patient account"}
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-4 text-sm"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Display name"
            />
          )}
          <input
            className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-4 text-sm"
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
          />
          <input
            className="min-h-[44px] rounded-xl border border-surface-sunken bg-surface-overlay px-4 text-sm"
            placeholder="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />
          {error && <p className="text-sm text-status-danger" role="alert">{error}</p>}
          {info && <p className="text-sm text-status-ok">{info}</p>}
          <PrimaryButton type="submit">{busy ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}</PrimaryButton>
        </form>
        <button
          className="mt-3 text-sm text-brand-teal underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signin" ? "New here? Create a patient account" : "Already have an account? Sign in"}
        </button>
        <p className="mt-3 text-xs text-ink-faint">
          Public sign-up creates patient accounts only. Provider access is verified separately and
          can never be self-assigned.
        </p>
      </Card>
    </main>
  );
}
