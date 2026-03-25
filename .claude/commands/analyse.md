---
description: Analyse a book and produce a structured analysis file
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /analyse — Book Analysis

Read a book file and produce a structured analysis for later summarisation.
This is Step 1 of the two-step workflow: analyse → summarize.

**Usage:**
- `/analyse <filename>` — analyse a specific file from `inbox/` (e.g. `/analyse thinking-fast-and-slow.pdf`)
- `/analyse` — scan `inbox/` for unprocessed books and analyse the first one found

---

## Pre-Flight

### If no arguments provided:
1. Scan `inbox/` for PDF/EPUB/MOBI files
2. Check `analysis/` for existing analysis files
3. Identify books in inbox that don't have a matching analysis file
4. If unprocessed books found: process the first one
5. If none: report "No unprocessed books found in inbox/"

### If filename provided:
1. Verify `inbox/$ARGUMENTS` exists and is readable
2. Check if `analysis/` already has an analysis for this book — if so, confirm with user before re-processing

---

## Step 1: Read the Book

Determine file format from extension and read the full text:

**PDF files:**
- Use the Read tool with `pages` parameter
- Read in batches of 20 pages: pages "1-20", "21-40", etc.
- Continue until all pages are read

**EPUB files:**
- Extract text using Python:
  ```bash
  pip install ebooklib beautifulsoup4 2>/dev/null
  python3 -c "
  import ebooklib
  from ebooklib import epub
  from bs4 import BeautifulSoup
  book = epub.read_epub('inbox/$FILEPATH')
  for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
      soup = BeautifulSoup(item.get_content(), 'html.parser')
      print(soup.get_text())
  " > /tmp/book_extract.txt
  ```
- Then read the extracted text file

**MOBI files:**
- Convert to EPUB first using Calibre:
  ```bash
  ebook-convert "inbox/$FILEPATH" /tmp/converted.epub
  ```
- Then follow the EPUB extraction process above
- If Calibre is not installed, tell the user: "Install Calibre from https://calibre-ebook.com — it's free. Then run this command again."

If any sections are unreadable (corrupted pages, image-only pages), note which sections were inaccessible.

---

## Step 2: Pass 1 — Structural Map

Before extracting anything, understand the book as a whole:

1. **Classify the book:** argument/polemic, taxonomy/framework, narrative/case-study, manual/how-to, compilation, interview collection, or hybrid?
2. **Identify the central thesis:** What is this author's model of how the world works? What problem are they solving?
3. **Map the argument structure:** How does the book flow? What builds on what? Where is the intellectual centre of gravity?
4. **Author context:** Who is this person, what is their background, and how does it shape their perspective?
5. **Audience:** Who was this written for? What assumptions does the author make about the reader?

---

## Step 3: Pass 2 — Deep Extraction

Process chapter-by-chapter. For each chapter/section, extract:

### Theoretical Frameworks & Mental Models
- Named models, taxonomies, categorisation systems
- Conceptual lenses for understanding the world
- For each: what it is, how it works, what it reveals that other models miss

### Key Principles (aim for 10-20 total)
Each principle MUST include ALL of:
- **The principle** — the claim, in your own words
- **The mechanism** — WHY it works (the underlying psychology, logic, or evidence)
- **When it applies** — the conditions under which this principle is most powerful
- **When it doesn't apply** — exceptions, counter-conditions, edge cases
- **Best evidence** — the author's strongest supporting example or data
- **Attribution** — chapter/section reference

### Evidence & Examples
- Strongest supporting examples (summarised, not quoted)
- Data, research citations, empirical grounding
- Distinguish anecdotal from systematic evidence

### Stories Worth Preserving
- The 5-10 most vivid, memorable stories in the book
- For each: who, what happened, why it matters, which concept it illustrates
- These will be the backbone of the human-readable summary

---

## Step 4: Pass 3 — Critique & Cross-Reference

Assess the book honestly:

1. **Assess strength:** Where is evidence strongest? Weakest? Absent?
2. **Surface assumptions:** What does the argument depend on that the author doesn't state?
3. **Test generalisability:** Is this advice context-dependent? What contexts is it written for vs. where would it break down?
4. **Cross-references to other books:**
   - Check `summaries/_index.md` for books on similar topics
   - Where existing summaries agree: note the convergence
   - Where they disagree: state both positions and conditions under which each applies

---

## Step 5: Pass 4 — Synthesis

Structure the analysis file for use by the `/summarize` command:

Write the analysis file to `analysis/author-lastname_short-title.md` with:

```markdown
---
date: YYYY-MM-DD
type: book-analysis
tags: [book-analysis, topic1, topic2]
author: Author Name
title: "Book Title"
year: YYYY
book-type: taxonomy|argument|manual|narrative|compilation|interview-collection|hybrid
source-file: inbox/original-filename.pdf
---

# Book Title — Author Name

## Classification & Context
[Book type, audience, author background]

## Central Thesis
[2-3 paragraphs — the author's core argument]

## Structural Map
[Chapter-by-chapter outline with key ideas per chapter]

## Key Frameworks
[Named models and mental models extracted]

## Key Principles
[10-20 principles with mechanism, evidence, conditions]

## Best Stories & Examples
[5-10 most vivid stories, summarised with who/what/why]

## Critique
[Honest assessment — strengths, weaknesses, assumptions, context-dependence]

## Cross-References
[Connections to other books in the vault]

## Summarisation Notes
[Recommended structure for the human summary, key content to preserve, suggested thematic groupings]
```

---

## Step 6: Update Index

After saving the analysis file:
1. Update `summaries/_index.md` — add row with status ANALYSED (no summary link yet). Wikilinks use `[[filename]]` format with no path prefix since the vault root is `summaries/`.

---

## Output Report

After analysis, report:
- **Book processed:** [Title] by [Author]
- **Analysis file:** [path]
- **Book type:** [classification]
- **Principles extracted:** [count]
- **Frameworks identified:** [count]
- **Stories preserved:** [count]
- **Cross-references:** [list of related books in vault]
- **Ready for:** `/summarize author-lastname_short-title`

---

## Important Safeguards

- NEVER reproduce large sections of copyrighted text — extract in your own wording
- Every claim must be attributable to a specific chapter/section
- If an insight cannot be grounded in the actual text, mark with `[INFERENCE]`
- Never hallucinate quotes — use short quotes sparingly, in quotation marks, only when clearly present
- If a principle seems like it SHOULD be in the book but you're not confident it IS, say so
- For books over 300 pages: spot-check 3 extracted principles against the source text
- Note any sections that were unreadable or inaccessible
