// One-off: mark Workplace Navigation books as private, owned by first user.
// Safe to run multiple times — idempotent.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  // Undo: make Workplace Navigation books public again (they're office books, not sensitive)
  const cat = await prisma.category.findUnique({ where: { name: "Workplace Navigation" } });
  if (cat) {
    const result = await prisma.book.updateMany({
      where: { categoryId: cat.id, private: true },
      data: { private: false, ownerId: null },
    });
    if (result.count > 0) console.log(`[fix] Made ${result.count} Workplace Navigation books public again`);
    else console.log("[fix] Workplace Navigation books already public");
  }
} finally {
  await prisma.$disconnect();
}
