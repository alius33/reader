"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  LayoutGrid,
  Clock,
  Share2,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BookMetadataCard } from "@/components/visualizations/BookMetadataCard";
import { cn } from "@/lib/utils";
import type { BookMeta } from "@/types";

const CategoryTreemap = dynamic(
  () =>
    import("@/components/visualizations/CategoryTreemap").then(
      (m) => m.CategoryTreemap,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const ReadingTimeline = dynamic(
  () =>
    import("@/components/visualizations/ReadingTimeline").then(
      (m) => m.ReadingTimeline,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const TagChordDiagram = dynamic(
  () =>
    import("@/components/visualizations/TagChordDiagram").then(
      (m) => m.TagChordDiagram,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

type Tab = "treemap" | "timeline" | "chord";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "treemap", label: "Categories", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
  { id: "chord", label: "Connections", icon: <Share2 className="h-4 w-4" /> },
];

function ChartSkeleton() {
  return (
    <div className="flex h-[350px] items-center justify-center rounded-lg border border-border bg-muted/30">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<Tab>("treemap");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: books = [], isLoading: booksLoading } = useQuery<BookMeta[]>({
    queryKey: ["books"],
    queryFn: () => fetch("/api/books").then((r) => r.json()),
  });

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of books) {
      counts.set(b.categoryName, (counts.get(b.categoryName) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, bookCount]) => ({ name, bookCount }))
      .sort((a, b) => b.bookCount - a.bookCount);
  }, [books]);

  const displayBooks = useMemo(() => {
    if (!selectedCategory) return books;
    return books.filter((b) => b.categoryName === selectedCategory);
  }, [books, selectedCategory]);

  if (booksLoading) {
    return (
      <AppShell>
        <div className="space-y-6 p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <ChartSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Explore Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length} books across {categories.length} categories
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visualization area */}
        <div>
          {activeTab === "treemap" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Category Distribution
                </h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <CategoryTreemap
                categories={categories}
                onCategoryClick={(name) =>
                  setSelectedCategory(
                    selectedCategory === name ? null : name,
                  )
                }
              />
            </div>
          )}

          {activeTab === "timeline" && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-foreground">
                Reading Timeline
              </h2>
              <ReadingTimeline books={books} />
            </div>
          )}

          {activeTab === "chord" && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-foreground">
                Cross-Reference Network
              </h2>
              <TagChordDiagram books={books} />
            </div>
          )}
        </div>

        {/* Book cards grid */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-foreground">
            {selectedCategory
              ? `${selectedCategory} (${displayBooks.length})`
              : `All Books (${displayBooks.length})`}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayBooks.map((book) => (
              <BookMetadataCard
                key={book.id}
                book={{
                  title: book.title,
                  author: book.author,
                  year: book.year,
                  categoryName: book.categoryName,
                  wordCount: book.wordCount,
                  tags: book.tags,
                  contentStats: book.contentStats,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
