-- Add full-text search vector column and GIN index
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', "plainText")) STORED;

CREATE INDEX IF NOT EXISTS "Book_searchVector_idx" ON "Book" USING GIN ("searchVector");
