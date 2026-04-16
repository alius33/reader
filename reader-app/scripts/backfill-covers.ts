/**
 * backfill-covers.ts — Fetch book covers from Google Books / Open Library and store on R2.
 *
 * Iterates books missing a cover, queries Google Books first (then Open Library as fallback),
 * scores the match by title similarity + author overlap, downloads the JPEG, optionally re-encodes
 * via sharp, uploads to R2 as `covers/<bookId>.jpg`, updates `Book.coverImageKey`.
 *
 * Skips Lectures, Podcasts, Concepts, Personal categories. Skips books with author = "Unknown".
 *
 * Usage:
 *   cd reader-app
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts --dry-run
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts --category "Power & Strategy"
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts --book-id <id> --image-url <url>
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts --review-only
 *   railway run --service Postgres npx tsx scripts/backfill-covers.ts --force
 *
 * Flags:
 *   --dry-run             Log matches without uploading to R2 or updating DB
 *   --category <name>     Restrict to one category
 *   --book-id <id>        Process only this book
 *   --image-url <url>     With --book-id: upload that URL as the cover (manual override)
 *   --review-only         Re-process the JSONL log, print only matches with confidence < 0.95
 *   --force               Overwrite existing coverImageKey
 *
 * Output log: scripts/.cover-backfill-results.jsonl (one JSON object per book attempted)
 */

import { PrismaClient } from "@prisma/client";
import { AwsClient } from "aws4fetch";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const SKIP_CATEGORIES = new Set(["Lectures", "Podcasts", "Concepts", "Personal"]);
const RESULTS_LOG = path.resolve(process.cwd(), "scripts", ".cover-backfill-results.jsonl");
const REQUEST_DELAY_MS = 250;
const MIN_CONFIDENCE = 0.85;

interface CliOpts {
  dryRun: boolean;
  category: string | null;
  bookId: string | null;
  imageUrl: string | null;
  reviewOnly: boolean;
  force: boolean;
}

interface Match {
  url: string;
  matchedTitle: string;
  matchedAuthor: string;
  source: "google" | "openlibrary" | "manual";
  confidence: number;
}

interface ResultRecord {
  bookId: string;
  title: string;
  author: string;
  category: string;
  source: string | null;
  matchedTitle: string | null;
  matchedAuthor: string | null;
  confidence: number;
  accepted: boolean;
  reason?: string;
  coverKey?: string;
  timestamp: string;
}

function parseArgs(argv: string[]): CliOpts {
  const args = argv.slice(2);
  const out: CliOpts = {
    dryRun: false,
    category: null,
    bookId: null,
    imageUrl: null,
    reviewOnly: false,
    force: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--category" && args[i + 1]) out.category = args[++i];
    else if (a === "--book-id" && args[i + 1]) out.bookId = args[++i];
    else if (a === "--image-url" && args[i + 1]) out.imageUrl = args[++i];
    else if (a === "--review-only") out.reviewOnly = true;
    else if (a === "--force") out.force = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: railway run --service Postgres npx tsx scripts/backfill-covers.ts [--dry-run] [--category <name>] [--book-id <id> --image-url <url>] [--review-only] [--force]"
      );
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

// ---------- Matching helpers ----------

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\b(the|a|an|of|and|in|on|at|to|for)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinRatio(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

function authorSurname(author: string): string {
  const cleaned = author.replace(/\b(Jr\.?|Sr\.?|III|II|IV|PhD|MD)\b/gi, "").trim();
  const parts = cleaned.split(/\s+/);
  return (parts[parts.length - 1] || "").toLowerCase();
}

function authorMatch(input: string, candidates: string[]): boolean {
  const inputSurname = authorSurname(input);
  if (!inputSurname) return false;
  const inputTokens = new Set(input.toLowerCase().split(/\s+/));
  for (const c of candidates) {
    if (!c) continue;
    const cLower = c.toLowerCase();
    if (cLower.includes(inputSurname)) return true;
    const cTokens = c.toLowerCase().split(/\s+/);
    if (cTokens.some((t) => inputTokens.has(t))) return true;
  }
  return false;
}

function scoreMatch(
  inputTitle: string,
  inputAuthor: string,
  candidateTitle: string,
  candidateAuthors: string[]
): number {
  const titleScore = levenshteinRatio(normalizeTitle(inputTitle), normalizeTitle(candidateTitle));
  const authorOk = inputAuthor && inputAuthor !== "Unknown"
    ? authorMatch(inputAuthor, candidateAuthors) ? 1 : 0
    : 1; // No author to verify against — accept on title alone
  // Title weight 0.8, author 0.2 — title misses are fatal, author confirms
  return titleScore * 0.8 + authorOk * 0.2;
}

// ---------- Cover sources ----------

async function fetchGoogleBooks(title: string, author: string): Promise<Match | null> {
  const titleQ = `intitle:${JSON.stringify(title)}`;
  const authorQ = author && author !== "Unknown" ? `+inauthor:${JSON.stringify(author)}` : "";
  const q = encodeURIComponent(`${titleQ}${authorQ}`);
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5&printType=books${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as {
      items?: Array<{
        volumeInfo: {
          title?: string;
          authors?: string[];
          imageLinks?: { thumbnail?: string; small?: string; medium?: string; large?: string; smallThumbnail?: string };
        };
      }>;
    };
    if (!data.items || data.items.length === 0) return null;

    let best: Match | null = null;
    for (const item of data.items) {
      const v = item.volumeInfo;
      const link = v.imageLinks?.large || v.imageLinks?.medium || v.imageLinks?.thumbnail || v.imageLinks?.small;
      if (!link || !v.title) continue;
      const conf = scoreMatch(title, author, v.title, v.authors || []);
      // Google often returns http://; upgrade and remove edge=curl param for cleaner image
      const cleanLink = link.replace(/^http:/, "https:").replace(/&edge=curl/, "");
      if (!best || conf > best.confidence) {
        best = {
          url: cleanLink,
          matchedTitle: v.title,
          matchedAuthor: (v.authors || []).join(", "),
          source: "google",
          confidence: conf,
        };
      }
    }
    return best;
  } catch (e) {
    console.error(`  google fetch error: ${(e as Error).message}`);
    return null;
  }
}

async function fetchOpenLibrary(title: string, author: string): Promise<Match | null> {
  const params = new URLSearchParams({ title });
  if (author && author !== "Unknown") params.set("author", author);
  params.set("limit", "5");
  const url = `https://openlibrary.org/search.json?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": "reader-app/cover-backfill (azmain)" } });
    if (!res.ok) return null;
    const data = await res.json() as {
      docs?: Array<{
        title?: string;
        author_name?: string[];
        cover_i?: number;
      }>;
    };
    if (!data.docs || data.docs.length === 0) return null;

    let best: Match | null = null;
    for (const doc of data.docs) {
      if (!doc.cover_i || !doc.title) continue;
      const conf = scoreMatch(title, author, doc.title, doc.author_name || []);
      const link = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      if (!best || conf > best.confidence) {
        best = {
          url: link,
          matchedTitle: doc.title,
          matchedAuthor: (doc.author_name || []).join(", "),
          source: "openlibrary",
          confidence: conf,
        };
      }
    }
    return best;
  } catch (e) {
    console.error(`  openlibrary fetch error: ${(e as Error).message}`);
    return null;
  }
}

async function findCover(title: string, author: string): Promise<Match | null> {
  const google = await fetchGoogleBooks(title, author);
  if (google && google.confidence >= MIN_CONFIDENCE) return google;
  await sleep(REQUEST_DELAY_MS);
  const ol = await fetchOpenLibrary(title, author);
  // Return best of the two even if below threshold — caller decides
  if (!google && !ol) return null;
  if (!google) return ol;
  if (!ol) return google;
  return google.confidence >= ol.confidence ? google : ol;
}

// ---------- R2 ----------

function makeR2Client() {
  const ak = process.env.R2_BOOKS_ACCESS_KEY_ID;
  const sk = process.env.R2_BOOKS_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_BOOKS_ENDPOINT;
  const bucket = process.env.R2_BOOKS_BUCKET;
  if (!ak || !sk || !endpoint || !bucket) {
    throw new Error(
      "Missing R2 env vars (R2_BOOKS_ACCESS_KEY_ID, R2_BOOKS_SECRET_ACCESS_KEY, R2_BOOKS_ENDPOINT, R2_BOOKS_BUCKET)"
    );
  }
  const client = new AwsClient({ accessKeyId: ak, secretAccessKey: sk, service: "s3", region: "auto" });
  return {
    async upload(key: string, body: Uint8Array, contentType: string) {
      const url = `${endpoint}/${bucket}/${key}`;
      const res = await client.fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: body as unknown as BodyInit,
      });
      if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
      return key;
    },
  };
}

async function downloadImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) return null; // Open Library returns ~120 bytes for "no cover"
    return new Uint8Array(buf);
  } catch (e) {
    console.error(`  download error: ${(e as Error).message}`);
    return null;
  }
}

async function reencode(input: Uint8Array): Promise<Uint8Array> {
  // Resize to max 600px wide, JPEG quality 85
  const out = await sharp(input).resize({ width: 600, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  return new Uint8Array(out);
}

// ---------- Logging ----------

async function appendResult(rec: ResultRecord) {
  await fs.appendFile(RESULTS_LOG, JSON.stringify(rec) + "\n", "utf8");
}

async function reviewLog() {
  let content: string;
  try {
    content = await fs.readFile(RESULTS_LOG, "utf8");
  } catch {
    console.error(`No log file at ${RESULTS_LOG}. Run without --review-only first.`);
    process.exit(1);
  }
  const lines = content.trim().split("\n");
  let total = 0, low = 0, none = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    total++;
    const r = JSON.parse(line) as ResultRecord;
    if (r.confidence === 0) {
      none++;
      console.log(`NO MATCH    [${r.bookId}] "${r.title}" — ${r.author}`);
    } else if (r.confidence < 0.95) {
      low++;
      console.log(
        `LOW (${r.confidence.toFixed(2)}) [${r.bookId}] "${r.title}" — ${r.author}\n` +
        `         got: "${r.matchedTitle}" — ${r.matchedAuthor} (${r.source})`
      );
    }
  }
  console.log(`\n${total} total, ${low} low confidence, ${none} no match.`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- Main ----------

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.reviewOnly) {
    await reviewLog();
    return;
  }

  const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  const prisma = new PrismaClient(databaseUrl ? { datasourceUrl: databaseUrl } : undefined);
  const r2 = opts.dryRun ? null : makeR2Client();

  // Manual override mode
  if (opts.bookId && opts.imageUrl) {
    const book = await prisma.book.findUnique({ where: { id: opts.bookId } });
    if (!book) {
      console.error(`Book ${opts.bookId} not found.`);
      process.exit(1);
    }
    console.log(`Manual override for "${book.title}" — ${book.author}`);
    const raw = await downloadImage(opts.imageUrl);
    if (!raw) {
      console.error(`Failed to download ${opts.imageUrl}`);
      process.exit(1);
    }
    const encoded = await reencode(raw);
    const key = `covers/${book.id}.jpg`;
    if (!opts.dryRun) {
      await r2!.upload(key, encoded, "image/jpeg");
      await prisma.book.update({ where: { id: book.id }, data: { coverImageKey: key } });
    }
    console.log(`  ${opts.dryRun ? "(dry-run) " : ""}uploaded ${key} (${encoded.length} bytes)`);
    await appendResult({
      bookId: book.id,
      title: book.title,
      author: book.author,
      category: "(manual)",
      source: "manual",
      matchedTitle: null,
      matchedAuthor: null,
      confidence: 1,
      accepted: true,
      coverKey: key,
      timestamp: new Date().toISOString(),
    });
    await prisma.$disconnect();
    return;
  }

  // Batch mode
  const where: Parameters<typeof prisma.book.findMany>[0] = { where: {} };
  if (opts.bookId) where.where = { id: opts.bookId };
  if (opts.category) where.where = { ...where.where, category: { name: opts.category } };
  if (!opts.force) where.where = { ...where.where, coverImageKey: null };

  const books = await prisma.book.findMany({
    ...where,
    select: {
      id: true,
      title: true,
      author: true,
      coverImageKey: true,
      category: { select: { name: true } },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
  });

  const eligible = books.filter((b) => !SKIP_CATEGORIES.has(b.category.name));
  console.log(`Found ${eligible.length} eligible books (${books.length - eligible.length} skipped: lectures/podcasts/concepts/personal).`);
  if (opts.dryRun) console.log("DRY RUN — no R2 uploads, no DB writes.");

  let processed = 0, accepted = 0, rejected = 0, errors = 0;

  for (const book of eligible) {
    processed++;
    const prefix = `[${processed}/${eligible.length}]`;

    if (book.author === "Unknown") {
      console.log(`${prefix} SKIP "${book.title}" — author Unknown (use --book-id with --image-url)`);
      await appendResult({
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category.name,
        source: null,
        matchedTitle: null,
        matchedAuthor: null,
        confidence: 0,
        accepted: false,
        reason: "author-unknown",
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    console.log(`${prefix} "${book.title}" — ${book.author} [${book.category.name}]`);

    try {
      const match = await findCover(book.title, book.author);

      if (!match) {
        console.log(`  no match`);
        await appendResult({
          bookId: book.id, title: book.title, author: book.author, category: book.category.name,
          source: null, matchedTitle: null, matchedAuthor: null, confidence: 0, accepted: false,
          reason: "no-match", timestamp: new Date().toISOString(),
        });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const accept = match.confidence >= MIN_CONFIDENCE;
      console.log(`  ${match.source} (${match.confidence.toFixed(2)}) "${match.matchedTitle}" — ${match.matchedAuthor}`);

      if (!accept) {
        console.log(`  REJECTED (confidence < ${MIN_CONFIDENCE})`);
        rejected++;
        await appendResult({
          bookId: book.id, title: book.title, author: book.author, category: book.category.name,
          source: match.source, matchedTitle: match.matchedTitle, matchedAuthor: match.matchedAuthor,
          confidence: match.confidence, accepted: false, reason: "low-confidence",
          timestamp: new Date().toISOString(),
        });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const raw = await downloadImage(match.url);
      if (!raw) {
        console.log(`  download failed`);
        errors++;
        await appendResult({
          bookId: book.id, title: book.title, author: book.author, category: book.category.name,
          source: match.source, matchedTitle: match.matchedTitle, matchedAuthor: match.matchedAuthor,
          confidence: match.confidence, accepted: false, reason: "download-failed",
          timestamp: new Date().toISOString(),
        });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const encoded = await reencode(raw);
      const key = `covers/${book.id}.jpg`;

      if (!opts.dryRun) {
        await r2!.upload(key, encoded, "image/jpeg");
        await prisma.book.update({ where: { id: book.id }, data: { coverImageKey: key } });
      }

      accepted++;
      console.log(`  ${opts.dryRun ? "(dry-run) " : ""}uploaded ${key} (${encoded.length} bytes)`);
      await appendResult({
        bookId: book.id, title: book.title, author: book.author, category: book.category.name,
        source: match.source, matchedTitle: match.matchedTitle, matchedAuthor: match.matchedAuthor,
        confidence: match.confidence, accepted: true, coverKey: key,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      errors++;
      console.error(`  ERROR: ${(e as Error).message}`);
      await appendResult({
        bookId: book.id, title: book.title, author: book.author, category: book.category.name,
        source: null, matchedTitle: null, matchedAuthor: null, confidence: 0, accepted: false,
        reason: `error: ${(e as Error).message}`, timestamp: new Date().toISOString(),
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\nDone. ${accepted} accepted, ${rejected} rejected (low confidence), ${errors} errors.`);
  console.log(`Log: ${RESULTS_LOG}`);
  console.log(`Re-review with: railway run --service Postgres npx tsx scripts/backfill-covers.ts --review-only`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Unexpected error:");
  console.error(err);
  process.exit(1);
});
