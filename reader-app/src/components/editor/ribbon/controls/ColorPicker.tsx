"use client";

import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Color palettes                                                     */
/* ------------------------------------------------------------------ */

export const TEXT_COLORS = [
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#4a4a4a" },
  { name: "Gray", color: "#9b9b9b" },
  { name: "Silver", color: "#d0d0d0" },
  { name: "White", color: "#ffffff" },
  { name: "Red", color: "#e74c3c" },
  { name: "Dark Red", color: "#c0392b" },
  { name: "Orange", color: "#e67e22" },
  { name: "Yellow", color: "#f1c40f" },
  { name: "Light Green", color: "#2ecc71" },
  { name: "Green", color: "#27ae60" },
  { name: "Dark Green", color: "#1e8449" },
  { name: "Teal", color: "#1abc9c" },
  { name: "Light Blue", color: "#3498db" },
  { name: "Blue", color: "#2980b9" },
  { name: "Dark Blue", color: "#2c3e50" },
  { name: "Purple", color: "#9b59b6" },
  { name: "Dark Purple", color: "#8e44ad" },
  { name: "Pink", color: "#e91e63" },
  { name: "Brown", color: "#795548" },
];

export const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";

export const HIGHLIGHT_COLORS = [
  // Yellows
  { name: "Pale Yellow", color: "#fef9c3" },
  { name: "Yellow", color: "#fef08a" },
  { name: "Gold", color: "#fde047" },
  { name: "Amber", color: "#facc15" },
  // Oranges
  { name: "Pale Orange", color: "#ffedd5" },
  { name: "Peach", color: "#fed7aa" },
  { name: "Orange", color: "#fdba74" },
  { name: "Tangerine", color: "#fb923c" },
  // Reds
  { name: "Rose", color: "#ffe4e6" },
  { name: "Light Red", color: "#fecaca" },
  { name: "Salmon", color: "#fca5a5" },
  { name: "Red", color: "#f87171" },
  // Pinks
  { name: "Pale Pink", color: "#fce7f3" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Hot Pink", color: "#f9a8d4" },
  { name: "Magenta", color: "#f472b6" },
  // Purples
  { name: "Lavender", color: "#f3e8ff" },
  { name: "Light Purple", color: "#e9d5ff" },
  { name: "Purple", color: "#d8b4fe" },
  { name: "Violet", color: "#c084fc" },
  // Blues
  { name: "Ice Blue", color: "#dbeafe" },
  { name: "Light Blue", color: "#bfdbfe" },
  { name: "Blue", color: "#93c5fd" },
  { name: "Royal Blue", color: "#60a5fa" },
  // Teals
  { name: "Pale Teal", color: "#ccfbf1" },
  { name: "Mint", color: "#99f6e4" },
  { name: "Teal", color: "#5eead4" },
  { name: "Aqua", color: "#2dd4bf" },
  // Greens
  { name: "Pale Green", color: "#dcfce7" },
  { name: "Light Green", color: "#bbf7d0" },
  { name: "Green", color: "#86efac" },
  { name: "Emerald", color: "#4ade80" },
  // Grays
  { name: "Light Gray", color: "#f3f4f6" },
  { name: "Gray", color: "#e5e7eb" },
  { name: "Medium Gray", color: "#d1d5db" },
  { name: "Dark Gray", color: "#9ca3af" },
  // Earth tones
  { name: "Cream", color: "#efebe9" },
  { name: "Sand", color: "#d7ccc8" },
  { name: "Clay", color: "#bcaaa4" },
  { name: "Brown", color: "#a1887f" },
];

/* ------------------------------------------------------------------ */
/*  Recent colors persistence                                          */
/* ------------------------------------------------------------------ */

const RECENTS_KEY = "reader-recent-highlights";
const MAX_RECENTS = 8;

function loadRecents(): string[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecent(color: string): string[] {
  const recents = loadRecents().filter(
    (c) => c.toLowerCase() !== color.toLowerCase()
  );
  recents.unshift(color);
  const trimmed = recents.slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota exceeded */
  }
  return trimmed;
}

/* ------------------------------------------------------------------ */
/*  HighlightPicker — expanded palette with recent colors              */
/* ------------------------------------------------------------------ */

interface HighlightPickerProps {
  activeColor?: string | null;
  onSelect: (color: string) => void;
  onClear: () => void;
}

export function HighlightPicker({
  activeColor,
  onSelect,
  onClear,
}: HighlightPickerProps) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const handleSelect = (color: string) => {
    const updated = saveRecent(color);
    setRecents(updated);
    onSelect(color);
  };

  return (
    <div className="flex flex-col gap-1 p-1.5" style={{ width: 200 }}>
      {/* Recents */}
      {recents.length > 0 && (
        <>
          <span className="text-[10px] font-medium text-muted-foreground px-0.5">
            Recent
          </span>
          <div className="flex gap-1 mb-0.5">
            {recents.map((c) => (
              <Swatch
                key={`r-${c}`}
                color={c}
                active={activeColor?.toLowerCase() === c.toLowerCase()}
                onClick={() => handleSelect(c)}
              />
            ))}
          </div>
          <hr className="border-border" />
        </>
      )}

      {/* Full palette — 4 per row (light → dark per hue) */}
      <div className="grid grid-cols-4 gap-1 mt-0.5">
        {HIGHLIGHT_COLORS.map((c) => (
          <Swatch
            key={c.color}
            color={c.color}
            name={c.name}
            active={activeColor?.toLowerCase() === c.color.toLowerCase()}
            onClick={() => handleSelect(c.color)}
          />
        ))}
      </div>

      {/* Remove */}
      <button
        onClick={onClear}
        className="flex w-full items-center justify-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-accent mt-0.5"
      >
        <span className="h-3 w-3 rounded-full border-2 border-dashed border-border" />
        Remove
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Swatch                                                              */
/* ------------------------------------------------------------------ */

function Swatch({
  color,
  name,
  active,
  onClick,
}: {
  color: string;
  name?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={name}
      className={`h-5 w-5 rounded border ${
        active
          ? "ring-2 ring-primary ring-offset-1"
          : "border-border hover:scale-110"
      } transition-transform`}
      style={{ backgroundColor: color }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Generic ColorPicker (still used for text color)                    */
/* ------------------------------------------------------------------ */

interface ColorPickerProps {
  colors: { name: string; color: string }[];
  onSelect: (color: string) => void;
  onClear: () => void;
  activeColor?: string | null;
  clearLabel?: string;
}

export function ColorPicker({
  colors,
  onSelect,
  onClear,
  activeColor,
  clearLabel = "Default",
}: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5 p-1">
      <div className="grid grid-cols-5 gap-1">
        {colors.map((c) => {
          const isActive =
            activeColor?.toLowerCase() === c.color.toLowerCase();
          return (
            <button
              key={c.color}
              onClick={() => onSelect(c.color)}
              title={c.name}
              className={`h-5 w-5 rounded border ${
                isActive
                  ? "ring-2 ring-primary ring-offset-1"
                  : "border-border hover:scale-110"
              } transition-transform`}
              style={{ backgroundColor: c.color }}
            />
          );
        })}
      </div>
      <button
        onClick={onClear}
        className="flex w-full items-center justify-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-accent"
      >
        <span className="h-3 w-3 rounded-full border-2 border-dashed border-border" />
        {clearLabel}
      </button>
    </div>
  );
}
