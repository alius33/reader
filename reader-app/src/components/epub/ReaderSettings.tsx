"use client";

import { useEpubStore } from "@/lib/epub-store";
import { FONT_OPTIONS } from "@/lib/store";

export function ReaderSettings({ bookId }: { bookId: string }) {
  const {
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    theme, setTheme,
    lineHeight, setLineHeight,
    margins, setMargins,
  } = useEpubStore();

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold">Reading Settings</h3>

      {/* Font size */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Font Size: {fontSize}px</label>
        <input
          type="range"
          min={12}
          max={28}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </div>

      {/* Font family */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Font</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Line height */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Line Height: {lineHeight.toFixed(1)}</label>
        <input
          type="range"
          min={1.2}
          max={2.0}
          step={0.1}
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </div>

      {/* Theme */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Theme</label>
        <div className="mt-1 flex gap-2">
          {(["light", "dark", "sepia"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 rounded border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                theme === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Margins</label>
        <div className="mt-1 flex gap-2">
          {(["narrow", "medium", "wide"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMargins(m)}
              className={`flex-1 rounded border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                margins === m ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
