/**
 * Utilities to extract and reapply user marks (highlights, comments) from a
 * Tiptap document. Used by the seed script to preserve marks across reseeds.
 */

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

interface TiptapDoc {
  type: "doc";
  content: TiptapNode[];
}

export interface SavedMark {
  text: string;
  marks: TiptapMark[];
  context: {
    prevText: string;
    nextText: string;
  };
}

const USER_MARK_TYPES = new Set(["highlight", "comment"]);

function collectTextNodes(node: TiptapNode | TiptapDoc): TiptapNode[] {
  if ("text" in node && node.text !== undefined) return [node as TiptapNode];
  const nodes: TiptapNode[] = [];
  for (const child of node.content ?? []) {
    nodes.push(...collectTextNodes(child));
  }
  return nodes;
}

/**
 * Walk a Tiptap doc and return every text node that carries a highlight or
 * comment mark, along with its surrounding context for disambiguation.
 */
export function extractUserMarks(doc: TiptapDoc): SavedMark[] {
  const textNodes = collectTextNodes(doc);
  const saved: SavedMark[] = [];

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const userMarks = (node.marks ?? []).filter((m) => USER_MARK_TYPES.has(m.type));
    if (userMarks.length === 0) continue;

    saved.push({
      text: node.text!,
      marks: userMarks,
      context: {
        prevText: textNodes[i - 1]?.text ?? "",
        nextText: textNodes[i + 1]?.text ?? "",
      },
    });
  }

  return saved;
}

/**
 * Walk a new Tiptap doc and reattach saved marks to matching text nodes.
 * Returns a deep-cloned doc with marks applied — original is not mutated.
 *
 * Matching strategy:
 *  1. Find all text nodes whose text exactly equals savedMark.text
 *  2. If multiple matches exist, use prev/next context to pick the right one
 *  3. If no context match, fall back to the first candidate
 *  4. If no candidate at all, skip with a warning (text was edited in markdown)
 */
export function reapplyUserMarks(doc: TiptapDoc, savedMarks: SavedMark[]): TiptapDoc {
  if (savedMarks.length === 0) return doc;

  const newDoc: TiptapDoc = JSON.parse(JSON.stringify(doc));
  const textNodes = collectTextNodes(newDoc);

  for (const saved of savedMarks) {
    const candidates = textNodes
      .map((node, i) => ({ node, i }))
      .filter(({ node }) => node.text === saved.text);

    if (candidates.length === 0) {
      console.warn(`    [preserveMarks] No match found for: "${saved.text.slice(0, 60)}"`);
      continue;
    }

    let target = candidates[0];
    if (candidates.length > 1) {
      const withContext = candidates.find(
        ({ i }) =>
          (textNodes[i - 1]?.text ?? "") === saved.context.prevText &&
          (textNodes[i + 1]?.text ?? "") === saved.context.nextText
      );
      if (withContext) target = withContext;
    }

    // Merge marks, skipping exact duplicates
    const existing = target.node.marks ?? [];
    const merged = [...existing];
    for (const mark of saved.marks) {
      const duplicate = merged.some(
        (m) =>
          m.type === mark.type &&
          JSON.stringify(m.attrs) === JSON.stringify(mark.attrs)
      );
      if (!duplicate) merged.push(mark);
    }
    target.node.marks = merged;
  }

  return newDoc;
}
