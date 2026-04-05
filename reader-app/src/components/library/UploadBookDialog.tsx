"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import type { BookMeta } from "@/types";

interface UploadBookDialogProps {
  books: BookMeta[];
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadBookDialog({ books, open, onClose, onUploaded }: UploadBookDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (f: File) => {
    const ext = f.name.toLowerCase();
    if (!ext.endsWith(".epub") && !ext.endsWith(".pdf")) {
      toast.error("Only EPUB and PDF files allowed");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !selectedBookId) return;
    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookId", selectedBookId);

      setProgress(30);
      const res = await fetch("/api/books/upload", { method: "POST", body: formData });
      setProgress(90);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      setProgress(100);
      toast.success("Book uploaded successfully");
      onUploaded();
      onClose();
      setFile(null);
      setSelectedBookId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload Book File</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm">Drop an EPUB or PDF here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".epub,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {/* Book selector */}
        <div className="mt-4">
          <label className="text-sm font-medium">Link to book summary</label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a book...</option>
            {books
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} - {b.author}
                </option>
              ))}
          </select>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || !selectedBookId || uploading}
          className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
