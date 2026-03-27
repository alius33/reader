"use client";

import { useState, useEffect } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  Table,
  Minus,
  GitBranch,
  Link,
  MessageSquare,
} from "lucide-react";
import { ToolbarButton, RibbonGroup } from "../shared";
import { CalloutInsertMenu } from "../controls/CalloutInsertMenu";
import { WikilinkInsertDialog } from "../controls/WikilinkInsertDialog";

/* ------------------------------------------------------------------ */
/*  InsertTab                                                          */
/* ------------------------------------------------------------------ */

interface InsertTabProps {
  editor: TiptapEditor;
  onComment?: (markId: string, selectedText: string) => void;
}

export function InsertTab({ editor, onComment }: InsertTabProps) {
  // Track whether the editor has a text selection for the comment button
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    const updateSelection = () => {
      setHasSelection(!editor.state.selection.empty);
    };

    editor.on("selectionUpdate", updateSelection);
    editor.on("transaction", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("transaction", updateSelection);
    };
  }, [editor]);

  function handleInsertComment() {
    if (editor.state.selection.empty || !onComment) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const markId = crypto.randomUUID();

    // Apply the comment mark to the selected text
    editor.chain().focus().setComment(markId).run();

    // Notify parent to create the comment in the database
    onComment(markId, selectedText);
  }

  return (
    <div className="flex items-end gap-0">
      {/* ---- Elements ---- */}
      <RibbonGroup label="Elements">
        <ToolbarButton
          icon={<Table className="h-4 w-4" />}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          tooltip="Insert Table"
        />
        <ToolbarButton
          icon={<Minus className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Horizontal Rule"
        />
      </RibbonGroup>

      {/* ---- Blocks ---- */}
      <RibbonGroup label="Blocks">
        <CalloutInsertMenu editor={editor} />
        <ToolbarButton
          icon={<GitBranch className="h-4 w-4" />}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: "mermaidDiagram",
                attrs: { source: "flowchart LR\n    A[Start] --> B[End]" },
              })
              .run()
          }
          tooltip="Insert Mermaid Diagram"
        />
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive("link")}
          tooltip="Insert Link"
        />
      </RibbonGroup>

      {/* ---- References ---- */}
      <RibbonGroup label="References">
        <WikilinkInsertDialog editor={editor} />
        <ToolbarButton
          icon={<MessageSquare className="h-4 w-4" />}
          onClick={handleInsertComment}
          disabled={!hasSelection || !onComment}
          tooltip={hasSelection ? "Add Comment" : "Select text to comment"}
        />
      </RibbonGroup>
    </div>
  );
}
