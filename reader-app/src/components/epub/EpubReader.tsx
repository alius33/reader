"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ReactReader } from "react-reader";
import type { Rendition } from "epubjs";
import { useEpubStore } from "@/lib/epub-store";
import { ReaderTopBar } from "./ReaderTopBar";
import { ReaderSettings } from "./ReaderSettings";
import { EpubToc } from "./EpubToc";
import { EpubSearch } from "./EpubSearch";

interface EpubReaderProps {
  url: string;
  title: string;
  bookId: string;
  onBack: () => void;
}

const THEMES: Record<string, Record<string, Record<string, string>>> = {
  light: { body: { color: "#1a1a1a", background: "#ffffff" } },
  dark: { body: { color: "#e0e0e0", background: "#1a1a1a" } },
  sepia: { body: { color: "#3d3425", background: "#f4ecd8" } },
};

const MARGIN_MAP = { narrow: 20, medium: 50, wide: 100 };

export function EpubReader({ url, title, bookId, onBack }: EpubReaderProps) {
  const renditionRef = useRef<Rendition | null>(null);
  const [location, setLocation] = useState<string | number>(0);
  const [progress, setProgress] = useState(0);

  const {
    fontSize, fontFamily, theme, lineHeight, margins,
    tocOpen, settingsOpen, searchOpen,
    toggleToc, toggleSettings, toggleSearch,
  } = useEpubStore();

  // Load saved progress
  useEffect(() => {
    fetch(`/api/epub/progress?bookId=${bookId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.cfi) setLocation(data.cfi);
      })
      .catch(() => {});
  }, [bookId]);

  // Apply theme and settings
  const applySettings = useCallback((rendition: Rendition) => {
    const themeName = theme;
    rendition.themes.register(themeName, THEMES[themeName]);
    rendition.themes.select(themeName);

    rendition.themes.override("font-size", `${fontSize}px`);
    rendition.themes.override("line-height", `${lineHeight}`);

    if (fontFamily !== "system") {
      rendition.themes.override("font-family", fontFamily);
    }
  }, [fontSize, fontFamily, theme, lineHeight]);

  useEffect(() => {
    if (renditionRef.current) applySettings(renditionRef.current);
  }, [applySettings]);

  // Debounced progress save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveProgress = useCallback((cfi: string, pct: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/epub/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, cfi, percentage: pct }),
      }).catch(() => {});
    }, 30000);
  }, [bookId]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Immediate save on unmount
      const store = useEpubStore.getState();
      if (store.currentLocation) {
        fetch("/api/epub/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, cfi: store.currentLocation, percentage: progress }),
        }).catch(() => {});
      }
    };
  }, [bookId, progress]);

  const handleLocationChanged = useCallback((loc: string) => {
    setLocation(loc);
    useEpubStore.getState().setCurrentLocation(loc);

    if (renditionRef.current) {
      const currentLoc = renditionRef.current.currentLocation();
      if (currentLoc && typeof currentLoc === "object" && "start" in currentLoc) {
        const pct = ((currentLoc as { start: { percentage: number } }).start.percentage ?? 0) * 100;
        setProgress(Math.round(pct));
        saveProgress(loc, pct);
      }
    }
  }, [saveProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") renditionRef.current?.next();
      if (e.key === "ArrowLeft") renditionRef.current?.prev();
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack]);

  const bgClass = theme === "dark" ? "bg-[#1a1a1a]" : theme === "sepia" ? "bg-[#f4ecd8]" : "bg-white";

  return (
    <div className={`flex flex-col h-screen ${bgClass}`}>
      <ReaderTopBar
        title={title}
        progress={progress}
        onBack={onBack}
        onToggleSettings={toggleSettings}
        onToggleToc={toggleToc}
        onToggleSearch={toggleSearch}
        bookId={bookId}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar panels */}
        {tocOpen && (
          <div className="w-72 border-r border-border bg-card overflow-y-auto">
            <EpubToc
              rendition={renditionRef.current}
              onNavigate={(href) => renditionRef.current?.display(href)}
            />
          </div>
        )}

        {settingsOpen && (
          <div className="w-72 border-r border-border bg-card overflow-y-auto p-4">
            <ReaderSettings bookId={bookId} />
          </div>
        )}

        {searchOpen && (
          <div className="w-72 border-r border-border bg-card overflow-y-auto">
            <EpubSearch
              rendition={renditionRef.current}
              onNavigate={(cfi) => renditionRef.current?.display(cfi)}
            />
          </div>
        )}

        {/* Reader */}
        <div className="flex-1" style={{ padding: `0 ${MARGIN_MAP[margins]}px` }}>
          <ReactReader
            url={url}
            location={location}
            locationChanged={handleLocationChanged}
            showToc={false}
            epubOptions={{ flow: "paginated", manager: "continuous" }}
            getRendition={(rendition) => {
              renditionRef.current = rendition;
              applySettings(rendition);

              // Swipe gestures
              rendition.on("touchstart", (e: TouchEvent) => {
                const startX = e.changedTouches[0].screenX;
                const handleEnd = (endEvt: TouchEvent) => {
                  const diff = endEvt.changedTouches[0].screenX - startX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) rendition.prev();
                    else rendition.next();
                  }
                };
                rendition.on("touchend", handleEnd);
                setTimeout(() => rendition.off("touchend", handleEnd), 1000);
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
