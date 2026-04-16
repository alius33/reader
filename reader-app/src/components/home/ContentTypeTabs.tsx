"use client";

import { BookOpen, GraduationCap, Headphones, Layers, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentTab = "books" | "lectures" | "podcasts" | "concepts";

const TABS: { key: ContentTab; label: string; icon: LucideIcon }[] = [
  { key: "books", label: "Books", icon: BookOpen },
  { key: "lectures", label: "Lectures", icon: GraduationCap },
  { key: "podcasts", label: "Podcasts", icon: Headphones },
  { key: "concepts", label: "Concepts", icon: Layers },
];

interface ContentTypeTabsProps {
  active: ContentTab;
  onChange: (tab: ContentTab) => void;
}

export function ContentTypeTabs({ active, onChange }: ContentTypeTabsProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex snap-x gap-1 overflow-x-auto py-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex shrink-0 snap-start items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
