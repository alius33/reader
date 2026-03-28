import { Node, mergeAttributes } from "@tiptap/core";

export interface D3Options {
  HTMLAttributes: Record<string, unknown>;
}

const PALETTE = [
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
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

function getColor(i: number, isDark: boolean) {
  const p = isDark ? DARK_PALETTE : PALETTE;
  return p[i % p.length];
}

function renderTreemap(
  svg: SVGSVGElement,
  data: { name: string; children: { name: string; value: number }[] },
  options: any,
  isDark: boolean
) {
  import("d3").then((d3) => {
    const W = 600, H = 400;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    if (options?.title) {
      sel.append("text").attr("x", W / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("font-size", "14px").attr("font-weight", "600")
        .attr("fill", isDark ? "#e5e7eb" : "#374151").text(options.title);
    }

    const root = d3.hierarchy(data).sum((d: any) => d.value || 0).sort((a, b) => (b.value || 0) - (a.value || 0));
    const treemap = d3.treemap<any>().size([W, H - 30]).padding(2).tile(d3.treemapSquarify);
    treemap(root);

    const g = sel.append("g").attr("transform", "translate(0,30)");
    const leaves = root.leaves();

    g.selectAll("rect").data(leaves).join("rect")
      .attr("x", (d: any) => d.x0).attr("y", (d: any) => d.y0)
      .attr("width", (d: any) => d.x1 - d.x0).attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (_: any, i: number) => getColor(i, isDark))
      .attr("rx", 3).attr("opacity", 0.85);

    g.selectAll("text").data(leaves).join("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2).attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-size", (d: any) => Math.min(14, (d.x1 - d.x0) / 6) + "px")
      .attr("fill", "#fff").attr("font-weight", "500")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        return w > 40 ? d.data.name : "";
      });
  });
}

function renderForceGraph(
  svg: SVGSVGElement,
  data: { nodes: { id: string; label: string; group: number }[]; links: { source: string; target: string }[] },
  options: any,
  isDark: boolean
) {
  import("d3").then((d3) => {
    const W = 600, H = 400;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    if (options?.title) {
      sel.append("text").attr("x", W / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("font-size", "14px").attr("font-weight", "600")
        .attr("fill", isDark ? "#e5e7eb" : "#374151").text(options.title);
    }

    const nodes = data.nodes.map((n) => ({ ...n }));
    const links = data.links.map((l) => ({ ...l }));

    const g = sel.append("g");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links as any).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide().radius(25));

    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af").attr("stroke-opacity", 0.6).attr("stroke-width", 1.5);

    const node = g.append("g").selectAll<SVGGElement, any>("g").data(nodes).join("g").attr("cursor", "grab");

    node.call(
      d3.drag<SVGGElement, any>()
        .on("start", (event: any, d: any) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event: any, d: any) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event: any, d: any) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

    node.append("circle").attr("r", 10)
      .attr("fill", (d: any) => getColor(d.group || 0, isDark))
      .attr("stroke", isDark ? "#1e1e1e" : "#fff").attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.label || d.id)
      .attr("x", 0).attr("y", -16).attr("text-anchor", "middle")
      .attr("font-size", "10px").attr("font-weight", "500")
      .attr("fill", isDark ? "#e5e7eb" : "#374151");

    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    (svg as any).__simulation = simulation;
  });
}

function renderSankey(
  svg: SVGSVGElement,
  data: { nodes: { id: string }[]; links: { source: string; target: string; value: number }[] },
  options: any,
  isDark: boolean
) {
  import("d3").then((d3) => {
    const W = 600, H = 400, PAD = 50;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    const titleOffset = options?.title ? 30 : 0;
    if (options?.title) {
      sel.append("text").attr("x", W / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("font-size", "14px").attr("font-weight", "600")
        .attr("fill", isDark ? "#e5e7eb" : "#374151").text(options.title);
    }

    const nodeMap = new Map<string, number>();
    data.nodes.forEach((n, i) => nodeMap.set(n.id, i));

    const adj = new Map<string, string[]>();
    const inDeg = new Map<string, number>();
    data.nodes.forEach((n) => { adj.set(n.id, []); inDeg.set(n.id, 0); });
    data.links.forEach((l) => {
      adj.get(l.source)?.push(l.target);
      inDeg.set(l.target, (inDeg.get(l.target) || 0) + 1);
    });

    const columns: string[][] = [];
    const assigned = new Set<string>();
    let queue = data.nodes.filter((n) => (inDeg.get(n.id) || 0) === 0).map((n) => n.id);
    while (queue.length > 0) {
      columns.push(queue);
      queue.forEach((id) => assigned.add(id));
      const next: string[] = [];
      queue.forEach((id) => {
        (adj.get(id) || []).forEach((t) => {
          if (!assigned.has(t) && !next.includes(t)) {
            const allParentsAssigned = data.links
              .filter((l) => l.target === t)
              .every((l) => assigned.has(l.source));
            if (allParentsAssigned) next.push(t);
          }
        });
      });
      if (next.length === 0 && assigned.size < data.nodes.length) {
        data.nodes.forEach((n) => { if (!assigned.has(n.id)) next.push(n.id); });
      }
      queue = next;
    }

    const numCols = columns.length;
    const colWidth = (W - PAD * 2) / Math.max(numCols - 1, 1);
    const nodeWidth = 18;
    const usableH = H - titleOffset - 40;

    const nodeFlows = new Map<string, number>();
    data.nodes.forEach((n) => {
      const inFlow = data.links.filter((l) => l.target === n.id).reduce((s, l) => s + l.value, 0);
      const outFlow = data.links.filter((l) => l.source === n.id).reduce((s, l) => s + l.value, 0);
      nodeFlows.set(n.id, Math.max(inFlow, outFlow, 1));
    });

    const nodePositions = new Map<string, { x: number; y: number; h: number }>();
    columns.forEach((col, ci) => {
      const totalFlow = col.reduce((s, id) => s + (nodeFlows.get(id) || 1), 0);
      const scale = usableH / (totalFlow + col.length * 5);
      let y = titleOffset + 20;
      col.forEach((id) => {
        const h = Math.max((nodeFlows.get(id) || 1) * scale, 12);
        nodePositions.set(id, { x: PAD + ci * colWidth, y, h });
        y += h + 5;
      });
    });

    const g = sel.append("g");

    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();
    data.nodes.forEach((n) => { sourceOffsets.set(n.id, 0); targetOffsets.set(n.id, 0); });

    data.links.forEach((l, i) => {
      const sp = nodePositions.get(l.source);
      const tp = nodePositions.get(l.target);
      if (!sp || !tp) return;
      const sOff = sourceOffsets.get(l.source) || 0;
      const tOff = targetOffsets.get(l.target) || 0;
      const thickness = Math.max((l.value / (nodeFlows.get(l.source) || 1)) * sp.h, 2);

      const x0 = sp.x + nodeWidth;
      const y0 = sp.y + sOff + thickness / 2;
      const x1 = tp.x;
      const y1 = tp.y + tOff + thickness / 2;

      g.append("path")
        .attr("d", `M${x0},${y0} C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}`)
        .attr("fill", "none")
        .attr("stroke", getColor(i, isDark))
        .attr("stroke-width", thickness)
        .attr("stroke-opacity", 0.4);

      sourceOffsets.set(l.source, sOff + thickness);
      targetOffsets.set(l.target, tOff + thickness);
    });

    data.nodes.forEach((n, i) => {
      const pos = nodePositions.get(n.id);
      if (!pos) return;
      g.append("rect").attr("x", pos.x).attr("y", pos.y)
        .attr("width", nodeWidth).attr("height", pos.h)
        .attr("fill", getColor(i, isDark)).attr("rx", 2);
      g.append("text").attr("x", pos.x - 4).attr("y", pos.y + pos.h / 2)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("font-size", "10px").attr("fill", isDark ? "#e5e7eb" : "#374151")
        .text(n.id);
    });
  });
}

function renderHeatmap(
  svg: SVGSVGElement,
  data: { xLabels: string[]; yLabels: string[]; values: number[][] },
  options: any,
  isDark: boolean
) {
  import("d3").then((d3) => {
    const marginL = 80, marginT = options?.title ? 50 : 30, marginB = 40, marginR = 20;
    const cols = data.xLabels.length, rows = data.yLabels.length;
    const cellW = Math.max(50, Math.min(80, (600 - marginL - marginR) / cols));
    const cellH = Math.max(30, Math.min(50, (400 - marginT - marginB) / rows));
    const W = marginL + cols * cellW + marginR;
    const H = marginT + rows * cellH + marginB;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    if (options?.title) {
      sel.append("text").attr("x", W / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("font-size", "14px").attr("font-weight", "600")
        .attr("fill", isDark ? "#e5e7eb" : "#374151").text(options.title);
    }

    const allVals = data.values.flat();
    const minV = Math.min(...allVals), maxV = Math.max(...allVals);
    const colorScale = isDark
      ? d3.scaleSequential(d3.interpolateOranges).domain([minV, maxV])
      : d3.scaleSequential(d3.interpolateBlues).domain([minV, maxV]);

    const g = sel.append("g").attr("transform", `translate(${marginL},${marginT})`);

    data.values.forEach((row, ri) => {
      row.forEach((val, ci) => {
        g.append("rect").attr("x", ci * cellW).attr("y", ri * cellH)
          .attr("width", cellW - 1).attr("height", cellH - 1)
          .attr("fill", colorScale(val) as string).attr("rx", 2);
        if (cellW > 35 && cellH > 20) {
          g.append("text").attr("x", ci * cellW + cellW / 2).attr("y", ri * cellH + cellH / 2)
            .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
            .attr("font-size", "11px").attr("fill", val > (maxV + minV) / 2 ? "#fff" : isDark ? "#e5e7eb" : "#374151")
            .text(val);
        }
      });
    });

    data.yLabels.forEach((label, i) => {
      g.append("text").attr("x", -6).attr("y", i * cellH + cellH / 2)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("font-size", "10px").attr("fill", isDark ? "#e5e7eb" : "#374151").text(label);
    });

    data.xLabels.forEach((label, i) => {
      g.append("text").attr("x", i * cellW + cellW / 2).attr("y", rows * cellH + 16)
        .attr("text-anchor", "middle").attr("font-size", "10px")
        .attr("fill", isDark ? "#e5e7eb" : "#374151").text(label);
    });
  });
}

const RENDERERS: Record<string, (svg: SVGSVGElement, data: any, options: any, isDark: boolean) => void> = {
  treemap: renderTreemap,
  force: renderForceGraph,
  sankey: renderSankey,
  heatmap: renderHeatmap,
};

export const D3Node = Node.create<D3Options>({
  name: "d3Diagram",
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
    return [{ tag: "div[data-d3-diagram]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-d3-diagram": "",
        "data-source": HTMLAttributes.source,
      }),
      ["pre", {}, ["code", {}, HTMLAttributes.source]],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-d3-diagram", "");
      dom.className = "d3-block";

      const header = document.createElement("div");
      header.className = "d3-header-bar";
      const label = document.createElement("span");
      label.textContent = "D3.js Visualization";
      header.appendChild(label);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Source";
      editBtn.className = "d3-edit-btn";
      header.appendChild(editBtn);
      dom.appendChild(header);

      const svgArea = document.createElement("div");
      svgArea.className = "d3-svg-area";
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svgArea.appendChild(svgEl);
      dom.appendChild(svgArea);

      const pre = document.createElement("pre");
      pre.className = "d3-source-pre";
      const code = document.createElement("code");
      code.textContent = node.attrs.source;
      pre.appendChild(code);
      dom.appendChild(pre);

      let editing = false;
      let mutationObs: MutationObserver | null = null;
      let resizeObs: ResizeObserver | null = null;

      function renderD3(source: string) {
        try {
          const config = JSON.parse(source);
          const isDark = detectDarkMode();
          const renderer = RENDERERS[config.type];
          if (!renderer) throw new Error(`Unknown D3 type: ${config.type}`);

          renderer(svgEl, config.data, config.options, isDark);
          svgArea.style.display = "flex";
          pre.style.display = "none";
          const errEl = dom.querySelector("[data-d3-error]");
          if (errEl) errEl.remove();
        } catch (e) {
          svgArea.style.display = "none";
          code.textContent = source;
          pre.style.display = "block";
          if (!dom.querySelector("[data-d3-error]")) {
            const errMsg = document.createElement("div");
            errMsg.setAttribute("data-d3-error", "");
            Object.assign(errMsg.style, {
              padding: "8px 12px",
              fontSize: "0.8em",
              color: "#dc2626",
            });
            errMsg.textContent = "Failed to render visualization \u2014 " + (e instanceof Error ? e.message : "showing source");
            dom.insertBefore(errMsg, pre);
          }
        }
      }

      renderD3(node.attrs.source);

      mutationObs = new MutationObserver(() => {
        if (!editing) {
          const currentSource = typeof getPos === "function"
            ? editor.state.doc.nodeAt(getPos())?.attrs.source ?? node.attrs.source
            : node.attrs.source;
          renderD3(currentSource);
        }
      });
      mutationObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      resizeObs = new ResizeObserver(() => {});
      resizeObs.observe(svgArea);

      function enterEditMode() {
        if (editing) return;
        editing = true;
        editBtn.textContent = "Done";
        svgArea.style.display = "none";
        const existing = dom.querySelector("[data-d3-error]");
        if (existing) existing.remove();

        const textarea = document.createElement("textarea");
        textarea.value = typeof getPos === "function"
          ? (editor.state.doc.nodeAt(getPos())?.attrs.source ?? node.attrs.source)
          : node.attrs.source;
        textarea.className = "d3-textarea";
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
            const currentAttrs = editor.state.doc.nodeAt(pos)?.attrs ?? node.attrs;
            editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, { ...currentAttrs, source: newSource });
              return true;
            });
          }
          renderD3(newSource);
        }

        textarea.addEventListener("blur", () => setTimeout(save, 150));
        editBtn.addEventListener("click", save, { once: true });
      }

      editBtn.addEventListener("click", () => { if (!editing) enterEditMode(); });

      return {
        dom,
        destroy() {
          if ((svgEl as any).__simulation) (svgEl as any).__simulation.stop();
          if (mutationObs) mutationObs.disconnect();
          if (resizeObs) resizeObs.disconnect();
        },
      };
    };
  },
});

export default D3Node;
