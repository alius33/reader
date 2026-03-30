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
import { ChartNode } from "./extensions/ChartNode";
import { D3Node } from "./extensions/D3Node";
import { WikilinkMark } from "./extensions/WikilinkMark";
import { CommentMark } from "./extensions/CommentMark";
import { SearchAndReplace } from "./extensions/SearchAndReplace";
import { Ribbon } from "./ribbon/Ribbon";
import { ReadToolbar } from "./ReadToolbar";
import { ZoomControls } from "./ZoomControls";
import { FindReplacePanel } from "./ribbon/controls/FindReplacePanel";
import { DEFAULT_HIGHLIGHT_COLOR } from "./ribbon/controls/ColorPicker";
import { useStore } from "@/lib/store";
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

  // Editor is always editable so inline formatting (bold, italic, highlight)
  // works in read mode. The toolbar controls what actions are available.
  const editable = true;

  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const contentZoom = useStore((s) => s.contentZoom);

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
      ChartNode,
      D3Node,
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

  // Set id attributes on heading elements so TOC links can scroll to them
  useEffect(() => {
    if (!editor) return;

    const setHeadingIds = () => {
      const el = editor.view.dom;
      el.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
        const text = heading.textContent || "";
        heading.id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      });
    };

    // Set on initial render
    setHeadingIds();

    // Re-set after content changes (e.g. edits)
    editor.on("update", setHeadingIds);
    return () => {
      editor.off("update", setHeadingIds);
    };
  }, [editor]);

  // Ctrl+S / Cmd+S → toggle yellow highlight on selection
  // Ctrl+H / Cmd+H → toggle yellow highlight on selection
  useEffect(() => {
    if (!editor) return;

    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "s" || e.key === "h")) {
        e.preventDefault();
        editor.chain().focus().toggleHighlight({ color: DEFAULT_HIGHLIGHT_COLOR }).run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor]);

  const handleOpenFindReplace = useCallback(() => {
    setFindReplaceOpen(true);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setFindReplaceOpen(false);
  }, []);

  return (
    <>
      {mode === "edit" && editor && (
        <div className="sticky top-0 z-20">
          <Ribbon
            editor={editor}
            onComment={onComment}
            onOpenFindReplace={handleOpenFindReplace}
          />
        </div>
      )}
      {mode === "read" && editor && (
        <>
          <div className="hidden sm:block sticky top-0 z-20">
            <ReadToolbar editor={editor} />
          </div>
          <div className="flex sm:hidden sticky top-0 z-20 border-b border-border bg-card px-3 py-1 justify-end">
            <ZoomControls />
          </div>
        </>
      )}
      <div
        className="relative"
        style={{ "--content-zoom": contentZoom / 100 } as React.CSSProperties}
      >
        {findReplaceOpen && editor && (
          <FindReplacePanel editor={editor} onClose={handleCloseFindReplace} />
        )}
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
