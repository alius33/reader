"use client";

import { useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomeTab } from "./tabs/HomeTab";
import { InsertTab } from "./tabs/InsertTab";
import { FormatTab } from "./tabs/FormatTab";
import { ZoomControls } from "../ZoomControls";
import { ToolbarButton, ToolbarDivider } from "./shared";
import { useStore } from "@/lib/store";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RibbonTabId = "home" | "insert" | "format";

const TABS: { id: RibbonTabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "insert", label: "Insert" },
  { id: "format", label: "Format" },
];

/* ------------------------------------------------------------------ */
/*  Ribbon                                                             */
/* ------------------------------------------------------------------ */

interface RibbonProps {
  editor: TiptapEditor;
  onComment?: (markId: string, selectedText: string) => void;
  onOpenFindReplace?: () => void;
}

export function Ribbon({ editor, onComment, onOpenFindReplace }: RibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTabId>("home");
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "ribbon-tab",
              activeTab === tab.id && "active"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex items-center px-2 py-0.5">
        <div className="overflow-x-auto flex-1">
          {activeTab === "home" && <HomeTab editor={editor} />}
          {activeTab === "insert" && <InsertTab editor={editor} onComment={onComment} />}
          {activeTab === "format" && (
            <FormatTab editor={editor} onOpenFindReplace={onOpenFindReplace} />
          )}
        </div>
        <div className="ml-auto shrink-0 flex items-center border-l border-border pl-2 ml-2 gap-1">
          <ZoomControls />
          <ToolbarDivider />
          <ToolbarButton
            icon={<Maximize2 className="h-4 w-4" />}
            onClick={toggleFocusMode}
            tooltip="Focus mode"
          />
        </div>
      </div>
    </div>
  );
}
