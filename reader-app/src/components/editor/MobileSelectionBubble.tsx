"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
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

export function MobileSelectionBubble({ editor, onComment }: { editor: Editor; onComment?: (markId: string, selectedText: string) => void }) {
  const [pos, setPos] = useState<BubblePos | null>(null);
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        setShowColors(false);
        return;
      }
      if (!editor.view.dom.contains(sel.anchorNode)) {
        setPos(null);
        setShowColors(false);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0) {
        setPos(null);
        return;
      }
      const BUBBLE_HEIGHT = 56;
      const GAP = 12;
      const above = rect.top > BUBBLE_HEIGHT + GAP;
      setPos({
        x: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
        y: above ? rect.top - GAP : rect.bottom + GAP,
        above,
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [editor]);

  const dismiss = useCallback(() => {
    window.getSelection()?.collapseToEnd();
    setPos(null);
    setShowColors(false);
  }, []);

  if (!pos) return null;

  const applyHighlight = (color: string) => {
    editor.chain().toggleHighlight({ color }).run();
    dismiss();
  };

  const clearHighlight = () => {
    editor.chain().unsetHighlight().run();
    dismiss();
  };

  const handleCopy = () => {
    const sel = window.getSelection();
    if (sel) {
      navigator.clipboard.writeText(sel.toString());
      toast.success("Copied to clipboard");
    }
    dismiss();
  };

  const handleComment = () => {
    if (!onComment) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (selectedText.trim()) {
      const markId = `comment-${Date.now()}`;
      editor.chain().setMark("commentMark", { markId }).run();
      onComment(markId, selectedText);
    }
    dismiss();
  };

  const handleShare = async () => {
    const sel = window.getSelection();
    if (sel && navigator.share) {
      try {
        await navigator.share({ text: sel.toString() });
      } catch {
        // User cancelled share
      }
    }
    dismiss();
  };

  // Color picker view
  if (showColors) {
    return (
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          transform: pos.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
          zIndex: 100,
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-2xl"
        onPointerDown={(e) => e.preventDefault()}
      >
        {QUICK_COLORS.map(({ color, label }) => (
          <button
            key={color}
            title={label}
            style={{ backgroundColor: color }}
            className="h-8 w-8 rounded-full border-2 border-black/10 transition-transform active:scale-90"
            onPointerDown={(e) => {
              e.preventDefault();
              applyHighlight(color);
            }}
          />
        ))}
        <div className="mx-0.5 h-6 w-px bg-border" />
        <button
          title="Remove highlight"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-transform active:scale-90"
          onPointerDown={(e) => {
            e.preventDefault();
            clearHighlight();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Main action bar (Kindle-style)
  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: pos.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        zIndex: 100,
      }}
      className="flex items-center gap-0.5 rounded-2xl border border-border bg-card px-1 py-1 shadow-2xl"
      onPointerDown={(e) => e.preventDefault()}
    >
      {/* Highlight — shows color picker */}
      <button
        className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 active:bg-accent"
        onPointerDown={(e) => {
          e.preventDefault();
          setShowColors(true);
        }}
      >
        <div className="h-5 w-5 rounded-full bg-[#fef08a] border border-black/10" />
        <span className="text-[10px] text-muted-foreground">Highlight</span>
      </button>

      {/* Note / Comment */}
      {onComment && (
        <button
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 active:bg-accent"
          onPointerDown={(e) => {
            e.preventDefault();
            handleComment();
          }}
        >
          <MessageSquare className="h-5 w-5 text-foreground" />
          <span className="text-[10px] text-muted-foreground">Note</span>
        </button>
      )}

      {/* Copy */}
      <button
        className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 active:bg-accent"
        onPointerDown={(e) => {
          e.preventDefault();
          handleCopy();
        }}
      >
        <Copy className="h-5 w-5 text-foreground" />
        <span className="text-[10px] text-muted-foreground">Copy</span>
      </button>

      {/* Share (uses Web Share API on mobile) */}
      <button
        className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 active:bg-accent"
        onPointerDown={(e) => {
          e.preventDefault();
          handleShare();
        }}
      >
        <Share2 className="h-5 w-5 text-foreground" />
        <span className="text-[10px] text-muted-foreground">Share</span>
      </button>
    </div>
  );
}
