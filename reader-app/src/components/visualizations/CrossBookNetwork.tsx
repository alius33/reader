'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface CrossBookNetworkProps {
  bookId: string;
  crossReferences: { targetBookId: string | null; targetTitle: string }[];
  referencedBy: { sourceBookId: string; targetTitle: string }[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  isCenter: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const CATEGORY_HEX: Record<string, string> = {
  'Awareness & Protection': '#ef4444',
  'Career Strategy': '#3b82f6',
  'Leadership & Management': '#a855f7',
  'Mindset & Self-Mastery': '#22c55e',
  'Parenting & Child Development': '#ec4899',
  'Personal Brand & Presence': '#f97316',
  'Power & Influence': '#f59e0b',
  'Psychology & Decision Making': '#14b8a6',
  'Robert Greene Canon': '#78716c',
  'Strategy & Systems Thinking': '#6366f1',
  'Wisdom & Big Ideas': '#eab308',
  'Workplace Navigation': '#06b6d4',
};

function getCategoryColor(index: number): string {
  const palette = Object.values(CATEGORY_HEX);
  return palette[index % palette.length];
}

export function CrossBookNetwork({
  bookId,
  crossReferences,
  referencedBy,
}: CrossBookNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const buildGraph = useCallback(() => {
    if (typeof window === 'undefined') return;
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const width = container.clientWidth;
    const height = 400;

    const nodeMap = new Map<string, GraphNode>();
    nodeMap.set(bookId, { id: bookId, title: 'This Book', isCenter: true });

    const links: GraphLink[] = [];

    crossReferences.forEach((ref, i) => {
      const targetId = ref.targetBookId || `unresolved-${i}`;
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, { id: targetId, title: ref.targetTitle, isCenter: false });
      }
      links.push({ source: bookId, target: targetId });
    });

    referencedBy.forEach((ref) => {
      if (!nodeMap.has(ref.sourceBookId)) {
        nodeMap.set(ref.sourceBookId, {
          id: ref.sourceBookId,
          title: ref.targetTitle,
          isCenter: false,
        });
      }
      links.push({ source: ref.sourceBookId, target: bookId });
    });

    const nodes = Array.from(nodeMap.values());
    if (nodes.length <= 1) return;

    const sel = d3.select(svg);
    sel.selectAll('*').remove();
    sel.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const g = sel.append('g');

    sel.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--color-muted-foreground)');

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--color-muted-foreground)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node.append('circle')
      .attr('r', (d) => (d.isCenter ? 14 : 9))
      .attr('fill', (d, i) => (d.isCenter ? 'var(--color-primary)' : getCategoryColor(i)))
      .attr('stroke', 'var(--color-background)')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d) => {
        const label = d.isCenter ? 'This Book' : d.title;
        return label.length > 24 ? label.slice(0, 22) + '…' : label;
      })
      .attr('x', 0)
      .attr('y', (d) => (d.isCenter ? -20 : -14))
      .attr('text-anchor', 'middle')
      .attr('font-size', (d) => (d.isCenter ? '11px' : '10px'))
      .attr('font-weight', (d) => (d.isCenter ? '600' : '400'))
      .attr('fill', 'var(--color-foreground)');

    node.on('click', (_, d) => {
      if (!d.isCenter && d.id && !d.id.startsWith('unresolved')) {
        window.location.href = `/book/${d.id}`;
      }
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    sel.call(zoom);

    return () => {
      simulation.stop();
    };
  }, [bookId, crossReferences, referencedBy]);

  useEffect(() => {
    const cleanup = buildGraph();
    const resizeObserver = new ResizeObserver(() => {
      buildGraph();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      cleanup?.();
      resizeObserver.disconnect();
    };
  }, [buildGraph]);

  const hasData = crossReferences.length > 0 || referencedBy.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        No cross-references found for this book.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-border">
      <svg ref={svgRef} className="h-[400px] w-full" />
    </div>
  );
}
