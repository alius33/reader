"use client";

import { useQuery } from "@tanstack/react-query";
import { BookCard } from "@/components/library/BookCard";
import type { BookMeta } from "@/types";

interface RecentRowProps {
  title: string;
  type: "book" | "lecture" | "podcast" | "concept";
  kind: "continue" | "added";
  limit: number;
  /** When provided, an empty result still renders this string instead of nothing. */
  emptyText?: string;
}

export function RecentRow({ title, type, kind, limit, emptyText }: RecentRowProps) {
  const { data: books = [], isLoading } = useQuery<BookMeta[]>({
    queryKey: ["recent", type, kind, limit],
    queryFn: () =>
      fetch(`/api/books/recent?type=${type}&kind=${kind}&limit=${limit}`).then((r) =>
        r.ok ? r.json() : []
      ),
  });

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-56 w-44 shrink-0 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    if (!emptyText) return null;
    return (
      <section className="space-y-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {books.map((book) => (
          <div
            key={book.id}
            className="w-44 shrink-0 snap-start sm:w-52"
          >
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}
