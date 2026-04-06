import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Check specific book
  const books = await p.book.findMany({
    where: { title: { contains: "33 Strategies" } },
    select: { id: true, title: true, author: true, originalFileKey: true, originalFileType: true },
  });
  console.log("33 Strategies entries:");
  for (const b of books) console.log(" ", b.id, "|", b.title, "|", b.originalFileKey ?? "NO FILE");

  // Overall stats
  const total = await p.book.count();
  const withFile = await p.book.count({ where: { originalFileKey: { not: null } } });
  console.log(`\nTotal: ${total} books, ${withFile} with files, ${total - withFile} without`);

  // Check the book from the URL
  const specific = await p.book.findUnique({
    where: { id: "cmncowwsd009wuboohvwvfzxn" },
    select: { id: true, title: true, originalFileKey: true },
  });
  console.log("\nBook from URL:", specific);

  await p.$disconnect();
}
main();
