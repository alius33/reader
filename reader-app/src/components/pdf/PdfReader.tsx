"use client";

import { ArrowLeft } from "lucide-react";

interface PdfReaderProps {
  url: string;
  title: string;
  bookId: string;
  onBack: () => void;
}

export function PdfReader({ url, title, onBack }: PdfReaderProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 h-10 px-4 bg-card border-b border-border z-10">
        <button onClick={onBack} className="rounded-md p-1 hover:bg-accent">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 truncate text-sm font-medium">{title}</span>
      </div>
      <iframe
        src={url}
        className="flex-1 w-full border-0"
        title={title}
      />
    </div>
  );
}
