import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return NextResponse.json([], { status: 200 });

    const userId = session.user.id;

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { private: false },
          { private: true, ownerId: userId },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        year: true,
        categoryId: true,
        category: { select: { name: true } },
        subcategory: true,
        tags: true,
        wordCount: true,
        summary: true,
        contentStats: true,
        sortOrder: true,
        originalFileKey: true,
        originalFileType: true,
        coverImageKey: true,
        createdAt: true,
        updatedAt: true,
        readingProgress: {
          where: { userId },
          select: { percentage: true, updatedAt: true },
        },
        bookViews: {
          where: { userId },
          select: { viewedAt: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    const result = books.map((b) => ({
      ...b,
      categoryName: b.category.name,
      category: undefined,
      readingPercentage: (b.readingProgress as { percentage: number; updatedAt: Date }[])?.[0]?.percentage ?? null,
      lastReadAt: (b.readingProgress as { percentage: number; updatedAt: Date }[])?.[0]?.updatedAt ?? null,
      lastViewedAt: (b.bookViews as { viewedAt: Date }[])?.[0]?.viewedAt ?? null,
      readingProgress: undefined,
      bookViews: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/books failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}
