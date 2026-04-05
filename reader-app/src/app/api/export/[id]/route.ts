import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const { id } = await context.params;

    const book = await prisma.book.findUnique({
      where: { id },
      select: { title: true, author: true, originalMarkdown: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!book.originalMarkdown) {
      return NextResponse.json(
        { error: "No markdown available for this book" },
        { status: 404 },
      );
    }

    const filename = `${book.title} - ${book.author}.md`
      .replace(/[<>:"/\\|?*]/g, "");

    return new NextResponse(book.originalMarkdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`GET /api/export/[id] failed:`, error);
    return NextResponse.json(
      { error: "Failed to export book" },
      { status: 500 },
    );
  }
}
