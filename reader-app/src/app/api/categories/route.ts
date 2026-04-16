import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

const NON_BOOK_CATEGORIES = ["Lectures", "Podcasts", "Concepts", "Personal"];

type ContentType = "book" | "lecture" | "podcast" | "concept";

function slugOf(name: string) {
  return slugify(name, { lower: true, strict: true, replacement: "-" });
}

function visibilityFilter(userId: string) {
  return {
    OR: [
      { private: false },
      { private: true, ownerId: userId },
    ],
  };
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session.user.id;

  const type = (request.nextUrl.searchParams.get("type") || "book") as ContentType;

  try {
    if (type === "book") {
      const cats = await prisma.category.findMany({
        where: { name: { notIn: NON_BOOK_CATEGORIES } },
        select: {
          id: true,
          name: true,
          sortOrder: true,
          _count: {
            select: {
              books: { where: visibilityFilter(userId) },
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      const result = cats
        .map((c) => ({
          slug: slugOf(c.name),
          name: c.name,
          count: c._count.books,
          contentType: "book" as const,
        }))
        .filter((c) => c.count > 0);

      return NextResponse.json(result);
    }

    if (type === "lecture" || type === "podcast") {
      const parentName = type === "lecture" ? "Lectures" : "Podcasts";
      const books = await prisma.book.findMany({
        where: {
          ...visibilityFilter(userId),
          category: { name: parentName },
          subcategory: { not: null },
        },
        select: { subcategory: true },
      });

      const counts = new Map<string, number>();
      for (const b of books) {
        if (!b.subcategory) continue;
        counts.set(b.subcategory, (counts.get(b.subcategory) || 0) + 1);
      }

      const parentSlug = slugOf(parentName);
      const result = Array.from(counts.entries())
        .map(([sub, count]) => ({
          slug: `${parentSlug}/${slugOf(sub)}`,
          name: sub,
          count,
          contentType: type,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json(result);
    }

    if (type === "concept") {
      // Concepts tab renders flat (no subcategory cards) — return empty
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
