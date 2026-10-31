import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kova Health (synthetic demo)",
  description: "Synthetic-data MVP demo for Kova Health. No real patient data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
