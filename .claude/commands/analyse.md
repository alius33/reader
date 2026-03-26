---
description: Analyse a book and produce a structured analysis file
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /analyse — Book Analysis

Read a book's extracted text and produce a structured analysis for later summarisation.
This is Step 2 of the pipeline: extract → **analyse** → summarize.

**Usage:**
- `/analyse <filename>` — analyse a specific extracted file (e.g. `/analyse Deep Work - Cal Newport`)
- `/analyse` — scan for extracted books without analysis files and process the first one found

**Pre-requisite:** The book must have been extracted to `extracted/` first using `/extract`.

---

## Pre-Flight

### If no arguments provided:
1. Scan `extracted/` for `.txt` files
2. Check `analysis/` for existing analysis files
3. Identify extracted books that don't have a matching analysis file
4. If unprocessed books found: process the first one
5. If none: report "No unprocessed books found. Run `/extract` first."

### If arguments provided:
1. Search for a matching `.txt` file in `extracted/`:
   - Try `extracted/$ARGUMENTS.txt` first
   - If not found, search for partial filename matches in `extracted/`
2. If no extracted text found: report "No extracted text found for '$ARGUMENTS'. Run `/extract` first."
3. Check if `analysis/` already has an analysis for this book — if so, confirm with user before re-processing

---

## Step 1: Read the Extracted Text

Read the extracted text file from `extracted/`. This is plain text, already converted from the original format.

For large files (over 5000 lines), read in sections and process incrementally.

---

## Step 2: Pass 1 — Structural Map (then CHECKPOINT)

Before extracting anything, understand the book as a whole:

1. **Classify the book:** argument/polemic, taxonomy/framework, narrative/case-study, manual/how-to, compilation, interview collection, or hybrid?
2. **Identify the central thesis:** What is this author's model of how the world works? What problem are they solving?
3. **Map the argument structure:** How does the book flow? What builds on what? Where is the intellectual centre of gravity?
4. **Author context:** Who is this person, what is their background, and how does it shape their perspective?
5. **Audience:** Who was this written for? What assumptions does the author make about the reader?

**CHECKPOINT:** Write the analysis file now with frontmatter + Classification + Central Thesis + Structural Map. Use the Write tool to create `analysis/author-lastname_short-title.md`:

```markdown
---
date: YYYY-MM-DD
type: book-analysis
tags: [book-analysis, topic1, topic2]
author: Author Name
title: "Book Title"
year: YYYY
book-type: taxonomy|argument|manual|narrative|compilation|interview-collection|hybrid
source-file: inbox/original-filename.ext
extracted-file: extracted/filename.txt
---

# Book Title — Author Name

## Classification & Context
[Book type, audience, author background]

## Central Thesis
[2-3 paragraphs — the author's core argument]

## Structural Map
[Chapter-by-chapter outline with key ideas per chapter]
```

---

## Step 3: Pass 2 — Deep Extraction (then CHECKPOINT)

Process chapter-by-chapter. Extract:

### Chapter-Level Detail

For EACH chapter or major section of the book, document:
- **Chapter title and position** in the book's argument
- **Main argument** of this chapter — what the author is trying to establish
- **Key concepts introduced** — with definitions and explanations
- **Best stories and examples** — with full narrative detail (who, what, when, why, outcome) — enough detail that the story can be paraphrased from this note alone without re-reading the source
- **Data and evidence** cited in this chapter
- **Connection to next chapter** — how this chapter sets up what follows

This section is critical — it is what allows `/summarize` to work without re-reading the original book.

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

### Stories Worth Preserving
- The 5-10 most vivid, memorable stories in the book
- For each: who, what happened, why it matters, which concept it illustrates
- Include enough narrative detail for a 4-8 sentence paraphrase

**CHECKPOINT:** Use Edit to append Chapter-Level Detail + Key Frameworks + Key Principles + Best Stories sections to the analysis file.

---

## Step 4: Pass 3 — Critique & Cross-Reference (then CHECKPOINT)

1. **Assess strength:** Where is evidence strongest? Weakest? Absent?
2. **Surface assumptions:** What does the argument depend on that the author doesn't state?
3. **Test generalisability:** Is this advice context-dependent? What contexts is it written for vs. where would it break down?
4. **Cross-references to other books:**
   - Check `summaries/_index.md` for books on similar topics
   - Where existing summaries agree: note the convergence
   - Where they disagree: state both positions and conditions under which each applies

**CHECKPOINT:** Use Edit to append Critique + Cross-References sections.

---

## Step 5: Pass 4 — Synthesis & Category Suggestion (then CHECKPOINT)

Structure the final sections:

### Summarisation Notes
- Recommended structure for the human summary (follow the book's own flow, or reorganise thematically?)
- Key content that MUST be preserved (the 3-5 ideas that define this book)
- Suggested thematic groupings if reorganising
- **Recommended category** for placement in `summaries/`:
  - Read existing categories from `summaries/_index.md`
  - Match based on the book's primary themes:
    - power, influence, persuasion, negotiation → Power & Influence
    - career, promotion, corporate ladder → Career Strategy
    - leadership, management, executive, team → Leadership & Management
    - stoicism, mindset, resilience, growth, focus, learning → Mindset & Self-Mastery
    - psychology, bias, decision, cognitive → Psychology & Decision Making
    - strategy, systems, mental-models, measurement → Strategy & Systems Thinking
    - presence, brand, networking, credibility → Personal Brand & Presence
    - manipulation, dark psychology, protection → Awareness & Protection
    - wisdom, history, economics, broad perspective → Wisdom & Big Ideas
    - office politics, managing up → Workplace Navigation
    - parenting, child development → Parenting & Child Development
  - State the recommended category and reasoning

**CHECKPOINT:** Use Edit to append Summarisation Notes section.

---

## Step 6: Update Index

After saving the analysis file:
1. Read `summaries/_index.md`
2. Find the appropriate category section
3. Add a row for this book with status ANALYSED (no summary link yet)
4. Wikilinks use `[[filename]]` format with no path prefix

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
- **Recommended category:** [category name]
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
