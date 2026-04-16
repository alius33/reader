import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function CategoryNotFound() {
  return (
    <AppShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Not found" }]}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-12 text-center">
        <h1 className="text-2xl font-semibold">Category not found</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find that category. It may have been renamed or removed.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </AppShell>
  );
}
