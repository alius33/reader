"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
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
import { CalloutNode } from "./extensions/CalloutNode";
import { MermaidNode } from "./extensions/MermaidNode";
import { WikilinkMark } from "./extensions/WikilinkMark";
import { CommentMark } from "./extensions/CommentMark";
import { Toolbar } from "./Toolbar";
import type { TiptapDoc } from "@/types";

interface EditorProps {
  content: TiptapDoc;
  onUpdate?: (doc: TiptapDoc) => void;
  editable?: boolean;
}

export function Editor({ content, onUpdate, editable = true }: EditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Table.configure({ resizable: true }),
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
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onUpdateRef.current?.(ed.getJSON() as TiptapDoc);
    },
    editorProps: {
      attributes: {
        class:
          "reader-content max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

  // Sync editable prop
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div className="flex flex-col">
      {editable && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
