import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TableWithAlignment } from "./TableAlignment";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { HighlightWithColor } from "./HighlightWithColor";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { FontSize } from "./FontSize";
import { Indent } from "./Indent";
import { CalloutNode } from "./CalloutNode";
import { MermaidNode } from "./MermaidNode";
import { ChartNode } from "./ChartNode";
import { D3Node } from "./D3Node";
import { WikilinkMark } from "./WikilinkMark";
import { CommentMark } from "./CommentMark";
import { SearchAndReplace } from "./SearchAndReplace";
import type { Extensions } from "@tiptap/react";

export function getEditorExtensions(options?: { placeholder?: string }): Extensions {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Underline,
    TableWithAlignment.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    HighlightWithColor.configure({ multicolor: true }),
    TextStyle,
    Color,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: options?.placeholder ?? "Start writing..." }),
    Typography,
    Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank" } }),
    CalloutNode,
    MermaidNode,
    ChartNode,
    D3Node,
    WikilinkMark,
    CommentMark,
    Superscript,
    Subscript,
    FontSize,
    Indent,
    SearchAndReplace,
  ];
}

// Re-export individual extensions for consumers that need specific ones
export {
  CalloutNode,
  MermaidNode,
  ChartNode,
  D3Node,
  WikilinkMark,
  CommentMark,
  SearchAndReplace,
  FontSize,
  Indent,
};
