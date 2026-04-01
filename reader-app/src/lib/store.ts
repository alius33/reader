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

export interface AudioChapter {
  number: number;
  title: string;
  url: string;
}

interface AppState {
  sidebarOpen: boolean;
  commentsPanelOpen: boolean;
  tocOpen: boolean;
  darkMode: boolean;
  activeBookId: string | null;
  fontFamily: FontFamily;
  contentZoom: number;
  focusMode: boolean;

  // Audio player
  audioBookId: string | null;
  audioChapters: AudioChapter[];
  currentChapterIndex: number;
  isPlaying: boolean;
  audioVolume: number;
  chapterListOpen: boolean;
  pendingSeekTime: number;

  toggleSidebar: () => void;
  toggleCommentsPanel: () => void;
  toggleToc: () => void;
  toggleDarkMode: () => void;
  setActiveBookId: (id: string | null) => void;
  setFontFamily: (font: FontFamily) => void;
  setContentZoom: (zoom: number) => void;
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;

  // Audio actions
  loadAudio: (bookId: string, chapters: AudioChapter[], savedProgress?: { chapterIndex: number; currentTime: number } | null) => void;
  playChapter: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setAudioVolume: (volume: number) => void;
  toggleChapterList: () => void;
  closeAudio: () => void;
  nextChapter: () => void;
  prevChapter: () => void;
  clearPendingSeek: () => void;
}

export const useStore = create<AppState>()((set) => ({
  sidebarOpen: true,
  commentsPanelOpen: false,
  tocOpen: false,
  darkMode: false,
  activeBookId: null,
  fontFamily: "system",
  contentZoom: 100,
  focusMode: false,

  // Audio initial state
  audioBookId: null,
  audioChapters: [],
  currentChapterIndex: 0,
  isPlaying: false,
  audioVolume: 0.8,
  chapterListOpen: false,
  pendingSeekTime: 0,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCommentsPanel: () => set((s) => ({ commentsPanelOpen: !s.commentsPanelOpen })),
  toggleToc: () =>
    set((s) => {
      const next = !s.tocOpen;
      localStorage.setItem("tocOpen", JSON.stringify(next));
      return { tocOpen: next };
    }),
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
  setContentZoom: (zoom) => {
    const clamped = Math.min(200, Math.max(50, zoom));
    localStorage.setItem("contentZoom", String(clamped));
    set({ contentZoom: clamped });
  },
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFocusMode: (val) => set({ focusMode: val }),

  // Audio actions
  loadAudio: (bookId, chapters, savedProgress) => set({
    audioBookId: bookId,
    audioChapters: chapters,
    currentChapterIndex: savedProgress?.chapterIndex ?? 0,
    isPlaying: true,
    chapterListOpen: false,
    pendingSeekTime: savedProgress?.currentTime ?? 0,
  }),
  playChapter: (index) => set({
    currentChapterIndex: index,
    isPlaying: true,
    chapterListOpen: false,
    pendingSeekTime: 0,
  }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setAudioVolume: (volume) => set({ audioVolume: volume }),
  toggleChapterList: () => set((s) => ({ chapterListOpen: !s.chapterListOpen })),
  closeAudio: () => set({
    audioBookId: null,
    audioChapters: [],
    currentChapterIndex: 0,
    isPlaying: false,
    chapterListOpen: false,
    pendingSeekTime: 0,
  }),
  nextChapter: () => set((s) => {
    if (s.currentChapterIndex >= s.audioChapters.length - 1) {
      return { isPlaying: false };
    }
    return { currentChapterIndex: s.currentChapterIndex + 1, pendingSeekTime: 0 };
  }),
  prevChapter: () => set((s) => {
    if (s.currentChapterIndex <= 0) return {};
    return { currentChapterIndex: s.currentChapterIndex - 1, pendingSeekTime: 0 };
  }),
  clearPendingSeek: () => set({ pendingSeekTime: 0 }),
}));
