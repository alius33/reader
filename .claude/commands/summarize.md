---
description: Generate a human-readable book summary from an analysed book
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Agent
---

# /summarize — Human-Readable Book Summary

Generate a comprehensive, general-purpose book summary for human reading.
These are NOT career extractions — they teach the book's ideas as the author intended.

**Usage:**
- `/summarize <book-reference-filename>` — generate summary from an existing analysed book (e.g. `/summarize greene_48-laws-of-power`)
- `/summarize --all-pending` — scan for analysed books without summaries and process them

---

## Four-Pass Workflow

### Pass 1: Reconnaissance & Source Reading

1. **Read the analysis file** from `analysis/$ARGUMENTS.md`:
   - Structural skeleton: chapters, key concepts, frameworks
   - What the critique says (strengths and weaknesses)
   - Best stories flagged for preservation
   - Recommended summary structure from the Summarisation Notes section

2. **Read the original source text** from `inbox/`:
   - Check the `source-file` field in the analysis frontmatter for the original filename
   - All concepts, not just the subset selected during analysis
   - Narratives, stories, and examples
   - The author's actual voice and tone
   - For large books (>5000 lines): read in sections, checkpoint after each part

3. **Online research** — targeted, not open-ended:
   - Author interviews about this specific book
   - Most-cited ideas (which concepts entered popular discourse)
   - Major criticisms from credible reviewers
   - Canonical stories most frequently referenced

**Output:** Mental model of the book's FULL scope, list of all concepts to cover, 3-5 best stories to preserve.

**Session management for large books:** If source text exceeds 5000 lines, process in stages:
- Read and outline the first half, write those sections
- Then read the second half, write those sections
- Then write framing sections (30-second read, 5-minute read, Verdict)
- Save progress after each thematic section

### Pass 2: Architecture

Design the summary structure before writing.

**Structural approaches by book type:**

| Book Type | Structure |
|-----------|-----------|
| **Taxonomy** | Hybrid: thematic overview → grouped entries with Quick Lookup Table |
| **Argument** | Follow the author's argument arc |
| **Manual/how-to** | Organised by technique/tool |
| **Narrative** | Preserve story structure |
| **Compilation** | Curated highlights by theme (adapted format) |
| **Interview collection** | Lessons-from format, grouped by insight |

**For taxonomy books (target: 2400+ lines):**
1. Quick Lookup Table — numbered list mapping every entry to its thematic group and page anchor
2. Group into 5-7 thematic clusters with cluster introductions
3. **Every entry gets meaningful treatment** — minimum 2 paragraphs (explanation + story), key entries get 4-6 paragraphs (explanation + mechanism + 2-3 stories + nuance)

**For non-taxonomy books (target: 1000-1600+ lines):**
1. Every chapter/major section of the book must be represented
2. Each section: core argument + key frameworks + 2-3 stories/examples + nuance
3. For how-to books: include enough detail to USE the technique from the summary alone

### Pass 3: Writing

**These are COMPREHENSIVE summaries, not overviews.** The reader should finish feeling they deeply understand the book. Do not compress — expand.

Write using the three-depth structure:

**30-Second Read:** Blockquote paragraph (5-7 sentences) at the top.

**5-Minute Read:**
- About the Author (3-5 sentences — what gives them authority)
- The Big Idea (3-4 substantial paragraphs — the full thesis with reasoning)
- Key Concepts at a Glance (comprehensive bulleted list with 1-2 sentence descriptions per concept, not just labels)

**Full Summary:** For each concept/chapter:
- What it is — the idea in plain language, explained fully (not one sentence — 2-3 paragraphs minimum)
- Why it works — the underlying mechanism, psychology, or logic (2-3 paragraphs)
- The author's best evidence — what supports the claim
- 2-4 stories per major concept — the author's strongest examples, paraphrased in 4-8 sentences each. Include BOTH successes and failures when the author provides both. Use real names, dates, specifics.
- When it applies and when it doesn't — the conditions and exceptions
- How it connects to other concepts in the same book

**The Verdict:** 3-4 substantive paragraphs — greatest contribution, weaknesses, who benefits, comparisons.

**Related Reading:** Links to other summaries with connection descriptions.

**Writing standards:**
- Plain, engaging English. Short paragraphs. One sentence per line.
- No Toulmin structures, no implementation intentions, no career-specific framing.
- Preserve the author's voice and energy.
- Use the author's terminology (bold on first use).
- Stories are the content — preserve ALL the best ones (2-4 per concept, not just 1).
- 5-8 key quotes per book (under 15 words, attributed).
- All stories paraphrased — no paragraph-length reproductions.
- **Do not compress a 300-page book into 250 lines. That is a blurb, not a summary.**

### Pass 4: Quality & Polish

**Checklist:**
- [ ] Works at all three reading depths (30-second, 5-minute, full)
- [ ] Every major concept/law/strategy covered (verify count against source)
- [ ] At least one illustrative story per major concept
- [ ] 3-5 key quotes, all under 15 words, properly attributed
- [ ] Quick Lookup Table present (taxonomy books)
- [ ] No career-specific language or framing
- [ ] No Toulmin structures or academic formatting
- [ ] Key terms bolded on first use
- [ ] Verdict section is honest and useful
- [ ] Cross-references using `[[wikilinks]]`
- [ ] No large chunks of reproduced text (copyright compliance)
- [ ] Spot-check 3 factual claims against source text
- [ ] `_index.md` updated (in the summaries vault)

**Cross-reference backfill:** After completing a set of related books, add inter-book links and ensure Related Reading sections are complete.

---

## File Template

```markdown
---
date: YYYY-MM-DD
type: book-summary
tags: [book-summary, topic1, topic2]
author: Author Name
title: "Book Title"
year: YYYY
---

# Book Title — Author Name

> [30-second version: thesis, author credibility, why it matters]

---

## About the Author

[2-3 sentences]

## The Big Idea

[Core thesis in 2-3 accessible paragraphs]

## Key Concepts at a Glance

[Quick Lookup Table for taxonomy books; bulleted list for others]

---

## [Thematic Section]

### [Concept Name]

[Explanation + mechanism + best story + nuance]

---

## The Verdict

[2-3 paragraphs]

---

## Related Reading

- [[related-book|Title]] — how it connects
```

---

## After Completion

1. Update `summaries/_index.md` — set status to DONE and add wikilink (no path prefix, just `[[filename]]`)
