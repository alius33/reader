"use client";

import { useMemo, useState } from "react";
import { BookCard } from "@/components/library/BookCard";
import type { BookMeta } from "@/types";

type SortKey = "default" | "title" | "author" | "year" | "lastRead" | "progress";

interface CategoryDetailProps {
  name: string;
  count: number;
  books: BookMeta[];
}

export function CategoryDetail({ name, count, books }: CategoryDetailProps) {
  const [sort, setSort] = useState<SortKey>("default");

  const sorted = useMemo(() => {
    if (sort === "default") return books;
    const arr = [...books];
    arr.sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "year":
          return (b.year ?? 0) - (a.year ?? 0);
        case "lastRead": {
          const ar = (a as BookMeta & { lastReadAt?: string | null }).lastReadAt;
          const br = (b as BookMeta & { lastReadAt?: string | null }).lastReadAt;
          return (br ? new Date(br).getTime() : 0) - (ar ? new Date(ar).getTime() : 0);
        }
        case "progress": {
          const ap = (a as BookMeta & { readingPercentage?: number | null }).readingPercentage ?? 0;
          const bp = (b as BookMeta & { readingPercentage?: number | null }).readingPercentage ?? 0;
          return bp - ap;
        }
        default:
          return 0;
      }
    });
    return arr;
  }, [books, sort]);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "entry" : "entries"}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="default">Default order</option>
          <option value="title">Sort by title</option>
          <option value="author">Sort by author</option>
          <option value="year">Sort by year</option>
          <option value="lastRead">Sort by recently read</option>
          <option value="progress">Sort by progress</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No books in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
