"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TableWithAlignment } from "./extensions/TableAlignment";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { FontSize } from "./extensions/FontSize";
import { Indent } from "./extensions/Indent";
import { CalloutNode } from "./extensions/CalloutNode";
import { MermaidNode } from "./extensions/MermaidNode";
import { WikilinkMark } from "./extensions/WikilinkMark";
import { CommentMark } from "./extensions/CommentMark";
import { SearchAndReplace } from "./extensions/SearchAndReplace";
import { Ribbon } from "./ribbon/Ribbon";
import { ReadToolbar } from "./ReadToolbar";
import { FindReplacePanel } from "./ribbon/controls/FindReplacePanel";
import type { TiptapDoc } from "@/types";

interface EditorProps {
  content: TiptapDoc;
  onUpdate?: (doc: TiptapDoc) => void;
  mode?: "read" | "edit";
  onComment?: (markId: string, selectedText: string) => void;
}

export function Editor({ content, onUpdate, mode = "read", onComment }: EditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editable = mode === "edit";

  const [findReplaceOpen, setFindReplaceOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TableWithAlignment.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Typography,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank" } }),
      CalloutNode,
      MermaidNode,
      WikilinkMark,
      CommentMark,
      Superscript,
      Subscript,
      FontSize,
      Indent,
      SearchAndReplace,
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onUpdateRef.current?.(ed.getJSON() as TiptapDoc);
    },
    editorProps: {
      attributes: {
        class:
          "reader-content max-w-none focus:outline-none min-h-[500px] px-4 py-4 sm:px-6 sm:py-6",
      },
    },
  });

  // Sync editable prop when mode changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Ctrl+H / Cmd+H to toggle Find & Replace
  useEffect(() => {
    if (mode !== "edit") return;

    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "h") {
        e.preventDefault();
        setFindReplaceOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode]);

  const handleOpenFindReplace = useCallback(() => {
    setFindReplaceOpen(true);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setFindReplaceOpen(false);
  }, []);

  return (
    <div className="flex flex-col">
      {mode === "edit" && editor && (
        <Ribbon
          editor={editor}
          onComment={onComment}
          onOpenFindReplace={handleOpenFindReplace}
        />
      )}
      {mode === "read" && editor && <ReadToolbar editor={editor} />}
      <div className="relative">
        {findReplaceOpen && editor && (
          <FindReplacePanel editor={editor} onClose={handleCloseFindReplace} />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
