import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <HomeDashboard />
      </Suspense>
    </AppShell>
  );
}
