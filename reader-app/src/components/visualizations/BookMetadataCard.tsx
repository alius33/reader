"use client";

import {
  BookOpen,
  MessageSquareQuote,
  GitFork,
  Lightbulb,
  Network,
  Calendar,
} from "lucide-react";
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

interface BookMetadataCardProps {
  book: {
    title: string;
    author: string;
    year: number | null;
    categoryName: string;
    wordCount: number | null;
    tags: string[];
    contentStats: {
      callouts: number;
      diagrams: number;
      stories: number;
      crossRefs: number;
    } | null;
  };
}

export function BookMetadataCard({ book }: BookMetadataCardProps) {
  const colorClass =
    CATEGORY_COLORS[book.categoryName] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";

  const stats = book.contentStats;

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold leading-snug text-foreground">
          {book.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{book.author}</span>
          {book.year && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {book.year}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category + word count row */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            colorClass,
          )}
        >
          {book.categoryName}
        </span>
        {book.wordCount && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {(book.wordCount / 1000).toFixed(1)}k words
          </span>
        )}
      </div>

      {/* Content stats grid */}
      {stats && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <StatCell
            icon={<MessageSquareQuote className="h-3.5 w-3.5" />}
            value={stats.stories}
            label="stories"
          />
          <StatCell
            icon={<GitFork className="h-3.5 w-3.5" />}
            value={stats.diagrams}
            label="diagrams"
          />
          <StatCell
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            value={stats.callouts}
            label="key insights"
          />
          <StatCell
            icon={<Network className="h-3.5 w-3.5" />}
            value={stats.crossRefs}
            label="cross-references"
          />
        </div>
      )}

      {/* Tags */}
      {book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {book.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm">
        <span className="font-semibold text-foreground">{value}</span>{" "}
        <span className="text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}
