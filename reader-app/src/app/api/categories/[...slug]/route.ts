import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

const NON_BOOK_CATEGORIES = ["Lectures", "Podcasts", "Concepts", "Personal"];

function slugOf(name: string) {
  return slugify(name, { lower: true, strict: true, replacement: "-" });
}

function visibility(userId: string) {
  return { OR: [{ private: false }, { private: true, ownerId: userId }] };
}

const BOOK_SELECT = {
  id: true,
  title: true,
  author: true,
  year: true,
  categoryId: true,
  category: { select: { name: true } },
  subcategory: true,
  tags: true,
  wordCount: true,
  summary: true,
  contentStats: true,
  sortOrder: true,
  originalFileKey: true,
  originalFileType: true,
  coverImageKey: true,
  createdAt: true,
  updatedAt: true,
} as const;

type Ctx = { params: Promise<{ slug: string[] }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session.user.id;

  const { slug: slugParts } = await context.params;
  const decoded = slugParts.map(decodeURIComponent);

  try {
    let categoryName: string | null = null;
    let subcategory: string | null = null;
    let contentType: "book" | "lecture" | "podcast" | "concept" = "book";

    if (decoded.length === 1) {
      // Top-level category — find by slugifying all categories
      const all = await prisma.category.findMany({ select: { name: true } });
      const match = all.find((c) => slugOf(c.name) === decoded[0]);
      if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
      categoryName = match.name;
      if (match.name === "Lectures") contentType = "lecture";
      else if (match.name === "Podcasts") contentType = "podcast";
      else if (match.name === "Concepts") contentType = "concept";
    } else if (decoded.length === 2) {
      // Subcategory under lectures/podcasts
      const parent = decoded[0];
      const sub = decoded[1];
      if (parent === "lectures") {
        categoryName = "Lectures";
        contentType = "lecture";
      } else if (parent === "podcasts") {
        categoryName = "Podcasts";
        contentType = "podcast";
      } else {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      // Resolve subcategory by slug
      const subs = await prisma.book.findMany({
        where: { ...visibility(userId), category: { name: categoryName }, subcategory: { not: null } },
        select: { subcategory: true },
        distinct: ["subcategory"],
      });
      const matchSub = subs.find((s) => s.subcategory && slugOf(s.subcategory) === sub);
      if (!matchSub) return NextResponse.json({ error: "Not found" }, { status: 404 });
      subcategory = matchSub.subcategory;
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const where = {
      ...visibility(userId),
      category: { name: categoryName! },
      ...(subcategory ? { subcategory } : {}),
      // For Lectures/Podcasts: when no subcategory specified, show all under that parent
    };

    const books = await prisma.book.findMany({
      where,
      select: {
        ...BOOK_SELECT,
        readingProgress: { where: { userId }, select: { percentage: true, updatedAt: true } },
        bookViews: { where: { userId }, select: { viewedAt: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    const result = books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      year: b.year,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      subcategory: b.subcategory,
      tags: b.tags,
      wordCount: b.wordCount,
      summary: b.summary,
      contentStats: b.contentStats,
      sortOrder: b.sortOrder,
      originalFileKey: b.originalFileKey,
      originalFileType: b.originalFileType,
      coverImageKey: b.coverImageKey,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      readingPercentage: b.readingProgress[0]?.percentage ?? null,
      lastReadAt: b.readingProgress[0]?.updatedAt ?? null,
      lastViewedAt: b.bookViews[0]?.viewedAt ?? null,
    }));

    const displayName = subcategory ?? categoryName!;
    const slugStr = subcategory
      ? `${slugOf(categoryName!)}/${slugOf(subcategory)}`
      : slugOf(categoryName!);

    // mark NON_BOOK_CATEGORIES referenced for clarity (not used in payload now)
    void NON_BOOK_CATEGORIES;

    return NextResponse.json({
      category: {
        slug: slugStr,
        name: displayName,
        parentName: subcategory ? categoryName : null,
        contentType,
        count: result.length,
      },
      books: result,
    });
  } catch (err) {
    console.error("GET /api/categories/[...slug] failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
