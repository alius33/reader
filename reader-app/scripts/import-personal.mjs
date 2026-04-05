/**
 * Import personal books from Workplace Navigation/test/ into the DB
 * as private books under "Personal" category, owned by first user.
 *
 * Run: railway run -- npx tsx scripts/import-personal.mjs
 * Or include in railway.json startCommand for one-time run.
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Simple frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      meta[m[1]] = val;
    }
  }
  // Parse tags
  if (content.includes("tags:")) {
    const tagMatch = content.match(/tags:\s*\n((?:\s+-\s+.+\n?)*)/);
    if (tagMatch) {
      meta.tags = tagMatch[1].split("\n").map(l => l.replace(/^\s+-\s+/, "").trim()).filter(Boolean);
    }
  }
  return { meta, body: match[2] };
}

// Convert markdown to simple Tiptap JSON
function markdownToTiptap(markdown) {
  const lines = markdown.split("\n");
  const content = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      content.push({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: line.slice(2) }] });
    } else if (line.startsWith("## ")) {
      content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: line.slice(3) }] });
    } else if (line.startsWith("### ")) {
      content.push({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: line.slice(4) }] });
    } else if (line.trim() === "") {
      // skip empty lines
    } else {
      content.push({ type: "paragraph", content: [{ type: "text", text: line }] });
    }
  }

  if (content.length === 0) {
    content.push({ type: "paragraph", content: [{ type: "text", text: "(empty)" }] });
  }

  return { type: "doc", content };
}

function extractSummary(body) {
  // Look for blockquote at top
  const match = body.match(/^>\s*(.+(?:\n>\s*.+)*)/m);
  if (match) return match[0].replace(/^>\s*/gm, "").trim().slice(0, 500);
  // First paragraph
  const lines = body.split("\n").filter(l => l.trim() && !l.startsWith("#"));
  return lines.slice(0, 3).join(" ").slice(0, 500);
}

async function main() {
  // Find owner
  const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!owner) { console.log("[import] No users, sign in first."); return; }
  console.log(`[import] Owner: ${owner.email}`);

  // Create/find "Personal" category
  let category = await prisma.category.findUnique({ where: { name: "Personal" } });
  if (!category) {
    category = await prisma.category.create({ data: { name: "Personal", description: "Private personal books and research", sortOrder: 99 } });
    console.log("[import] Created 'Personal' category");
  }

  // Also undo private flag on Workplace Navigation books (they're office books, not sensitive)
  const wnCat = await prisma.category.findUnique({ where: { name: "Workplace Navigation" } });
  if (wnCat) {
    await prisma.book.updateMany({ where: { categoryId: wnCat.id }, data: { private: false, ownerId: null } });
    console.log("[import] Undid private flag on Workplace Navigation books");
  }

  const testDir = path.resolve(__dirname, "../summaries/Workplace Navigation/test");
  if (!fs.existsSync(testDir)) {
    console.log(`[import] Directory not found: ${testDir}`);
    return;
  }

  let imported = 0;
  let skipped = 0;

  // Import main files
  const files = fs.readdirSync(testDir).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const filePath = path.join(testDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    const title = meta.title || file.replace(/\.md$/, "").replace(/ - .+$/, "");
    const author = meta.author || file.replace(/\.md$/, "").replace(/^.+ - /, "") || "Unknown";
    const year = meta.year ? parseInt(meta.year) : null;
    const tags = Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : ["personal"]);

    // Check if already exists
    const existing = await prisma.book.findFirst({ where: { title, author } });
    if (existing) { skipped++; continue; }

    const tiptap = markdownToTiptap(body);
    const plainText = body.replace(/[#*>`\[\]()_~|]/g, "").slice(0, 50000);
    const summary = extractSummary(body);
    const wordCount = body.split(/\s+/).length;

    await prisma.book.create({
      data: {
        title,
        author,
        year,
        categoryId: category.id,
        tags,
        content: tiptap,
        plainText,
        originalMarkdown: raw,
        summary,
        wordCount,
        private: true,
        ownerId: owner.id,
      },
    });
    imported++;
    console.log(`[import] ✓ ${title}`);
  }

  // Import archived/ chapter files
  const archivedDir = path.join(testDir, "archived");
  if (fs.existsSync(archivedDir)) {
    const archivedFiles = fs.readdirSync(archivedDir).filter(f => f.endsWith(".md"));
    for (const file of archivedFiles) {
      const filePath = path.join(archivedDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { meta, body } = parseFrontmatter(raw);

      const title = meta.title || file.replace(/\.md$/, "");
      const author = meta.author || "Azmain Hossain";
      const tags = Array.isArray(meta.tags) ? meta.tags : ["personal", "eldest-son", "chapter"];

      const existing = await prisma.book.findFirst({ where: { title, author } });
      if (existing) { skipped++; continue; }

      const tiptap = markdownToTiptap(body);
      const plainText = body.replace(/[#*>`\[\]()_~|]/g, "").slice(0, 50000);
      const summary = extractSummary(body);
      const wordCount = body.split(/\s+/).length;

      await prisma.book.create({
        data: {
          title,
          author,
          year: null,
          categoryId: category.id,
          subcategory: "The Eldest Son",
          tags,
          content: tiptap,
          plainText,
          originalMarkdown: raw,
          summary,
          wordCount,
          private: true,
          ownerId: owner.id,
        },
      });
      imported++;
      console.log(`[import] ✓ ${title}`);
    }
  }

  console.log(`[import] Done: ${imported} imported, ${skipped} skipped (already exist)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
