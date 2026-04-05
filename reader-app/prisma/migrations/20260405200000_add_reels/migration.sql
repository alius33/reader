-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceHandle" TEXT,
    "caption" TEXT,
    "transcript" TEXT,
    "plainText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "topic" TEXT,
    "duration" INTEGER,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reel_sourceUrl_key" ON "Reel"("sourceUrl");

-- CreateIndex
CREATE INDEX "Reel_ownerId_idx" ON "Reel"("ownerId");

-- CreateIndex
CREATE INDEX "Reel_topic_idx" ON "Reel"("topic");

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
