/**
 * One-off script: Mark all "Workplace Navigation" books as private
 * and assign them to the first user (owner).
 *
 * Run on Railway: railway run -- npx tsx scripts/mark-private.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the owner (first user created = Azmain)
  const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!owner) {
    console.error("No users found. Sign in first, then run this script.");
    process.exit(1);
  }
  console.log(`Owner: ${owner.name} (${owner.email})`);

  // Find the "Workplace Navigation" category
  const category = await prisma.category.findUnique({ where: { name: "Workplace Navigation" } });
  if (!category) {
    console.error("Category 'Workplace Navigation' not found.");
    process.exit(1);
  }

  // Mark all books in that category as private
  const result = await prisma.book.updateMany({
    where: { categoryId: category.id },
    data: { private: true, ownerId: owner.id },
  });

  console.log(`Marked ${result.count} books as private, owned by ${owner.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
