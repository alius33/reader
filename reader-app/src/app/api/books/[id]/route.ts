import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const book = await prisma.book.update({
      where: { id },
      data: { lastViewedAt: new Date() },
      include: {
        category: { select: { name: true } },
        comments: { orderBy: { createdAt: "asc" } },
        crossReferences: true,
        referencedBy: true,
      },
    });

    return NextResponse.json({
      ...book,
      categoryName: book.category.name,
      category: undefined,
    });
  } catch (error) {
    console.error(`GET /api/books/[id] failed:`, error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { content, updatedAt } = body;

    if (!content || !updatedAt) {
      return NextResponse.json(
        { error: "Missing required fields: content, updatedAt" },
        { status: 400 },
      );
    }

    const existing = await prisma.book.findUnique({
      where: { id },
      select: { updatedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (existing.updatedAt.toISOString() !== updatedAt) {
      return NextResponse.json(
        {
          error: "Conflict: book was modified since you last loaded it",
          serverUpdatedAt: existing.updatedAt.toISOString(),
        },
        { status: 409 },
      );
    }

    const updated = await prisma.book.update({
      where: { id },
      data: { content },
      include: {
        category: { select: { name: true } },
        comments: { orderBy: { createdAt: "asc" } },
        crossReferences: true,
        referencedBy: true,
      },
    });

    return NextResponse.json({
      ...updated,
      categoryName: updated.category.name,
      category: undefined,
    });
  } catch (error) {
    console.error(`PUT /api/books/[id] failed:`, error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 },
    );
  }
}
