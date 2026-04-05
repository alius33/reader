import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session.user.id;
  const topic = request.nextUrl.searchParams.get("topic");
  const search = request.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = { ownerId: userId };
  if (topic) where.topic = topic;
  if (search) where.plainText = { contains: search, mode: "insensitive" };

  const reels = await prisma.reel.findMany({
    where,
    select: {
      id: true,
      title: true,
      sourceUrl: true,
      sourceHandle: true,
      summary: true,
      keyPoints: true,
      tags: true,
      topic: true,
      duration: true,
      slideCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reels);
}
