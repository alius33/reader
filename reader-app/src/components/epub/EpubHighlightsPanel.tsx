"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Download } from "lucide-react";
import { useState } from "react";
import { HIGHLIGHT_COLORS } from "./EpubHighlightBubble";

interface Highlight {
  id: string;
  cfiRange: string;
  color: string;
  text: string;
  note: string | null;
  createdAt: string;
}

interface EpubHighlightsPanelProps {
  bookId: string;
  onNavigate: (cfi: string) => void;
}

export function EpubHighlightsPanel({ bookId, onNavigate }: EpubHighlightsPanelProps) {
  const queryClient = useQueryClient();
  const [exportOpen, setExportOpen] = useState(false);

  const { data: highlights = [] } = useQuery<Highlight[]>({
    queryKey: ["epub-highlights", bookId],
    queryFn: () => fetch(`/api/epub/highlights?bookId=${bookId}`).then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/epub/highlights/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["epub-highlights", bookId] }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      fetch(`/api/epub/highlights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["epub-highlights", bookId] }),
  });

  const exportHighlights = (format: string) => {
    window.open(`/api/epub/highlights/export?bookId=${bookId}&format=${format}`);
    setExportOpen(false);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Highlights ({highlights.length})</h3>
        <div className="relative">
          <button onClick={() => setExportOpen(!exportOpen)} className="rounded-md p-1 hover:bg-accent" title="Export">
            <Download className="h-4 w-4" />
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-8 z-10 rounded-md border border-border bg-card shadow-lg py-1">
              {["xlsx", "docx", "html"].map((f) => (
                <button
                  key={f}
                  onClick={() => exportHighlights(f)}
                  className="block w-full px-4 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {highlights.map((h) => (
          <div key={h.id} className="rounded-md border border-border p-2">
            <button
              onClick={() => onNavigate(h.cfiRange)}
              className="block w-full text-left"
            >
              <div
                className="rounded px-2 py-1 text-xs"
                style={{ backgroundColor: h.color + "40" }}
              >
                {h.text.substring(0, 150)}
                {h.text.length > 150 && "..."}
              </div>
            </button>
            <div className="mt-1 flex items-center gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateNoteMutation.mutate({ id: h.id, note: h.note ?? "" })}
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.value, border: c.value === h.color ? "2px solid currentColor" : "none" }}
                />
              ))}
              <div className="flex-1" />
              <button
                onClick={() => deleteMutation.mutate(h.id)}
                className="rounded p-0.5 hover:bg-accent text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {h.note && (
              <p className="mt-1 text-xs text-muted-foreground italic">{h.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
