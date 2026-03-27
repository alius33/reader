"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { Search, BookOpen, Hash } from "lucide-react";
import type { BookMeta } from "@/types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: books = [] } = useQuery<BookMeta[]>({
    queryKey: ["books"],
    queryFn: () => fetch("/api/books").then((r) => r.json()),
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return books.slice(0, 20);
    const q = search.toLowerCase();
    return books
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [books, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="absolute left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2">
        <Command
          className="rounded-xl border border-border bg-popover shadow-2xl"
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search books..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {filtered.map((book) => (
              <Command.Item
                key={book.id}
                value={book.id}
                onSelect={() => {
                  router.push(`/book/${book.id}`);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <span className="font-medium">{book.title}</span>
                  <span className="ml-2 text-muted-foreground">
                    {book.author}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {book.categoryName}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
