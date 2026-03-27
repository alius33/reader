import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

const INDENTABLE_TYPES = ["paragraph", "heading", "bulletList", "orderedList"];
const MAX_INDENT = 8;

export const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types: INDENTABLE_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) =>
              parseInt(element.getAttribute("data-indent") || "0", 10),
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent === 0) return {};
              return {
                "data-indent": attributes.indent,
                style: `margin-left: ${attributes.indent * 2}em`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (INDENTABLE_TYPES.includes(node.type.name)) {
              const currentIndent = (node.attrs.indent as number) || 0;
              if (currentIndent < MAX_INDENT) {
                if (dispatch) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indent: currentIndent + 1,
                  });
                }
                changed = true;
              }
            }
          });
          return changed;
        },

      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (INDENTABLE_TYPES.includes(node.type.name)) {
              const currentIndent = (node.attrs.indent as number) || 0;
              if (currentIndent > 0) {
                if (dispatch) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indent: currentIndent - 1,
                  });
                }
                changed = true;
              }
            }
          });
          return changed;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // Don't intercept Tab inside tables — Tiptap uses it for cell navigation
        if (editor.isActive("table")) return false;
        return editor.commands.indent();
      },
      "Shift-Tab": ({ editor }) => {
        if (editor.isActive("table")) return false;
        return editor.commands.outdent();
      },
    };
  },
});
