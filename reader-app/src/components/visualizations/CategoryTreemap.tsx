'use client';

import { useCallback } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';

interface CategoryTreemapProps {
  categories: { name: string; bookCount: number }[];
  onCategoryClick?: (categoryName: string) => void;
}

const CATEGORY_PALETTE: Record<string, string> = {
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

const FALLBACK_COLORS = [
  '#8b5cf6', '#10b981', '#f43f5e', '#0ea5e9', '#84cc16',
  '#d946ef', '#64748b', '#fb923c', '#2dd4bf', '#a3e635',
];

function getColor(name: string, index: number): string {
  return CATEGORY_PALETTE[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function CustomCell(props: Record<string, unknown>) {
  const x = props.x as number;
  const y = props.y as number;
  const width = props.width as number;
  const height = props.height as number;
  const name = (props.name ?? '') as string;
  const bookCount = (props.bookCount ?? 0) as number;
  const fill = (props.fill ?? '#94a3b8') as string;
  const onClickHandler = props.onClickHandler as ((name: string) => void) | undefined;

  if (width < 4 || height < 4) return null;

  const showLabel = width > 60 && height > 30;
  const showCount = width > 40 && height > 20;
  const fontSize = Math.min(12, Math.max(9, width / 10));

  return (
    <g onClick={() => onClickHandler?.(name)} cursor="pointer">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={fill}
        fillOpacity={0.85}
        stroke="var(--color-background)"
        strokeWidth={2}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCount ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={fontSize}
          fontWeight={600}
        >
          {name.length > width / 7 ? name.slice(0, Math.floor(width / 7)) + '…' : name}
        </text>
      )}
      {showCount && showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + fontSize}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.8)"
          fontSize={fontSize - 1}
        >
          {bookCount} {bookCount === 1 ? 'book' : 'books'}
        </text>
      )}
    </g>
  );
}

export function CategoryTreemap({ categories, onCategoryClick }: CategoryTreemapProps) {
  const data = categories
    .filter((c) => c.bookCount > 0)
    .map((c, i) => ({
      name: c.name,
      size: c.bookCount,
      bookCount: c.bookCount,
      fill: getColor(c.name, i),
      onClickHandler: onCategoryClick,
    }));

  const handleClick = useCallback(
    (name: string) => {
      onCategoryClick?.(name);
    },
    [onCategoryClick],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        No categories with books found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <ResponsiveContainer width="100%" height={350}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          content={
            <CustomCell onClickHandler={handleClick} />
          }
        />
      </ResponsiveContainer>
    </div>
  );
}
