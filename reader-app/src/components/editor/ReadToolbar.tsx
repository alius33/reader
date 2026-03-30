"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  Highlighter,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
} from "lucide-react";
import { ToolbarButton, ToolbarDivider, ToolbarDropdown } from "./ribbon/shared";
import {
  ColorPicker,
  HighlightPicker,
  TEXT_COLORS,
} from "./ribbon/controls/ColorPicker";
import { ZoomControls } from "./ZoomControls";

/* ------------------------------------------------------------------ */
/*  ReadToolbar                                                        */
/* ------------------------------------------------------------------ */

interface ReadToolbarProps {
  editor: TiptapEditor;
}

export function ReadToolbar({ editor }: ReadToolbarProps) {
  const activeTextColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? null;

  const activeHighlightColor =
    (editor.getAttributes("highlight").color as string | undefined) ?? null;

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card px-4 py-1 flex items-center gap-1">
      {/* Formatting tools */}
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

      {/* Text colour */}
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

      {/* Text formatting */}
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

      <ToolbarDivider />

      {/* Comment button — disabled in read mode */}
      <ToolbarButton
        icon={<MessageSquare className="h-4 w-4" />}
        onClick={() => {}}
        disabled
        tooltip="Switch to Edit mode to add comments"
      />

      {/* Zoom — pushed to right */}
      <div className="ml-auto border-l border-border pl-2">
        <ZoomControls />
      </div>
    </div>
  );
}
