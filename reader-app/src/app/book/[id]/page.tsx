"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Pencil, BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { CommentsPanel } from "@/components/layout/CommentsPanel";
import { useStore } from "@/lib/store";
import type { BookFull, TiptapDoc } from "@/types";

const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => ({ default: m.Editor })),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

export default function BookPage() {
  const params = useParams();
  const id = params.id as string;
  const setActiveBookId = useStore((s) => s.setActiveBookId);
  const toggleCommentsPanel = useStore((s) => s.toggleCommentsPanel);
  const commentsPanelOpen = useStore((s) => s.commentsPanelOpen);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"read" | "edit">("read");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedAt = useRef<string>("");

  const { data: book, isLoading, error } = useQuery<BookFull>({
    queryKey: ["book", id],
    queryFn: () =>
      fetch(`/api/books/${id}`).then((r) => {
        if (!r.ok) throw new Error("Book not found");
        return r.json();
      }),
    enabled: !!id,
  });

  useEffect(() => {
    if (book) lastUpdatedAt.current = book.updatedAt;
  }, [book]);

  useEffect(() => {
    if (id) setActiveBookId(id);
    return () => setActiveBookId(null);
  }, [id, setActiveBookId]);

  const saveMutation = useMutation({
    mutationFn: async (content: TiptapDoc) => {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          updatedAt: lastUpdatedAt.current,
        }),
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error("conflict");
        throw new Error("Save failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      lastUpdatedAt.current = data.updatedAt;
      setSaveStatus("saved");
    },
    onError: (err) => {
      if (err.message === "conflict") {
        alert("This book was modified in another tab. Please reload the page.");
      }
      setSaveStatus("unsaved");
    },
  });

  const saveMutateRef = useRef(saveMutation.mutate);
  saveMutateRef.current = saveMutation.mutate;

  const handleUpdate = useCallback(
    (doc: TiptapDoc) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus("saving");
        saveMutateRef.current(doc);
      }, 2000);
    },
    []
  );

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus]);

  const handleComment = useCallback(
    async (markId: string, selectedText: string) => {
      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: id,
            markId,
            selectedText,
            commentText: "(new comment)",
          }),
        });
        if (!res.ok) {
          console.error("Failed to create comment:", res.status);
          return;
        }
        // Refresh the book data to show the new comment
        queryClient.invalidateQueries({ queryKey: ["book", id] });
        // Open the comments panel if it isn't already open
        if (!commentsPanelOpen) {
          toggleCommentsPanel();
        }
      } catch (err) {
        console.error("Failed to create comment:", err);
      }
    },
    [id, queryClient, commentsPanelOpen, toggleCommentsPanel]
  );

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl p-8">
          <div className="mb-6 h-10 w-96 animate-pulse rounded bg-muted" />
          <EditorSkeleton />
        </div>
      </AppShell>
    );
  }

  if (error || !book) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-destructive">
            Book not found
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Book header */}
          <div className="border-b border-border px-4 py-3 sm:px-8 sm:py-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">{book.title}</h1>
                  <p className="mt-1 text-muted-foreground">
                    {book.author}
                    {book.year && ` (${book.year})`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {mode === "edit" && (
                    <span className="text-xs text-muted-foreground">
                      {saveStatus === "saved" && "Saved"}
                      {saveStatus === "saving" && "Saving..."}
                      {saveStatus === "unsaved" && "Unsaved changes"}
                    </span>
                  )}
                  <button
                    onClick={() => setMode(mode === "read" ? "edit" : "read")}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    title={mode === "read" ? "Switch to edit mode" : "Switch to read mode"}
                  >
                    {mode === "read" ? (
                      <>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-3.5 w-3.5" />
                        Reading
                      </>
                    )}
                  </button>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
                    {book.categoryName}
                  </span>
                </div>
              </div>
              {(book.tags ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(book.tags ?? []).slice(0, 8).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="mx-auto max-w-4xl">
            <Editor
              content={book.content}
              onUpdate={handleUpdate}
              mode={mode}
              onComment={handleComment}
            />
          </div>
        </div>

        {/* TOC sidebar */}
        {book.toc && book.toc.length > 0 && (
          <TableOfContents entries={book.toc} />
        )}

        {/* Comments panel */}
        <CommentsPanel bookId={book.id} comments={book.comments || []} />
      </div>
    </AppShell>
  );
}

const SKELETON_WIDTHS = [72, 95, 58, 88, 63, 91, 77, 54, 86, 69, 93, 60, 82, 74, 97];

function EditorSkeleton() {
  return (
    <div className="space-y-4 p-8">
      {SKELETON_WIDTHS.map((w, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-muted"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}
