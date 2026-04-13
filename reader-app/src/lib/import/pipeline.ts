/**
 * Full import pipeline: markdown file → database record.
 */

import { parseFrontmatter } from "./parseFrontmatter";
import { preprocess } from "./preprocess";
import { parseMarkdown } from "./parseMarkdown";
import { extractPlainText } from "./extractPlainText";
import { extractToc } from "./extractToc";
import { extractContentStats } from "./extractContentStats";
import { extractSummary } from "./extractSummary";
import type { TiptapDoc, TocEntry, ContentStats } from "@/types";

export interface ImportResult {
  title: string;
  author: string;
  year: number | null;
  tags: string[];
  category: string;
  content: TiptapDoc;
  plainText: string;
  originalMarkdown: string;
  summary: string | null;
  wordCount: number;
  toc: TocEntry[];
  contentStats: ContentStats;
  lectureNumber: number | null;
}

export function processFile(
  markdown: string,
  category: string
): ImportResult {
  // Step 1: Parse frontmatter
  const { data: frontmatter, content: body } = parseFrontmatter(markdown);

  // Step 2: Preprocess (callouts, colored HTML, wikilinks)
  const preprocessed = preprocess(body);

  // Step 3: Parse to Tiptap JSON
  const doc = parseMarkdown(preprocessed);

  // Step 4: Extract metadata
  const plainText = extractPlainText(doc);
  const toc = extractToc(doc);
  const contentStats = extractContentStats(doc);
  const summary = extractSummary(doc);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    title: frontmatter.title,
    author: frontmatter.author,
    year: frontmatter.year,
    tags: frontmatter.tags,
    category,
    content: doc,
    plainText,
    originalMarkdown: markdown,
    summary,
    wordCount,
    toc,
    contentStats,
    lectureNumber: frontmatter.lectureNumber,
  };
}
