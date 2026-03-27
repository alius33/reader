"use client";

import { Editor as TiptapEditor } from "@tiptap/react";
import { ToolbarDropdown } from "../shared";
import { CaseSensitive } from "lucide-react";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function transformSelectedText(editor: TiptapEditor, transformFn: (text: string) => string) {
  const { from, to } = editor.state.selection;
  if (from === to) return; // no selection

  const tr = editor.state.tr;
  // Walk backwards to avoid position shifts
  const textNodes: { pos: number; size: number; text: string; marks: readonly any[] }[] = [];

  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText && node.text) {
      const startInSelection = Math.max(from, pos);
      const endInSelection = Math.min(to, pos + node.nodeSize);
      if (startInSelection < endInSelection) {
        const sliceStart = startInSelection - pos;
        const sliceEnd = endInSelection - pos;
        const originalText = node.text.slice(sliceStart, sliceEnd);
        const transformed = transformFn(originalText);
        if (transformed !== originalText) {
          textNodes.push({
            pos: startInSelection,
            size: endInSelection - startInSelection,
            text: transformed,
            marks: node.marks,
          });
        }
      }
    }
  });

  // Apply in reverse order to keep positions valid
  for (let i = textNodes.length - 1; i >= 0; i--) {
    const { pos, size, text, marks } = textNodes[i];
    const textNode = editor.state.schema.text(text, marks);
    tr.replaceWith(pos, pos + size, textNode);
  }

  if (textNodes.length > 0) {
    editor.view.dispatch(tr);
  }
}

interface TextCaseMenuProps {
  editor: TiptapEditor;
}

export function TextCaseMenu({ editor }: TextCaseMenuProps) {
  const hasSelection = !editor.state.selection.empty;

  return (
    <ToolbarDropdown
      icon={<CaseSensitive className="h-4 w-4" />}
      tooltip="Text Case"
      disabled={!hasSelection}
    >
      <div className="flex flex-col p-1 min-w-[140px]">
        <button
          className="px-3 py-1.5 text-left text-sm hover:bg-muted rounded"
          onClick={() => transformSelectedText(editor, (t) => t.toUpperCase())}
        >
          UPPERCASE
        </button>
        <button
          className="px-3 py-1.5 text-left text-sm hover:bg-muted rounded"
          onClick={() => transformSelectedText(editor, (t) => t.toLowerCase())}
        >
          lowercase
        </button>
        <button
          className="px-3 py-1.5 text-left text-sm hover:bg-muted rounded"
          onClick={() => transformSelectedText(editor, toTitleCase)}
        >
          Title Case
        </button>
      </div>
    </ToolbarDropdown>
  );
}
