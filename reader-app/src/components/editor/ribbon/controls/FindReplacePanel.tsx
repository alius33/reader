"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import type { SearchAndReplaceStorage } from "../../extensions/SearchAndReplace";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface FindReplacePanelProps {
  editor: TiptapEditor;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  FindReplacePanel                                                   */
/* ------------------------------------------------------------------ */

export function FindReplacePanel({ editor, onClose }: FindReplacePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const storage = editor.storage
    .searchAndReplace as SearchAndReplaceStorage | undefined;
  const matchCount = storage?.results?.length ?? 0;
  const currentIndex = storage?.currentIndex ?? 0;
  const caseSensitive = storage?.caseSensitive ?? false;

  // Focus search input on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    editor.commands.clearSearch();
    onClose();
  }, [editor, onClose]);

  // Keyboard shortcuts scoped to the panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      // Enter / Shift+Enter only when search input is focused
      if (
        e.key === "Enter" &&
        document.activeElement === searchRef.current
      ) {
        e.preventDefault();
        if (e.shiftKey) {
          editor.commands.findPrevious();
        } else {
          editor.commands.findNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, handleClose]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    editor.commands.setSearchTerm(value);
  };

  const handleReplaceChange = (value: string) => {
    setReplaceTerm(value);
    editor.commands.setReplaceTerm(value);
  };

  return (
    <div className="absolute top-2 right-2 z-30 rounded-lg border border-border bg-card p-3 shadow-lg w-[calc(100vw-2rem)] sm:w-80">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Find &amp; Replace</span>
        <button
          onClick={handleClose}
          className="rounded p-1 hover:bg-muted"
          title="Close (Esc)"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Find row */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Find..."
          className="h-7 flex-1 rounded border border-border bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={() => editor.commands.findPrevious()}
          className="rounded p-1 hover:bg-muted"
          title="Previous (Shift+Enter)"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => editor.commands.findNext()}
          className="rounded p-1 hover:bg-muted"
          title="Next (Enter)"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Replace row */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <input
          type="text"
          value={replaceTerm}
          onChange={(e) => handleReplaceChange(e.target.value)}
          placeholder="Replace..."
          className="h-7 flex-1 rounded border border-border bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={() => editor.commands.replaceOne()}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          title="Replace current match"
        >
          Replace
        </button>
        <button
          onClick={() => editor.commands.replaceAll()}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          title="Replace all matches"
        >
          All
        </button>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={() => editor.commands.toggleCaseSensitive()}
            className="h-3 w-3"
          />
          Case sensitive
        </label>
        <span className="text-xs text-muted-foreground">
          {matchCount > 0
            ? `${currentIndex + 1} of ${matchCount}`
            : searchTerm
              ? "No matches"
              : ""}
        </span>
      </div>
    </div>
  );
}
