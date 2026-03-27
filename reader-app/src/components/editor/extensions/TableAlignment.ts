import Table from "@tiptap/extension-table";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableAlignment: {
      setTableAlignment: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

export const TableWithAlignment = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tableAlign: {
        default: "left",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-table-align") || "left",
        renderHTML: (attributes: Record<string, unknown>) => {
          const align = (attributes.tableAlign as string) || "left";
          const result: Record<string, string> = {
            "data-table-align": align,
          };
          if (align === "center") {
            result.style = "margin-left: auto; margin-right: auto;";
          } else if (align === "right") {
            result.style = "margin-left: auto;";
          }
          return result;
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableAlignment:
        (align: "left" | "center" | "right") =>
        ({ tr, state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "table") {
              if (dispatch) {
                const pos = $from.before(d);
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  tableAlign: align,
                });
              }
              return true;
            }
          }
          return false;
        },
    };
  },
});
