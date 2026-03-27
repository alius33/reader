import { Node, mergeAttributes } from "@tiptap/core";

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
}

let mermaidInstance: typeof import("mermaid").default | null = null;
let mermaidLoading = false;
const mermaidCallbacks: (() => void)[] = [];
let mermaidConfigVersion = 2; // bump to force re-init

async function getMermaid() {
  if (mermaidInstance) return mermaidInstance;
  if (mermaidLoading) {
    return new Promise<typeof import("mermaid").default>((resolve) => {
      mermaidCallbacks.push(() => resolve(mermaidInstance!));
    });
  }
  mermaidLoading = true;
  const mod = await import("mermaid");
  mermaidInstance = mod.default;
  mermaidInstance.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    flowchart: {
      useMaxWidth: false,
      htmlLabels: false,
      padding: 15,
      nodeSpacing: 50,
      rankSpacing: 50,
    },
    themeVariables: {
      fontSize: "14px",
    },
  });
  for (const cb of mermaidCallbacks) cb();
  mermaidCallbacks.length = 0;
  return mermaidInstance;
}

let renderCounter = 0;

export const MermaidNode = Node.create<MermaidOptions>({
  name: "mermaidDiagram",
  group: "block",
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      source: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-source") || "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-mermaid-diagram]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-mermaid-diagram": "",
        "data-source": HTMLAttributes.source,
      }),
      ["pre", {}, ["code", {}, HTMLAttributes.source]],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-mermaid-diagram", "");
      Object.assign(dom.style, {
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        marginBlock: "8px",
        overflow: "hidden",
        background: "#fff",
      });

      const header = document.createElement("div");
      Object.assign(header.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 12px",
        background: "#f3f4f6",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "0.8em",
        color: "#6b7280",
        fontWeight: "600",
        userSelect: "none",
      });

      const label = document.createElement("span");
      label.textContent = "Mermaid Diagram";
      header.appendChild(label);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Source";
      Object.assign(editBtn.style, {
        fontSize: "0.85em",
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer",
        color: "#374151",
      });
      header.appendChild(editBtn);
      dom.appendChild(header);

      // Rendered diagram container
      const diagramContainer = document.createElement("div");
      Object.assign(diagramContainer.style, {
        padding: "16px",
        display: "flex",
        justifyContent: "center",
        overflowX: "auto",
        overflowY: "hidden",
        minHeight: "100px",
      });
      dom.appendChild(diagramContainer);

      // Source code view (hidden by default)
      const pre = document.createElement("pre");
      Object.assign(pre.style, {
        margin: "0",
        padding: "12px",
        fontSize: "0.85em",
        lineHeight: "1.5",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        display: "none",
      });
      const code = document.createElement("code");
      code.textContent = node.attrs.source;
      pre.appendChild(code);
      dom.appendChild(pre);

      let editing = false;

      // Render the mermaid diagram
      async function renderDiagram(source: string) {
        try {
          const mermaid = await getMermaid();
          const id = `mermaid-${++renderCounter}`;
          const { svg } = await mermaid.render(id, source);
          diagramContainer.innerHTML = svg;
          const svgEl = diagramContainer.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "none";
            svgEl.style.width = "auto";
            svgEl.style.height = "auto";
          }
          diagramContainer.style.display = "flex";
          pre.style.display = "none";
        } catch {
          // Render failed — show source with error
          diagramContainer.innerHTML = "";
          diagramContainer.style.display = "none";
          code.textContent = source;
          pre.style.display = "block";
          const errMsg = document.createElement("div");
          Object.assign(errMsg.style, {
            padding: "8px 12px",
            fontSize: "0.8em",
            color: "#dc2626",
            background: "#fef2f2",
          });
          errMsg.textContent = "Failed to render diagram — showing source";
          if (!dom.querySelector("[data-mermaid-error]")) {
            errMsg.setAttribute("data-mermaid-error", "");
            dom.insertBefore(errMsg, pre);
          }
        }
      }

      renderDiagram(node.attrs.source);

      function enterEditMode() {
        if (editing) return;
        editing = true;
        editBtn.textContent = "Done";

        diagramContainer.style.display = "none";
        const existing = dom.querySelector("[data-mermaid-error]");
        if (existing) existing.remove();

        const textarea = document.createElement("textarea");
        textarea.value =
          typeof getPos === "function"
            ? (editor.state.doc.nodeAt(getPos())?.attrs.source ?? node.attrs.source)
            : node.attrs.source;
        Object.assign(textarea.style, {
          width: "100%",
          minHeight: "120px",
          padding: "12px",
          fontSize: "0.85em",
          lineHeight: "1.5",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          border: "none",
          outline: "none",
          resize: "vertical",
          background: "#fff",
          boxSizing: "border-box",
          display: "block",
        });

        pre.style.display = "none";
        dom.appendChild(textarea);
        textarea.focus();

        function save() {
          if (!editing) return;
          editing = false;
          editBtn.textContent = "Edit Source";
          const newSource = textarea.value;

          if (textarea.parentNode) textarea.remove();

          if (typeof getPos === "function") {
            const pos = getPos();
            const currentAttrs =
              editor.state.doc.nodeAt(pos)?.attrs ?? node.attrs;
            editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...currentAttrs,
                source: newSource,
              });
              return true;
            });
          }

          renderDiagram(newSource);
        }

        textarea.addEventListener("blur", () => setTimeout(save, 150));
        editBtn.addEventListener("click", save, { once: true });
      }

      editBtn.addEventListener("click", () => {
        if (!editing) enterEditMode();
      });

      return { dom };
    };
  },
});

export default MermaidNode;
