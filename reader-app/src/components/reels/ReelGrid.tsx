"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReelCard } from "./ReelCard";
import { Search, Film } from "lucide-react";
import type { ReelMeta } from "@/types";

type SortKey = "title" | "createdAt" | "topic" | "handle";

export function ReelGrid() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [filterHandle, setFilterHandle] = useState<string>("all");

  const { data: reels = [], isLoading } = useQuery<ReelMeta[]>({
    queryKey: ["reels"],
    queryFn: () =>
      fetch("/api/reels").then((r) => {
        if (!r.ok) return [];
        return r.json();
      }),
  });

  const topics = useMemo(() => {
    const set = new Set(reels.map((r) => r.topic).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [reels]);

  const handles = useMemo(() => {
    const set = new Set(reels.map((r) => r.sourceHandle).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [reels]);

  const filtered = useMemo(() => {
    let result = reels;

    if (filterTopic !== "all") {
      result = result.filter((r) => r.topic === filterTopic);
    }

    if (filterHandle !== "all") {
      result = result.filter((r) => r.sourceHandle === filterHandle);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          (r.keyPoints ?? []).some((p: string) => p.toLowerCase().includes(q)) ||
          (r.tags ?? []).some((t: string) => t.toLowerCase().includes(q)) ||
          (r.sourceHandle ?? "").toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "topic":
          return (a.topic ?? "").localeCompare(b.topic ?? "");
        case "handle":
          return (a.sourceHandle ?? "").localeCompare(b.sourceHandle ?? "");
        default:
          return 0;
      }
    });

    return result;
  }, [reels, search, sortBy, filterTopic, filterHandle]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
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
            placeholder="Search reels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filterHandle}
          onChange={(e) => setFilterHandle(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All accounts</option>
          {handles.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="createdAt">Sort by date</option>
          <option value="title">Sort by title</option>
          <option value="topic">Sort by topic</option>
          <option value="handle">Sort by account</option>
        </select>

        <span className="text-sm text-muted-foreground">
          {filtered.length} reel{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Film className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No reels found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
