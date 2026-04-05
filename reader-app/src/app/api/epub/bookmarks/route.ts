import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const bookmarks = await prisma.epubBookmark.findMany({
    where: { userId: session!.user.id, bookId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { bookId, cfi, label } = await request.json();
  if (!bookId || !cfi) {
    return NextResponse.json({ error: "bookId and cfi required" }, { status: 400 });
  }

  const bookmark = await prisma.epubBookmark.create({
    data: { userId: session!.user.id, bookId, cfi, label },
  });

  return NextResponse.json(bookmark, { status: 201 });
}
