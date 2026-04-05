"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Settings, List, Search, Bookmark, BookmarkCheck } from "lucide-react";

interface ReaderTopBarProps {
  title: string;
  progress: number;
  onBack: () => void;
  onToggleSettings: () => void;
  onToggleToc: () => void;
  onToggleSearch: () => void;
  bookId: string;
}

export function ReaderTopBar({ title, progress, onBack, onToggleSettings, onToggleToc, onToggleSearch, bookId }: ReaderTopBarProps) {
  const [visible, setVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const resetHideTimer = useCallback(() => {
    setVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    hideTimerRef.current = setTimeout(() => setVisible(false), 3000);
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (e.clientY < 60) resetHideTimer();
    };
    const handleTouch = () => resetHideTimer();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchstart", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [resetHideTimer]);

  const toggleBookmark = async () => {
    // TODO: implement bookmark toggle with current CFI
    setBookmarked(!bookmarked);
  };

  return (
    <div
      className="flex items-center gap-3 h-10 px-4 bg-card/90 backdrop-blur-sm border-b border-border/50 transition-all duration-200 z-30"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)", opacity: visible ? 1 : 0 }}
      onPointerEnter={resetHideTimer}
      onFocus={resetHideTimer}
    >
      <button onClick={onBack} className="rounded-md p-1 hover:bg-accent" title="Back">
        <ArrowLeft className="h-4 w-4" />
      </button>

      <span className="flex-1 truncate text-sm font-medium">{title}</span>

      <span className="text-xs text-muted-foreground">{progress}%</span>

      <button onClick={onToggleSearch} className="rounded-md p-1 hover:bg-accent" title="Search">
        <Search className="h-4 w-4" />
      </button>
      <button onClick={onToggleToc} className="rounded-md p-1 hover:bg-accent" title="Table of Contents">
        <List className="h-4 w-4" />
      </button>
      <button onClick={toggleBookmark} className="rounded-md p-1 hover:bg-accent" title="Bookmark">
        {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
      </button>
      <button onClick={onToggleSettings} className="rounded-md p-1 hover:bg-accent" title="Settings">
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}
