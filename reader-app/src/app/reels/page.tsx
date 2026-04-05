import { AppShell } from "@/components/layout/AppShell";
import { ReelGrid } from "@/components/reels/ReelGrid";

export const dynamic = "force-dynamic";

export default function ReelsPage() {
  return (
    <AppShell>
      <ReelGrid />
    </AppShell>
  );
}
