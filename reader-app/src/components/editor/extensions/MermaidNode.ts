import { Node, mergeAttributes } from "@tiptap/core";

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
}

let mermaidInstance: typeof import("mermaid").default | null = null;
let mermaidLoading = false;
const mermaidCallbacks: (() => void)[] = [];
let currentMermaidTheme: string = "";

function detectDarkMode(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

async function getMermaid(isDark?: boolean) {
  const dark = isDark ?? detectDarkMode();
  const desiredTheme = dark ? "dark" : "default";

  if (mermaidInstance && currentMermaidTheme === desiredTheme) return mermaidInstance;

  if (!mermaidInstance) {
    if (mermaidLoading) {
      return new Promise<typeof import("mermaid").default>((resolve) => {
        mermaidCallbacks.push(() => resolve(mermaidInstance!));
      });
    }
    mermaidLoading = true;
    const mod = await import("mermaid");
    mermaidInstance = mod.default;
  }

  mermaidInstance.initialize({
    startOnLoad: false,
    theme: desiredTheme,
    securityLevel: "loose",
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      padding: 15,
      nodeSpacing: 50,
      rankSpacing: 50,
    },
    themeVariables:
      desiredTheme === "dark"
        ? {
            fontSize: "14px",
            primaryColor: "#4a6fa5",
            primaryTextColor: "#e5e7eb",
            primaryBorderColor: "#4b5563",
            lineColor: "#6b7280",
            secondaryColor: "#1e293b",
            tertiaryColor: "#1e1e2e",
            nodeTextColor: "#e5e7eb",
            mainBkg: "#2d3748",
            nodeBorder: "#4b5563",
            clusterBkg: "#1a202c",
            clusterBorder: "#4b5563",
            titleColor: "#e5e7eb",
            edgeLabelBackground: "#2d3748",
          }
        : { fontSize: "14px" },
  });
  currentMermaidTheme = desiredTheme;

  if (mermaidLoading) {
    for (const cb of mermaidCallbacks) cb();
    mermaidCallbacks.length = 0;
    mermaidLoading = false;
  }

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
      dom.className = "mermaid-block";

      const header = document.createElement("div");
      header.className = "mermaid-header-bar";

      const label = document.createElement("span");
      label.textContent = "Mermaid Diagram";
      header.appendChild(label);

      const headerRight = document.createElement("div");
      headerRight.style.display = "flex";
      headerRight.style.gap = "6px";
      headerRight.style.alignItems = "center";

      const expandBtn = document.createElement("button");
      expandBtn.className = "mermaid-edit-btn mermaid-expand-btn";
      expandBtn.innerHTML = "&#x26F6;";
      expandBtn.title = "Expand diagram";
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = dom.classList.toggle("mermaid-expanded");
        expandBtn.innerHTML = isExpanded ? "&#x2716;" : "&#x26F6;";
        expandBtn.title = isExpanded ? "Collapse diagram" : "Expand diagram";
      });
      headerRight.appendChild(expandBtn);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Source";
      editBtn.className = "mermaid-edit-btn";
      headerRight.appendChild(editBtn);
      header.appendChild(headerRight);
      dom.appendChild(header);

      // Rendered diagram container
      const diagramContainer = document.createElement("div");
      diagramContainer.className = "mermaid-diagram-area";
      dom.appendChild(diagramContainer);

      // Source code view (hidden by default)
      const pre = document.createElement("pre");
      pre.className = "mermaid-source-pre";
      const code = document.createElement("code");
      code.textContent = node.attrs.source;
      pre.appendChild(code);
      dom.appendChild(pre);

      let editing = false;

      // Render the mermaid diagram
      async function renderDiagram(source: string) {
        try {
          const isDark = detectDarkMode();
          const mermaid = await getMermaid(isDark);
          const id = `mermaid-${++renderCounter}`;
          const { svg } = await mermaid.render(id, source);
          diagramContainer.innerHTML = svg;
          const svgEl = diagramContainer.querySelector("svg");
          if (svgEl) {
            const intrinsicW = parseFloat(svgEl.getAttribute("width") || "0");
            const intrinsicH = parseFloat(svgEl.getAttribute("height") || "0");
            // Set viewBox if missing so the SVG can scale down when capped
            if (!svgEl.getAttribute("viewBox") && intrinsicW && intrinsicH) {
              svgEl.setAttribute("viewBox", `0 0 ${intrinsicW} ${intrinsicH}`);
            }
            // Keep intrinsic width so narrow diagrams don't stretch,
            // but cap at container width so wide ones shrink
            svgEl.style.width = `${intrinsicW}px`;
            svgEl.style.maxWidth = "100%";
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
          });
          errMsg.textContent = "Failed to render diagram \u2014 showing source";
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
        textarea.className = "mermaid-textarea";

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
