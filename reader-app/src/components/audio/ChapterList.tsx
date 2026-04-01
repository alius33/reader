"use client";

import { Headphones } from "lucide-react";
import type { AudioChapter } from "@/lib/store";

interface ChapterListProps {
  chapters: AudioChapter[];
  currentIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}

export function ChapterList({ chapters, currentIndex, isPlaying, onSelect }: ChapterListProps) {
  return (
    <div className="border-t border-border max-h-60 overflow-y-auto">
      {chapters.map((chapter, i) => {
        const isCurrent = i === currentIndex;
        return (
          <button
            key={chapter.number}
            onClick={() => onSelect(i)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors ${
              isCurrent ? "bg-muted" : ""
            }`}
          >
            <span className="text-xs text-muted-foreground shrink-0 w-5 text-right flex items-center justify-end">
              {isCurrent ? (
                <Headphones className={`h-3.5 w-3.5 ${isPlaying ? "text-primary" : ""}`} />
              ) : (
                chapter.number
              )}
            </span>
            <span
              className={`text-sm truncate ${
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {chapter.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
