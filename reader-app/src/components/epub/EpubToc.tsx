"use client";

import { useState, useEffect } from "react";
import type { Rendition, NavItem } from "epubjs";

interface EpubTocProps {
  rendition: Rendition | null;
  onNavigate: (href: string) => void;
}

export function EpubToc({ rendition, onNavigate }: EpubTocProps) {
  const [toc, setToc] = useState<NavItem[]>([]);

  useEffect(() => {
    if (!rendition) return;
    const book = rendition.book;
    book.loaded.navigation.then((nav) => {
      setToc(nav.toc);
    });
  }, [rendition]);

  const renderItems = (items: NavItem[], depth = 0) => (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onNavigate(item.href)}
            className="block w-full text-left truncate rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {item.label.trim()}
          </button>
          {item.subitems && item.subitems.length > 0 && renderItems(item.subitems, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold mb-3">Contents</h3>
      {toc.length > 0 ? renderItems(toc) : <p className="text-xs text-muted-foreground">Loading...</p>}
    </div>
  );
}
