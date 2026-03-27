"use client";

import { useState, useEffect, useRef } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  WikilinkInsertDialog                                                */
/* ------------------------------------------------------------------ */

interface WikilinkInsertDialogProps {
  editor: TiptapEditor;
}

export function WikilinkInsertDialog({ editor }: WikilinkInsertDialogProps) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [display, setDisplay] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill display text from selection when opening
  useEffect(() => {
    if (open) {
      const { from, to, empty } = editor.state.selection;
      if (!empty) {
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setDisplay(selectedText);
      } else {
        setDisplay("");
      }
      setTarget("");
      // Focus the target input after the dropdown renders
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, editor]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;

    const { empty } = editor.state.selection;
    const displayValue = display.trim() || target.trim();

    if (!empty) {
      // Text is selected: apply wikilink mark to the selection
      editor
        .chain()
        .focus()
        .setWikilink({
          target: target.trim(),
          bookId: null,
          display: displayValue,
        })
        .run();
    } else {
      // No selection: insert text with the wikilink mark
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: displayValue,
          marks: [
            {
              type: "wikilink",
              attrs: {
                target: target.trim(),
                bookId: null,
                display: displayValue,
              },
            },
          ],
        })
        .run();
    }

    setOpen(false);
    setTarget("");
    setDisplay("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="Insert Wikilink"
        className={cn(
          "flex h-7 items-center gap-1 rounded px-1.5 hover:bg-muted",
          editor.isActive("wikilink") && "bg-accent text-primary"
        )}
      >
        <Link2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-md border border-border bg-popover p-3 shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Target book
            </label>
            <input
              ref={inputRef}
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. Deep Work - Cal Newport"
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <label className="text-xs font-medium text-muted-foreground">
              Display text{" "}
              <span className="font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={display}
              onChange={(e) => setDisplay(e.target.value)}
              placeholder={target || "Same as target"}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 text-xs hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!target.trim()}
                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-40"
              >
                Insert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
