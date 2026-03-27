'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface TimelineBook {
  id: string;
  title: string;
  author: string;
  year: number | null;
  categoryName: string;
}

interface ReadingTimelineProps {
  books: TimelineBook[];
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

const FALLBACK_COLOR = '#94a3b8';

export function ReadingTimeline({ books }: ReadingTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const datedBooks = useMemo(
    () => books.filter((b): b is TimelineBook & { year: number } => b.year !== null),
    [books],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svg = svgRef.current;
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!svg || !container || !tooltip || datedBooks.length === 0) return;

    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 30 };

    const years = datedBooks.map((b) => b.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const xScale = d3.scaleLinear()
      .domain([minYear - 1, maxYear + 1])
      .range([margin.left, width - margin.right]);

    const categories = Array.from(new Set(datedBooks.map((b) => b.categoryName)));
    const yBand = d3.scaleBand()
      .domain(categories)
      .range([margin.top, height - margin.bottom])
      .padding(0.3);

    const sel = d3.select(svg);
    sel.selectAll('*').remove();
    sel.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(Math.min(10, maxYear - minYear + 1));
    sel.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'var(--color-muted-foreground)')
      .attr('font-size', '10px');

    sel.selectAll('.domain, .tick line')
      .attr('stroke', 'var(--color-border)');

    categories.forEach((cat) => {
      const yPos = (yBand(cat) ?? 0) + yBand.bandwidth() / 2;
      sel.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yPos)
        .attr('y2', yPos)
        .attr('stroke', 'var(--color-border)')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '2,4');
    });

    const tip = d3.select(tooltip);

    const jitter = new Map<string, number>();
    const yearCatCount = new Map<string, number>();
    datedBooks.forEach((b) => {
      const key = `${b.year}-${b.categoryName}`;
      const count = yearCatCount.get(key) || 0;
      jitter.set(b.id, (count - 0.5) * 12);
      yearCatCount.set(key, count + 1);
    });

    sel.append('g')
      .selectAll('circle')
      .data(datedBooks)
      .join('circle')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => {
        const base = (yBand(d.categoryName) ?? 0) + yBand.bandwidth() / 2;
        return base + (jitter.get(d.id) ?? 0);
      })
      .attr('r', 6)
      .attr('fill', (d) => CATEGORY_HEX[d.categoryName] ?? FALLBACK_COLOR)
      .attr('fill-opacity', 0.85)
      .attr('stroke', 'var(--color-background)')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 9).attr('fill-opacity', 1);
        tip
          .style('opacity', '1')
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 12}px`)
          .html(`<strong>${d.title}</strong><br/>${d.author} (${d.year})<br/><span style="opacity:0.7">${d.categoryName}</span>`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 6).attr('fill-opacity', 0.85);
        tip.style('opacity', '0');
      })
      .on('click', (_, d) => {
        window.location.href = `/book/${d.id}`;
      });

    const legend = sel.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top - 6})`);

    categories.forEach((cat, i) => {
      const xOff = i * 140;
      if (xOff + 130 > width) return;
      legend.append('circle')
        .attr('cx', xOff)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', CATEGORY_HEX[cat] ?? FALLBACK_COLOR);
      legend.append('text')
        .attr('x', xOff + 8)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .attr('font-size', '9px')
        .attr('fill', 'var(--color-muted-foreground)')
        .text(cat.length > 16 ? cat.slice(0, 14) + '…' : cat);
    });

    const resizeObserver = new ResizeObserver(() => {
      /* trigger re-render on resize via React */
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [datedBooks]);

  if (datedBooks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        No books with publication years to display.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg border border-border">
      <svg ref={svgRef} className="h-[300px] w-full" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute rounded-md bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity"
      />
    </div>
  );
}
