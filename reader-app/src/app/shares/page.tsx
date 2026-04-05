"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Copy, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareLinkData {
  id: string;
  token: string;
  active: boolean;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
  book: { title: string; author: string };
}

export default function SharesPage() {
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery<ShareLinkData[]>({
    queryKey: ["shares"],
    queryFn: () => fetch("/api/shares").then((r) => r.json()),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/shares/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shares/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares"] }),
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-bold mb-6">Shared Links</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <p className="text-muted-foreground">
            No shared links yet. Share a book from its page to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{link.book.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {link.book.author} · {link.viewCount} views ·{" "}
                    {link.active ? "Active" : "Revoked"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(link.token)}
                    className="rounded-md p-1.5 hover:bg-accent"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`/s/${link.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-1.5 hover:bg-accent"
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => toggleMutation.mutate({ id: link.id, active: !link.active })}
                    className="rounded-md p-1.5 hover:bg-accent"
                    title={link.active ? "Revoke" : "Reactivate"}
                  >
                    {link.active ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(link.id)}
                    className="rounded-md p-1.5 hover:bg-accent text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
