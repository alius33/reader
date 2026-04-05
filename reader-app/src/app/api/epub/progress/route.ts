import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const progress = await prisma.readingProgress.findUnique({
    where: { userId_bookId: { userId: session!.user.id, bookId } },
  });

  return NextResponse.json(progress ?? { cfi: null, percentage: 0 });
}

export async function PUT(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { bookId, cfi, page, percentage } = await request.json();
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const progress = await prisma.readingProgress.upsert({
    where: { userId_bookId: { userId: session!.user.id, bookId } },
    create: { userId: session!.user.id, bookId, cfi, page, percentage: percentage ?? 0 },
    update: { cfi, page, percentage: percentage ?? 0 },
  });

  return NextResponse.json(progress);
}
