"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Library } from "lucide-react";
import { ContentTypeTabs, type ContentTab } from "./ContentTypeTabs";
import { RecentRow } from "./RecentRow";
import { CategoryGrid } from "./CategoryGrid";
import { BookGrid } from "@/components/library/BookGrid";

const VALID_TABS: ContentTab[] = ["books", "lectures", "podcasts", "concepts"];

function isContentTab(s: string | null): s is ContentTab {
  return !!s && (VALID_TABS as string[]).includes(s);
}

export function HomeDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const active: ContentTab = isContentTab(raw) ? raw : "books";

  const setTab = useCallback(
    (tab: ContentTab) => {
      const sp = new URLSearchParams(params.toString());
      if (tab === "books") sp.delete("tab");
      else sp.set("tab", tab);
      const qs = sp.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <ContentTypeTabs active={active} onChange={setTab} />

      {active === "books" && (
        <>
          <RecentRow title="Continue Reading" type="book" kind="continue" limit={5} />
          <RecentRow title="Recently Added" type="book" kind="added" limit={8} />
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Browse by Category</h2>
            <CategoryGrid type="book" />
          </section>
          <div className="pt-2">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Library className="h-4 w-4" />
              Browse all books
            </Link>
          </div>
        </>
      )}

      {active === "lectures" && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Lecture Series</h2>
          <CategoryGrid type="lecture" />
        </section>
      )}

      {active === "podcasts" && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Podcast Series</h2>
          <CategoryGrid type="podcast" />
        </section>
      )}

      {active === "concepts" && (
        <div className="-mx-4 sm:-mx-6">
          <BookGrid defaultCategoryFilter="Concepts" />
        </div>
      )}
    </div>
  );
}
