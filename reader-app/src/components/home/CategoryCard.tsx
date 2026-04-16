"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  count: number;
  icon: LucideIcon;
}

export function CategoryCard({ slug, name, count, icon: Icon }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex w-full items-end justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">
          {name}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
    </Link>
  );
}
