/**
 * Extract table of contents from Tiptap doc — H2 and H3 headings.
 */

import type { TiptapDoc, TiptapNode, TocEntry } from "@/types";

export function extractToc(doc: TiptapDoc): TocEntry[] {
  const entries: TocEntry[] = [];

  for (const node of doc.content) {
    if (node.type === "heading") {
      const level = (node.attrs?.level as number) || 2;
      if (level === 2 || level === 3) {
        const text = getTextContent(node);
        if (text) {
          const id = slugify(text);
          entries.push({ id, text, level });
        }
      }
    }
    // Also check inside callouts for headings
    if (node.type === "callout" && node.content) {
      for (const inner of node.content) {
        if (inner.type === "heading") {
          const level = (inner.attrs?.level as number) || 2;
          if (level === 2 || level === 3) {
            const text = getTextContent(inner);
            if (text) {
              entries.push({ id: slugify(text), text, level });
            }
          }
        }
      }
    }
  }

  return entries;
}

function getTextContent(node: TiptapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(getTextContent).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
