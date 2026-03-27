/**
 * Tiptap JSON → Obsidian-compatible markdown export.
 */

import type { TiptapDoc, TiptapNode, TiptapMark } from "@/types";

export function toMarkdown(doc: TiptapDoc): string {
  return doc.content.map((node) => nodeToMd(node)).join("\n\n");
}

function nodeToMd(node: TiptapNode, indent = ""): string {
  switch (node.type) {
    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const prefix = "#".repeat(level);
      return `${prefix} ${inlineToMd(node.content)}`;
    }

    case "paragraph":
      return `${indent}${inlineToMd(node.content)}`;

    case "blockquote":
      return (node.content || [])
        .map((child) => nodeToMd(child, "> "))
        .join("\n> \n");

    case "bulletList":
      return (node.content || [])
        .map((item) => {
          const inner = (item.content || [])
            .map((child) => nodeToMd(child))
            .join("\n  ");
          return `${indent}- ${inner}`;
        })
        .join("\n");

    case "orderedList":
      return (node.content || [])
        .map((item, i) => {
          const inner = (item.content || [])
            .map((child) => nodeToMd(child))
            .join("\n   ");
          return `${indent}${i + 1}. ${inner}`;
        })
        .join("\n");

    case "codeBlock": {
      const lang = (node.attrs?.language as string) || "";
      const code = node.content?.map((c) => c.text).join("") || "";
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "horizontalRule":
      return "---";

    case "table": {
      if (!node.content?.length) return "";
      const rows = node.content.map((row) =>
        (row.content || []).map((cell) =>
          (cell.content || []).map((p) => inlineToMd(p.content)).join(" ")
        )
      );
      if (rows.length === 0) return "";

      const header = rows[0];
      const separator = header.map(() => "---");
      const lines = [
        `| ${header.join(" | ")} |`,
        `| ${separator.join(" | ")} |`,
        ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`),
      ];
      return lines.join("\n");
    }

    case "callout": {
      const calloutType = (node.attrs?.calloutType as string) || "info";
      const title = (node.attrs?.title as string) || "";
      const collapsible = node.attrs?.collapsible ? "-" : "";
      const inner = (node.content || [])
        .map((child) => nodeToMd(child))
        .join("\n> ");
      return `> [!${calloutType}]${collapsible} ${title}\n> ${inner}`;
    }

    case "mermaidDiagram":
      return `\`\`\`mermaid\n${node.attrs?.source || ""}\n\`\`\``;

    default:
      if (node.content) {
        return node.content.map((child) => nodeToMd(child, indent)).join("\n");
      }
      return "";
  }
}

function inlineToMd(nodes: TiptapNode[] | undefined): string {
  if (!nodes) return "";
  return nodes.map((node) => inlineNodeToMd(node)).join("");
}

function inlineNodeToMd(node: TiptapNode): string {
  if (node.type !== "text" || !node.text) return "";

  let text = node.text;

  if (!node.marks || node.marks.length === 0) return text;

  for (const mark of node.marks) {
    switch (mark.type) {
      case "bold":
        text = `**${text}**`;
        break;
      case "italic":
        text = `*${text}*`;
        break;
      case "strike":
        text = `~~${text}~~`;
        break;
      case "code":
        text = `\`${text}\``;
        break;
      case "underline":
        text = `<u>${text}</u>`;
        break;
      case "link":
        text = `[${text}](${mark.attrs?.href || ""})`;
        break;
      case "textStyle": {
        const color = mark.attrs?.color as string;
        if (color) {
          text = `<b style="color: ${color}">${text}</b>`;
        }
        break;
      }
      case "wikilink": {
        const target = mark.attrs?.target as string;
        const display = mark.attrs?.display as string;
        if (target === display || !display) {
          text = `[[${target}]]`;
        } else {
          text = `[[${target}|${display}]]`;
        }
        break;
      }
      case "highlight": {
        text = `==${text}==`;
        break;
      }
      // comment marks are stripped in export
    }
  }

  return text;
}
