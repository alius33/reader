-- DropIndex (old unique constraint)
DROP INDEX "Comment_bookId_markId_key";

-- AlterTable: Add userId to Comment (nullable first for backfill)
ALTER TABLE "Comment" ADD COLUMN "userId" TEXT;

-- Backfill: assign all existing comments to the first registered user
UPDATE "Comment" SET "userId" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "userId" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Comment" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable: BookView
CREATE TABLE "BookView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookView_pkey" PRIMARY KEY ("id")
);

-- Seed BookView from existing Book.lastViewedAt for the first user (skip if no users)
INSERT INTO "BookView" ("id", "userId", "bookId", "viewedAt")
SELECT
    gen_random_uuid(),
    u.id,
    b.id,
    b."lastViewedAt"
FROM "Book" b
CROSS JOIN (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1) u
WHERE b."lastViewedAt" IS NOT NULL
ON CONFLICT DO NOTHING;

-- CreateTable: Mention
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "commentId" TEXT,
    "text" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookView_userId_viewedAt_idx" ON "BookView"("userId", "viewedAt");
CREATE UNIQUE INDEX "BookView_userId_bookId_key" ON "BookView"("userId", "bookId");
CREATE INDEX "Mention_toUserId_read_idx" ON "Mention"("toUserId", "read");
CREATE INDEX "Comment_userId_bookId_idx" ON "Comment"("userId", "bookId");
CREATE UNIQUE INDEX "Comment_bookId_markId_userId_key" ON "Comment"("bookId", "markId", "userId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookView" ADD CONSTRAINT "BookView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookView" ADD CONSTRAINT "BookView_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
