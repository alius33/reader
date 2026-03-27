import { create } from "zustand";

export type FontFamily = "system" | "georgia" | "charter" | "literata" | "source-sans" | "merriweather" | "open-sans";

export const FONT_OPTIONS: { id: FontFamily; label: string; value: string }[] = [
  { id: "system", label: "System (default)", value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' },
  { id: "georgia", label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { id: "charter", label: "Charter", value: "'Charter', 'Bitstream Charter', Georgia, serif" },
  { id: "literata", label: "Literata", value: "'Literata', Georgia, serif" },
  { id: "source-sans", label: "Source Sans", value: "'Source Sans 3', 'Segoe UI', sans-serif" },
  { id: "merriweather", label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { id: "open-sans", label: "Open Sans", value: "'Open Sans', 'Segoe UI', sans-serif" },
];

interface AppState {
  sidebarOpen: boolean;
  commentsPanelOpen: boolean;
  darkMode: boolean;
  activeBookId: string | null;
  fontFamily: FontFamily;

  toggleSidebar: () => void;
  toggleCommentsPanel: () => void;
  toggleDarkMode: () => void;
  setActiveBookId: (id: string | null) => void;
  setFontFamily: (font: FontFamily) => void;
}

export const useStore = create<AppState>()((set) => ({
  sidebarOpen: true,
  commentsPanelOpen: false,
  darkMode: false,
  activeBookId: null,
  fontFamily: "system",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCommentsPanel: () => set((s) => ({ commentsPanelOpen: !s.commentsPanelOpen })),
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(next));
      return { darkMode: next };
    }),
  setActiveBookId: (id) => set({ activeBookId: id }),
  setFontFamily: (font) => {
    localStorage.setItem("fontFamily", font);
    set({ fontFamily: font });
  },
}));
