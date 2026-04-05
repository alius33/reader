import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const highlights = await prisma.epubHighlight.findMany({
    where: { userId: session!.user.id, bookId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(highlights);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { bookId, cfiRange, color, text, note } = await request.json();
  if (!bookId || !cfiRange || !text) {
    return NextResponse.json({ error: "bookId, cfiRange, text required" }, { status: 400 });
  }

  const highlight = await prisma.epubHighlight.create({
    data: { userId: session!.user.id, bookId, cfiRange, color: color ?? "#fef08a", text, note },
  });

  return NextResponse.json(highlight, { status: 201 });
}
