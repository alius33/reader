export interface BookMeta {
  id: string;
  title: string;
  author: string;
  year: number | null;
  categoryId: string;
  categoryName: string;
  subcategory: string | null;
  tags: string[];
  wordCount: number | null;
  summary: string | null;
  contentStats: ContentStats | null;
  sortOrder: number | null;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudioChapter {
  number: number;
  title: string;
  url: string;
}

export interface BookFull extends BookMeta {
  content: TiptapDoc;
  plainText: string;
  originalMarkdown: string | null;
  toc: TocEntry[] | null;
  audioChapters: AudioChapter[] | null;
  originalFileKey: string | null;
  originalFileType: string | null;
  coverImageKey: string | null;
  comments: CommentData[];
  crossReferences: CrossRefData[];
  referencedBy: CrossRefData[];
}

export interface TiptapDoc {
  type: "doc";
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export interface ContentStats {
  callouts: number;
  diagrams: number;
  stories: number;
  crossRefs: number;
}

export interface CommentData {
  id: string;
  markId: string;
  bookId: string;
  userId: string;
  selectedText: string;
  commentText: string;
  isMention?: boolean;
  user?: { name: string | null; image: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface CrossRefData {
  id: string;
  sourceBookId: string;
  targetBookId: string | null;
  targetTitle: string;
  context: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  categoryName: string;
  snippet: string;
  rank: number;
}

export interface ReelMeta {
  id: string;
  title: string;
  sourceUrl: string | null;
  sourceHandle: string | null;
  summary: string;
  keyPoints: string[];
  tags: string[];
  topic: string | null;
  duration: number | null;
  slideCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReelFull extends ReelMeta {
  caption: string | null;
  transcript: string | null;
  plainText: string;
}
