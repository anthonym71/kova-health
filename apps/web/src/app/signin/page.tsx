import { Card, PageHeader, PrimaryButton } from "@/components/ui";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <PageHeader title="Kova Health" subtitle="Synthetic demo build - not for real patient data" />
      <Card>
        <h2 className="mb-2 font-semibold text-ink-strong">Demo sign-in</h2>
        <p className="mb-4 text-sm text-ink-body">
          The live app uses Supabase Auth (email verification, recovery, MFA for providers and
          operators). This demo skips authentication and shows fabricated data only.
        </p>
        <div className="flex flex-col gap-2">
          <PrimaryButton href="/today">Continue as demo patient</PrimaryButton>
          <PrimaryButton href="/provider">Continue as demo provider</PrimaryButton>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Providers cannot self-assign a trusted role: live sign-up requires pending verification and
          operator approval.
        </p>
      </Card>
    </main>
  );
}
