/**
 * Extract the 30-second summary — the first blockquote in the document
 * (typically the "The Big Idea" introductory blockquote).
 */

import type { TiptapDoc, TiptapNode } from "@/types";

export function extractSummary(doc: TiptapDoc): string | null {
  for (const node of doc.content) {
    if (node.type === "blockquote") {
      return getTextContent(node).trim() || null;
    }
  }
  return null;
}

function getTextContent(node: TiptapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(getTextContent).join(" ");
}
