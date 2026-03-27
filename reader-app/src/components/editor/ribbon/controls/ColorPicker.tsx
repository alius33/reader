"use client";

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

export const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Orange", color: "#fed7aa" },
  { name: "Purple", color: "#e9d5ff" },
  { name: "Red", color: "#fecaca" },
  { name: "Gray", color: "#e5e7eb" },
];

/* ------------------------------------------------------------------ */
/*  ColorPicker                                                        */
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
