import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

const NON_BOOK_CATEGORIES = ["Lectures", "Podcasts", "Concepts", "Personal"];

type ContentType = "book" | "lecture" | "podcast" | "concept";
type Kind = "continue" | "added";

function categoryFilter(type: ContentType) {
  if (type === "book") return { category: { name: { notIn: NON_BOOK_CATEGORIES } } };
  if (type === "lecture") return { category: { name: "Lectures" } };
  if (type === "podcast") return { category: { name: "Podcasts" } };
  if (type === "concept") return { category: { name: "Concepts" } };
  return {};
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

function projectBook(
  b: {
    id: string; title: string; author: string; year: number | null; categoryId: string;
    category: { name: string }; subcategory: string | null; tags: unknown; wordCount: number | null;
    summary: string | null; contentStats: unknown; sortOrder: number | null;
    originalFileKey: string | null; originalFileType: string | null; coverImageKey: string | null;
    createdAt: Date; updatedAt: Date;
  },
  extras: { readingPercentage?: number | null; lastReadAt?: Date | null; lastViewedAt?: Date | null } = {}
) {
  return {
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
    readingPercentage: extras.readingPercentage ?? null,
    lastReadAt: extras.lastReadAt ?? null,
    lastViewedAt: extras.lastViewedAt ?? null,
  };
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session.user.id;

  const type = (request.nextUrl.searchParams.get("type") || "book") as ContentType;
  const kind = (request.nextUrl.searchParams.get("kind") || "added") as Kind;
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "8", 10), 50);

  const visibility = {
    OR: [{ private: false }, { private: true, ownerId: userId }],
  };
  const catFilter = categoryFilter(type);

  try {
    if (kind === "added") {
      const books = await prisma.book.findMany({
        where: { ...visibility, ...catFilter },
        select: {
          ...BOOK_SELECT,
          readingProgress: { where: { userId }, select: { percentage: true, updatedAt: true } },
          bookViews: { where: { userId }, select: { viewedAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const result = books.map((b) =>
        projectBook(b, {
          readingPercentage: b.readingProgress[0]?.percentage ?? null,
          lastReadAt: b.readingProgress[0]?.updatedAt ?? null,
          lastViewedAt: b.bookViews[0]?.viewedAt ?? null,
        })
      );
      return NextResponse.json(result);
    }

    if (kind === "continue") {
      // Pull all viewed books for user (filtered by category), then prioritize in-progress
      const views = await prisma.bookView.findMany({
        where: { userId, book: { ...visibility, ...catFilter } },
        orderBy: { viewedAt: "desc" },
        take: limit * 3, // Over-fetch so we can prioritize in-progress
        include: {
          book: {
            select: {
              ...BOOK_SELECT,
              readingProgress: { where: { userId }, select: { percentage: true, updatedAt: true } },
            },
          },
        },
      });

      // Score: in-progress books first, otherwise sort by viewedAt
      const scored = views.map((v) => {
        const pct = v.book.readingProgress[0]?.percentage ?? 0;
        const inProgress = pct > 0 && pct < 100;
        return { v, inProgress, pct };
      });
      scored.sort((a, b) => {
        if (a.inProgress !== b.inProgress) return a.inProgress ? -1 : 1;
        return b.v.viewedAt.getTime() - a.v.viewedAt.getTime();
      });

      const seen = new Set<string>();
      const result: ReturnType<typeof projectBook>[] = [];
      for (const { v } of scored) {
        if (seen.has(v.book.id)) continue;
        seen.add(v.book.id);
        result.push(
          projectBook(v.book, {
            readingPercentage: v.book.readingProgress[0]?.percentage ?? null,
            lastReadAt: v.book.readingProgress[0]?.updatedAt ?? null,
            lastViewedAt: v.viewedAt,
          })
        );
        if (result.length >= limit) break;
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("GET /api/books/recent failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
