import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const links = await prisma.shareLink.findMany({
    where: { userId: session!.user.id },
    include: { book: { select: { title: true, author: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { bookId } = await request.json();
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const token = randomBytes(9).toString("base64url");

  const link = await prisma.shareLink.create({
    data: {
      token,
      bookId,
      userId: session!.user.id,
    },
    include: { book: { select: { title: true, author: true } } },
  });

  return NextResponse.json(link, { status: 201 });
}
