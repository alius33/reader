"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Pencil, Trash2, ChevronRight } from "lucide-react";
import type { CommentData } from "@/types";

interface CommentsPanelProps {
  bookId: string;
  comments: CommentData[];
}

export function CommentsPanel({ bookId, comments }: CommentsPanelProps) {
  const commentsPanelOpen = useStore((s) => s.commentsPanelOpen);
  const toggleCommentsPanel = useStore((s) => s.toggleCommentsPanel);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const updateMutation = useMutation({
    mutationFn: async ({ id, commentText }: { id: string; commentText: string }) => {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    },
  });

  if (!commentsPanelOpen) {
    return (
      <button
        onClick={toggleCommentsPanel}
        className="flex w-10 flex-col items-center border-l border-border bg-card pt-3"
        title="Open comments"
      >
        <MessageSquare className="h-4 w-4" />
        {comments.length > 0 && (
          <span className="mt-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
            {comments.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="flex w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">
          Comments ({comments.length})
        </h2>
        <button
          onClick={toggleCommentsPanel}
          className="rounded-md p-1 hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Select text and click Comment</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <div key={comment.id} className="px-4 py-3">
                {/* Selected text */}
                <div className="mb-2 rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                  "{comment.selectedText.slice(0, 100)}
                  {comment.selectedText.length > 100 ? "..." : ""}"
                </div>

                {/* Comment body */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            id: comment.id,
                            commentText: editText,
                          })
                        }
                        className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded px-2 py-1 text-xs hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.commentText}</p>
                )}

                {/* Actions */}
                {editingId !== comment.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditText(comment.commentText);
                        }}
                        className="rounded p-1 hover:bg-accent"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this comment?")) {
                            deleteMutation.mutate(comment.id);
                          }
                        }}
                        className="rounded p-1 hover:bg-accent text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
