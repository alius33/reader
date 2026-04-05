-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
