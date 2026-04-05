"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, BookmarkIcon } from "lucide-react";

interface Bookmark {
  id: string;
  cfi: string;
  label: string | null;
  createdAt: string;
}

interface EpubBookmarksPanelProps {
  bookId: string;
  onNavigate: (cfi: string) => void;
}

export function EpubBookmarksPanel({ bookId, onNavigate }: EpubBookmarksPanelProps) {
  const queryClient = useQueryClient();

  const { data: bookmarks = [] } = useQuery<Bookmark[]>({
    queryKey: ["epub-bookmarks", bookId],
    queryFn: () => fetch(`/api/epub/bookmarks?bookId=${bookId}`).then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/epub/bookmarks/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["epub-bookmarks", bookId] }),
  });

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold mb-3">Bookmarks ({bookmarks.length})</h3>

      <div className="space-y-1">
        {bookmarks.map((b) => (
          <div key={b.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
            <BookmarkIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <button
              onClick={() => onNavigate(b.cfi)}
              className="flex-1 text-left text-sm truncate"
            >
              {b.label || new Date(b.createdAt).toLocaleDateString()}
            </button>
            <button
              onClick={() => deleteMutation.mutate(b.id)}
              className="rounded p-0.5 hover:bg-accent text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {bookmarks.length === 0 && (
          <p className="text-xs text-muted-foreground">No bookmarks yet</p>
        )}
      </div>
    </div>
  );
}
