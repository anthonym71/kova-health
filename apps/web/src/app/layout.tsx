import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Kova Health" : "Kova Health (synthetic demo)",
  description: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Kova Health - personal health manager. Test deployment with fictional data only." : "Synthetic-data MVP demo for Kova Health. No real patient data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
