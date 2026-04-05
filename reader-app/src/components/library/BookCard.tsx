"use client";

import Link from "next/link";
import { BookOpen, BookText } from "lucide-react";
import type { BookMeta } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "Awareness & Protection": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Career Strategy": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Leadership & Management": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Mindset & Self-Mastery": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Parenting & Child Development": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "Personal Brand & Presence": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Power & Influence": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Psychology & Decision Making": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  "Robert Greene Canon": "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
  "Strategy & Systems Thinking": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Wisdom & Big Ideas": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Workplace Navigation": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

type BookWithExtras = BookMeta & {
  originalFileType?: string | null;
  coverImageKey?: string | null;
  readingPercentage?: number | null;
  lastReadAt?: string | null;
};

export function BookCard({ book }: { book: BookMeta }) {
  const ext = book as BookWithExtras;
  const colorClass =
    CATEGORY_COLORS[book.categoryName] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  const readPct = ext.readingPercentage ?? null;

  return (
    <Link
      href={`/book/${book.id}`}
      className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md overflow-hidden"
    >
      {/* Cover image */}
      {ext.coverImageKey && (
        <div className="mb-3 h-32 w-full rounded overflow-hidden bg-muted">
          <img
            src={`/api/books/cover/${ext.coverImageKey}`}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">
          {book.title}
        </h3>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">{book.author}</p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
            colorClass
          )}
        >
          {book.categoryName}
        </span>

        {book.wordCount && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {Math.round(book.wordCount / 1000)}k words
          </span>
        )}

        {ext.originalFileType && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <BookText className="h-3 w-3" />
            {ext.originalFileType.toUpperCase()}
          </span>
        )}
      </div>

      {(book.tags ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(book.tags ?? []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {(book.tags ?? []).length > 4 && (
            <span className="text-[10px] text-muted-foreground">
              +{(book.tags ?? []).length - 4}
            </span>
          )}
        </div>
      )}
      {/* Progress bar */}
      {readPct !== null && readPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(readPct, 100)}%` }}
          />
        </div>
      )}
    </Link>
  );
}
