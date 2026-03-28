/**
 * Extract content statistics from a Tiptap doc.
 */

import type { TiptapDoc, TiptapNode, ContentStats } from "@/types";

export function extractContentStats(doc: TiptapDoc): ContentStats {
  const stats: ContentStats = {
    callouts: 0,
    diagrams: 0,
    stories: 0,
    crossRefs: 0,
  };

  walkForStats(doc.content, stats);
  return stats;
}

function walkForStats(nodes: TiptapNode[] | undefined, stats: ContentStats) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.type === "callout") {
      stats.callouts++;
      if (
        node.attrs?.calloutType === "example" ||
        node.attrs?.calloutType === "quote"
      ) {
        stats.stories++;
      }
    }
    if (node.type === "mermaidDiagram" || node.type === "chartDiagram" || node.type === "d3Diagram") {
      stats.diagrams++;
    }
    // Count wikilink marks
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "wikilink") {
          stats.crossRefs++;
        }
      }
    }
    if (node.content) {
      walkForStats(node.content, stats);
    }
  }
}
