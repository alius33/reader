/**
 * Extract plain text from a Tiptap JSON document.
 * Used for full-text search indexing.
 */

import type { TiptapDoc, TiptapNode } from "@/types";

export function extractPlainText(doc: TiptapDoc): string {
  const parts: string[] = [];
  walkNodes(doc.content, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function walkNodes(nodes: TiptapNode[] | undefined, parts: string[]) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.text) {
      parts.push(node.text);
    }
    if (node.content) {
      walkNodes(node.content, parts);
    }
    // Add spacing after block-level nodes
    if (
      ["heading", "paragraph", "listItem", "callout", "blockquote"].includes(
        node.type
      )
    ) {
      parts.push(" ");
    }
  }
}
