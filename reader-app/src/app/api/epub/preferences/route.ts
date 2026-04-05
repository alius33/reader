import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const prefs = await prisma.readingPreference.findUnique({
    where: { userId: session!.user.id },
  });

  return NextResponse.json(prefs ?? { fontSize: 18, fontFamily: "system", theme: "light", lineHeight: 1.6, margins: "medium" });
}

export async function PUT(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { fontSize, fontFamily, theme, lineHeight, margins } = await request.json();

  const prefs = await prisma.readingPreference.upsert({
    where: { userId: session!.user.id },
    create: { userId: session!.user.id, fontSize, fontFamily, theme, lineHeight, margins },
    update: { fontSize, fontFamily, theme, lineHeight, margins },
  });

  return NextResponse.json(prefs);
}
