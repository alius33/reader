import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const { active } = await request.json();

  const link = await prisma.shareLink.findUnique({ where: { id } });
  if (!link || link.userId !== session!.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.shareLink.update({
    where: { id },
    data: { active },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  const link = await prisma.shareLink.findUnique({ where: { id } });
  if (!link || link.userId !== session!.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.shareLink.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
