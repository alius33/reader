"use client";

import { useCallback, useRef } from "react";
import { set, get, del } from "idb-keyval";

const IDB_PREFIX = "reader-autosave-";

export function useAutosave(bookId: string) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const saveToIDB = useCallback(
    async (content: unknown) => {
      try {
        await set(`${IDB_PREFIX}${bookId}`, {
          content,
          savedAt: Date.now(),
        });
      } catch {
        // IndexedDB not available — silently fail
      }
    },
    [bookId]
  );

  const loadFromIDB = useCallback(async () => {
    try {
      const saved = await get(`${IDB_PREFIX}${bookId}`);
      return saved as { content: unknown; savedAt: number } | undefined;
    } catch {
      return undefined;
    }
  }, [bookId]);

  const clearIDB = useCallback(async () => {
    try {
      await del(`${IDB_PREFIX}${bookId}`);
    } catch {
      // silently fail
    }
  }, [bookId]);

  return { saveToIDB, loadFromIDB, clearIDB };
}
