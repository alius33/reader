import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { SearchResult } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json(
        { error: "Missing search query parameter: q" },
        { status: 400 },
      );
    }

    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT
        b.id,
        b.title,
        b.author,
        c.name AS "categoryName",
        ts_headline('english', b."plainText", query,
          'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
        ) AS snippet,
        ts_rank(b."searchVector", query) AS rank
      FROM "Book" b
      JOIN "Category" c ON c.id = b."categoryId",
           plainto_tsquery('english', ${q}) query
      WHERE b."searchVector" @@ query
      ORDER BY rank DESC
      LIMIT 20
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 },
    );
  }
}
