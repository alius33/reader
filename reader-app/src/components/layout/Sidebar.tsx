"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  Share2,
  AtSign,
  Film,
} from "lucide-react";
import type { BookMeta } from "@/types";

export function Sidebar() {
  const { data: session } = useSession();
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

  const { data: mentionCount = 0 } = useQuery<number>({
    queryKey: ["mentions-count"],
    queryFn: () => fetch("/api/mentions").then((r) => r.ok ? r.json() : []).then((m: unknown[]) => m.length),
    enabled: !!session,
    refetchInterval: 60000,
  });

  const { data: books = [] } = useQuery<BookMeta[]>({
    queryKey: ["books"],
    queryFn: () => fetch("/api/books").then((r) => {
      if (!r.ok) return [];
      return r.json();
    }),
    enabled: !!session,
  });

  type CategoryEntry = {
    name: string;
    books: BookMeta[];
    subcategories: Map<string, BookMeta[]>;
  };

  const categorized = useMemo(() => {
    const map = new Map<string, CategoryEntry>();
    for (const book of books) {
      const cat = book.categoryName;
      if (!map.has(cat)) map.set(cat, { name: cat, books: [], subcategories: new Map() });
      const entry = map.get(cat)!;
      if (book.subcategory) {
        if (!entry.subcategories.has(book.subcategory)) entry.subcategories.set(book.subcategory, []);
        entry.subcategories.get(book.subcategory)!.push(book);
      } else {
        entry.books.push(book);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [books]);

  const totalBooksInCategory = (entry: CategoryEntry) =>
    entry.books.length + Array.from(entry.subcategories.values()).reduce((sum, b) => sum + b.length, 0);

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
    const matchBook = (b: BookMeta) =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return categorized
      .map((entry) => {
        const filteredBooks = entry.books.filter(matchBook);
        const filteredSubs = new Map<string, BookMeta[]>();
        for (const [sub, subBooks] of entry.subcategories) {
          const filtered = subBooks.filter(matchBook);
          if (filtered.length > 0) filteredSubs.set(sub, filtered);
        }
        return { ...entry, books: filteredBooks, subcategories: filteredSubs } as CategoryEntry;
      })
      .filter((entry) => entry.books.length > 0 || entry.subcategories.size > 0);
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
    // On mobile, hide the collapsed rail entirely — TopBar has the toggle
    if (isMobile) return null;
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

      {/* Quick links */}
      <div className="border-b border-border px-3 py-2 space-y-0.5">
        <Link
          href="/reels"
          onClick={handleNavClick}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Film className="h-3.5 w-3.5" />
          Reels
        </Link>
        <Link
          href="/shares"
          onClick={handleNavClick}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Share2 className="h-3.5 w-3.5" />
          Shared Links
        </Link>
        {mentionCount > 0 && (
          <button
            onClick={handleNavClick}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-primary hover:bg-accent"
          >
            <AtSign className="h-3.5 w-3.5" />
            Mentions
            <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {mentionCount}
            </span>
          </button>
        )}
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
        {filteredCategorized.map((entry) => (
          <div key={entry.name} className="mb-1">
            <button
              onClick={() => toggleCategory(entry.name)}
              className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent"
            >
              {expandedCategories.has(entry.name) ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{entry.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {totalBooksInCategory(entry)}
              </span>
            </button>
            {expandedCategories.has(entry.name) && (
              <div className="ml-3 border-l border-border pl-2">
                {/* Subcategories (e.g. Civilization, Geo-Strategy, Secret History) */}
                {Array.from(entry.subcategories.entries())
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([sub, subBooks]) => (
                    <div key={sub} className="mb-0.5">
                      <button
                        onClick={() => toggleCategory(`${entry.name}/${sub}`)}
                        className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        {expandedCategories.has(`${entry.name}/${sub}`) ? (
                          <ChevronDown className="h-3 w-3 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate">{sub}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {subBooks.length}
                        </span>
                      </button>
                      {expandedCategories.has(`${entry.name}/${sub}`) && (
                        <div className="ml-3 border-l border-border pl-2">
                          {subBooks
                            .sort((a, b) => {
                              if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
                              if (a.sortOrder != null) return -1;
                              if (b.sortOrder != null) return 1;
                              return a.title.localeCompare(b.title);
                            })
                            .map((book) => (
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
                    </div>
                  ))}
                {/* Direct books (no subcategory) */}
                {entry.books
                  .sort((a, b) => {
                    if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
                    if (a.sortOrder != null) return -1;
                    if (b.sortOrder != null) return 1;
                    return a.title.localeCompare(b.title);
                  })
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
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-6 w-6 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-medium">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
          <span className="flex-1 truncate text-xs text-muted-foreground">
            {session?.user?.name ?? session?.user?.email ?? `${books.length} books`}
          </span>
          <button
            onClick={() => signOut()}
            className="rounded-md p-1 hover:bg-accent"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
