/**
 * Register audio chapters for a podcast episode from its metadata JSON sidecar.
 *
 * Usage:
 *   npx tsx scripts/register-podcast-audio.ts ../../extracted/podcasts/lex-fridman_367.json
 *   npx tsx scripts/register-podcast-audio.ts ../../extracted/podcasts/*.json   (batch)
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface ChapterMeta {
  number: number;
  title: string;
  url: string;
  start_ms?: number;
  end_ms?: number;
}

interface PodcastMeta {
  series: string;
  episode_number: number | null;
  title: string;
  host: string;
  full_episode_url: string;
  chapters: ChapterMeta[];
  transcribed_at: string;
  duration_seconds: number;
}

async function registerFromJson(jsonPath: string) {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const meta: PodcastMeta = JSON.parse(raw);

  // Build the title the same way the summary file is named: "NN - Title" or just "Title"
  const summaryTitle = meta.episode_number
    ? `${String(meta.episode_number).padStart(2, "0")} - ${meta.title}`
    : meta.title;

  // The author in the DB is the host name (set in summary frontmatter)
  const author = meta.host;

  console.log(`Looking for: "${summaryTitle}" by ${author}`);

  // Try exact match first
  let book = await prisma.book.findUnique({
    where: { title_author: { title: summaryTitle, author } },
    select: { id: true, title: true, author: true, audioChapters: true },
  });

  // Fallback: search by title contains
  if (!book) {
    book = await prisma.book.findFirst({
      where: {
        title: { contains: meta.title, mode: "insensitive" },
        category: { name: "Podcasts" },
      },
      select: { id: true, title: true, author: true, audioChapters: true },
    });
  }

  if (!book) {
    console.error(`  Book not found in database. Import the summary first via seed.ts.`);
    return false;
  }

  console.log(`  Found: "${book.title}" by ${book.author} (${book.id})`);

  // Build audioChapters array — include full episode as first "chapter" if we have chapter splits
  const chapters: { number: number; title: string; url: string }[] = [];

  if (meta.chapters.length > 0) {
    for (const ch of meta.chapters) {
      chapters.push({
        number: ch.number,
        title: ch.title,
        url: ch.url,
      });
    }
  } else {
    // No chapters — store full episode as single chapter
    chapters.push({
      number: 1,
      title: meta.title,
      url: meta.full_episode_url,
    });
  }

  console.log(`  Registering ${chapters.length} chapter(s):`);
  chapters.forEach((c) => console.log(`    ${c.number}. ${c.title}`));

  await prisma.book.update({
    where: { id: book.id },
    data: { audioChapters: chapters },
  });

  console.log(`  Done.`);
  return true;
}

async function main() {
  const jsonPaths = process.argv.slice(2);
  if (jsonPaths.length === 0) {
    console.error("Usage: npx tsx scripts/register-podcast-audio.ts <metadata.json> [...]");
    process.exit(1);
  }

  let success = 0;
  let failed = 0;

  for (const p of jsonPaths) {
    const resolved = path.resolve(p);
    if (!fs.existsSync(resolved)) {
      console.error(`File not found: ${resolved}`);
      failed++;
      continue;
    }
    console.log(`\nProcessing: ${path.basename(resolved)}`);
    const ok = await registerFromJson(resolved);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n${success} registered, ${failed} failed.`);
}

main().finally(() => prisma.$disconnect());
