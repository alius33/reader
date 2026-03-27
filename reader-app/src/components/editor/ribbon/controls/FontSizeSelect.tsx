"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface FontSizeSelectProps {
  editor: TiptapEditor;
}

export function FontSizeSelect({ editor }: FontSizeSelectProps) {
  const raw = editor.getAttributes("textStyle").fontSize as
    | string
    | null
    | undefined;

  // Parse "18px" -> "18", or keep null
  const current = raw ? raw.replace(/px$/i, "") : "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "") {
          editor.chain().focus().unsetFontSize().run();
        } else {
          editor
            .chain()
            .focus()
            .setFontSize(`${val}px`)
            .run();
        }
      }}
      title="Font Size"
      className="h-7 w-[60px] rounded border border-border bg-transparent px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">Default</option>
      {FONT_SIZES.map((size) => (
        <option key={size} value={String(size)}>
          {size}
        </option>
      ))}
    </select>
  );
}
