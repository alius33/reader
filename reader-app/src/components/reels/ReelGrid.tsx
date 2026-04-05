"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReelCard } from "./ReelCard";
import { Search, Film, FolderOpen, ArrowLeft } from "lucide-react";
import type { ReelMeta } from "@/types";

type SortKey = "title" | "createdAt" | "handle";

const FOLDER_COLORS: Record<string, string> = {
  ai: "from-blue-500 to-indigo-600",
  career: "from-amber-500 to-orange-600",
  parenting: "from-pink-500 to-rose-600",
  productivity: "from-cyan-500 to-blue-600",
  finance: "from-green-500 to-emerald-600",
  psychology: "from-purple-500 to-violet-600",
  health: "from-emerald-500 to-teal-600",
  relationships: "from-rose-500 to-pink-600",
  leadership: "from-indigo-500 to-purple-600",
  philosophy: "from-yellow-500 to-amber-600",
  technology: "from-sky-500 to-blue-600",
  education: "from-teal-500 to-cyan-600",
};

function FolderCard({
  name,
  count,
  onClick,
}: {
  name: string;
  count: number;
  onClick: () => void;
}) {
  const gradient = FOLDER_COLORS[name] || "from-gray-500 to-gray-600";
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}
      >
        <FolderOpen className="h-8 w-8" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold capitalize group-hover:text-primary">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? "post" : "posts"}
        </p>
      </div>
    </button>
  );
}

export function ReelGrid() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");

  const { data: reels = [], isLoading } = useQuery<ReelMeta[]>({
    queryKey: ["reels"],
    queryFn: () =>
      fetch("/api/reels").then((r) => {
        if (!r.ok) return [];
        return r.json();
      }),
  });

  // Group reels by topic (folder)
  const folders = useMemo(() => {
    const map = new Map<string, ReelMeta[]>();
    for (const reel of reels) {
      const folder = reel.topic || "other";
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(reel);
    }
    return Array.from(map.entries())
      .map(([name, items]) => ({ name, count: items.length }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [reels]);

  // Reels in the active folder, with search and sort
  const folderReels = useMemo(() => {
    if (!activeFolder) return [];

    let result = reels.filter((r) => (r.topic || "other") === activeFolder);

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
        case "handle":
          return (a.sourceHandle ?? "").localeCompare(b.sourceHandle ?? "");
        default:
          return 0;
      }
    });

    return result;
  }, [reels, activeFolder, search, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  // Folder view
  if (!activeFolder) {
    return (
      <div>
        <div className="border-b border-border bg-background px-6 py-3">
          <span className="text-sm text-muted-foreground">
            {folders.length} {folders.length === 1 ? "folder" : "folders"} · {reels.length} posts
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.name}
              name={folder.name}
              count={folder.count}
              onClick={() => {
                setActiveFolder(folder.name);
                setSearch("");
              }}
            />
          ))}
        </div>

        {folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Film className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No reels yet</p>
            <p className="text-sm">Use /reel-process to import Instagram posts</p>
          </div>
        )}
      </div>
    );
  }

  // Reels inside a folder
  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
        <button
          onClick={() => setActiveFolder(null)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <h2 className="text-sm font-semibold capitalize">{activeFolder}</h2>

        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in folder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="createdAt">Sort by date</option>
          <option value="title">Sort by title</option>
          <option value="handle">Sort by account</option>
        </select>

        <span className="text-sm text-muted-foreground">
          {folderReels.length} {folderReels.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
        {folderReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>

      {folderReels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No posts found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
