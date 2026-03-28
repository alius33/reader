import { Node, mergeAttributes } from "@tiptap/core";

export interface ChartOptions {
  HTMLAttributes: Record<string, unknown>;
}

const LIGHT_PALETTE = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
  "#1abc9c", "#e67e22", "#34495e", "#d35400", "#2980b9",
  "#27ae60", "#8e44ad", "#c0392b", "#16a085", "#f1c40f",
];

const DARK_PALETTE = [
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#f7dc6f", "#bb8fce",
  "#82e0aa", "#f0b27a", "#85c1e9", "#f1948a", "#73c6b6",
  "#aed6f1", "#d7bde2", "#f5b041", "#76d7c4", "#fadbd8",
];

function detectDarkMode(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

function applyTheme(config: any, isDark: boolean): any {
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const cfg = JSON.parse(JSON.stringify(config));

  if (cfg.data?.datasets) {
    cfg.data.datasets.forEach((ds: any, i: number) => {
      const color = palette[i % palette.length];
      if (!ds.backgroundColor) {
        if (["pie", "doughnut", "polarArea"].includes(cfg.type)) {
          ds.backgroundColor = cfg.data.labels
            ? cfg.data.labels.map((_: any, j: number) => palette[j % palette.length])
            : palette.slice(0, ds.data?.length || 5);
          ds.borderColor = isDark ? "#1e1e1e" : "#ffffff";
          ds.borderWidth = ds.borderWidth ?? 2;
        } else {
          ds.backgroundColor = color;
          ds.borderColor = color;
        }
      }
      if (cfg.type === "radar" && !ds.backgroundColor) {
        ds.backgroundColor = color + "33";
        ds.borderColor = color;
      }
      if (cfg.type === "radar" && ds.backgroundColor && !ds.backgroundColor.endsWith("33")) {
        // keep user-set colors
      }
    });
  }

  cfg.options = cfg.options || {};
  cfg.options.plugins = cfg.options.plugins || {};
  cfg.options.plugins.legend = cfg.options.plugins.legend || {};
  cfg.options.plugins.legend.labels = cfg.options.plugins.legend.labels || {};
  cfg.options.plugins.legend.labels.color = textColor;

  if (cfg.options.plugins.title) {
    cfg.options.plugins.title.color = textColor;
  }

  if (cfg.options.scales) {
    for (const key of Object.keys(cfg.options.scales)) {
      const scale = cfg.options.scales[key];
      scale.ticks = scale.ticks || {};
      scale.ticks.color = textColor;
      scale.grid = scale.grid || {};
      scale.grid.color = gridColor;
      if (scale.pointLabels) {
        scale.pointLabels.color = textColor;
      }
    }
  }

  if (cfg.type === "radar") {
    cfg.options.scales = cfg.options.scales || {};
    cfg.options.scales.r = cfg.options.scales.r || {};
    cfg.options.scales.r.ticks = cfg.options.scales.r.ticks || {};
    cfg.options.scales.r.ticks.color = textColor;
    cfg.options.scales.r.ticks.backdropColor = isDark ? "#1e1e1e" : "#ffffff";
    cfg.options.scales.r.pointLabels = cfg.options.scales.r.pointLabels || {};
    cfg.options.scales.r.pointLabels.color = textColor;
    cfg.options.scales.r.grid = cfg.options.scales.r.grid || {};
    cfg.options.scales.r.grid.color = gridColor;
    cfg.options.scales.r.angleLines = cfg.options.scales.r.angleLines || {};
    cfg.options.scales.r.angleLines.color = gridColor;
  }

  cfg.options.responsive = false;
  cfg.options.maintainAspectRatio = true;

  return cfg;
}

export const ChartNode = Node.create<ChartOptions>({
  name: "chartDiagram",
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
    return [{ tag: "div[data-chart-diagram]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-chart-diagram": "",
        "data-source": HTMLAttributes.source,
      }),
      ["pre", {}, ["code", {}, HTMLAttributes.source]],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-chart-diagram", "");
      dom.className = "chart-block";

      const header = document.createElement("div");
      header.className = "chart-header-bar";

      const label = document.createElement("span");
      label.textContent = "Chart.js";
      header.appendChild(label);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Source";
      editBtn.className = "chart-edit-btn";
      header.appendChild(editBtn);
      dom.appendChild(header);

      const canvasArea = document.createElement("div");
      canvasArea.className = "chart-canvas-area";
      const canvas = document.createElement("canvas");
      canvasArea.appendChild(canvas);
      dom.appendChild(canvasArea);

      const pre = document.createElement("pre");
      pre.className = "chart-source-pre";
      const code = document.createElement("code");
      code.textContent = node.attrs.source;
      pre.appendChild(code);
      dom.appendChild(pre);

      let chartInstance: any = null;
      let editing = false;
      let mutationObs: MutationObserver | null = null;
      let resizeObs: ResizeObserver | null = null;

      async function renderChart(source: string) {
        try {
          const ChartJS = await import("chart.js/auto");
          const ChartClass = ChartJS.default;

          if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
          }

          const parsed = JSON.parse(source);
          const isDark = detectDarkMode();
          const themed = applyTheme(parsed, isDark);

          const dpr = window.devicePixelRatio || 1;
          const displayWidth = canvasArea.clientWidth - 32 || 500;
          const displayHeight = Math.min(displayWidth * 0.65, 400);
          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;
          canvas.style.width = displayWidth + "px";
          canvas.style.height = displayHeight + "px";

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
            chartInstance = new ChartClass(ctx, themed);
          }

          canvasArea.style.display = "flex";
          pre.style.display = "none";
          const errEl = dom.querySelector("[data-chart-error]");
          if (errEl) errEl.remove();
        } catch (e) {
          canvasArea.style.display = "none";
          code.textContent = source;
          pre.style.display = "block";
          if (!dom.querySelector("[data-chart-error]")) {
            const errMsg = document.createElement("div");
            errMsg.setAttribute("data-chart-error", "");
            Object.assign(errMsg.style, {
              padding: "8px 12px",
              fontSize: "0.8em",
              color: "#dc2626",
            });
            errMsg.textContent =
              "Failed to render chart \u2014 " +
              (e instanceof Error ? e.message : "showing source");
            dom.insertBefore(errMsg, pre);
          }
        }
      }

      renderChart(node.attrs.source);

      mutationObs = new MutationObserver(() => {
        if (!editing) {
          const currentSource =
            typeof getPos === "function"
              ? editor.state.doc.nodeAt(getPos())?.attrs.source ?? node.attrs.source
              : node.attrs.source;
          renderChart(currentSource);
        }
      });
      mutationObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      resizeObs = new ResizeObserver(() => {
        if (chartInstance) {
          chartInstance.resize();
        }
      });
      resizeObs.observe(canvasArea);

      function enterEditMode() {
        if (editing) return;
        editing = true;
        editBtn.textContent = "Done";
        canvasArea.style.display = "none";
        const existing = dom.querySelector("[data-chart-error]");
        if (existing) existing.remove();

        const textarea = document.createElement("textarea");
        textarea.value =
          typeof getPos === "function"
            ? (editor.state.doc.nodeAt(getPos())?.attrs.source ?? node.attrs.source)
            : node.attrs.source;
        textarea.className = "chart-textarea";
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
          renderChart(newSource);
        }

        textarea.addEventListener("blur", () => setTimeout(save, 150));
        editBtn.addEventListener("click", save, { once: true });
      }

      editBtn.addEventListener("click", () => {
        if (!editing) enterEditMode();
      });

      return {
        dom,
        destroy() {
          if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
          }
          if (mutationObs) mutationObs.disconnect();
          if (resizeObs) resizeObs.disconnect();
        },
      };
    };
  },
});

export default ChartNode;
