"use client";

import { useState, useEffect } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Code,
  List,
  ListOrdered,
  Quote,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { ToolbarButton, ToolbarDivider, ToolbarDropdown } from "./ribbon/shared";
import {
  ColorPicker,
  HighlightPicker,
  TEXT_COLORS,
} from "./ribbon/controls/ColorPicker";
import { ZoomControls } from "./ZoomControls";
import { useStore } from "@/lib/store";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FloatingToolbarProps {
  editor: TiptapEditor;
  mode: "read" | "edit";
  bookId: string;
  onComment?: (markId: string, selectedText: string) => void;
}

/* ------------------------------------------------------------------ */
/*  FloatingToolbar                                                    */
/* ------------------------------------------------------------------ */

export function FloatingToolbar({ editor, mode, bookId, onComment }: FloatingToolbarProps) {
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);

  const [atBottom, setAtBottom] = useState(() => {
    try {
      return localStorage.getItem(`focus-toolbar-pos-${bookId}`) === "bottom";
    } catch { return false; }
  });

  const [visible, setVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Persist position preference
  useEffect(() => {
    try {
      localStorage.setItem(`focus-toolbar-pos-${bookId}`, atBottom ? "bottom" : "top");
    } catch { /* quota exceeded */ }
  }, [atBottom, bookId]);

  return (
    <>
      {/* ARIA live region */}
      <div className="sr-only" aria-live="polite" role="status">
        Focus mode enabled. Press Escape to exit.
      </div>

      {/* Spacer so content doesn't hide under the toolbar */}
      <div className={atBottom ? "pb-12" : "pt-12"} aria-hidden />

      {/* Toolbar bar */}
      <div
        role="toolbar"
        aria-label="Formatting toolbar"
        className="fixed left-0 right-0 z-50 flex items-center gap-1 px-3 bg-card/95 backdrop-blur-sm motion-safe:transition-[opacity,transform] motion-safe:duration-200"
        style={{
          top: atBottom ? undefined : 0,
          bottom: atBottom ? 0 : undefined,
          borderBottom: atBottom ? undefined : "1px solid hsl(var(--border))",
          borderTop: atBottom ? "1px solid hsl(var(--border))" : undefined,
          paddingTop: "6px",
          paddingBottom: "6px",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0)"
            : atBottom
            ? "translateY(100%)"
            : "translateY(-100%)",
        }}
      >
        <FloatingToolbarContent
          editor={editor}
          mode={mode}
          onComment={onComment}
        />

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <ToolbarButton
            icon={atBottom ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            onClick={() => setAtBottom((v) => !v)}
            tooltip={atBottom ? "Move to top" : "Move to bottom"}
          />
          <ToolbarButton
            icon={<X className="h-4 w-4" />}
            onClick={toggleFocusMode}
            tooltip="Exit focus mode"
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FloatingToolbarContent                                             */
/* ------------------------------------------------------------------ */

function FloatingToolbarContent({
  editor,
  mode,
  onComment,
}: {
  editor: TiptapEditor;
  mode: "read" | "edit";
  onComment?: (markId: string, selectedText: string) => void;
}) {
  const activeTextColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? null;
  const activeHighlightColor =
    (editor.getAttributes("highlight").color as string | undefined) ?? null;

  return (
    <>
      {/* Highlight & colour */}
      <ToolbarDropdown
        icon={<Highlighter className="h-4 w-4" />}
        active={editor.isActive("highlight")}
        tooltip="Highlight"
      >
        <HighlightPicker
          activeColor={activeHighlightColor}
          onSelect={(color) =>
            editor.chain().focus().toggleHighlight({ color }).run()
          }
          onClear={() => editor.chain().focus().unsetHighlight().run()}
        />
      </ToolbarDropdown>

      <ToolbarDropdown
        icon={<Palette className="h-4 w-4" />}
        active={!!activeTextColor}
        tooltip="Text Colour"
      >
        <ColorPicker
          colors={TEXT_COLORS}
          activeColor={activeTextColor}
          onSelect={(color) =>
            editor.chain().focus().setColor(color).run()
          }
          onClear={() => editor.chain().focus().unsetColor().run()}
          clearLabel="Default"
        />
      </ToolbarDropdown>

      <ToolbarDivider />

      {/* Inline formatting */}
      <ToolbarButton
        icon={<Bold className="h-4 w-4" />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        tooltip="Bold"
      />
      <ToolbarButton
        icon={<Italic className="h-4 w-4" />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        tooltip="Italic"
      />
      <ToolbarButton
        icon={<Underline className="h-4 w-4" />}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        tooltip="Underline"
      />
      <ToolbarButton
        icon={<Strikethrough className="h-4 w-4" />}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        tooltip="Strikethrough"
      />

      {/* Edit-mode extras */}
      {mode === "edit" && (
        <>
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            tooltip="Code"
          />

          <ToolbarDivider />

          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            tooltip="Bullet list"
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            tooltip="Ordered list"
          />
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            tooltip="Blockquote"
          />

          <ToolbarDivider />

          <ToolbarButton
            icon={<MessageSquare className="h-4 w-4" />}
            onClick={() => {
              if (!onComment) return;
              const { from, to } = editor.state.selection;
              if (from === to) return;
              const text = editor.state.doc.textBetween(from, to, " ");
              const markId = `comment-${Date.now()}`;
              editor.chain().focus().setMark("commentMark", { id: markId }).run();
              onComment(markId, text);
            }}
            disabled={editor.state.selection.from === editor.state.selection.to}
            tooltip="Add comment"
          />
        </>
      )}

      {/* Zoom — read mode */}
      {mode === "read" && (
        <>
          <ToolbarDivider />
          <ZoomControls />
        </>
      )}
    </>
  );
}
