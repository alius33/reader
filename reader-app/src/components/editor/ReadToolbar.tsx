"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";
import { Highlighter, MessageSquare } from "lucide-react";
import { ToolbarButton, ToolbarDropdown } from "./ribbon/shared";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Orange", color: "#fed7aa" },
];

/* ------------------------------------------------------------------ */
/*  ReadToolbar                                                        */
/* ------------------------------------------------------------------ */

interface ReadToolbarProps {
  editor: TiptapEditor;
}

export function ReadToolbar({ editor }: ReadToolbarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card px-4 py-1 flex items-center gap-1">
      {/* Highlight dropdown */}
      <ToolbarDropdown
        icon={<Highlighter className="h-4 w-4" />}
        active={editor.isActive("highlight")}
      >
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: c.color })
                .run()
            }
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
          >
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: c.color }}
            />
            {c.name}
          </button>
        ))}
        <button
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
        >
          <span className="h-3 w-3 rounded-full border-2 border-dashed border-border" />
          Remove
        </button>
      </ToolbarDropdown>

      {/* Comment button — disabled in read mode (marks cannot be applied when editor is not editable) */}
      <ToolbarButton
        icon={<MessageSquare className="h-4 w-4" />}
        onClick={() => {}}
        disabled
        tooltip="Switch to Edit mode to add comments"
      />
    </div>
  );
}
