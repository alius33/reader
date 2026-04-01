import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
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
        lastViewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { title: "asc" },
    });

    const result = books.map((b) => ({
      ...b,
      categoryName: b.category.name,
      category: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/books failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 },
    );
  }
}
