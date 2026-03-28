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
