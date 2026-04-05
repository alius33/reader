import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const { id } = await context.params;

    const userId = session.user.id;

    const book = await prisma.book.findUniqueOrThrow({
      where: { id },
      include: {
        category: { select: { name: true } },
        comments: {
          where: { userId },
          orderBy: { createdAt: "asc" },
        },
        crossReferences: true,
        referencedBy: true,
      },
    });

    // Block access to private books for non-owners
    if (book.private && book.ownerId !== userId) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Also include comments where this user is mentioned
    const mentionedCommentIds = await prisma.mention.findMany({
      where: { toUserId: userId, bookId: id },
      select: { commentId: true },
    });
    const mentionIds = mentionedCommentIds.map((m) => m.commentId).filter(Boolean) as string[];

    let mentionedComments: typeof book.comments = [];
    if (mentionIds.length > 0) {
      mentionedComments = await prisma.comment.findMany({
        where: { id: { in: mentionIds }, userId: { not: userId } },
        orderBy: { createdAt: "asc" },
      });
    }

    // Record per-user view (fire-and-forget)
    prisma.bookView.upsert({
      where: { userId_bookId: { userId, bookId: id } },
      update: { viewedAt: new Date() },
      create: { userId, bookId: id },
    }).catch(() => {});

    return NextResponse.json({
      ...book,
      categoryName: book.category.name,
      category: undefined,
      comments: [
        ...book.comments.map((c) => ({ ...c, isMention: false })),
        ...mentionedComments.map((c) => ({ ...c, isMention: true })),
      ],
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
    const { error } = await requireAuth();
    if (error) return error;
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
