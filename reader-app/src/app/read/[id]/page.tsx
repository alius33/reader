"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import type { BookFull } from "@/types";

const EpubReader = dynamic(() => import("@/components/epub/EpubReader").then((m) => ({ default: m.EpubReader })), { ssr: false });
const PdfReader = dynamic(() => import("@/components/pdf/PdfReader").then((m) => ({ default: m.PdfReader })), { ssr: false });

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: book, isLoading } = useQuery<BookFull>({
    queryKey: ["book", id],
    queryFn: () => fetch(`/api/books/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!book?.originalFileKey) {
    router.replace(`/book/${id}`);
    return null;
  }

  const fileUrl = `/api/books/file/${encodeURIComponent(book.originalFileKey)}`;

  if (book.originalFileType === "pdf") {
    return <PdfReader url={fileUrl} title={book.title} bookId={id} onBack={() => router.push(`/book/${id}`)} />;
  }

  return <EpubReader url={fileUrl} title={book.title} bookId={id} onBack={() => router.push(`/book/${id}`)} />;
}
