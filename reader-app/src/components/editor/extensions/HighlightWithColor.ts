import Highlight from "@tiptap/extension-highlight";

/**
 * Extends the default Highlight mark to render inline `color: #1a1a1a` on the
 * <mark> element.  This solves two competing dark-mode requirements:
 *
 *  1. Regular text + highlight  →  must be dark on the pastel background
 *     (otherwise white-on-yellow is unreadable).
 *  2. Coloured text + highlight →  must keep its colour (green / red / blue).
 *
 * Because the colour lives as an inline style on <mark>, it beats any
 * inherited dark-mode body colour.  And because Tiptap's Color extension
 * places `style="color: …"` on a <span> *inside* the mark, normal CSS
 * inheritance means the closer ancestor wins — so coloured text is preserved.
 *
 * No `!important` is used anywhere in the stylesheet.
 */
export const HighlightWithColor = Highlight.extend({
  renderHTML({ HTMLAttributes }) {
    // Merge the fixed text colour into whatever inline styles Highlight
    // already produces (background-color, data-color, etc.)
    const existing = (HTMLAttributes.style as string) || "";
    const style = existing
      ? `color: #1a1a1a; ${existing}`
      : "color: #1a1a1a";

    return [
      "mark",
      { ...HTMLAttributes, style },
      0, // content hole
    ];
  },
});
