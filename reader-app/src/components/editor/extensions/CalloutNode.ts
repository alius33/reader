import { Node, mergeAttributes } from "@tiptap/core";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const CALLOUT_COLORS: Record<string, { border: string; bg: string; icon: string }> = {
  example:  { border: "#3b82f6", bg: "#eff6ff", icon: "📘" },
  tip:      { border: "#22c55e", bg: "#f0fdf4", icon: "💡" },
  warning:  { border: "#eab308", bg: "#fefce8", icon: "⚠️" },
  danger:   { border: "#ef4444", bg: "#fef2f2", icon: "🔴" },
  success:  { border: "#10b981", bg: "#ecfdf5", icon: "✅" },
  info:     { border: "#0ea5e9", bg: "#f0f9ff", icon: "ℹ️" },
  quote:    { border: "#6b7280", bg: "#f9fafb", icon: "💬" },
  note:     { border: "#a855f7", bg: "#faf5ff", icon: "📝" },
  abstract: { border: "#6366f1", bg: "#eef2ff", icon: "📄" },
};

function getColors(type: string) {
  return CALLOUT_COLORS[type] ?? CALLOUT_COLORS.info;
}

export const CalloutNode = Node.create<CalloutOptions>({
  name: "callout",
  group: "block",
  content: "block+",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      calloutType: { default: "info", parseHTML: (el) => el.getAttribute("data-callout-type") || "info" },
      title:       { default: "",    parseHTML: (el) => el.getAttribute("data-title") || "" },
      collapsible: { default: false, parseHTML: (el) => el.getAttribute("data-collapsible") === "true" },
      collapsed:   { default: false, parseHTML: (el) => el.getAttribute("data-collapsed") === "true" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-callout": "",
        "data-callout-type": HTMLAttributes.calloutType,
        "data-title": HTMLAttributes.title,
        "data-collapsible": String(HTMLAttributes.collapsible),
        "data-collapsed": String(HTMLAttributes.collapsed),
      }),
      ["div", { "data-callout-content": "" }, 0],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const { calloutType, title, collapsible, collapsed } = node.attrs;
      const colors = getColors(calloutType);

      const dom = document.createElement("div");
      dom.setAttribute("data-callout", "");
      dom.className = `callout-block callout-${calloutType}`;

      const header = document.createElement("div");
      header.className = "callout-title";
      if (collapsible) header.style.cursor = "pointer";

      const iconSpan = document.createElement("span");
      iconSpan.textContent = colors.icon;
      header.appendChild(iconSpan);

      const titleSpan = document.createElement("span");
      titleSpan.textContent = title || calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
      titleSpan.style.flex = "1";
      header.appendChild(titleSpan);

      let chevron: HTMLSpanElement | null = null;
      let isCollapsed = collapsed;

      if (collapsible) {
        chevron = document.createElement("span");
        Object.assign(chevron.style, {
          transition: "transform 0.15s ease",
          display: "inline-block",
          fontSize: "0.85em",
        });
        chevron.textContent = "\u25B6";
        chevron.style.transform = isCollapsed ? "rotate(0deg)" : "rotate(90deg)";
        header.appendChild(chevron);
      }

      dom.appendChild(header);

      const contentDOM = document.createElement("div");
      contentDOM.setAttribute("data-callout-content", "");
      contentDOM.className = "callout-body";
      if (isCollapsed) contentDOM.style.display = "none";
      dom.appendChild(contentDOM);

      if (collapsible) {
        header.addEventListener("click", () => {
          isCollapsed = !isCollapsed;
          contentDOM.style.display = isCollapsed ? "none" : "block";
          if (chevron) {
            chevron.style.transform = isCollapsed ? "rotate(0deg)" : "rotate(90deg)";
          }
          if (typeof getPos === "function") {
            const pos = getPos();
            const currentAttrs = editor.state.doc.nodeAt(pos)?.attrs ?? node.attrs;
            editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...currentAttrs,
                collapsed: isCollapsed,
              });
              return true;
            });
          }
        });
      }

      return { dom, contentDOM };
    };
  },
});

export default CalloutNode;
