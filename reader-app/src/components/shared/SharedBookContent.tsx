"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "@/components/editor/extensions";

export function SharedBookContent({ content }: { content: Record<string, unknown> }) {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "reader-content max-w-none focus:outline-none px-0 py-0",
      },
    },
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
