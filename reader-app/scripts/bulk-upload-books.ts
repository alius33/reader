/**
 * Bulk upload book files (epub/pdf) from Calibre library + inbox to R2,
 * then update the Railway database with file keys.
 *
 * Usage:
 *   cd reader-app && npx dotenv-cli -e .env -- tsx scripts/bulk-upload-books.ts --dry-run
 *   cd reader-app && npx dotenv-cli -e .env -- tsx scripts/bulk-upload-books.ts
 */

import { PrismaClient } from "@prisma/client";
import { AwsClient } from "aws4fetch";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CALIBRE_LIBRARY = "C:/Users/maila/Documents/Calibre Library";
const INBOX_DIR = "C:/Users/maila/music/reader/inbox";
const EBOOK_CONVERT = "C:/Program Files/Calibre2/ebook-convert.exe";
const TEMP_DIR = "C:/Users/maila/music/reader/scripts/.converted";
const DRY_RUN = process.argv.includes("--dry-run");

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "in", "and", "to", "for", "on", "at", "is",
  "how", "why", "what", "who", "my", "its", "with", "from", "by", "your",
  "that", "this", "don't", "dont", "not", "do", "it", "s",
]);

// ---------------------------------------------------------------------------
// R2 client
// ---------------------------------------------------------------------------

const r2 = new AwsClient({
  accessKeyId: process.env.R2_BOOKS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_BOOKS_SECRET_ACCESS_KEY!,
});
const R2_ENDPOINT = process.env.R2_BOOKS_ENDPOINT!;
const R2_BUCKET = process.env.R2_BOOKS_BUCKET!;

function r2Url(key: string) {
  return `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;
}

async function uploadToR2(key: string, body: Uint8Array, contentType: string) {
  const res = await r2.fetch(r2Url(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  return key;
}

// ---------------------------------------------------------------------------
// DB client
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "")       // strip smart quotes
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantWords(s: string, n = 4): string[] {
  const words = normalize(s).split(" ").filter(w => !STOP_WORDS.has(w) && w.length > 1);
  return words.slice(0, n);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// File index
// ---------------------------------------------------------------------------

interface FileEntry {
  filePath: string;
  format: "epub" | "pdf" | "mobi";
  coverPath: string | null;  // Calibre's pre-extracted cover.jpg
  authorFolder: string;      // e.g. "Robert Greene"
  titleFolder: string;       // e.g. "The 33 Strategies Of War" (stripped of ID)
}

function buildFileIndex(): FileEntry[] {
  const entries: FileEntry[] = [];

  // --- Calibre library ---
  if (fs.existsSync(CALIBRE_LIBRARY)) {
    for (const authorDir of fs.readdirSync(CALIBRE_LIBRARY, { withFileTypes: true })) {
      if (!authorDir.isDirectory()) continue;
      const authorPath = path.join(CALIBRE_LIBRARY, authorDir.name);

      for (const bookDir of fs.readdirSync(authorPath, { withFileTypes: true })) {
        if (!bookDir.isDirectory()) continue;
        const bookPath = path.join(authorPath, bookDir.name);

        // Strip Calibre ID from folder name: "Title (1736)" → "Title"
        const titleFolder = bookDir.name.replace(/\s*\(\d+\)\s*$/, "").trim();

        // Find best format file
        const files = fs.readdirSync(bookPath);
        const coverPath = files.find(f => f.toLowerCase() === "cover.jpg")
          ? path.join(bookPath, "cover.jpg")
          : null;

        let bestFile: string | null = null;
        let bestFormat: "epub" | "pdf" | "mobi" | null = null;

        for (const f of files) {
          const lower = f.toLowerCase();
          if (lower.endsWith(".epub") && bestFormat !== "epub") {
            bestFile = f; bestFormat = "epub";
          } else if (lower.endsWith(".pdf") && bestFormat !== "epub") {
            bestFile = f; bestFormat = "pdf";
          } else if (lower.endsWith(".mobi") && !bestFormat) {
            bestFile = f; bestFormat = "mobi";
          }
        }

        if (bestFile && bestFormat) {
          entries.push({
            filePath: path.join(bookPath, bestFile),
            format: bestFormat,
            coverPath,
            authorFolder: authorDir.name,
            titleFolder,
          });
        }
      }
    }
  }

  // --- Inbox ---
  if (fs.existsSync(INBOX_DIR)) {
    for (const f of fs.readdirSync(INBOX_DIR)) {
      const lower = f.toLowerCase();
      const fullPath = path.join(INBOX_DIR, f);
      if (!fs.statSync(fullPath).isFile()) continue;

      let format: "epub" | "pdf" | "mobi" | null = null;
      if (lower.endsWith(".epub")) format = "epub";
      else if (lower.endsWith(".pdf")) format = "pdf";
      else if (lower.endsWith(".mobi")) format = "mobi";
      if (!format) continue;

      const baseName = f.replace(/\.(epub|pdf|mobi)$/i, "");
      let titlePart = "";
      let authorPart = "";

      // Clean "Title - Author" format (e.g. "Foundation - Peter Ackroyd")
      const dashMatch = baseName.match(/^(.+?)\s+-\s+(.+)$/);
      // Anna's Archive format: "Title_ Subtitle -- Author -- Year -- ..."
      const annaMatch = baseName.match(/^(.+?)\s+--\s+(.+?)(?:\s+--\s+|$)/);

      if (dashMatch && !baseName.includes("--")) {
        titlePart = dashMatch[1].replace(/_/g, " ").trim();
        authorPart = dashMatch[2].replace(/_/g, " ").trim();
      } else if (annaMatch) {
        titlePart = annaMatch[1].replace(/_/g, " ").trim();
        authorPart = annaMatch[2].replace(/_/g, " ").trim();
      } else {
        titlePart = baseName.replace(/_/g, " ").trim();
      }

      entries.push({
        filePath: fullPath,
        format,
        coverPath: null,
        authorFolder: authorPart,
        titleFolder: titlePart,
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** Extract volume/edition number from title if present */
function extractVolumeNumber(title: string): string | null {
  const m = normalize(title).match(/\b(?:vol|volume|book|part)\s*(\d+)\b/);
  return m ? m[1] : null;
}

/** Get all author last names (handles "Author1 & Author2", "Author1 with Author2") */
function authorLastNames(author: string): string[] {
  return author
    .split(/\s*(?:[&,]|\bwith\b)\s*/)
    .map(a => normalize(a).split(" ").pop() || "")
    .filter(n => n.length > 2);
}

function matchBookToFile(
  dbTitle: string,
  dbAuthor: string,
  index: FileEntry[]
): FileEntry | null {
  // Use main title (before colon/subtitle) for primary matching, full title as fallback
  const mainTitle = dbTitle.split(/[:—–]/)[0].trim();
  const mainTitleWords = significantWords(mainTitle);
  const fullTitleWords = significantWords(dbTitle);
  // Use whichever is shorter (main title words) for threshold calculation
  const titleWords = mainTitleWords.length > 0 ? mainTitleWords : fullTitleWords;
  const lastNames = authorLastNames(dbAuthor);
  const volumeNum = extractVolumeNumber(dbTitle);

  // Skip chapter titles (Ch 01, Ch 02, etc.) — these are personal writing, not books
  if (/^Ch \d+/.test(dbTitle)) return null;

  // Guard: if title has a volume number, candidate must contain the same number
  function volumeOk(entryTitle: string): boolean {
    if (!volumeNum) return true;
    return normalize(entryTitle).includes(volumeNum);
  }

  // Check if any author last name matches
  function authorMatch(entryAuthor: string, entryTitle: string): boolean {
    if (lastNames.length === 0) return false;
    const combined = normalize(entryAuthor) + " " + normalize(entryTitle);
    return lastNames.some(n => combined.includes(n));
  }

  // Score-based: find the best match across all candidates
  let bestEntry: FileEntry | null = null;
  let bestScore = 0;

  for (const entry of index) {
    if (!volumeOk(entry.titleFolder)) continue;

    const normTitle = normalize(entry.titleFolder);
    const hasAuthor = authorMatch(entry.authorFolder, entry.titleFolder);
    // Count title word hits with prefix matching (handles Calibre's truncated folder names)
    const normTitleWords = normTitle.split(" ");
    const titleHits = titleWords.filter(w =>
      normTitle.includes(w) ||
      normTitleWords.some(tw => tw.length >= 5 && (w.startsWith(tw) || tw.startsWith(w)))
    ).length;
    const firstWordMatch = titleWords.length > 0 && normTitle.includes(titleWords[0]);

    let score = 0;

    // Minimum title hits needed: at least 60% of words, minimum 2 (or 1 if only 1 word)
    const minTitleHits = titleWords.length <= 1 ? 1 : Math.max(2, Math.ceil(titleWords.length * 0.6));

    // Strategy 1: Author + strong title match
    if (hasAuthor && firstWordMatch && titleHits >= minTitleHits) {
      score = titleHits * 2 + 10; // author bonus
    }

    // Strategy 2: Title-only match (3+ significant words ALL match, no author needed)
    if (titleWords.length >= 3 && titleHits >= 3) {
      score = Math.max(score, titleHits * 2);
    }

    // Strategy 3: Author + first title word (1-word titles, or strong single-word match)
    if (hasAuthor && firstWordMatch && titleWords.length <= 2 && titleHits >= titleWords.length) {
      score = Math.max(score, titleHits * 2 + 5);
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Minimum threshold: at least first word + author, or 4 title words
  return bestScore >= 5 ? bestEntry : null;
}

// ---------------------------------------------------------------------------
// Mobi → Epub conversion
// ---------------------------------------------------------------------------

function convertMobiToEpub(mobiPath: string): string {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  const outName = path.basename(mobiPath).replace(/\.mobi$/i, ".epub");
  const outPath = path.join(TEMP_DIR, outName);

  if (fs.existsSync(outPath)) return outPath; // already converted

  console.log(`  Converting mobi → epub: ${path.basename(mobiPath)}`);
  execSync(`"${EBOOK_CONVERT}" "${mobiPath}" "${outPath}"`, {
    stdio: "pipe",
    timeout: 120_000,
  });

  if (!fs.existsSync(outPath)) throw new Error(`Conversion failed: ${mobiPath}`);
  return outPath;
}

// ---------------------------------------------------------------------------
// Cover extraction from epub (fallback when Calibre cover.jpg not available)
// ---------------------------------------------------------------------------

async function extractCoverFromEpub(buffer: Uint8Array): Promise<{ data: Uint8Array; type: string } | null> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  const coverPatterns = [
    /cover\.(jpg|jpeg|png)/i,
    /images\/cover/i,
    /OEBPS\/images\/cover/i,
    /OEBPS\/cover/i,
  ];

  for (const pattern of coverPatterns) {
    for (const [zipPath, zipEntry] of Object.entries(zip.files)) {
      if (pattern.test(zipPath) && !zipEntry.dir) {
        const data = new Uint8Array(await zipEntry.async("arraybuffer"));
        const type = zipPath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        return { data, type };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== UPLOADING ===");

  // --- Validate connections ---
  console.log("\n1. Validating connections...");
  try {
    const count = await prisma.book.count();
    console.log(`   DB: OK (${count} books total)`);
  } catch (e) {
    console.error("   DB connection failed:", e);
    process.exit(1);
  }

  if (!DRY_RUN) {
    try {
      const res = await r2.fetch(r2Url("_health-check"), { method: "HEAD" });
      // 404 is fine (object doesn't exist), anything else that's not a network error is OK
      console.log(`   R2: OK (status ${res.status})`);
    } catch (e) {
      console.error("   R2 connection failed:", e);
      process.exit(1);
    }
  }

  // --- Query books without files ---
  console.log("\n2. Querying books without original files...");
  const books = await prisma.book.findMany({
    where: { originalFileKey: null },
    select: { id: true, title: true, author: true },
  });
  console.log(`   Found ${books.length} books without files`);

  // --- Build file index ---
  console.log("\n3. Building file index...");
  const fileIndex = buildFileIndex();
  console.log(`   Indexed ${fileIndex.length} files (Calibre + inbox)`);

  // --- Match and process ---
  console.log("\n4. Matching and uploading...\n");
  let uploaded = 0, converted = 0, skipped = 0, failed = 0;
  const failures: { title: string; error: string }[] = [];
  const matches: { title: string; file: string; format: string }[] = [];

  for (const book of books) {
    const match = matchBookToFile(book.title, book.author, fileIndex);

    if (!match) {
      skipped++;
      continue;
    }

    matches.push({
      title: `${book.title} - ${book.author}`,
      file: path.basename(match.filePath),
      format: match.format,
    });

    if (DRY_RUN) {
      console.log(`  ✓ ${book.title} → ${path.basename(match.filePath)} [${match.format}]`);
      uploaded++;
      continue;
    }

    try {
      // Convert mobi if needed
      let filePath = match.filePath;
      let format: "epub" | "pdf" = match.format === "mobi" ? "epub" : match.format as "epub" | "pdf";

      if (match.format === "mobi") {
        filePath = convertMobiToEpub(match.filePath);
        converted++;
      }

      // Read file
      const fileBuffer = new Uint8Array(fs.readFileSync(filePath));
      const ext = format;
      const slug = slugify(book.title);
      const fileKey = `books/${book.id}/${slug}.${ext}`;
      const contentType = ext === "epub" ? "application/epub+zip" : "application/pdf";

      // Upload file to R2
      console.log(`  ↑ ${book.title} (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB) → ${fileKey}`);
      await uploadToR2(fileKey, fileBuffer, contentType);

      // Upload cover
      let coverKey: string | null = null;
      if (match.coverPath && fs.existsSync(match.coverPath)) {
        // Use Calibre's pre-extracted cover
        const coverBuffer = new Uint8Array(fs.readFileSync(match.coverPath));
        coverKey = `covers/${book.id}.jpg`;
        await uploadToR2(coverKey, coverBuffer, "image/jpeg");
      } else if (ext === "epub") {
        // Extract from epub
        try {
          const cover = await extractCoverFromEpub(fileBuffer);
          if (cover) {
            coverKey = `covers/${book.id}.jpg`;
            await uploadToR2(coverKey, cover.data, cover.type);
          }
        } catch { /* skip cover */ }
      }

      // Update DB
      await prisma.book.update({
        where: { id: book.id },
        data: {
          originalFileKey: fileKey,
          originalFileType: format,
          ...(coverKey ? { coverImageKey: coverKey } : {}),
        },
      });

      uploaded++;
      console.log(`    ✓ done${coverKey ? " + cover" : ""}`);
    } catch (e: any) {
      failed++;
      failures.push({ title: book.title, error: e.message || String(e) });
      console.error(`    ✗ FAILED: ${e.message || e}`);
    }
  }

  // --- Cleanup temp files ---
  if (!DRY_RUN && fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log("\n5. Cleaned up temp conversions");
  }

  // --- Report ---
  console.log("\n" + "=".repeat(60));
  console.log(`RESULTS${DRY_RUN ? " (DRY RUN)" : ""}:`);
  console.log(`  Uploaded:  ${uploaded}`);
  console.log(`  Converted: ${converted} (mobi → epub)`);
  console.log(`  Skipped:   ${skipped} (no file found)`);
  console.log(`  Failed:    ${failed}`);
  console.log("=".repeat(60));

  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(`  - ${f.title}: ${f.error}`);
    }
  }

  if (DRY_RUN && skipped > 0) {
    console.log("\nSkipped (no file match):");
    const skippedBooks = books.filter(b => !matchBookToFile(b.title, b.author, fileIndex));
    for (const b of skippedBooks) {
      console.log(`  - ${b.title} - ${b.author}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Fatal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
