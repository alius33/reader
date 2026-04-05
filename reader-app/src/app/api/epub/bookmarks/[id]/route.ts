import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  const bookmark = await prisma.epubBookmark.findUnique({ where: { id } });
  if (!bookmark || bookmark.userId !== session!.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.epubBookmark.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
