"use client";

import Link from "next/link";
import { useStore, FONT_OPTIONS } from "@/lib/store";
import type { FontFamily } from "@/lib/store";
import { Moon, Sun, Type } from "lucide-react";

interface TopBarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  saveStatus?: "saved" | "saving" | "unsaved" | null;
}

export function TopBar({ title, breadcrumbs, saveStatus }: TopBarProps) {
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const fontFamily = useStore((s) => s.fontFamily);
  const setFontFamily = useStore((s) => s.setFontFamily);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs?.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
        {!breadcrumbs && title && (
          <span className="font-medium">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {saveStatus && (
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "unsaved" && "Unsaved changes"}
          </span>
        )}

        {/* Font picker */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Change font"
          >
            <Type className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {FONT_OPTIONS.find((f) => f.id === fontFamily)?.label}
            </span>
          </button>
          <div className="absolute right-0 top-full z-30 hidden min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-lg group-hover:block">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-accent ${
                  fontFamily === f.id
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
                {fontFamily === f.id && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <kbd className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5">
          <span className="text-[10px]">⌘</span>K
        </kbd>

        <button
          onClick={toggleDarkMode}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
