"use client";

import Link from "next/link";
import { Clock, Film, Images } from "lucide-react";
import type { ReelMeta } from "@/types";
import { cn } from "@/lib/utils";

const TOPIC_COLORS: Record<string, string> = {
  parenting: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  productivity: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  finance: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  psychology: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  career: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  leadership: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  health: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  relationships: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  philosophy: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  technology: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  education: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ReelCard({ reel }: { reel: ReelMeta }) {
  const topicColor =
    TOPIC_COLORS[reel.topic ?? ""] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";

  const keyPoints = (reel.keyPoints ?? []) as string[];

  return (
    <Link
      href={`/reel/${reel.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">
          {reel.title}
        </h3>
      </div>

      <div className="mb-2 flex items-center gap-2">
        {reel.sourceHandle && (
          <span className="text-xs text-muted-foreground">{reel.sourceHandle}</span>
        )}
        {reel.topic && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              topicColor
            )}
          >
            {reel.topic}
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-muted-foreground line-clamp-3">
        {reel.summary}
      </p>

      {keyPoints.length > 0 && (
        <ul className="mb-3 space-y-0.5">
          {keyPoints.slice(0, 3).map((point, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
              <span className="text-primary shrink-0">-</span>
              <span className="line-clamp-1">{point}</span>
            </li>
          ))}
          {keyPoints.length > 3 && (
            <li className="text-[10px] text-muted-foreground">
              +{keyPoints.length - 3} more
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {reel.duration ? (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDuration(reel.duration)}
          </span>
        ) : reel.slideCount ? (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Images className="h-3 w-3" />
            {reel.slideCount} slides
          </span>
        ) : null}
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Film className="h-3 w-3" />
          {timeAgo(reel.createdAt)}
        </span>
      </div>

      {(reel.tags ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(reel.tags ?? []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {(reel.tags ?? []).length > 4 && (
            <span className="text-[10px] text-muted-foreground">
              +{(reel.tags ?? []).length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
