import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { commentText } = body;

    if (!commentText) {
      return NextResponse.json(
        { error: "Missing required field: commentText" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { commentText },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error(`PUT /api/comments/[id] failed:`, error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/comments/[id] failed:`, error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
