"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Clock,
} from "lucide-react";
import type { BookMeta } from "@/types";

export function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const activeBookId = useStore((s) => s.activeBookId);
  const isMobile = useIsMobile();

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const { data: books = [] } = useQuery<BookMeta[]>({
    queryKey: ["books"],
    queryFn: () => fetch("/api/books").then((r) => r.json()),
  });

  const categorized = useMemo(() => {
    const map = new Map<string, BookMeta[]>();
    for (const book of books) {
      const cat = book.categoryName;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(book);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [books]);

  const recentBooks = useMemo(() => {
    return [...books]
      .filter((b) => b.lastViewedAt)
      .sort(
        (a, b) =>
          new Date(b.lastViewedAt!).getTime() -
          new Date(a.lastViewedAt!).getTime()
      )
      .slice(0, 5);
  }, [books]);

  const filteredCategorized = useMemo(() => {
    if (!searchQuery.trim()) return categorized;
    const q = searchQuery.toLowerCase();
    return categorized
      .map(([cat, catBooks]) => {
        const filtered = catBooks.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );
        return [cat, filtered] as [string, BookMeta[]];
      })
      .filter(([, catBooks]) => catBooks.length > 0);
  }, [categorized, searchQuery]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (!sidebarOpen) {
    return (
      <div className="flex w-12 flex-col items-center border-r border-border bg-card py-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className={cn(
      "flex w-72 flex-col border-r border-border bg-card",
      isMobile && "fixed inset-y-0 left-0 z-40 shadow-xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/" className="text-sm font-semibold" onClick={handleNavClick}>
          Reader
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-8 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Recent */}
        {recentBooks.length > 0 && !searchQuery && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              Recent
            </div>
            {recentBooks.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                onClick={handleNavClick}
                className={cn(
                  "block truncate rounded-md px-2 py-1 text-sm hover:bg-accent",
                  activeBookId === book.id && "bg-accent font-medium"
                )}
              >
                {book.title}
              </Link>
            ))}
          </div>
        )}

        {/* Categories */}
        {filteredCategorized.map(([cat, catBooks]) => (
          <div key={cat} className="mb-1">
            <button
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent"
            >
              {expandedCategories.has(cat) ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{cat}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {catBooks.length}
              </span>
            </button>
            {expandedCategories.has(cat) && (
              <div className="ml-3 border-l border-border pl-2">
                {catBooks
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((book) => (
                    <Link
                      key={book.id}
                      href={`/book/${book.id}`}
                      onClick={handleNavClick}
                      className={cn(
                        "block truncate rounded-md px-2 py-1 text-sm hover:bg-accent",
                        activeBookId === book.id &&
                          "bg-accent font-medium"
                      )}
                    >
                      {book.title}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {books.length} books
      </div>
    </aside>
  );
}
