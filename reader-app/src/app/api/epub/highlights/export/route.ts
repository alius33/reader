import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const bookId = request.nextUrl.searchParams.get("bookId");
  const format = request.nextUrl.searchParams.get("format") ?? "html";

  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { title: true, author: true } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const highlights = await prisma.epubHighlight.findMany({
    where: { userId: session!.user.id, bookId },
    orderBy: { createdAt: "asc" },
  });

  const filename = `${book.title} - Highlights`;

  if (format === "xlsx") {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Highlights");
    sheet.columns = [
      { header: "Text", key: "text", width: 60 },
      { header: "Color", key: "color", width: 10 },
      { header: "Note", key: "note", width: 40 },
      { header: "Date", key: "date", width: 15 },
    ];
    for (const h of highlights) {
      sheet.addRow({ text: h.text, color: h.color, note: h.note ?? "", date: h.createdAt.toISOString().split("T")[0] });
    }
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  if (format === "docx") {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
    const children = [
      new Paragraph({ text: `${book.title} - ${book.author}`, heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: `${highlights.length} highlights`, spacing: { after: 200 } }),
    ];
    for (const h of highlights) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: h.text, highlight: "yellow" })],
          spacing: { before: 200 },
        })
      );
      if (h.note) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Note: ${h.note}`, italics: true, color: "666666" })],
          })
        );
      }
    }
    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
      },
    });
  }

  // HTML format (default)
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${book.title} - Highlights</title>
<style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:0 20px}
h1{font-size:1.5em}
.highlight{margin:16px 0;padding:12px;border-radius:6px;border-left:4px solid}
.note{color:#666;font-style:italic;margin-top:6px;font-size:0.9em}
.date{color:#999;font-size:0.8em}</style></head>
<body><h1>${book.title}</h1><p>${book.author} · ${highlights.length} highlights</p>
${highlights.map((h) => `<div class="highlight" style="background:${h.color}40;border-color:${h.color}">
<div>${h.text}</div>
${h.note ? `<div class="note">Note: ${h.note}</div>` : ""}
<div class="date">${h.createdAt.toISOString().split("T")[0]}</div>
</div>`).join("\n")}
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.html"`,
    },
  });
}
