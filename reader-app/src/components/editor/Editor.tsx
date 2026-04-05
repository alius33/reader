"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";
import { Ribbon } from "./ribbon/Ribbon";
import { ReadToolbar } from "./ReadToolbar";
import { FloatingToolbar } from "./FloatingToolbar";
import { FindReplacePanel } from "./ribbon/controls/FindReplacePanel";
import { DEFAULT_HIGHLIGHT_COLOR } from "./ribbon/controls/ColorPicker";
import { MobileSelectionBubble } from "./MobileSelectionBubble";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";
import type { TiptapDoc } from "@/types";

interface EditorProps {
  content: TiptapDoc;
  onUpdate?: (doc: TiptapDoc) => void;
  mode?: "read" | "edit";
  onComment?: (markId: string, selectedText: string) => void;
  focusMode?: boolean;
  bookId?: string;
}

export function Editor({ content, onUpdate, mode = "read", onComment, focusMode = false, bookId = "" }: EditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Editor is always editable so inline formatting (bold, italic, highlight)
  // works in read mode. The toolbar controls what actions are available.
  const editable = true;

  const isMobile = useIsMobile();
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const contentZoom = useStore((s) => s.contentZoom);

  const editor = useEditor({
    extensions: getEditorExtensions(),
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

  // In read mode on mobile, prevent the virtual keyboard from appearing when
  // the user selects text. The editor stays editable so Tiptap commands work,
  // but inputmode="none" tells the browser not to open the keyboard.
  // Also suppress the native context menu so our custom bubble takes priority.
  useEffect(() => {
    if (!editor || !isMobile) return;
    const el = editor.view.dom as HTMLElement;
    if (mode === "read") {
      el.setAttribute("inputmode", "none");
      // Suppress native context menu (Android "Cut/Copy/Paste" bar)
      const suppressMenu = (e: Event) => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
          e.preventDefault();
        }
      };
      el.addEventListener("contextmenu", suppressMenu);
      return () => el.removeEventListener("contextmenu", suppressMenu);
    } else {
      el.removeAttribute("inputmode");
    }
  }, [editor, isMobile, mode]);

  const handleOpenFindReplace = useCallback(() => {
    setFindReplaceOpen(true);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setFindReplaceOpen(false);
  }, []);

  return (
    <>
      {/* Normal toolbars — hidden in focus mode */}
      {!focusMode && mode === "edit" && editor && (
        <div className="sticky top-0 z-20">
          <Ribbon
            editor={editor}
            onComment={onComment}
            onOpenFindReplace={handleOpenFindReplace}
          />
        </div>
      )}
      {!focusMode && mode === "read" && editor && (
        <div className="sticky top-0 z-20">
          <ReadToolbar editor={editor} />
        </div>
      )}
      {/* Mobile: bubble appears above selected text with colour swatches — no toolbar tap needed */}
      {isMobile && mode === "read" && editor && (
        <MobileSelectionBubble editor={editor} onComment={onComment} />
      )}

      {/* Floating toolbar in focus mode */}
      {focusMode && editor && (
        <FloatingToolbar
          editor={editor}
          mode={mode}
          bookId={bookId}
          onComment={onComment}
        />
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
