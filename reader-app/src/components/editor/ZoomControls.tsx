"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";

const STEP = 5;

export function ZoomControls() {
  const contentZoom = useStore((s) => s.contentZoom);
  const setContentZoom = useStore((s) => s.setContentZoom);

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => setContentZoom(contentZoom - STEP)}
        disabled={contentZoom <= 50}
        title="Decrease text size"
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setContentZoom(100)}
        title="Reset text size"
        className="flex h-7 items-center justify-center rounded px-1 text-xs tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground min-w-[3rem]"
      >
        {contentZoom === 100 ? (
          <span>{contentZoom}%</span>
        ) : (
          <span className="flex items-center gap-0.5">
            {contentZoom}%
            <RotateCcw className="h-2.5 w-2.5" />
          </span>
        )}
      </button>
      <button
        onClick={() => setContentZoom(contentZoom + STEP)}
        disabled={contentZoom >= 200}
        title="Increase text size"
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
