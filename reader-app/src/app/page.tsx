import { AppShell } from "@/components/layout/AppShell";
import { BookGrid } from "@/components/library/BookGrid";

export default function HomePage() {
  return (
    <AppShell>
      <BookGrid />
    </AppShell>
  );
}
