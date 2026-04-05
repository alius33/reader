import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const importKey = request.headers.get("x-import-key");
  const validKey = process.env.IMPORT_SECRET;

  let userId: string;

  if (importKey && validKey && importKey === validKey) {
    const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!owner) return NextResponse.json({ error: "No users found" }, { status: 500 });
    userId = owner.id;
  } else {
    const { session, error } = await requireAuth();
    if (error) return error;
    userId = session.user.id;
  }

  const { title, sourceUrl, sourceHandle, caption, transcript, summary, keyPoints, tags, topic, duration } =
    await request.json();

  if (!title || !summary) {
    return NextResponse.json({ error: "title and summary required" }, { status: 400 });
  }

  // Check for duplicate sourceUrl
  if (sourceUrl) {
    const existing = await prisma.reel.findUnique({ where: { sourceUrl } });
    if (existing) {
      return NextResponse.json({ skipped: true, id: existing.id, title: existing.title });
    }
  }

  // Build plainText for search
  const parts = [title, summary, ...(keyPoints || []), caption, transcript].filter(Boolean);
  const plainText = parts.join("\n");

  const reel = await prisma.reel.create({
    data: {
      title,
      sourceUrl: sourceUrl || null,
      sourceHandle: sourceHandle || null,
      caption: caption || null,
      transcript: transcript || null,
      plainText,
      summary,
      keyPoints: keyPoints || [],
      tags: tags || [],
      topic: topic || null,
      duration: duration || null,
      ownerId: userId,
    },
  });

  return NextResponse.json({ imported: true, id: reel.id, title: reel.title }, { status: 201 });
}
