"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReelCard } from "./ReelCard";
import {
  Search,
  Film,
  FolderOpen,
  ArrowLeft,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import type { ReelMeta } from "@/types";

type SortKey = "title" | "createdAt" | "handle" | "topic";
type ViewMode = "table" | "folders";

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

const TOPIC_COLORS: Record<string, string> = {
  parenting:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  productivity:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  finance:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  psychology:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  career:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  leadership:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  health:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  relationships:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  philosophy:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  technology:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  education:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ai: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReelGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

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

  // All reels filtered and sorted (for table view or folder drill-down)
  const filteredReels = useMemo(() => {
    let result =
      activeFolder && viewMode === "folders"
        ? reels.filter((r) => (r.topic || "other") === activeFolder)
        : reels;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          (r.keyPoints ?? []).some((p: string) => p.toLowerCase().includes(q)) ||
          (r.tags ?? []).some((t: string) => t.toLowerCase().includes(q)) ||
          (r.sourceHandle ?? "").toLowerCase().includes(q) ||
          (r.topic ?? "").toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          cmp =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "handle":
          cmp = (a.sourceHandle ?? "").localeCompare(b.sourceHandle ?? "");
          break;
        case "topic":
          cmp = (a.topic ?? "").localeCompare(b.topic ?? "");
          break;
        default:
          cmp = 0;
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [reels, activeFolder, viewMode, search, sortBy, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(key === "title" || key === "handle" || key === "topic");
    }
  }

  function SortHeader({
    label,
    sortKey,
    className,
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) {
    const active = sortBy === sortKey;
    return (
      <th
        onClick={() => toggleSort(sortKey)}
        className={`cursor-pointer select-none px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground ${className ?? ""}`}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <ArrowUpDown className="h-3 w-3 text-primary" />
          )}
        </span>
      </th>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md border border-border bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  // Table view (default)
  if (viewMode === "table") {
    return (
      <div>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all reels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <button
            onClick={() => {
              setViewMode("folders");
              setSearch("");
            }}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-sm hover:bg-accent"
            title="Folder view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          <span className="text-sm text-muted-foreground">
            {filteredReels.length} {filteredReels.length === 1 ? "reel" : "reels"}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <SortHeader label="Title" sortKey="title" className="min-w-[250px]" />
                <SortHeader label="Source" sortKey="handle" />
                <SortHeader label="Topic" sortKey="topic" />
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[300px]">
                  Summary
                </th>
                <SortHeader label="Date" sortKey="createdAt" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReels.map((reel) => {
                const topicColor =
                  TOPIC_COLORS[reel.topic ?? ""] ||
                  "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
                return (
                  <tr
                    key={reel.id}
                    className="group hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/reel/${reel.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {reel.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                      {reel.sourceHandle || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {reel.topic && (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${topicColor}`}
                        >
                          {reel.topic}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      <span className="line-clamp-1">{reel.summary}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">
                      {timeAgo(reel.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No reels found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>
    );
  }

  // Folder view
  if (!activeFolder) {
    return (
      <div>
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
          <span className="text-sm text-muted-foreground">
            {folders.length} {folders.length === 1 ? "folder" : "folders"} ·{" "}
            {reels.length} posts
          </span>

          <div className="ml-auto">
            <button
              onClick={() => {
                setViewMode("table");
                setSearch("");
              }}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-sm hover:bg-accent"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
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

  // Reels inside a folder (card view)
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

        <button
          onClick={() => {
            setViewMode("table");
            setActiveFolder(null);
            setSearch("");
          }}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-sm hover:bg-accent"
          title="Table view"
        >
          <List className="h-4 w-4" />
        </button>

        <span className="text-sm text-muted-foreground">
          {filteredReels.length} {filteredReels.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>

      {filteredReels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No posts found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
