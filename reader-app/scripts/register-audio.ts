/**
 * One-time script to register audio chapters for a book.
 * URLs point directly to the public R2 bucket.
 *
 * Usage:  npx tsx scripts/register-audio.ts
 */
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const R2_BASE_URL = process.env.R2_BASE_URL;
if (!R2_BASE_URL) {
  console.error("Error: R2_BASE_URL environment variable is not set.");
  process.exit(1);
}

// R2 folder path (as shown in the Cloudflare dashboard)
const R2_FOLDER = "33 Startegies - Audio";

// File names exactly as uploaded to R2
const CHAPTER_FILES = [
  "01_Chapter 1.mp3",
  "02_Chapter 2.mp3",
  "03_Chapter 3.mp3",
  "04_Chapter 4.mp3",
  "05_Chapter 5.mp3",
  "06_Chapter 6.mp3",
];

const CHAPTERS = CHAPTER_FILES.map((file, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}`,
  url: `${R2_BASE_URL}/${encodeURIComponent(R2_FOLDER)}/${encodeURIComponent(file)}`,
}));

async function main() {
  const book = await prisma.book.findFirst({
    where: { title: { contains: "33 Strategies", mode: "insensitive" } },
    select: { id: true, title: true, author: true },
  });

  if (!book) {
    console.error('Book matching "33 Strategies" not found in database.');
    process.exit(1);
  }

  console.log(`Found: "${book.title}" by ${book.author} (${book.id})`);
  console.log("Registering chapters:");
  CHAPTERS.forEach((c) => console.log(`  ${c.number}. ${c.title} → ${c.url}`));

  await prisma.book.update({
    where: { id: book.id },
    data: { audioChapters: CHAPTERS },
  });

  console.log(`\nDone — ${CHAPTERS.length} chapters registered.`);
}

main().finally(() => prisma.$disconnect());
