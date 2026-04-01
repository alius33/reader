"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AudioPlayerBar } from "@/components/audio/AudioPlayerBar";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const focusMode = useStore((s) => s.focusMode);
  const audioBookId = useStore((s) => s.audioBookId);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && !focusMode && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar — hidden in focus mode */}
      {!focusMode && <Sidebar />}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar — hidden in focus mode */}
        {!focusMode && <TopBar />}

        {/* Extra bottom padding so audio player doesn't overlap content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-200 ${audioBookId ? "pb-16" : ""}`}>
          {children}
        </main>
      </div>

      {/* Audio player — fixed bottom bar, always mounted */}
      <AudioPlayerBar />
    </div>
  );
}
