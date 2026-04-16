import { notFound } from "next/navigation";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { CategoryDetail } from "@/components/home/CategoryDetail";
import type { BookMeta } from "@/types";

export const dynamic = "force-dynamic";

function slugOf(name: string) {
  return slugify(name, { lower: true, strict: true, replacement: "-" });
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const userId = session.user.id;
  const { slug } = await params;
  const decoded = slug.map(decodeURIComponent);

  let categoryName: string | null = null;
  let subcategory: string | null = null;
  let contentType: "book" | "lecture" | "podcast" | "concept" = "book";

  if (decoded.length === 1) {
    const all = await prisma.category.findMany({ select: { name: true } });
    const match = all.find((c) => slugOf(c.name) === decoded[0]);
    if (!match) notFound();
    categoryName = match.name;
    if (match.name === "Lectures") contentType = "lecture";
    else if (match.name === "Podcasts") contentType = "podcast";
    else if (match.name === "Concepts") contentType = "concept";
  } else if (decoded.length === 2) {
    const [parent, sub] = decoded;
    if (parent === "lectures") {
      categoryName = "Lectures";
      contentType = "lecture";
    } else if (parent === "podcasts") {
      categoryName = "Podcasts";
      contentType = "podcast";
    } else {
      notFound();
    }
    const subs = await prisma.book.findMany({
      where: {
        OR: [{ private: false }, { private: true, ownerId: userId }],
        category: { name: categoryName! },
        subcategory: { not: null },
      },
      select: { subcategory: true },
      distinct: ["subcategory"],
    });
    const matchSub = subs.find((s) => s.subcategory && slugOf(s.subcategory) === sub);
    if (!matchSub || !matchSub.subcategory) notFound();
    subcategory = matchSub.subcategory;
  } else {
    notFound();
  }

  const where = {
    OR: [{ private: false }, { private: true, ownerId: userId }],
    category: { name: categoryName! },
    ...(subcategory ? { subcategory } : {}),
  };

  const books = await prisma.book.findMany({
    where,
    select: {
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
      readingProgress: { where: { userId }, select: { percentage: true, updatedAt: true } },
      bookViews: { where: { userId }, select: { viewedAt: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  const projected: BookMeta[] = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    year: b.year,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    subcategory: b.subcategory,
    tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
    wordCount: b.wordCount,
    summary: b.summary,
    contentStats: b.contentStats as BookMeta["contentStats"],
    sortOrder: b.sortOrder,
    lastViewedAt: (b.bookViews[0]?.viewedAt ?? null) as unknown as string | null,
    createdAt: b.createdAt as unknown as string,
    updatedAt: b.updatedAt as unknown as string,
    // Extras consumed by BookCard
    ...({
      originalFileKey: b.originalFileKey,
      originalFileType: b.originalFileType,
      coverImageKey: b.coverImageKey,
      readingPercentage: b.readingProgress[0]?.percentage ?? null,
      lastReadAt: (b.readingProgress[0]?.updatedAt ?? null) as unknown as string | null,
    } as Record<string, unknown>),
  }));

  const displayName = subcategory ?? categoryName!;

  // Build breadcrumbs
  let tabSlug = "books";
  let tabLabel = "Books";
  if (contentType === "lecture") { tabSlug = "lectures"; tabLabel = "Lectures"; }
  else if (contentType === "podcast") { tabSlug = "podcasts"; tabLabel = "Podcasts"; }
  else if (contentType === "concept") { tabSlug = "concepts"; tabLabel = "Concepts"; }

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
    { label: tabLabel, href: tabSlug === "books" ? "/" : `/?tab=${tabSlug}` },
  ];
  if (subcategory) {
    breadcrumbs.push({ label: categoryName!, href: `/?tab=${tabSlug}` });
  }
  breadcrumbs.push({ label: displayName });

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <CategoryDetail name={displayName} count={projected.length} books={projected} />
    </AppShell>
  );
}
