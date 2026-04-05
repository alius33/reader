import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const mentions = await prisma.mention.findMany({
    where: { toUserId: session.user.id, read: false },
    include: {
      fromUser: { select: { name: true, image: true } },
      book: { select: { id: true, title: true } },
      comment: { select: { selectedText: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(mentions);
}
