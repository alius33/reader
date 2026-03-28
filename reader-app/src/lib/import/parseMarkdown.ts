/**
 * Convert preprocessed markdown → Tiptap JSON document.
 *
 * After preprocessing, the markdown contains:
 *   - Standard markdown (headings, bold, italic, lists, tables, code, hr, blockquotes)
 *   - :::callout{...} fences
 *   - ::color[text]{hex="..."} inline directives
 *   - ::wikilink[display]{target="..."} inline directives
 *   - ```mermaid code blocks
 *
 * Strategy: Use unified/remark-parse to get an AST, then walk it
 * and produce Tiptap-compatible JSON nodes.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { TiptapDoc, TiptapNode, TiptapMark } from "@/types";

// ---- Directive patterns for post-AST inline processing ----
const COLOR_DIR_RE = /::color\[([^\]]*)\]\{hex="(#[0-9a-fA-F]{6})"\}/g;
const WIKILINK_DIR_RE =
  /::wikilink\[([^\]]*)\]\{target="([^"]+)"\}/g;
const CALLOUT_FENCE_RE =
  /^:::callout\{type="([^"]+)" title="([^"]*)" collapsible=(true|false)\}$/;

export function parseMarkdown(preprocessed: string): TiptapDoc {
  const doc: TiptapDoc = { type: "doc", content: [] };
  const lines = preprocessed.split("\n");

  let i = 0;
  while (i < lines.length) {
    const calloutMatch = lines[i].match(CALLOUT_FENCE_RE);
    if (calloutMatch) {
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && lines[i] !== ":::") {
        calloutLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::

      const innerDoc = parseMarkdownBlock(calloutLines.join("\n"));
      doc.content.push({
        type: "callout",
        attrs: {
          calloutType: calloutMatch[1],
          title: calloutMatch[2],
          collapsible: calloutMatch[3] === "true",
          collapsed: false,
        },
        content: innerDoc.length > 0 ? innerDoc : [{ type: "paragraph" }],
      });
      continue;
    }

    // Accumulate non-callout lines for a block
    const blockLines: string[] = [];
    while (i < lines.length && !lines[i].match(CALLOUT_FENCE_RE)) {
      blockLines.push(lines[i]);
      i++;
    }

    if (blockLines.length > 0) {
      const nodes = parseMarkdownBlock(blockLines.join("\n"));
      doc.content.push(...nodes);
    }
  }

  if (doc.content.length === 0) {
    doc.content.push({ type: "paragraph" });
  }

  return doc;
}

function parseMarkdownBlock(md: string): TiptapNode[] {
  if (!md.trim()) return [];

  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);
  const nodes: TiptapNode[] = [];

  for (const child of (tree as any).children || []) {
    const converted = convertNode(child);
    if (converted) {
      if (Array.isArray(converted)) {
        nodes.push(...converted);
      } else {
        nodes.push(converted);
      }
    }
  }

  return nodes;
}

function convertNode(node: any): TiptapNode | TiptapNode[] | null {
  switch (node.type) {
    case "heading":
      return {
        type: "heading",
        attrs: { level: node.depth },
        content: convertInlineChildren(node.children),
      };

    case "paragraph": {
      const content = convertInlineChildren(node.children);
      if (content.length === 0) return { type: "paragraph" };
      return { type: "paragraph", content };
    }

    case "blockquote": {
      const inner: TiptapNode[] = [];
      for (const child of node.children || []) {
        const c = convertNode(child);
        if (c) {
          if (Array.isArray(c)) inner.push(...c);
          else inner.push(c);
        }
      }
      return {
        type: "blockquote",
        content: inner.length > 0 ? inner : [{ type: "paragraph" }],
      };
    }

    case "list": {
      const listType = node.ordered ? "orderedList" : "bulletList";
      const items: TiptapNode[] = [];
      for (const item of node.children || []) {
        const itemContent: TiptapNode[] = [];
        for (const child of item.children || []) {
          const c = convertNode(child);
          if (c) {
            if (Array.isArray(c)) itemContent.push(...c);
            else itemContent.push(c);
          }
        }
        items.push({
          type: "listItem",
          content:
            itemContent.length > 0
              ? itemContent
              : [{ type: "paragraph" }],
        });
      }
      return { type: listType, content: items };
    }

    case "code": {
      if (node.lang === "mermaid") {
        return {
          type: "mermaidDiagram",
          attrs: { source: node.value },
        };
      }
      if (node.lang === "chartjs") {
        return {
          type: "chartDiagram",
          attrs: { source: node.value },
        };
      }
      if (node.lang === "d3") {
        return {
          type: "d3Diagram",
          attrs: { source: node.value },
        };
      }
      return {
        type: "codeBlock",
        attrs: { language: node.lang || null },
        content: node.value ? [{ type: "text", text: node.value }] : [],
      };
    }

    case "thematicBreak":
      return { type: "horizontalRule" };

    case "table": {
      const rows: TiptapNode[] = [];
      for (let ri = 0; ri < (node.children || []).length; ri++) {
        const row = node.children[ri];
        const cells: TiptapNode[] = [];
        for (const cell of row.children || []) {
          const cellType = ri === 0 ? "tableHeader" : "tableCell";
          const content = convertInlineChildren(cell.children);
          cells.push({
            type: cellType,
            content: [
              {
                type: "paragraph",
                content: content.length > 0 ? content : undefined,
              },
            ],
          });
        }
        rows.push({ type: "tableRow", content: cells });
      }
      return { type: "table", content: rows };
    }

    case "html": {
      // Leftover HTML that wasn't caught by preprocessor — keep as paragraph
      const text = node.value?.trim();
      if (!text) return null;
      return {
        type: "paragraph",
        content: processInlineDirectives(text),
      };
    }

    default:
      return null;
  }
}

function convertInlineChildren(children: any[]): TiptapNode[] {
  if (!children || children.length === 0) return [];

  const nodes: TiptapNode[] = [];

  for (const child of children) {
    switch (child.type) {
      case "text": {
        const processed = processInlineDirectives(child.value);
        nodes.push(...processed);
        break;
      }

      case "strong": {
        const inner = convertInlineChildren(child.children);
        for (const n of inner) {
          addMark(n, { type: "bold" });
        }
        nodes.push(...inner);
        break;
      }

      case "emphasis": {
        const inner = convertInlineChildren(child.children);
        for (const n of inner) {
          addMark(n, { type: "italic" });
        }
        nodes.push(...inner);
        break;
      }

      case "delete": {
        const inner = convertInlineChildren(child.children);
        for (const n of inner) {
          addMark(n, { type: "strike" });
        }
        nodes.push(...inner);
        break;
      }

      case "inlineCode":
        nodes.push({
          type: "text",
          text: child.value,
          marks: [{ type: "code" }],
        });
        break;

      case "link": {
        const inner = convertInlineChildren(child.children);
        for (const n of inner) {
          addMark(n, {
            type: "link",
            attrs: { href: child.url, target: "_blank" },
          });
        }
        nodes.push(...inner);
        break;
      }

      case "image":
        // Skip images (not in scope for this app)
        break;

      case "html": {
        const processed = processInlineDirectives(child.value);
        nodes.push(...processed);
        break;
      }

      default: {
        if (child.value) {
          nodes.push({ type: "text", text: child.value });
        } else if (child.children) {
          nodes.push(...convertInlineChildren(child.children));
        }
        break;
      }
    }
  }

  return nodes;
}

function processInlineDirectives(text: string): TiptapNode[] {
  if (!text) return [];

  interface Segment {
    start: number;
    end: number;
    node: TiptapNode;
  }
  const segments: Segment[] = [];

  // Find ::color directives
  let match: RegExpExecArray | null;
  const colorRe = new RegExp(COLOR_DIR_RE.source, "g");
  while ((match = colorRe.exec(text)) !== null) {
    segments.push({
      start: match.index,
      end: match.index + match[0].length,
      node: {
        type: "text",
        text: match[1],
        marks: [{ type: "bold" }, { type: "textStyle", attrs: { color: match[2] } }],
      },
    });
  }

  // Find ::wikilink directives
  const wikiRe = new RegExp(WIKILINK_DIR_RE.source, "g");
  while ((match = wikiRe.exec(text)) !== null) {
    segments.push({
      start: match.index,
      end: match.index + match[0].length,
      node: {
        type: "text",
        text: match[1],
        marks: [
          {
            type: "wikilink",
            attrs: { target: match[2], bookId: null, display: match[1] },
          },
        ],
      },
    });
  }

  if (segments.length === 0) {
    return text ? [{ type: "text", text }] : [];
  }

  // Sort by position and interleave plain text
  segments.sort((a, b) => a.start - b.start);
  const result: TiptapNode[] = [];
  let cursor = 0;

  for (const seg of segments) {
    if (seg.start > cursor) {
      result.push({ type: "text", text: text.slice(cursor, seg.start) });
    }
    result.push(seg.node);
    cursor = seg.end;
  }

  if (cursor < text.length) {
    result.push({ type: "text", text: text.slice(cursor) });
  }

  return result;
}

function addMark(node: TiptapNode, mark: TiptapMark) {
  if (node.type === "text") {
    node.marks = node.marks || [];
    node.marks.push(mark);
  }
}
