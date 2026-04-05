import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";
import { processFile } from "@/lib/import/pipeline";

export async function POST(request: NextRequest) {
  // Allow import via either session auth or one-time import key
  const importKey = request.headers.get("x-import-key");
  const validKey = process.env.IMPORT_SECRET;

  let userId: string;

  if (importKey && validKey && importKey === validKey) {
    // Key-based auth — find the first user (owner)
    const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!owner) return NextResponse.json({ error: "No users found" }, { status: 500 });
    userId = owner.id;
  } else {
    const { session, error } = await requireAuth();
    if (error) return error;
    userId = session.user.id;
  }

  const { title, author, year, markdown, categoryName, subcategory, tags, isPrivate } = await request.json();

  if (!markdown || !categoryName) {
    return NextResponse.json({ error: "markdown and categoryName required" }, { status: 400 });
  }

  // Find or create category
  let category = await prisma.category.findUnique({ where: { name: categoryName } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryName, sortOrder: 99 },
    });
  }

  // Check if already exists
  const existing = await prisma.book.findFirst({ where: { title, author } });
  if (existing) {
    return NextResponse.json({ skipped: true, id: existing.id, title });
  }

  // Process markdown through the import pipeline
  const result = processFile(markdown, categoryName);

  const book = await prisma.book.create({
    data: {
      title: title || result.title,
      author: author || result.author || "Unknown",
      year: year || result.year || null,
      categoryId: category.id,
      subcategory: subcategory || null,
      tags: tags || result.tags || [],
      content: result.content as unknown as Prisma.InputJsonValue,
      plainText: result.plainText,
      originalMarkdown: markdown,
      summary: result.summary || null,
      wordCount: result.wordCount || 0,
      toc: (result.toc || null) as unknown as Prisma.InputJsonValue,
      contentStats: (result.contentStats || null) as unknown as Prisma.InputJsonValue,
      private: isPrivate ?? false,
      ownerId: isPrivate ? userId : null,
    },
  });

  return NextResponse.json({ imported: true, id: book.id, title: book.title }, { status: 201 });
}
