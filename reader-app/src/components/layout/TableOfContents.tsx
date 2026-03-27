"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { List, X } from "lucide-react";
import type { TocEntry } from "@/types";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const tocOpen = useStore((s) => s.tocOpen);
  const toggleToc = useStore((s) => s.toggleToc);
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string>("");

  // Intersection observer to track active heading
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

  // Close on Escape key
  useEffect(() => {
    if (!tocOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleToc();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tocOpen, toggleToc]);

  const handleLinkClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    // Auto-close on mobile after clicking a heading
    if (isMobile && tocOpen) {
      toggleToc();
    }
  };

  // Collapsed state — narrow strip with icon
  if (!tocOpen) {
    return (
      <button
        onClick={toggleToc}
        className="flex w-10 flex-col items-center border-l border-border bg-card pt-3"
        title="Open table of contents"
      >
        <List className="h-4 w-4" />
      </button>
    );
  }

  // Expanded panel content
  const panelContent = (
    <nav
      className={cn(
        "flex flex-col bg-card",
        isMobile
          ? "fixed inset-y-0 right-0 z-40 w-64 border-l border-border shadow-xl"
          : "sticky top-0 h-screen w-64 shrink-0 border-l border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <button
          onClick={toggleToc}
          className="rounded-md p-1 hover:bg-accent"
          title="Close table of contents"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Heading links */}
      <ul className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(entry.id);
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

  // On mobile, wrap with backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={toggleToc}
        />
        {panelContent}
      </>
    );
  }

  return panelContent;
}
