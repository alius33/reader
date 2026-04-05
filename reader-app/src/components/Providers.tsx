"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore, FONT_OPTIONS } from "@/lib/store";
import type { FontFamily } from "@/lib/store";
import { CommandPalette } from "@/components/layout/CommandPalette";

function DarkModeSync() {
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return null;
}

function FontSync() {
  const fontFamily = useStore((s) => s.fontFamily);

  useEffect(() => {
    const opt = FONT_OPTIONS.find((f) => f.id === fontFamily);
    if (opt) {
      document.documentElement.style.setProperty("--font-reading", opt.value);
    }
  }, [fontFamily]);

  return null;
}

function PrefsInit() {
  useEffect(() => {
    try {
      const darkStored = localStorage.getItem("darkMode");
      if (darkStored === "true") {
        useStore.setState({ darkMode: true });
      }
      const fontStored = localStorage.getItem("fontFamily") as FontFamily | null;
      if (fontStored && FONT_OPTIONS.some((f) => f.id === fontStored)) {
        useStore.setState({ fontFamily: fontStored });
      }
      const tocStored = localStorage.getItem("tocOpen");
      if (tocStored === "true") {
        useStore.setState({ tocOpen: true });
      }
      const zoomStored = localStorage.getItem("contentZoom");
      if (zoomStored) {
        const zoom = Number(zoomStored);
        if (zoom >= 50 && zoom <= 200) {
          useStore.setState({ contentZoom: zoom });
        }
      }
      if (window.innerWidth < 1024) {
        useStore.setState({ sidebarOpen: false });
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PrefsInit />
        <DarkModeSync />
        <FontSync />
        <CommandPalette />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
