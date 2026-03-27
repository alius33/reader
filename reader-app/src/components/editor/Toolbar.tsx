"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Palette,
  MessageSquare,
  Code,
  Quote,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  editor: Editor;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Orange", color: "#fed7aa" },
];

const TEXT_COLORS = [
  { name: "Default", color: "" },
  { name: "Red", color: "#e74c3c" },
  { name: "Green", color: "#27ae60" },
  { name: "Blue", color: "#2980b9" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 hover:bg-accent disabled:opacity-50",
        active && "bg-accent text-primary"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card">
      {/* Row 1: Text formatting */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert table"
        >
          <Table className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Row 2: Colors, callouts, alignment */}
      <div className="flex flex-wrap items-center gap-0.5 border-t border-border px-2 py-1">
        {/* Text color dropdown */}
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Text color">
            <Palette className="h-4 w-4" />
          </ToolbarButton>
          <div className="absolute left-0 top-full z-30 hidden min-w-[120px] rounded-md border border-border bg-popover p-1 shadow-md group-hover:block">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  if (c.color) {
                    editor.chain().focus().setColor(c.color).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
              >
                <span
                  className="h-3 w-3 rounded-full border border-border"
                  style={{
                    backgroundColor: c.color || "transparent",
                  }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight dropdown */}
        <div className="relative group">
          <ToolbarButton
            onClick={() => {}}
            active={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <div className="absolute left-0 top-full z-30 hidden min-w-[120px] rounded-md border border-border bg-popover p-1 shadow-md group-hover:block">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: c.color })
                    .run()
                }
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
              >
                <span
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </button>
            ))}
            <button
              onClick={() =>
                editor.chain().focus().unsetHighlight().run()
              }
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
            >
              <span className="h-3 w-3 rounded-full border-2 border-dashed border-border" />
              Remove
            </button>
          </div>
        </div>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => {}}
          title="Add comment"
        >
          <MessageSquare className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
