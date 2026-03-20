"use client";

import { AppShell } from "@/components/app-shell";
import { HydrationProvider } from "@/contexts/hydration-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <AppShell>{children}</AppShell>
    </HydrationProvider>
  );
}
