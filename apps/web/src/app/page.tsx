"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/today");
  }, [router]);
  return (
    <main className="p-8">
      <a href="today/" className="text-brand-teal underline">
        Open the Kova Health demo
      </a>
    </main>
  );
}
