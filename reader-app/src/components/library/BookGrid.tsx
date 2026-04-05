"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookCard } from "./BookCard";
import { Search } from "lucide-react";
import type { BookMeta } from "@/types";

type SortKey = "title" | "author" | "year" | "category" | "updatedAt" | "lastRead" | "progress";

export function BookGrid() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("title");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: books = [], isLoading } = useQuery<BookMeta[]>({
    queryKey: ["books"],
    queryFn: () => fetch("/api/books").then((r) => {
      if (!r.ok) return [];
      return r.json();
    }),
  });

  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.categoryName));
    return Array.from(cats).sort();
  }, [books]);

  const filtered = useMemo(() => {
    let result = books;

    if (filterCategory !== "all") {
      result = result.filter((b) => b.categoryName === filterCategory);
    }

    if (filterStatus !== "all") {
      result = result.filter((b) => {
        const pct = (b as BookMeta & { readingPercentage?: number | null }).readingPercentage ?? null;
        const hasFile = !!(b as BookMeta & { originalFileType?: string }).originalFileType;
        if (filterStatus === "epub") return hasFile;
        if (filterStatus === "in-progress") return pct !== null && pct > 0 && pct < 100;
        if (filterStatus === "not-started") return pct === null || pct === 0;
        if (filterStatus === "completed") return pct !== null && pct >= 100;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "year":
          return (b.year ?? 0) - (a.year ?? 0);
        case "category":
          return a.categoryName.localeCompare(b.categoryName);
        case "updatedAt":
          return (
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          );
        case "lastRead": {
          const aRead = (a as BookMeta & { lastReadAt?: string | null }).lastReadAt;
          const bRead = (b as BookMeta & { lastReadAt?: string | null }).lastReadAt;
          return (bRead ? new Date(bRead).getTime() : 0) - (aRead ? new Date(aRead).getTime() : 0);
        }
        case "progress": {
          const aPct = (a as BookMeta & { readingPercentage?: number | null }).readingPercentage ?? 0;
          const bPct = (b as BookMeta & { readingPercentage?: number | null }).readingPercentage ?? 0;
          return bPct - aPct;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [books, search, sortBy, filterCategory, filterStatus]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="title">Sort by title</option>
          <option value="author">Sort by author</option>
          <option value="year">Sort by year</option>
          <option value="category">Sort by category</option>
          <option value="updatedAt">Sort by date added</option>
          <option value="lastRead">Sort by recently read</option>
          <option value="progress">Sort by progress</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All status</option>
          <option value="epub">Has EPUB/PDF</option>
          <option value="in-progress">In progress</option>
          <option value="not-started">Not started</option>
          <option value="completed">Completed</option>
        </select>

        <span className="text-sm text-muted-foreground">
          {filtered.length} book{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No books found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
