'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface TagChordDiagramProps {
  books: { tags: string[] }[];
}

function buildMatrix(books: { tags: string[] }[], topN: number) {
  const freq = new Map<string, number>();
  for (const book of books) {
    for (const tag of book.tags) {
      freq.set(tag, (freq.get(tag) || 0) + 1);
    }
  }

  const topTags = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([tag]) => tag);

  const tagIndex = new Map(topTags.map((t, i) => [t, i]));
  const n = topTags.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const book of books) {
    const relevant = book.tags.filter((t) => tagIndex.has(t));
    for (let i = 0; i < relevant.length; i++) {
      for (let j = i + 1; j < relevant.length; j++) {
        const a = tagIndex.get(relevant[i])!;
        const b = tagIndex.get(relevant[j])!;
        matrix[a][b] += 1;
        matrix[b][a] += 1;
      }
    }
  }

  return { topTags, matrix };
}

const CHORD_COLORS = [
  '#ef4444', '#3b82f6', '#a855f7', '#22c55e', '#ec4899',
  '#f97316', '#f59e0b', '#14b8a6', '#6366f1', '#06b6d4',
  '#8b5cf6', '#10b981', '#f43f5e', '#0ea5e9', '#84cc16',
  '#d946ef', '#64748b', '#fb923c', '#2dd4bf', '#a3e635',
  '#e11d48', '#7c3aed', '#059669', '#0284c7', '#ca8a04',
  '#be185d', '#4f46e5', '#047857', '#0369a1', '#a16207',
];

export function TagChordDiagram({ books }: TagChordDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { topTags, matrix } = useMemo(() => buildMatrix(books, 30), [books]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    if (!svg || !tooltip || topTags.length < 2) return;

    const size = 500;
    const outerRadius = size / 2 - 60;
    const innerRadius = outerRadius - 20;

    const sel = d3.select(svg);
    sel.selectAll('*').remove();
    sel
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = sel.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

    const chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);
    const chords = chord(matrix);

    const arc = d3.arc<d3.ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(innerRadius);

    const color = (i: number) => CHORD_COLORS[i % CHORD_COLORS.length];

    const tip = d3.select(tooltip);

    g.append('g')
      .selectAll('path')
      .data(chords)
      .join('path')
      .attr('d', ribbon as unknown as string)
      .attr('fill', (d) => color(d.source.index))
      .attr('fill-opacity', 0.6)
      .attr('stroke', 'none')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill-opacity', 0.9);
        const src = topTags[d.source.index];
        const tgt = topTags[d.target.index];
        const count = d.source.value;
        tip
          .style('opacity', '1')
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY - 10}px`)
          .html(`<strong>${src}</strong> ↔ <strong>${tgt}</strong><br/>${count} shared book${count !== 1 ? 's' : ''}`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill-opacity', 0.6);
        tip.style('opacity', '0');
      });

    const group = g.append('g')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    group.append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.index))
      .attr('stroke', 'var(--color-background)')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        tip
          .style('opacity', '1')
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY - 10}px`)
          .html(`<strong>${topTags[d.index]}</strong><br/>${d.value} co-occurrence${d.value !== 1 ? 's' : ''}`);
      })
      .on('mouseout', () => {
        tip.style('opacity', '0');
      });

    group.append('text')
      .each((d) => {
        (d as d3.ChordGroup & { angle: number }).angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '0.35em')
      .attr('transform', (d) => {
        const angle = (d as d3.ChordGroup & { angle: number }).angle;
        const rotate = (angle * 180) / Math.PI - 90;
        const flip = angle > Math.PI;
        return `rotate(${rotate}) translate(${outerRadius + 8})${flip ? ' rotate(180)' : ''}`;
      })
      .attr('text-anchor', (d) => {
        const angle = (d as d3.ChordGroup & { angle: number }).angle;
        return angle > Math.PI ? 'end' : 'start';
      })
      .attr('font-size', '9px')
      .attr('fill', 'var(--color-foreground)')
      .text((d) => {
        const label = topTags[d.index];
        return label.length > 18 ? label.slice(0, 16) + '…' : label;
      });
  }, [topTags, matrix]);

  if (topTags.length < 2) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Not enough tag data to display chord diagram.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border">
      <svg ref={svgRef} className="h-[500px] w-full" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute rounded-md bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity"
      />
    </div>
  );
}
