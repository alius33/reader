/**
 * Two-pass wikilink resolution.
 * Pass 1: All books are already inserted with unresolved wikilinks.
 * Pass 2: Resolve wikilink targets to book IDs + create CrossReference records.
 */

import type { PrismaClient } from "@prisma/client";
import type { TiptapDoc, TiptapNode, TiptapMark } from "@/types";

interface BookRecord {
  id: string;
  title: string;
  author: string;
}

export async function resolveWikilinks(prisma: PrismaClient) {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, author: true, content: true },
  });

  // Build lookup maps with multiple key strategies
  const bookMap = new Map<string, BookRecord>();       // "full title - author"
  const titleOnlyMap = new Map<string, BookRecord>();  // "full title"
  const shortTitleMap = new Map<string, BookRecord>(); // title before ":"
  const firstWordsMap = new Map<string, BookRecord>(); // first 1-3 significant words

  for (const book of books) {
    const key = `${book.title} - ${book.author}`;
    bookMap.set(key.toLowerCase(), book);
    titleOnlyMap.set(book.title.toLowerCase(), book);

    // Short title: everything before first colon
    const colonIdx = book.title.indexOf(":");
    if (colonIdx > 0) {
      shortTitleMap.set(book.title.slice(0, colonIdx).trim().toLowerCase(), book);
    }
  }

  let resolvedCount = 0;
  let orphanCount = 0;
  const orphanTargets: string[] = [];

  for (const book of books) {
    const doc = book.content as unknown as TiptapDoc;
    const targets = extractWikilinkTargets(doc);
    let docChanged = false;

    for (const target of targets) {
      const resolved = resolveTarget(target, bookMap, titleOnlyMap, shortTitleMap, book.id);

      // Create CrossReference
      await prisma.crossReference.upsert({
        where: {
          sourceBookId_targetTitle: {
            sourceBookId: book.id,
            targetTitle: target,
          },
        },
        update: { targetBookId: resolved?.id ?? null },
        create: {
          sourceBookId: book.id,
          targetBookId: resolved?.id ?? null,
          targetTitle: target,
        },
      });

      if (resolved) {
        resolvedCount++;
        // Update the wikilink mark in the document with the bookId
        updateWikilinkBookId(doc, target, resolved.id);
        docChanged = true;
      } else {
        orphanCount++;
        orphanTargets.push(target);
      }
    }

    if (docChanged) {
      await prisma.book.update({
        where: { id: book.id },
        data: { content: doc as any },
      });
    }
  }

  console.log(`  Wikilinks resolved: ${resolvedCount}, orphans: ${orphanCount}`);
  if (orphanTargets.length > 0) {
    const unique = [...new Set(orphanTargets)];
    console.log(`  Orphan targets (${unique.length}):`);
    for (const t of unique.slice(0, 20)) {
      console.log(`    - ${t}`);
    }
    if (unique.length > 20) {
      console.log(`    ... and ${unique.length - 20} more`);
    }
  }
}

function resolveTarget(
  target: string,
  bookMap: Map<string, BookRecord>,
  titleOnlyMap: Map<string, BookRecord>,
  shortTitleMap: Map<string, BookRecord>,
  selfId: string
): BookRecord | null {
  const lower = target.toLowerCase();

  // Exact match: "Title - Author"
  const exact = bookMap.get(lower);
  if (exact && exact.id !== selfId) return exact;

  // Title-only match
  const titleOnly = titleOnlyMap.get(lower);
  if (titleOnly && titleOnly.id !== selfId) return titleOnly;

  // Strip author suffix: "Title - Author" → try just "Title"
  const dashIdx = target.lastIndexOf(" - ");
  if (dashIdx > 0) {
    const titlePart = target.slice(0, dashIdx).toLowerCase();
    const byTitle = titleOnlyMap.get(titlePart);
    if (byTitle && byTitle.id !== selfId) return byTitle;

    // Also try short title map for the title part
    const byShort = shortTitleMap.get(titlePart);
    if (byShort && byShort.id !== selfId) return byShort;
  }

  // Try short title map directly (e.g., "Influence" → "Influence: The Psychology...")
  const byShort = shortTitleMap.get(lower);
  if (byShort && byShort.id !== selfId) return byShort;

  // Also try short title with author stripped
  if (dashIdx > 0) {
    const titlePart = target.slice(0, dashIdx).toLowerCase();
    const byShortStripped = shortTitleMap.get(titlePart);
    if (byShortStripped && byShortStripped.id !== selfId) return byShortStripped;
  }

  // Underscore format: "greene_mastery" → "Mastery"
  if (target.includes("_")) {
    const parts = target.split("_");
    const titleGuess = parts[parts.length - 1].toLowerCase();
    const byGuess = titleOnlyMap.get(titleGuess);
    if (byGuess && byGuess.id !== selfId) return byGuess;
  }

  return null;
}

function extractWikilinkTargets(doc: TiptapDoc): string[] {
  const targets: string[] = [];
  walkForWikilinks(doc.content, targets);
  return [...new Set(targets)];
}

function walkForWikilinks(
  nodes: TiptapNode[] | undefined,
  targets: string[]
) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "wikilink" && mark.attrs?.target) {
          targets.push(mark.attrs.target as string);
        }
      }
    }
    if (node.content) {
      walkForWikilinks(node.content, targets);
    }
  }
}

function updateWikilinkBookId(
  doc: TiptapDoc,
  target: string,
  bookId: string
) {
  walkAndUpdate(doc.content, target, bookId);
}

function walkAndUpdate(
  nodes: TiptapNode[] | undefined,
  target: string,
  bookId: string
) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.marks) {
      for (const mark of node.marks) {
        if (
          mark.type === "wikilink" &&
          mark.attrs?.target === target
        ) {
          mark.attrs.bookId = bookId;
        }
      }
    }
    if (node.content) {
      walkAndUpdate(node.content, target, bookId);
    }
  }
}
