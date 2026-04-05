"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import type { Rendition } from "epubjs";

interface EpubSearchProps {
  rendition: Rendition | null;
  onNavigate: (cfi: string) => void;
}

interface SearchResult {
  cfi: string;
  excerpt: string;
  section: string;
}

export function EpubSearch({ rendition, onNavigate }: EpubSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!rendition || !query.trim()) return;
    setSearching(true);

    const book = rendition.book;
    const allResults: SearchResult[] = [];

    const spine = book.spine as unknown as { each: (fn: (item: { load: (resolve: unknown) => Promise<{ find: (q: string) => { cfi: string; excerpt: string }[] }>; unload: () => void }, index: number) => void) => void };

    await new Promise<void>((resolve) => {
      let remaining = 0;
      spine.each((item: { load: (resolve: unknown) => Promise<{ find: (q: string) => { cfi: string; excerpt: string }[] }>; unload: () => void }) => {
        remaining++;
        item.load(book.load.bind(book)).then((contents: { find: (q: string) => { cfi: string; excerpt: string }[] }) => {
          const found = contents.find(query);
          for (const r of found) {
            allResults.push({
              cfi: r.cfi,
              excerpt: r.excerpt.substring(0, 100),
              section: "",
            });
          }
          item.unload();
          remaining--;
          if (remaining === 0) resolve();
        });
      });
      if (remaining === 0) resolve();
    });

    setResults(allResults.slice(0, 50));
    setSearching(false);
  }, [rendition, query]);

  return (
    <div className="p-3">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search in book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full rounded border border-border bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {searching && <p className="text-xs text-muted-foreground">Searching...</p>}

      {results.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-2">{results.length} results</p>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onNavigate(r.cfi)}
              className="block w-full text-left rounded p-2 text-xs hover:bg-accent transition-colors"
            >
              <span className="text-foreground">{r.excerpt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
