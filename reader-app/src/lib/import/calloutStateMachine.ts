/**
 * Line-by-line state machine for Obsidian callout blocks.
 * Converts `> [!type] Title` blocks into custom fence directives:
 *
 *   :::callout{type="example" title="Title" collapsible=false}
 *   content lines (> prefix stripped)
 *   :::
 */

const CALLOUT_START_RE =
  /^>\s*\[!(example|tip|abstract|warning|danger|success|info|quote|note)\](-)?(?:\s+(.*))?$/i;
const CALLOUT_BODY_RE = /^>\s?(.*)$/;

type State = "NORMAL" | "CALLOUT_START" | "CALLOUT_BODY";

interface CalloutBlock {
  type: string;
  title: string;
  collapsible: boolean;
  lines: string[];
}

export function processCallouts(input: string): string {
  const lines = input.split("\n");
  const output: string[] = [];

  let state: State = "NORMAL";
  let current: CalloutBlock | null = null;

  function emitCallout() {
    if (!current) return;
    const collStr = current.collapsible ? "true" : "false";
    const titleEsc = current.title.replace(/"/g, '\\"');
    output.push(
      `:::callout{type="${current.type}" title="${titleEsc}" collapsible=${collStr}}`
    );
    output.push(...current.lines);
    output.push(":::");
    current = null;
  }

  for (const line of lines) {
    switch (state) {
      case "NORMAL": {
        const match = line.match(CALLOUT_START_RE);
        if (match) {
          current = {
            type: match[1].toLowerCase(),
            title: (match[3] || "").trim(),
            collapsible: match[2] === "-",
            lines: [],
          };
          state = "CALLOUT_START";
        } else {
          output.push(line);
        }
        break;
      }

      case "CALLOUT_START": {
        const bodyMatch = line.match(CALLOUT_BODY_RE);
        if (bodyMatch) {
          current!.lines.push(bodyMatch[1]);
          state = "CALLOUT_BODY";
        } else {
          emitCallout();
          output.push(line);
          state = "NORMAL";
        }
        break;
      }

      case "CALLOUT_BODY": {
        const bodyMatch = line.match(CALLOUT_BODY_RE);
        if (bodyMatch) {
          current!.lines.push(bodyMatch[1]);
        } else {
          emitCallout();
          output.push(line);
          state = "NORMAL";
        }
        break;
      }
    }
  }

  if (current) emitCallout();

  return output.join("\n");
}
