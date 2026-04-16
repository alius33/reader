"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "./CategoryCard";
import { getCategoryIcon } from "./categoryIcons";

interface CategoryDTO {
  slug: string;
  name: string;
  count: number;
  contentType: "book" | "lecture" | "podcast" | "concept";
}

interface CategoryGridProps {
  type: "book" | "lecture" | "podcast" | "concept";
}

export function CategoryGrid({ type }: CategoryGridProps) {
  const { data: categories = [], isLoading } = useQuery<CategoryDTO[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((r) => (r.ok ? r.json() : [])),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No categories yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((c) => (
        <CategoryCard
          key={c.slug}
          slug={c.slug}
          name={c.name}
          count={c.count}
          icon={getCategoryIcon(c.name)}
        />
      ))}
    </div>
  );
}
