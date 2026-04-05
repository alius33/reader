import { AppShell } from "@/components/layout/AppShell";
import { BookGrid } from "@/components/library/BookGrid";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <AppShell>
      <BookGrid />
    </AppShell>
  );
}
