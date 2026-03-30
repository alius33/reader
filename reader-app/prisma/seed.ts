/**
 * Seed script: Import book summaries from the Obsidian vault into PostgreSQL.
 *
 * Usage:
 *   npx tsx prisma/seed.ts --source ../../summaries
 *   npx tsx prisma/seed.ts --source ../../summaries --file "New Book - Author.md"
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// We can't use @/ aliases in a standalone tsx script, so use relative paths
import { processFile } from "../src/lib/import/pipeline";
import { resolveWikilinks } from "../src/lib/import/resolveWikilinks";
import { extractUserMarks, reapplyUserMarks } from "../src/lib/import/preserveMarks";

const prisma = new PrismaClient();

const SKIP_FILES = new Set([
  "_index.md",
  "book list.md",
  "_overview.md",
]);

/** Recursively collect all .md files in a directory tree, tracking subcategory */
function collectMdFiles(dir: string, categoryDir: string): { filePath: string; subcategory: string | null }[] {
  const results: { filePath: string; subcategory: string | null }[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      // Files inside subdirectories get the subdirectory name as subcategory
      const subResults = collectMdFiles(fullPath, categoryDir);
      for (const r of subResults) {
        // Derive subcategory from the immediate child folder of the category dir
        if (!r.subcategory) {
          const relPath = path.relative(categoryDir, r.filePath);
          const parts = relPath.split(path.sep);
          r.subcategory = parts.length > 1 ? parts[0] : null;
        }
        results.push(r);
      }
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      !SKIP_FILES.has(entry.name.toLowerCase())
    ) {
      results.push({ filePath: fullPath, subcategory: null });
    }
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  let sourceDir = "";
  let singleFile = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source" && args[i + 1]) {
      sourceDir = args[++i];
    } else if (args[i] === "--file" && args[i + 1]) {
      singleFile = args[++i];
    }
  }

  if (!sourceDir) {
    // Default: look for summaries relative to the script location
    sourceDir = path.resolve(__dirname, "..", "..", "summaries");
  } else {
    sourceDir = path.resolve(sourceDir);
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`Importing from: ${sourceDir}`);

  // Discover category folders
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  const categories = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith(".")
  );

  console.log(`Found ${categories.length} categories`);

  // Ensure categories exist in DB
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.category.upsert({
      where: { name: categories[i].name },
      update: {},
      create: { name: categories[i].name, sortOrder: i },
    });
    categoryMap.set(categories[i].name, cat.id);
  }

  let imported = 0;
  let errors = 0;

  for (const category of categories) {
    const catDir = path.join(sourceDir, category.name);
    const files = collectMdFiles(catDir, catDir);

    if (singleFile) {
      const match = files.find((f) => path.basename(f.filePath) === singleFile);
      if (!match) continue;
      await importFile(
        match.filePath,
        category.name,
        categoryMap.get(category.name)!,
        match.subcategory
      );
      imported++;
      continue;
    }

    for (const { filePath, subcategory } of files) {
      try {
        await importFile(
          filePath,
          category.name,
          categoryMap.get(category.name)!,
          subcategory
        );
        imported++;
      } catch (err) {
        console.error(`  ERROR importing ${path.basename(filePath)}:`, err);
        errors++;
      }
    }
  }

  console.log(`\nImported ${imported} books (${errors} errors)`);

  // Pass 2: Resolve wikilinks
  console.log("\nResolving wikilinks...");
  await resolveWikilinks(prisma);

  console.log("\nDone!");
}

async function importFile(
  filePath: string,
  categoryName: string,
  categoryId: string,
  subcategory: string | null = null
) {
  const markdown = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath, ".md");

  console.log(`  Importing: ${fileName}`);

  const result = processFile(markdown, categoryName);

  // Use frontmatter title/author if available, otherwise parse from filename
  let { title, author } = result;
  if (!title || title === "Unknown") {
    const dashIdx = fileName.lastIndexOf(" - ");
    if (dashIdx > 0) {
      title = fileName.slice(0, dashIdx);
      author = fileName.slice(dashIdx + 3);
    } else {
      title = fileName;
      author = "Unknown";
    }
  }

  // Preserve user marks (highlights, comments) that exist in the current DB
  const existing = await prisma.book.findUnique({
    where: { title_author: { title, author } },
    select: { content: true },
  });
  const savedMarks = existing ? extractUserMarks(existing.content as any) : [];
  if (savedMarks.length > 0) {
    console.log(`    Preserving ${savedMarks.length} user mark(s)`);
  }

  const book = await prisma.book.upsert({
    where: { title_author: { title, author } },
    update: {
      categoryId,
      subcategory,
      tags: result.tags,
      content: result.content as any,
      plainText: result.plainText,
      originalMarkdown: result.originalMarkdown,
      summary: result.summary,
      wordCount: result.wordCount,
      toc: result.toc as any,
      contentStats: result.contentStats as any,
      year: result.year,
    },
    create: {
      title,
      author,
      year: result.year,
      categoryId,
      subcategory,
      tags: result.tags,
      content: result.content as any,
      plainText: result.plainText,
      originalMarkdown: result.originalMarkdown,
      summary: result.summary,
      wordCount: result.wordCount,
      toc: result.toc as any,
      contentStats: result.contentStats as any,
    },
  });

  // Reapply saved marks to the freshly seeded content
  if (savedMarks.length > 0) {
    const restoredContent = reapplyUserMarks(book.content as any, savedMarks);
    await prisma.book.update({
      where: { id: book.id },
      data: { content: restoredContent as any },
    });
    console.log(`    Restored ${savedMarks.length} user mark(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
