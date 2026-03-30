"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  List,
  ListOrdered,
  Quote,
  Palette,
  Highlighter,
} from "lucide-react";
import {
  ToolbarButton,
  ToolbarDivider,
  ToolbarDropdown,
  RibbonGroup,
} from "../shared";
import { FontSizeSelect } from "../controls/FontSizeSelect";
import {
  ColorPicker,
  HighlightPicker,
  TEXT_COLORS,
} from "../controls/ColorPicker";

/* ------------------------------------------------------------------ */
/*  HomeTab                                                            */
/* ------------------------------------------------------------------ */

interface HomeTabProps {
  editor: TiptapEditor;
}

export function HomeTab({ editor }: HomeTabProps) {
  const activeTextColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? null;

  const activeHighlightColor =
    (editor.getAttributes("highlight").color as string | undefined) ?? null;

  return (
    <div className="flex items-end gap-0">
      {/* ---- Font ---- */}
      <RibbonGroup label="Font">
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          tooltip="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          tooltip="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          tooltip="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          tooltip="Strikethrough"
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          tooltip="Inline Code"
        />
        <ToolbarDivider />
        <FontSizeSelect editor={editor} />
      </RibbonGroup>

      {/* ---- Paragraph ---- */}
      <RibbonGroup label="Paragraph">
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          tooltip="Align Left"
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          tooltip="Align Center"
        />
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          tooltip="Align Right"
        />
        <ToolbarButton
          icon={<AlignJustify className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          tooltip="Justify"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={<IndentIncrease className="h-4 w-4" />}
          onClick={() => editor.commands.indent()}
          tooltip="Indent (Tab)"
        />
        <ToolbarButton
          icon={<IndentDecrease className="h-4 w-4" />}
          onClick={() => editor.commands.outdent()}
          tooltip="Outdent (Shift+Tab)"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          tooltip="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          tooltip="Ordered List"
        />
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          tooltip="Blockquote"
        />
        {editor.isActive("table") && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              icon={<AlignLeft className="h-3.5 w-3.5" />}
              onClick={() => editor.commands.setTableAlignment("left")}
              tooltip="Align table left"
            />
            <ToolbarButton
              icon={<AlignCenter className="h-3.5 w-3.5" />}
              onClick={() => editor.commands.setTableAlignment("center")}
              tooltip="Align table center"
            />
            <ToolbarButton
              icon={<AlignRight className="h-3.5 w-3.5" />}
              onClick={() => editor.commands.setTableAlignment("right")}
              tooltip="Align table right"
            />
          </>
        )}
      </RibbonGroup>

      {/* ---- Styles ---- */}
      <RibbonGroup label="Styles">
        {/* Text Color */}
        <ToolbarDropdown
          icon={<Palette className="h-4 w-4" />}
          active={!!activeTextColor}
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

        {/* Highlight */}
        <ToolbarDropdown
          icon={<Highlighter className="h-4 w-4" />}
          active={editor.isActive("highlight")}
        >
          <HighlightPicker
            activeColor={activeHighlightColor}
            onSelect={(color) =>
              editor.chain().focus().toggleHighlight({ color }).run()
            }
            onClear={() => editor.chain().focus().unsetHighlight().run()}
          />
        </ToolbarDropdown>
      </RibbonGroup>
    </div>
  );
}
