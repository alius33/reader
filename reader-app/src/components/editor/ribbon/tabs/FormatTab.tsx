"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  RemoveFormatting,
  Search,
  Superscript,
  Subscript,
} from "lucide-react";
import { ToolbarButton, ToolbarDivider, RibbonGroup } from "../shared";
import { TextCaseMenu } from "../controls/TextCaseMenu";

/* ------------------------------------------------------------------ */
/*  FormatTab                                                          */
/* ------------------------------------------------------------------ */

interface FormatTabProps {
  editor: TiptapEditor;
  onOpenFindReplace?: () => void;
}

export function FormatTab({ editor, onOpenFindReplace }: FormatTabProps) {
  return (
    <div className="flex items-end gap-0">
      {/* ---- Text ---- */}
      <RibbonGroup label="Text">
        <TextCaseMenu editor={editor} />
        <ToolbarButton
          icon={<Superscript className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive("superscript")}
          tooltip="Superscript"
        />
        <ToolbarButton
          icon={<Subscript className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive("subscript")}
          tooltip="Subscript"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={<RemoveFormatting className="h-4 w-4" />}
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          tooltip="Clear Formatting"
        />
      </RibbonGroup>

      {/* ---- Tools ---- */}
      <RibbonGroup label="Tools">
        <ToolbarButton
          icon={<Search className="h-4 w-4" />}
          onClick={() => onOpenFindReplace?.()}
          tooltip="Find & Replace (Ctrl+H)"
        />
      </RibbonGroup>
    </div>
  );
}
