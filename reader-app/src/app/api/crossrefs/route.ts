import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const crossRefs = await prisma.crossReference.findMany({
      where: { targetBookId: { not: null } },
      select: {
        sourceBookId: true,
        targetBookId: true,
        targetTitle: true,
        sourceBook: { select: { title: true } },
      },
    });

    const result = crossRefs.map((ref) => ({
      sourceBookId: ref.sourceBookId,
      targetBookId: ref.targetBookId,
      targetTitle: ref.targetTitle,
      sourceTitle: ref.sourceBook.title,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/crossrefs failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch cross-references" },
      { status: 500 },
    );
  }
}
