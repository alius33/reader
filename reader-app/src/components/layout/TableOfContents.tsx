"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/types";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observerEntries) => {
        for (const entry of observerEntries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const tocEntry of entries) {
      const el = document.getElementById(tocEntry.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav className="sticky top-0 max-h-screen overflow-y-auto border-l border-border px-4 py-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(entry.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={cn(
                "block truncate rounded px-2 py-1 text-xs transition-colors hover:text-foreground",
                entry.level === 3 && "pl-5",
                activeId === entry.id
                  ? "font-medium text-foreground bg-accent"
                  : "text-muted-foreground"
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
