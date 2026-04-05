/**
 * Upload personal books to Railway via the /api/books/import endpoint.
 *
 * Usage: node scripts/upload-personal.mjs <session-cookie>
 *
 * Get the session cookie by:
 * 1. Sign in at https://readerapp.up.railway.app
 * 2. Open DevTools > Application > Cookies
 * 3. Copy the value of `authjs.session-token` (or `__Secure-authjs.session-token`)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://readerapp.up.railway.app";
const IMPORT_KEY = process.argv[2] || process.env.IMPORT_SECRET;

if (!IMPORT_KEY) {
  console.error("Usage: node scripts/upload-personal.mjs <import-secret>");
  process.exit(1);
}

const testDir = path.resolve(__dirname, "../../summaries/Workplace Navigation/test");

async function importFile(filePath, subcategory) {
  const markdown = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath, ".md");

  // Parse title/author from filename pattern "Title - Author"
  let title, author;
  if (filename.includes(" - ")) {
    const parts = filename.split(" - ");
    title = parts[0].trim();
    author = parts.slice(1).join(" - ").trim();
  } else {
    title = filename;
    author = subcategory === "The Eldest Son" ? "Azmain Hossain" : "Unknown";
  }

  const res = await fetch(`${BASE_URL}/api/books/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-import-key": IMPORT_KEY,
    },
    body: JSON.stringify({
      title,
      author,
      markdown,
      categoryName: "Personal",
      subcategory: subcategory || null,
      tags: ["personal"],
      isPrivate: true,
    }),
  });

  const data = await res.json();
  if (data.skipped) {
    console.log(`  SKIP ${title} (already exists)`);
  } else if (data.imported) {
    console.log(`  ✓ ${title}`);
  } else {
    console.log(`  ✗ ${title}: ${JSON.stringify(data)}`);
  }
}

async function main() {
  console.log("Importing from:", testDir);

  // Main files
  const files = fs.readdirSync(testDir).filter(f => f.endsWith(".md"));
  console.log(`\n${files.length} main files:`);
  for (const file of files) {
    await importFile(path.join(testDir, file), null);
  }

  // Archived (Eldest Son chapters)
  const archivedDir = path.join(testDir, "archived");
  if (fs.existsSync(archivedDir)) {
    const archivedFiles = fs.readdirSync(archivedDir).filter(f => f.endsWith(".md"));
    console.log(`\n${archivedFiles.length} archived (Eldest Son) files:`);
    for (const file of archivedFiles) {
      await importFile(path.join(archivedDir, file), "The Eldest Son");
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
