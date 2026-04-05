"use client";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#86efac" },
  { name: "Blue", value: "#93c5fd" },
  { name: "Red", value: "#fca5a5" },
  { name: "Purple", value: "#d8b4fe" },
  { name: "Orange", value: "#fdba74" },
];

interface EpubHighlightBubbleProps {
  position: { x: number; y: number };
  onHighlight: (color: string) => void;
  onDismiss: () => void;
}

export function EpubHighlightBubble({ position, onHighlight, onDismiss }: EpubHighlightBubbleProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onDismiss} />
      <div
        className="fixed z-50 flex gap-1.5 rounded-lg border border-border bg-card p-2 shadow-lg"
        style={{ left: position.x, top: position.y - 50, transform: "translateX(-50%)" }}
      >
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onHighlight(c.value)}
            className="h-6 w-6 rounded-full border-2 border-transparent hover:border-foreground/30 transition-colors"
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
      </div>
    </>
  );
}

export { HIGHLIGHT_COLORS };
