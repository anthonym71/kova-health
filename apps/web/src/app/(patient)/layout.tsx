import { PatientNav } from "@/components/nav";

/** Shared patient shell: desktop sidebar + mobile bottom tabs. */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PatientNav />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:ml-56 md:max-w-4xl md:px-8 md:pb-10">
        {children}
      </main>
    </div>
  );
}
