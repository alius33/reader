"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={toggleSidebar}
        />
      )}
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto transition-all duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
