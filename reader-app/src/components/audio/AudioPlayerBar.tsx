"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  List,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ChapterList } from "./ChapterList";

/* ------------------------------------------------------------------ */
/*  Progress persistence                                               */
/* ------------------------------------------------------------------ */

const AUDIO_KEY = "reader-audio-";

export function saveAudioProgress(bookId: string, chapterIndex: number, currentTime: number) {
  try {
    localStorage.setItem(`${AUDIO_KEY}${bookId}`, JSON.stringify({ chapterIndex, currentTime }));
  } catch { /* quota */ }
}

export function loadAudioProgress(bookId: string): { chapterIndex: number; currentTime: number } | null {
  try {
    const val = localStorage.getItem(`${AUDIO_KEY}${bookId}`);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  AudioPlayerBar                                                     */
/* ------------------------------------------------------------------ */

export function AudioPlayerBar() {
  const audioBookId      = useStore((s) => s.audioBookId);
  const audioChapters    = useStore((s) => s.audioChapters);
  const currentChapterIndex = useStore((s) => s.currentChapterIndex);
  const isPlaying        = useStore((s) => s.isPlaying);
  const volume           = useStore((s) => s.audioVolume);
  const chapterListOpen  = useStore((s) => s.chapterListOpen);
  const pendingSeekTime  = useStore((s) => s.pendingSeekTime);

  const playChapter      = useStore((s) => s.playChapter);
  const setIsPlaying     = useStore((s) => s.setIsPlaying);
  const setAudioVolume   = useStore((s) => s.setAudioVolume);
  const toggleChapterList = useStore((s) => s.toggleChapterList);
  const closeAudio       = useStore((s) => s.closeAudio);
  const nextChapter      = useStore((s) => s.nextChapter);
  const prevChapter      = useStore((s) => s.prevChapter);
  const clearPendingSeek = useStore((s) => s.clearPendingSeek);

  // Local state for scrubber — avoids Zustand updates at 4 Hz
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stable refs so event listeners don't close over stale values
  const audioBookIdRef        = useRef(audioBookId);
  const currentChapterIndexRef = useRef(currentChapterIndex);
  const isPlayingRef          = useRef(isPlaying);
  const nextChapterRef        = useRef(nextChapter);

  useEffect(() => { audioBookIdRef.current = audioBookId; }, [audioBookId]);
  useEffect(() => { currentChapterIndexRef.current = currentChapterIndex; }, [currentChapterIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { nextChapterRef.current = nextChapter; }, [nextChapter]);

  /* ------ Create Audio element once ------ */
  useEffect(() => {
    const audio = new Audio();
    audio.volume = useStore.getState().audioVolume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Debounced save to localStorage
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        if (audioBookIdRef.current) {
          saveAudioProgress(audioBookIdRef.current, currentChapterIndexRef.current, audio.currentTime);
        }
      }, 2000);
    };

    const onEnded = () => nextChapterRef.current();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------ Load chapter when index changes ------ */
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const chapter = audioChapters[currentChapterIndex];
    if (!audio || !chapter) return;

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setCurrentTime(0);
    setDuration(0);

    const controller = new AbortController();

    // Fetch audio as blob — some browsers can't stream audio from network URLs
    fetch(chapter.url, { signal: controller.signal })
      .then((r) => r.blob())
      .then((blob) => {
        if (controller.signal.aborted) return;
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        audio.src = blobUrl;

        const onMetadata = () => {
          setDuration(audio.duration);
          const seekTo = useStore.getState().pendingSeekTime;
          if (seekTo > 0) {
            audio.currentTime = seekTo;
            clearPendingSeek();
          }
          if (isPlayingRef.current) {
            audio.play().catch(console.error);
          }
        };

        audio.addEventListener("loadedmetadata", onMetadata, { once: true });
        audio.load();
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Audio fetch failed:", err);
      });

    return () => controller.abort();
  }, [currentChapterIndex, audioChapters, clearPendingSeek]);

  /* ------ Stop when closed ------ */
  useEffect(() => {
    if (!audioBookId) {
      audioRef.current?.pause();
      setCurrentTime(0);
      setDuration(0);
    }
  }, [audioBookId]);

  /* ------ Sync play / pause ------ */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  /* ------ Sync volume ------ */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  /* ------ Space bar toggle ------ */
  useEffect(() => {
    if (!audioBookId) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(!isPlayingRef.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [audioBookId, setIsPlaying]);

  /* ------ Handle pendingSeekTime changes (e.g. user reloads same book) ------ */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || pendingSeekTime <= 0) return;
    if (audio.readyState >= 1) {
      audio.currentTime = pendingSeekTime;
      clearPendingSeek();
    }
    // If not ready yet, the loadedmetadata handler above covers it
  }, [pendingSeekTime, clearPendingSeek]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  if (!audioBookId || audioChapters.length === 0) return null;

  const chapter = audioChapters[currentChapterIndex];
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < audioChapters.length - 1;

  return (
    <>
      {/* Backdrop closes chapter list */}
      {chapterListOpen && (
        <div className="fixed inset-0 z-40" onClick={toggleChapterList} />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg">
        {/* Chapter list panel */}
        {chapterListOpen && (
          <ChapterList
            chapters={audioChapters}
            currentIndex={currentChapterIndex}
            isPlaying={isPlaying}
            onSelect={playChapter}
          />
        )}

        {/* Player bar */}
        <div className="flex items-center gap-3 px-4 py-2 max-w-screen-xl mx-auto">
          {/* Playback controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={prevChapter}
              disabled={!hasPrev}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              title="Previous chapter"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying
                ? <Pause className="h-4 w-4" />
                : <Play className="h-4 w-4 translate-x-0.5" />}
            </button>
            <button
              onClick={nextChapter}
              disabled={!hasNext}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              title="Next chapter"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Chapter title + scrubber */}
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium truncate">{chapter?.title ?? ""}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 accent-primary cursor-pointer"
            />
          </div>

          {/* Volume — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setAudioVolume(volume === 0 ? 0.8 : 0)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0
                ? <VolumeX className="h-4 w-4" />
                : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setAudioVolume(Number(e.target.value))}
              className="w-20 h-1 accent-primary cursor-pointer"
            />
          </div>

          {/* Chapter list toggle */}
          <button
            onClick={toggleChapterList}
            className={`p-1.5 rounded hover:bg-muted transition-colors shrink-0 ${chapterListOpen ? "bg-muted" : ""}`}
            title="Chapters"
          >
            <List className="h-4 w-4" />
          </button>

          {/* Close */}
          <button
            onClick={closeAudio}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="Close player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
