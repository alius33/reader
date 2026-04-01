-- AlterTable
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;

-- Drop searchVector if it exists (cleanup from db push)
ALTER TABLE "Book" DROP COLUMN IF EXISTS "searchVector";
