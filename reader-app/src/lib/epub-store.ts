import { create } from "zustand";

interface EpubState {
  currentLocation: string | null;
  setCurrentLocation: (loc: string | null) => void;

  settingsOpen: boolean;
  toggleSettings: () => void;
  tocOpen: boolean;
  toggleToc: () => void;
  highlightsOpen: boolean;
  toggleHighlights: () => void;
  bookmarksOpen: boolean;
  toggleBookmarks: () => void;
  searchOpen: boolean;
  toggleSearch: () => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: { cfi: string; excerpt: string; section: string }[];
  setSearchResults: (r: { cfi: string; excerpt: string; section: string }[]) => void;

  selectedHighlightColor: string;
  setSelectedHighlightColor: (c: string) => void;

  // Reading preferences (synced to server)
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  theme: "light" | "dark" | "sepia";
  setTheme: (t: "light" | "dark" | "sepia") => void;
  lineHeight: number;
  setLineHeight: (h: number) => void;
  margins: "narrow" | "medium" | "wide";
  setMargins: (m: "narrow" | "medium" | "wide") => void;
}

export const useEpubStore = create<EpubState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (loc) => set({ currentLocation: loc }),

  settingsOpen: false,
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen, tocOpen: false, highlightsOpen: false, bookmarksOpen: false, searchOpen: false })),
  tocOpen: false,
  toggleToc: () => set((s) => ({ tocOpen: !s.tocOpen, settingsOpen: false, highlightsOpen: false, bookmarksOpen: false, searchOpen: false })),
  highlightsOpen: false,
  toggleHighlights: () => set((s) => ({ highlightsOpen: !s.highlightsOpen, settingsOpen: false, tocOpen: false, bookmarksOpen: false, searchOpen: false })),
  bookmarksOpen: false,
  toggleBookmarks: () => set((s) => ({ bookmarksOpen: !s.bookmarksOpen, settingsOpen: false, tocOpen: false, highlightsOpen: false, searchOpen: false })),
  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen, settingsOpen: false, tocOpen: false, highlightsOpen: false, bookmarksOpen: false })),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchResults: [],
  setSearchResults: (r) => set({ searchResults: r }),

  selectedHighlightColor: "#fef08a",
  setSelectedHighlightColor: (c) => set({ selectedHighlightColor: c }),

  fontSize: 18,
  setFontSize: (s) => set({ fontSize: s }),
  fontFamily: "system",
  setFontFamily: (f) => set({ fontFamily: f }),
  theme: "light",
  setTheme: (t) => set({ theme: t }),
  lineHeight: 1.6,
  setLineHeight: (h) => set({ lineHeight: h }),
  margins: "medium",
  setMargins: (m) => set({ margins: m }),
}));
