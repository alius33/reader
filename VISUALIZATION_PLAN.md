# Rich Visualization Plan — Chart.js + D3.js + Mermaid

## Context

The reader-app exists specifically to go beyond what Obsidian can do. The whole point is interactive Chart.js charts, D3.js infographics, and rich visuals that Obsidian can't render. The app already has a working MermaidNode Tiptap extension — we replicate that exact pattern for two new node types.

## Two Phases

**Phase 1:** Build ChartNode and D3Node Tiptap extensions in the reader-app. ~10 files touched. Run this as a single Claude Code / Cursor session with the Phase 1 prompt below.

**Phase 2:** Agents process 181 books in 19 batches, adding 3-5 rich visualizations per book using ```chartjs, ```d3, and ```mermaid syntax. Run each batch as a separate Cursor prompt.

## Important Notes

- All file paths are relative to the project root (the `reader` directory)
- The repo should be cloned/pulled fresh before starting
- Both phases use Claude 4.6 Opus with 1M token context window
- Phase 1 MUST be completed and verified (build passes) before starting Phase 2

---

## Phase 1: App Changes — Copy-Paste This Prompt

Paste this entire block into Claude Code or Cursor as a single prompt. It will build everything.

```
You are Claude 4.6 Opus with a 1 million token context window. You are working in a Next.js reader-app that renders book summaries using Tiptap editor. The app already has a MermaidNode Tiptap extension that renders Mermaid diagrams from fenced code blocks in markdown.

## Task

Build two NEW Tiptap node extensions — ChartNode (for Chart.js) and D3Node (for D3.js) — that follow the EXACT same pattern as the existing MermaidNode. Then wire them into the parser, exporter, editor, and CSS.

## Step 0: Read the existing pattern

Before writing ANY code, read these files completely to understand the pattern you're replicating:
1. reader-app/src/components/editor/extensions/MermaidNode.ts — the full extension
2. reader-app/src/lib/import/parseMarkdown.ts — how ```mermaid blocks become mermaidDiagram nodes
3. reader-app/src/lib/export/toMarkdown.ts — how mermaidDiagram nodes export back to markdown
4. reader-app/src/components/editor/Editor.tsx — how MermaidNode is registered
5. reader-app/src/lib/import/extractContentStats.ts — how diagrams are counted
6. reader-app/src/app/editor.css — mermaid block CSS styles
7. reader-app/src/app/globals.css — mermaid reader-content styles
8. reader-app/src/components/visualizations/CrossBookNetwork.tsx — D3 force graph pattern to reuse
9. reader-app/package.json — current dependencies

## Step 1: Install Chart.js

Run: cd reader-app && npm install chart.js

## Step 2: Create reader-app/src/components/editor/extensions/ChartNode.ts

Follow MermaidNode.ts pattern EXACTLY. Key specs:
- name: "chartDiagram", group: "block", atom: true
- Single "source" attribute (string — the Chart.js JSON config)
- parseHTML: [{ tag: "div[data-chart-diagram]" }]
- renderHTML: same pattern as MermaidNode, with data-chart-diagram attribute
- addNodeView() creates DOM structure:
  - div.chart-block[data-chart-diagram]
    - div.chart-header-bar (label "Chart.js" + "Edit Source" button)
    - div.chart-canvas-area containing a <canvas>
    - pre.chart-source-pre > code (hidden fallback on error)
- Lazy-load chart.js via: const ChartJS = await import("chart.js/auto") then use ChartJS.default
- renderChart(source) function: JSON.parse the source, create new Chart(canvas, config)
- MUST destroy() existing chart instance before re-rendering
- Color palettes — define two arrays (15 colors each) for light and dark mode:
  - Light: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#d35400', '#2980b9', '#27ae60', '#8e44ad', '#c0392b', '#16a085', '#f1c40f']
  - Dark: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#82e0aa', '#f0b27a', '#85c1e9', '#f1948a', '#73c6b6', '#aed6f1', '#d7bde2', '#f5b041', '#76d7c4', '#fadbd8']
- applyTheme(config, isDark): auto-assign dataset colors from palette, set text/grid colors for dark mode
- Dark mode detection: document.documentElement.classList.contains("dark") — same as MermaidNode
- MutationObserver on document.documentElement watching "class" attribute changes to re-render on dark mode toggle
- ResizeObserver on the container to call chart.resize()
- Edit mode: identical textarea pattern to MermaidNode (toggle with Edit Source button)
- destroy() callback: destroy chart instance, disconnect MutationObserver, disconnect ResizeObserver
- Error handling: on JSON parse error or Chart.js error, hide canvas, show source code with red error message (same as MermaidNode)

## Step 3: Create reader-app/src/components/editor/extensions/D3Node.ts

Same Tiptap Node pattern:
- name: "d3Diagram", group: "block", atom: true
- Single "source" attribute (string — JSON with { type, data, options })
- parseHTML: [{ tag: "div[data-d3-diagram]" }]
- addNodeView() creates:
  - div.d3-block[data-d3-diagram]
    - div.d3-header-bar (label "D3.js Visualization" + "Edit Source" button)
    - div.d3-svg-area containing an <svg> element (viewBox-based, responsive)
    - pre.d3-source-pre > code (hidden fallback on error)

Four built-in renderer functions dispatched by config.type:

1. renderTreemap(svg, data, options, isDark):
   - Input: { name: "Root", children: [{ name, value }, ...] }
   - Use d3.hierarchy() and d3.treemap() with d3.treemapSquarify
   - Render colored <rect> elements with white text labels inside
   - viewBox-based responsive sizing (e.g. viewBox="0 0 600 400")

2. renderForceGraph(svg, data, options, isDark):
   - Input: { nodes: [{ id, label, group }], links: [{ source, target }] }
   - Use d3.forceSimulation with forceLink, forceManyBody, forceCenter, forceCollide
   - REUSE the pattern from CrossBookNetwork.tsx for drag behavior and force config
   - Nodes colored by group, labels positioned near nodes

3. renderSankey(svg, data, options, isDark):
   - Input: { nodes: [{ id }], links: [{ source, target, value }] }
   - Implement simple left-to-right flow WITHOUT importing d3-sankey:
     a. Build DAG from links
     b. Topological sort to assign column indices
     c. Within each column, distribute nodes vertically proportional to total flow
     d. Draw cubic bezier paths between source/target with opacity proportional to value
   - Colored flow paths, node labels on the left of each rect

4. renderHeatmap(svg, data, options, isDark):
   - Input: { xLabels: [...], yLabels: [...], values: [[...], ...] }
   - SVG grid of <rect> elements colored by value using d3.interpolateBlues (light) or d3.interpolateOranges (dark)
   - Axis labels on left and bottom, optional value text in cells

Dispatcher: const RENDERERS = { treemap: renderTreemap, force: renderForceGraph, sankey: renderSankey, heatmap: renderHeatmap }

Same dark mode / resize / edit / error / destroy patterns as ChartNode.

## Step 4: Edit reader-app/src/lib/import/parseMarkdown.ts

Find the case "code" block where node.lang === "mermaid" is checked. Add after it:

if (node.lang === "chartjs") {
  return { type: "chartDiagram", attrs: { source: node.value } };
}
if (node.lang === "d3") {
  return { type: "d3Diagram", attrs: { source: node.value } };
}

## Step 5: Edit reader-app/src/lib/export/toMarkdown.ts

Find the case "mermaidDiagram" line. Add after it:

case "chartDiagram":
  return `\`\`\`chartjs\n${node.attrs?.source || ""}\n\`\`\``;
case "d3Diagram":
  return `\`\`\`d3\n${node.attrs?.source || ""}\n\`\`\``;

## Step 6: Edit reader-app/src/components/editor/Editor.tsx

Import ChartNode and D3Node alongside MermaidNode. Add both to the extensions array.

## Step 7: Edit reader-app/src/lib/import/extractContentStats.ts

Find where mermaidDiagram is counted. Add chartDiagram and d3Diagram counting too.

## Step 8: Add CSS

In reader-app/src/app/editor.css — add .chart-block, .chart-header-bar, .chart-edit-btn, .chart-canvas-area, .chart-source-pre, .chart-textarea and .d3-block equivalents. Follow the exact same structure as the .mermaid-block CSS already in the file. Include .dark variants.

In reader-app/src/app/globals.css — add .reader-content [data-chart-diagram] and .reader-content [data-d3-diagram] styles for unconstrained sizing, matching the mermaid pattern.

## Step 9: Create a test file

Create reader-app/content/test-charts.md with this content to verify all chart types work:

---
date: 2026-01-01
type: book-summary
tags: [test]
author: Test
title: "Chart Test"
year: 2026
---

# Chart Test

## Chart.js Radar
```chartjs
{
  "type": "radar",
  "data": {
    "labels": ["A", "B", "C", "D", "E"],
    "datasets": [{ "label": "Test", "data": [8, 6, 9, 4, 7] }]
  },
  "options": { "plugins": { "title": { "display": true, "text": "Radar Test" } }, "scales": { "r": { "beginAtZero": true, "max": 10 } } }
}
```

## Chart.js Doughnut
```chartjs
{
  "type": "doughnut",
  "data": {
    "labels": ["Work", "Rest", "Play"],
    "datasets": [{ "data": [50, 30, 20] }]
  },
  "options": { "plugins": { "title": { "display": true, "text": "Time Split" } } }
}
```

## Chart.js Line
```chartjs
{
  "type": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
    "datasets": [{ "label": "Growth", "data": [10, 25, 45, 70, 95], "tension": 0.3 }]
  },
  "options": { "plugins": { "title": { "display": true, "text": "Growth Curve" } } }
}
```

## D3 Treemap
```d3
{
  "type": "treemap",
  "data": {
    "name": "Root",
    "children": [
      { "name": "Alpha", "value": 40 },
      { "name": "Beta", "value": 30 },
      { "name": "Gamma", "value": 20 },
      { "name": "Delta", "value": 10 }
    ]
  },
  "options": { "title": "Treemap Test" }
}
```

## D3 Force Graph
```d3
{
  "type": "force",
  "data": {
    "nodes": [
      { "id": "a", "label": "Center", "group": 1 },
      { "id": "b", "label": "Node B", "group": 2 },
      { "id": "c", "label": "Node C", "group": 2 },
      { "id": "d", "label": "Node D", "group": 3 }
    ],
    "links": [
      { "source": "a", "target": "b" },
      { "source": "a", "target": "c" },
      { "source": "b", "target": "d" }
    ]
  },
  "options": { "title": "Force Graph Test" }
}
```

## D3 Heatmap
```d3
{
  "type": "heatmap",
  "data": {
    "xLabels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "yLabels": ["Morning", "Afternoon", "Evening"],
    "values": [[8, 6, 7, 9, 5], [4, 7, 8, 6, 3], [2, 3, 4, 5, 7]]
  },
  "options": { "title": "Productivity Heatmap" }
}
```

## D3 Sankey
```d3
{
  "type": "sankey",
  "data": {
    "nodes": [{ "id": "Input" }, { "id": "A" }, { "id": "B" }, { "id": "Output" }],
    "links": [
      { "source": "Input", "target": "A", "value": 60 },
      { "source": "Input", "target": "B", "value": 40 },
      { "source": "A", "target": "Output", "value": 60 },
      { "source": "B", "target": "Output", "value": 40 }
    ]
  },
  "options": { "title": "Sankey Flow Test" }
}
```

## Step 10: Build and verify

Run: cd reader-app && npm run build
Fix any TypeScript or build errors.
Then run: npm run dev
Navigate to the app, seed the test file, and verify all charts render in both light and dark mode.
Delete test-charts.md after verification.

You have 1M tokens of context. Complete ALL steps without stopping.
```

---

## Phase 2: Cursor Prompt Template

```
You are Claude 4.6 Opus with a 1 million token context window. You have MORE than enough context to process all books in this batch. Do NOT stop early. Do NOT ask for confirmation between books. Process ALL books listed below, one by one, until the entire batch is complete.

## Task

Add 3-5 NEW rich visualizations to each book summary listed below. Use a MIX of these three systems:

1. **Chart.js** (```chartjs) — for data-driven charts: radar, bar, doughnut, line, polarArea, bubble
2. **D3.js** (```d3) — for infographics: treemap, force graph, sankey flow, heatmap
3. **Mermaid** (```mermaid) — for diagrams: flowchart, timeline, stateDiagram-v2, sequenceDiagram, mindmap, quadrantChart, pie, gantt

Every book should get at LEAST 1 Chart.js and 1 D3.js visualization. The rest can be any mix.

## Chart.js Examples (```chartjs blocks)

Radar chart — comparing dimensions of a concept:
```chartjs
{
  "type": "radar",
  "data": {
    "labels": ["Empathy", "Assertiveness", "Strategic Thinking", "Self-Awareness", "Resilience", "Communication"],
    "datasets": [{
      "label": "Effective Leader",
      "data": [9, 8, 9, 8, 7, 9]
    }, {
      "label": "Average Manager",
      "data": [5, 6, 4, 3, 5, 6]
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Leadership Competency Profile" } },
    "scales": { "r": { "beginAtZero": true, "max": 10 } }
  }
}
```

Bar chart — comparing quantities:
```chartjs
{
  "type": "bar",
  "data": {
    "labels": ["System 1", "System 2"],
    "datasets": [{
      "label": "Speed (ms)",
      "data": [50, 3000]
    }, {
      "label": "Accuracy (%)",
      "data": [60, 95]
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "System 1 vs System 2 Performance" } }
  }
}
```

Doughnut chart — proportions:
```chartjs
{
  "type": "doughnut",
  "data": {
    "labels": ["Deep Work", "Shallow Work", "Breaks", "Admin"],
    "datasets": [{ "data": [40, 30, 15, 15] }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Ideal Daily Time Allocation" } }
  }
}
```

Line chart — trends over time:
```chartjs
{
  "type": "line",
  "data": {
    "labels": ["Year 1", "Year 3", "Year 5", "Year 10", "Year 20"],
    "datasets": [{
      "label": "Deliberate Practice",
      "data": [10, 35, 60, 85, 98],
      "tension": 0.3
    }, {
      "label": "Casual Practice",
      "data": [10, 15, 18, 20, 22],
      "tension": 0.3
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Skill Development Trajectories" } }
  }
}
```

## D3.js Examples (```d3 blocks)

Treemap — showing hierarchical proportions:
```d3
{
  "type": "treemap",
  "data": {
    "name": "Mental Models",
    "children": [
      { "name": "Psychology", "value": 30 },
      { "name": "Economics", "value": 25 },
      { "name": "Biology", "value": 20 },
      { "name": "Physics", "value": 15 },
      { "name": "Mathematics", "value": 10 }
    ]
  },
  "options": { "title": "Munger's Mental Model Distribution" }
}
```

Force graph — showing concept relationships:
```d3
{
  "type": "force",
  "data": {
    "nodes": [
      { "id": "habit", "label": "Habit Loop", "group": 1 },
      { "id": "cue", "label": "Cue", "group": 2 },
      { "id": "routine", "label": "Routine", "group": 2 },
      { "id": "reward", "label": "Reward", "group": 2 },
      { "id": "craving", "label": "Craving", "group": 3 }
    ],
    "links": [
      { "source": "habit", "target": "cue" },
      { "source": "habit", "target": "routine" },
      { "source": "habit", "target": "reward" },
      { "source": "cue", "target": "craving" },
      { "source": "craving", "target": "routine" }
    ]
  },
  "options": { "title": "The Habit Loop" }
}
```

Sankey — showing flow/allocation:
```d3
{
  "type": "sankey",
  "data": {
    "nodes": [
      { "id": "Input" }, { "id": "System 1" }, { "id": "System 2" },
      { "id": "Fast Decision" }, { "id": "Slow Decision" }, { "id": "Error" }
    ],
    "links": [
      { "source": "Input", "target": "System 1", "value": 80 },
      { "source": "Input", "target": "System 2", "value": 20 },
      { "source": "System 1", "target": "Fast Decision", "value": 60 },
      { "source": "System 1", "target": "Error", "value": 20 },
      { "source": "System 2", "target": "Slow Decision", "value": 18 },
      { "source": "System 2", "target": "Error", "value": 2 }
    ]
  },
  "options": { "title": "Decision Processing Flow" }
}
```

Heatmap — showing matrix/correlation:
```d3
{
  "type": "heatmap",
  "data": {
    "xLabels": ["Analyst", "Accommodator", "Assertive"],
    "yLabels": ["Data Focus", "Relationship", "Speed", "Conflict Comfort"],
    "values": [
      [9, 3, 5],
      [3, 9, 4],
      [2, 5, 9],
      [4, 2, 8]
    ]
  },
  "options": { "title": "Negotiation Style Matrix" }
}
```

## Mermaid Examples (```mermaid blocks)

Use for: timeline, stateDiagram-v2, sequenceDiagram, mindmap, quadrantChart, pie, gantt, flowchart. Existing mermaid diagrams stay unless clearly broken.

## JSON Rules — CRITICAL

- Valid JSON only: double quotes, no trailing commas, no comments, no single quotes
- No JavaScript expressions — pure JSON data
- Chart titles are REQUIRED for every chart
- Keep data arrays to 4-10 items (not too sparse, not too cluttered)

## Process for EACH book

1. Read the summary from `reader-app/content/[Category]/[Title - Author].md` in 500-line chunks
2. Identify 3-5 visualization opportunities:
   - Multi-dimensional comparisons → radar chart (chartjs)
   - Proportions/distributions → doughnut or treemap
   - Trends/progression → line chart (chartjs)
   - Concept relationships → force graph (d3)
   - Resource/energy flow → sankey (d3)
   - Scoring matrices → heatmap (d3)
   - Historical sequences → timeline (mermaid)
   - State transitions → stateDiagram-v2 (mermaid)
   - 2x2 frameworks → quadrantChart (mermaid)
3. Insert each visualization at the contextually appropriate location using surgical edits
4. Add 1 interpretation sentence below each new visualization
5. After editing reader-app/content/, copy the modified file to summaries/ to keep them in sync: cp "reader-app/content/[Category]/[File]" "summaries/[Category]/[File]"

## Rules

- Do NOT remove existing diagrams unless clearly broken
- Do NOT cluster visualizations at the end — place where the concept is discussed
- Do NOT rewrite entire files — use targeted edits only
- Read in 500-line chunks, write surgical edits
- After finishing each book, immediately move to the next
- You have 1M tokens of context. USE IT. Process the entire batch.
- EVERY book must get at least 1 chartjs and 1 d3 visualization

## Books in this batch

[PASTE BATCH LIST HERE]

All paths are relative to the project root.
Content path: reader-app/content/
Mirror path: summaries/

Process ALL books above. Do not stop until every book has been enhanced.
```

---

## Batch Lists (19 Batches, 181 Books)

### Batch 1: Awareness & Protection (10 of 14)
1. Adult Children of Emotionally Immature Parents - Lindsay C. Gibson (Awareness & Protection)
2. Children of the Self-Absorbed - Nina W. Brown (Awareness & Protection)
3. Complex PTSD - Pete Walker (Awareness & Protection)
4. Disarming the Narcissist - Wendy Behary (Awareness & Protection)
5. Emotional Blackmail - Susan Forward (Awareness & Protection)
6. In Sheep's Clothing - George K. Simon (Awareness & Protection)
7. Recovering From Emotionally Immature Parents - Lindsay C. Gibson (Awareness & Protection)
8. Running on Empty - Jonice Webb (Awareness & Protection)
9. The Gaslight Effect - Robin Stern (Awareness & Protection)
10. The Sociopath Next Door - Martha Stout (Awareness & Protection)

### Batch 2: Awareness & Protection (4) + Career Strategy (6)
1. Toxic Parents - Susan Forward (Awareness & Protection)
2. When I Say No I Feel Guilty - Manuel J. Smith (Awareness & Protection)
3. Who's Pulling Your Strings - Harriet B. Braiker (Awareness & Protection)
4. Will the Drama Ever End - Karyl McBride (Awareness & Protection)
5. Career Warfare - David D'Alessandro (Career Strategy)
6. Expect to Win - Carla A. Harris (Career Strategy)
7. Invaluable - Maya Grossman (Career Strategy)
8. Nice Girls Don't Get the Corner Office - Lois P. Frankel (Career Strategy)
9. Rise - Patty Azzarello (Career Strategy)
10. Stealing the Corner Office - Brendan Reid (Career Strategy)

### Batch 3: Career Strategy (5) + Personal Brand & Presence (5)
1. Strategize to Win - Carla A. Harris (Career Strategy)
2. The First 90 Days - Michael D. Watkins (Career Strategy)
3. The Unspoken Truths for Career Success - Tessa White (Career Strategy)
4. What Got You Here Won't Get You There - Marshall Goldsmith (Career Strategy)
5. Who Gets Promoted, Who Doesn't, and Why - Donald Asher (Career Strategy)
6. Executive Presence - Sylvia Ann Hewlett (Personal Brand & Presence)
7. Gravitas - Caroline Goyder (Personal Brand & Presence)
8. The Credibility Code - Cara Hale Alter (Personal Brand & Presence)
9. The Start-Up of You - Reid Hoffman & Ben Casnocha (Personal Brand & Presence)
10. The Unnatural Networker - Charlie Lawson (Personal Brand & Presence)

### Batch 4: Leadership & Management (10 of 18)
1. 7 Rules of Power - Jeffrey Pfeffer (Leadership & Management)
2. An Elegant Puzzle - Will Larson (Leadership & Management)
3. High Output Management - Andrew S. Grove (Leadership & Management)
4. Making Things Happen - Scott Berkun (Leadership & Management)
5. Measure What Matters - John Doerr (Leadership & Management)
6. The Culture Code - Daniel Coyle (Leadership & Management)
7. The Effective Executive - Peter Drucker (Leadership & Management)
8. The Four Obsessions of an Extraordinary Executive - Patrick M. Lencioni (Leadership & Management)
9. The Infinite Game - Simon Sinek (Leadership & Management)
10. The Innovator's Dilemma - Clayton M. Christensen (Leadership & Management)

### Batch 5: Leadership & Management (8)
1. The Lean Startup - Eric Ries (Leadership & Management)
2. The Motive - Patrick M. Lencioni (Leadership & Management)
3. The Phoenix Project - Gene Kim (Leadership & Management)
4. Tribes - Seth Godin (Leadership & Management)
5. Winning Now Winning Later - David M. Cote (Leadership & Management)
6. Wooden on Leadership - John Wooden (Leadership & Management)
7. Working Backwards - Colin Bryar & Bill Carr (Leadership & Management)
8. Zero to One - Peter Thiel (Leadership & Management)

### Batch 6: Mindset & Self-Mastery (10 of 31)
1. 12 Rules for Life - Jordan Peterson (Mindset & Self-Mastery)
2. 13 Things Mentally Strong People Don't Do - Amy Morin (Mindset & Self-Mastery)
3. A Mind for Numbers - Barbara Oakley (Mindset & Self-Mastery)
4. An Astronaut's Guide to Life on Earth - Chris Hadfield (Mindset & Self-Mastery)
5. Deep Work - Cal Newport (Mindset & Self-Mastery)
6. Discourses - Epictetus (Mindset & Self-Mastery)
7. Don't Believe Everything You Think - Joseph Nguyen (Mindset & Self-Mastery)
8. Edge - Laura Huang (Mindset & Self-Mastery)
9. Enjoying the Gift of Being Uncommon - Willem Kuipers (Mindset & Self-Mastery)
10. Essentialism - Greg McKeown (Mindset & Self-Mastery)

### Batch 7: Mindset & Self-Mastery (11-20)
1. Feel the Fear and Do It Anyway - Susan Jeffers (Mindset & Self-Mastery)
2. How to Fail at Almost Everything and Still Win Big - Scott Adams (Mindset & Self-Mastery)
3. How to Take Smart Notes - Sonke Ahrens (Mindset & Self-Mastery)
4. How Will You Measure Your Life - Clayton M. Christensen (Mindset & Self-Mastery)
5. Letters From a Stoic - Seneca (Mindset & Self-Mastery)
6. Man's Search for Meaning - Viktor Frankl (Mindset & Self-Mastery)
7. Meditations - Marcus Aurelius (Mindset & Self-Mastery)
8. Mindset - Carol S. Dweck (Mindset & Self-Mastery)
9. Not Nice - Aziz Gazipura (Mindset & Self-Mastery)
10. Originals - Adam Grant (Mindset & Self-Mastery)

### Batch 8: Mindset & Self-Mastery (21-31)
1. Peak - Anders Ericsson (Mindset & Self-Mastery)
2. Range - David Epstein (Mindset & Self-Mastery)
3. Relentless - Tim S. Grover (Mindset & Self-Mastery)
4. Siddhartha - Hermann Hesse (Mindset & Self-Mastery)
5. So Good They Can't Ignore You - Cal Newport (Mindset & Self-Mastery)
6. StrengthsFinder 2.0 - Tom Rath (Mindset & Self-Mastery)
7. The Almanack of Naval Ravikant - Eric Jorgenson (Mindset & Self-Mastery)
8. The Daily Stoic - Ryan Holiday (Mindset & Self-Mastery)
9. The Four Agreements - Don Miguel Ruiz (Mindset & Self-Mastery)
10. The Road to Character - David Brooks (Mindset & Self-Mastery)
11. The Subtle Art of Not Giving a F-ck - Mark Manson (Mindset & Self-Mastery)

### Batch 9: Parenting & Child Development (10 of 23)
1. 1-2-3 Magic - Thomas W. Phelan (Parenting & Child Development)
2. Brain Rules for Baby - John Medina (Parenting & Child Development)
3. Child Education in Islam - Abdullah Ulwan (Parenting & Child Development)
4. Cribsheet - Emily Oster (Parenting & Child Development)
5. How to Talk So Kids Will Listen - Adele Faber & Elaine Mazlish (Parenting & Child Development)
6. How to Talk So Little Kids Will Listen - Joanna Faber & Julie King (Parenting & Child Development)
7. Hunt, Gather, Parent - Michaeleen Doucleff (Parenting & Child Development)
8. No Bad Kids - Janet Lansbury (Parenting & Child Development)
9. No-Drama Discipline - Daniel J. Siegel (Parenting & Child Development)
10. Nurturing Eeman in Children - Aisha Hamdan (Parenting & Child Development)

### Batch 10: Parenting & Child Development (13)
1. Parenting from the Inside Out - Daniel J. Siegel (Parenting & Child Development)
2. Peaceful Parent Happy Kids - Laura Markham (Parenting & Child Development)
3. Positive Parenting in the Muslim Home - Noha Alshugairi & Munira Lekovic Ezzeldine (Parenting & Child Development)
4. Precious Little Sleep - Alexis Dubief (Parenting & Child Development)
5. Raising Your Spirited Child - Mary Sheedy Kurcinka (Parenting & Child Development)
6. Simplicity Parenting - Kim John Payne (Parenting & Child Development)
7. The Danish Way of Parenting - Jessica Joelle Alexander (Parenting & Child Development)
8. The Explosive Child - Ross W. Greene (Parenting & Child Development)
9. The Gardener and the Carpenter - Alison Gopnik (Parenting & Child Development)
10. The Montessori Toddler - Simone Davies (Parenting & Child Development)
11. The Self-Driven Child - William Stixrud & Ned Johnson (Parenting & Child Development)
12. The Whole-Brain Child - Daniel J. Siegel (Parenting & Child Development)
13. Unconditional Parenting - Alfie Kohn (Parenting & Child Development)

### Batch 11: Power & Influence (10 of 21)
1. Corporate Confidential - Cynthia Shapiro (Power & Influence)
2. Crucial Conversations - Kerry Patterson (Power & Influence)
3. Fierce Conversations - Susan Scott (Power & Influence)
4. Games People Play - Eric Berne (Power & Influence)
5. Getting to Yes - Roger Fisher & William Ury (Power & Influence)
6. How to Win Friends and Influence People - Dale Carnegie (Power & Influence)
7. Humour Seriously - Jennifer Aaker (Power & Influence)
8. Influence - Robert Cialdini (Power & Influence)
9. Like Switch - Jack Schafer (Power & Influence)
10. Managing with Power - Jeffrey Pfeffer (Power & Influence)

### Batch 12: Power & Influence (11)
1. Never Eat Alone - Keith Ferrazzi (Power & Influence)
2. Never Split the Difference - Chris Voss (Power & Influence)
3. Power - Jeffrey Pfeffer (Power & Influence)
4. Pre-Suasion - Robert Cialdini (Power & Influence)
5. The Art of Reading Minds - Henrik Fexeus (Power & Influence)
6. The Charisma Myth - Olivia Fox Cabane (Power & Influence)
7. The Power Paradox - Dacher Keltner (Power & Influence)
8. The Prince - Niccolo Machiavelli (Power & Influence)
9. What Every Body Is Saying - Joe Navarro (Power & Influence)
10. Words That Change Minds - Shelle Rose Charvet (Power & Influence)
11. Yes! 50 Scientifically Proven Ways - Goldstein, Martin & Cialdini (Power & Influence)

### Batch 13: Psychology & Decision Making (8 of 16)
1. Antifragile - Nassim Nicholas Taleb (Psychology & Decision Making)
2. Atlas of the Heart - Brene Brown (Psychology & Decision Making)
3. Emotional Intelligence - Daniel Goleman (Psychology & Decision Making)
4. Noise - Cass R. Sunstein (Psychology & Decision Making)
5. Power vs Force - David R. Hawkins (Psychology & Decision Making)
6. Predictably Irrational - Dan Ariely (Psychology & Decision Making)
7. Skin in the Game - Nassim Nicholas Taleb (Psychology & Decision Making)
8. The Black Swan - Nassim Nicholas Taleb (Psychology & Decision Making)

### Batch 14: Psychology & Decision Making (8)
1. The Body Keeps the Score - Bessel van der Kolk (Psychology & Decision Making)
2. The Expectation Effect - David Robson (Psychology & Decision Making)
3. The Psychology of Money - Morgan Housel (Psychology & Decision Making)
4. Thinking Fast and Slow - Daniel Kahneman (Psychology & Decision Making)
5. Thinking in Bets - Annie Duke (Psychology & Decision Making)
6. Trust Me I'm Lying - Ryan Holiday (Psychology & Decision Making)
7. You Are Not So Smart - David McRaney (Psychology & Decision Making)
8. Your Brain at Work - David Rock (Psychology & Decision Making)

### Batch 15: Robert Greene Canon (8)
1. Interviews with the Masters - Robert Greene (Robert Greene Canon)
2. Mastery - Robert Greene (Robert Greene Canon)
3. The 33 Strategies of War - Robert Greene (Robert Greene Canon)
4. The 48 Laws of Power - Robert Greene (Robert Greene Canon)
5. The 50th Law - 50 Cent & Robert Greene (Robert Greene Canon)
6. The Art of Seduction - Robert Greene (Robert Greene Canon)
7. The Daily Laws - Robert Greene (Robert Greene Canon)
8. The Laws of Human Nature - Robert Greene (Robert Greene Canon)

### Batch 16: Strategy & Systems Thinking (10 of 19)
1. Critical Thinking - Richard W. Paul (Strategy & Systems Thinking)
2. Digital Transformation - Thomas M. Siebel (Strategy & Systems Thinking)
3. Good Strategy Bad Strategy - Richard Rumelt (Strategy & Systems Thinking)
4. How Asia Works - Joe Studwell (Strategy & Systems Thinking)
5. How to Measure Anything - Douglas Hubbard (Strategy & Systems Thinking)
6. Made to Stick - Chip Heath & Dan Heath (Strategy & Systems Thinking)
7. Making Numbers Count - Chip Heath (Strategy & Systems Thinking)
8. Playing to Win - A.G. Lafley & Roger L. Martin (Strategy & Systems Thinking)
9. Predatory Thinking - Dave Trott (Strategy & Systems Thinking)
10. Sapiens - Yuval Noah Harari (Strategy & Systems Thinking)

### Batch 17: Strategy & Systems Thinking (9)
1. Seeking Wisdom - Peter Bevelin (Strategy & Systems Thinking)
2. Storytelling with Data - Cole Nussbaumer Knaflic (Strategy & Systems Thinking)
3. Strategy A History - Lawrence Freedman (Strategy & Systems Thinking)
4. Superforecasting - Philip E. Tetlock & Dan Gardner (Strategy & Systems Thinking)
5. The Art of War - Sun Tzu (Strategy & Systems Thinking)
6. The Checklist Manifesto - Atul Gawande (Strategy & Systems Thinking)
7. The Pyramid Principle - Barbara Minto (Strategy & Systems Thinking)
8. Thinking in Systems - Donella H. Meadows (Strategy & Systems Thinking)
9. Thinking Strategically - Avinash K. Dixit & Barry J. Nalebuff (Strategy & Systems Thinking)

### Batch 18: Wisdom & Big Ideas (10)
1. Humankind - Rutger Bregman (Wisdom & Big Ideas)
2. Invent and Wander - Jeff Bezos (Wisdom & Big Ideas)
3. Poor Charlie's Almanack - Charles T. Munger (Wisdom & Big Ideas)
4. Principles - Ray Dalio (Wisdom & Big Ideas)
5. The Changing World Order - Ray Dalio (Wisdom & Big Ideas)
6. The Dictator's Handbook - Bruce Bueno de Mesquita (Wisdom & Big Ideas)
7. The Law of Success - Napoleon Hill (Wisdom & Big Ideas)
8. The Richest Man in Babylon - George C. Clason (Wisdom & Big Ideas)
9. The Road Less Stupid - Keith J. Cunningham (Wisdom & Big Ideas)
10. Tribe of Mentors - Timothy Ferriss (Wisdom & Big Ideas)

### Batch 19: Workplace Navigation (5)
1. Managing Up - Mary Abbajay (Workplace Navigation)
2. Secrets to Winning at Office Politics - Marie G. McIntyre (Workplace Navigation)
3. Snakes in Suits - Babiak & Hare (Workplace Navigation)
4. The Right and Wrong Stuff - Carter Cast (Workplace Navigation)
5. Thriving at Work - Dennis Mark & Michael Dam (Workplace Navigation)

---

## Verification (after all batches)

1. **Count visualizations per book:**
```bash
for f in reader-app/content/**/*.md; do
  cjs=$(grep -c '```chartjs' "$f" 2>/dev/null || echo 0)
  d3=$(grep -c '```d3' "$f" 2>/dev/null || echo 0)
  mm=$(grep -c '```mermaid' "$f" 2>/dev/null || echo 0)
  echo "$cjs chartjs, $d3 d3, $mm mermaid: $(basename "$f")"
done
```

2. **Validate JSON in all chartjs/d3 blocks** (run a quick script)

3. **Mirror sync:** `diff -rq reader-app/content/ summaries/ --exclude=.obsidian`

4. **Re-seed database:** `cd reader-app && npx tsx prisma/seed.ts --source ../reader-app/content`

5. **Visual spot-check:** Open 10 books, verify charts render, dark mode works, edit mode works

---

## Key Files Reference

| File | Action |
|------|--------|
| `reader-app/src/components/editor/extensions/ChartNode.ts` | CREATE — Chart.js Tiptap extension |
| `reader-app/src/components/editor/extensions/D3Node.ts` | CREATE — D3.js Tiptap extension |
| `reader-app/src/components/editor/extensions/MermaidNode.ts` | READ — pattern to replicate |
| `reader-app/src/lib/import/parseMarkdown.ts` | EDIT — add chartjs/d3 code block detection |
| `reader-app/src/lib/export/toMarkdown.ts` | EDIT — add chartjs/d3 export cases |
| `reader-app/src/components/editor/Editor.tsx` | EDIT — register new extensions |
| `reader-app/src/lib/import/extractContentStats.ts` | EDIT — count new node types |
| `reader-app/src/app/editor.css` | EDIT — add chart/d3 block styles |
| `reader-app/src/app/globals.css` | EDIT — add reader-content chart styles |
| `reader-app/package.json` | EDIT — add chart.js dependency |
