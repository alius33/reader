import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SharedBookContent } from "@/components/shared/SharedBookContent";
import { SharedTOC } from "@/components/shared/SharedTOC";
import type { Metadata } from "next";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { book: { select: { title: true, author: true, summary: true } } },
  });
  if (!link || !link.active) return { title: "Not Found" };
  return {
    title: `${link.book.title} - ${link.book.author}`,
    description: link.book.summary ?? `Summary of ${link.book.title}`,
    openGraph: {
      title: `${link.book.title} - ${link.book.author}`,
      description: link.book.summary ?? `Summary of ${link.book.title}`,
    },
  };
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      book: {
        select: {
          title: true,
          author: true,
          year: true,
          content: true,
          toc: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!link || !link.active) notFound();
  if (link.expiresAt && link.expiresAt < new Date()) notFound();

  // Increment view count (fire-and-forget)
  prisma.shareLink.update({
    where: { id: link.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const book = link.book;
  const toc = (book.toc ?? []) as { id: string; text: string; level: number }[];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* TOC sidebar — desktop only */}
      {toc.length > 0 && (
        <aside className="hidden lg:block w-64 border-r border-border overflow-y-auto sticky top-0 h-screen">
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-3">Contents</h2>
            <SharedTOC entries={toc} />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {book.author}
            {book.year && ` (${book.year})`}
            {" · "}
            {book.category.name}
          </p>
        </header>
        <SharedBookContent content={book.content as Record<string, unknown>} />
      </main>
    </div>
  );
}
