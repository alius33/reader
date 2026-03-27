-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER,
    "categoryId" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "plainText" TEXT NOT NULL,
    "originalMarkdown" TEXT,
    "summary" TEXT,
    "wordCount" INTEGER,
    "toc" JSONB,
    "contentStats" JSONB,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "markId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "selectedText" TEXT NOT NULL,
    "commentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossReference" (
    "id" TEXT NOT NULL,
    "sourceBookId" TEXT NOT NULL,
    "targetBookId" TEXT,
    "targetTitle" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "CrossReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_author_key" ON "Book"("title", "author");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_bookId_markId_key" ON "Comment"("bookId", "markId");

-- CreateIndex
CREATE UNIQUE INDEX "CrossReference_sourceBookId_targetTitle_key" ON "CrossReference"("sourceBookId", "targetTitle");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossReference" ADD CONSTRAINT "CrossReference_sourceBookId_fkey" FOREIGN KEY ("sourceBookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossReference" ADD CONSTRAINT "CrossReference_targetBookId_fkey" FOREIGN KEY ("targetBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
