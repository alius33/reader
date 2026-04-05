import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "application/epub+zip": "epub",
  "application/pdf": "pdf",
};

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bookId = formData.get("bookId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileType = ALLOWED_TYPES[file.type] ?? (file.name.endsWith(".epub") ? "epub" : file.name.endsWith(".pdf") ? "pdf" : null);
  if (!fileType) {
    return NextResponse.json({ error: "Only EPUB and PDF files allowed" }, { status: 400 });
  }

  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const key = `books/${bookId}/${file.name}`;
  await uploadToR2(key, buffer, file.type || "application/octet-stream");

  // Try to extract cover from EPUB
  let coverKey: string | null = null;
  if (fileType === "epub") {
    try {
      const cover = await extractEpubCover(buffer);
      if (cover) {
        coverKey = `covers/${bookId}.jpg`;
        await uploadToR2(coverKey, cover.data, cover.type);
      }
    } catch (e) {
      console.error("Cover extraction failed:", e);
    }
  }

  const updated = await prisma.book.update({
    where: { id: bookId },
    data: {
      originalFileKey: key,
      originalFileType: fileType,
      ...(coverKey ? { coverImageKey: coverKey } : {}),
    },
  });

  return NextResponse.json({
    id: updated.id,
    originalFileKey: updated.originalFileKey,
    originalFileType: updated.originalFileType,
    coverImageKey: updated.coverImageKey,
  });
}

async function extractEpubCover(buffer: Uint8Array): Promise<{ data: Uint8Array; type: string } | null> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  // Common cover file paths in EPUBs
  const coverPatterns = [
    /cover\.(jpg|jpeg|png)/i,
    /images\/cover/i,
    /OEBPS\/images\/cover/i,
    /OEBPS\/cover/i,
  ];

  for (const pattern of coverPatterns) {
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (pattern.test(path) && !zipEntry.dir) {
        const data = new Uint8Array(await zipEntry.async("arraybuffer"));
        const type = path.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        return { data, type };
      }
    }
  }

  return null;
}
