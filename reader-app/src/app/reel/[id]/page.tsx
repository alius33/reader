"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Film,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import type { ReelFull } from "@/types";

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

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {title}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ReelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: reel, isLoading } = useQuery<ReelFull>({
    queryKey: ["reel", id],
    queryFn: () => fetch(`/api/reels/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/reels/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      router.push("/reels");
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted mb-4" />
          <div className="h-4 w-full animate-pulse rounded bg-muted mb-2" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!reel) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Film className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">Reel not found</p>
        </div>
      </AppShell>
    );
  }

  const topicColor =
    TOPIC_COLORS[reel.topic ?? ""] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  const keyPoints = (reel.keyPoints ?? []) as string[];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-6">
        {/* Back link */}
        <Link
          href="/reels"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reels
        </Link>

        {/* Header */}
        <h1 className="text-2xl font-bold mb-3">{reel.title}</h1>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {reel.sourceHandle && (
            <span className="text-sm text-muted-foreground">{reel.sourceHandle}</span>
          )}
          {reel.topic && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                topicColor
              )}
            >
              {reel.topic}
            </span>
          )}
          {reel.duration && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(reel.duration)}
            </span>
          )}
        </div>

        {/* Summary */}
        <p className="mb-6 text-sm leading-relaxed text-foreground">{reel.summary}</p>

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-2">Key Points</h2>
            <ul className="space-y-1.5">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary shrink-0">-</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {(reel.tags ?? []).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {(reel.tags ?? []).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Caption */}
        {reel.caption && (
          <CollapsibleSection title="Original Caption">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{reel.caption}</p>
          </CollapsibleSection>
        )}

        {/* Transcript */}
        {reel.transcript && (
          <CollapsibleSection title="Transcript">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{reel.transcript}</p>
          </CollapsibleSection>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          {reel.sourceUrl && (
            <a
              href={reel.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open on Instagram
            </a>
          )}
          <button
            onClick={() => {
              if (confirm("Delete this reel?")) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </AppShell>
  );
}
