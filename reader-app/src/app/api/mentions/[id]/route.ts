import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_request: NextRequest, context: Ctx) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  const mention = await prisma.mention.findUnique({ where: { id } });
  if (!mention || mention.toUserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.mention.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json(updated);
}
