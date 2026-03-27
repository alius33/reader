/**
 * Pre-processor: runs BEFORE remark parsing.
 * 1. Callout state machine (blockquotes → :::callout fences)
 * 2. Colored HTML → ::color directives
 * 3. Wikilinks → ::wikilink directives
 */

import { processCallouts } from "./calloutStateMachine";

const COLOR_B_RE =
  /<b\s+style="color:\s*#([0-9a-fA-F]{6})">([\s\S]*?)<\/b>/gi;
const COLOR_SPAN_RE =
  /<span\s+style="color:\s*#([0-9a-fA-F]{6})">([\s\S]*?)<\/span>/gi;

const WIKILINK_ALIASED_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
const WIKILINK_BARE_RE = /\[\[([^\]|]+)\]\]/g;

function replaceColoredHtml(input: string): string {
  let result = input.replace(COLOR_B_RE, (_, hex, text) => {
    return `::color[${text}]{hex="#${hex}"}`;
  });
  result = result.replace(COLOR_SPAN_RE, (_, hex, text) => {
    return `::color[${text}]{hex="#${hex}"}`;
  });
  return result;
}

function replaceWikilinks(input: string): string {
  let result = input.replace(WIKILINK_ALIASED_RE, (_, target, display) => {
    return `::wikilink[${display.trim()}]{target="${target.trim()}"}`;
  });
  result = result.replace(WIKILINK_BARE_RE, (_, target) => {
    const t = target.trim();
    return `::wikilink[${t}]{target="${t}"}`;
  });
  return result;
}

export function preprocess(markdown: string): string {
  let result = processCallouts(markdown);
  result = replaceColoredHtml(result);
  result = replaceWikilinks(result);
  return result;
}
