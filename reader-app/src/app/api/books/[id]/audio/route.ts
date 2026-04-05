import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const { id } = await context.params;
    const { chapters } = await request.json();

    if (!Array.isArray(chapters)) {
      return NextResponse.json({ error: "chapters must be an array" }, { status: 400 });
    }

    const updated = await prisma.book.update({
      where: { id },
      data: { audioChapters: chapters },
      select: { id: true, audioChapters: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/books/[id]/audio failed:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update audio chapters" }, { status: 500 });
  }
}
