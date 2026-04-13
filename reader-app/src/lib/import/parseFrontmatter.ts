import matter from "gray-matter";

export interface BookFrontmatter {
  title: string;
  author: string;
  year: number | null;
  tags: string[];
  date: string | null;
  type: string | null;
  lectureNumber: number | null;
}

export function parseFrontmatter(markdown: string): {
  data: BookFrontmatter;
  content: string;
} {
  const { data, content } = matter(markdown);

  return {
    data: {
      title: String(data.title || "").replace(/^["']|["']$/g, ""),
      author: String(data.author || "Unknown"),
      year: data.year ? Number(data.year) : null,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      date: data.date ? String(data.date) : null,
      type: data.type ? String(data.type) : null,
      lectureNumber: data['lecture-number'] != null ? Number(data['lecture-number']) : null,
    },
    content,
  };
}
