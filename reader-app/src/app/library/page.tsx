import { AppShell } from "@/components/layout/AppShell";
import { BookGrid } from "@/components/library/BookGrid";

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library" }]}>
      <BookGrid />
    </AppShell>
  );
}
