"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

const QUICK_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#86efac", label: "Green" },
  { color: "#93c5fd", label: "Blue" },
  { color: "#fca5a5", label: "Red" },
  { color: "#d8b4fe", label: "Purple" },
  { color: "#fdba74", label: "Orange" },
];

interface BubblePos {
  x: number;
  y: number;
  above: boolean;
}

export function MobileSelectionBubble({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<BubblePos | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        return;
      }
      // Only show when selection is inside the editor
      if (!editor.view.dom.contains(sel.anchorNode)) {
        setPos(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0) {
        setPos(null);
        return;
      }
      // Show above the selection unless there isn't enough room
      const BUBBLE_HEIGHT = 48;
      const GAP = 10;
      const above = rect.top > BUBBLE_HEIGHT + GAP;
      setPos({
        x: Math.max(90, Math.min(window.innerWidth - 90, rect.left + rect.width / 2)),
        y: above ? rect.top - GAP : rect.bottom + GAP,
        above,
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [editor]);

  if (!pos) return null;

  const apply = (color: string) => {
    editor.chain().toggleHighlight({ color }).run();
    window.getSelection()?.collapseToEnd();
    setPos(null);
  };

  const clear = () => {
    editor.chain().unsetHighlight().run();
    window.getSelection()?.collapseToEnd();
    setPos(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: pos.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        zIndex: 100,
      }}
      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-xl"
      onPointerDown={(e) => e.preventDefault()}
    >
      {QUICK_COLORS.map(({ color, label }) => (
        <button
          key={color}
          title={label}
          style={{ backgroundColor: color }}
          className="h-7 w-7 rounded-full border border-black/15 transition-transform active:scale-90"
          onPointerDown={(e) => {
            e.preventDefault();
            apply(color);
          }}
        />
      ))}
      <div className="mx-0.5 h-5 w-px bg-border" />
      <button
        title="Remove highlight"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground transition-transform active:scale-90"
        onPointerDown={(e) => {
          e.preventDefault();
          clear();
        }}
      >
        ✕
      </button>
    </div>
  );
}
