---
description: Generate a human-readable book summary from an analysed book
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /summarize — Human-Readable Book Summary

Generate a comprehensive, general-purpose book summary for human reading.
These are NOT career extractions — they teach the book's ideas as the author intended.

This is Step 3 of the pipeline: extract → analyse → **summarize**.

**Usage:**
- `/summarize <book-reference>` — generate summary from an existing analysis (e.g. `/summarize greene_48-laws-of-power`)
- `/summarize --all-pending` — scan for analysed books without summaries and process them

---

## Pre-Flight Quality Check

1. **Read the analysis file** from `analysis/$ARGUMENTS.md`
2. **Validate analysis quality:**
   - Run: `python scripts/validate.py --analysis "analysis/$ARGUMENTS.md"`
   - If the analysis is under 100 lines: WARN — "This analysis is too sparse for a quality summary. Recommend re-running `/analyse` first."
   - If the analysis lacks a `## Chapter-Level Detail` section: WARN — "This analysis uses the old format and lacks chapter-level detail. Recommend re-running `/analyse` for better coverage. Proceed anyway? Coverage may be incomplete."
3. If user confirms proceeding with a sparse analysis, continue but note that coverage will be limited.

---

## Four-Pass Workflow

### Pass 1: Reconnaissance

1. **Read the analysis file** — the sole source for book content:
   - Structural skeleton: chapters, key concepts, frameworks
   - Chapter-Level Detail: per-chapter arguments, stories, evidence
   - What the critique says (strengths and weaknesses)
   - Best stories flagged for preservation
   - Recommended summary structure from the Summarisation Notes section

2. **Online research** — targeted, not open-ended:
   - Author interviews about this specific book
   - Most-cited ideas (which concepts entered popular discourse)
   - Major criticisms from credible reviewers
   - Canonical stories most frequently referenced

**Output:** Mental model of the book's FULL scope, list of all concepts to cover, 3-5 best stories to preserve.

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

**Determine category placement:**
- Read the `Recommended category` from the analysis's Summarisation Notes
- If present, use it
- If absent, determine category by reading `summaries/_index.md` and matching book themes
- If ambiguous between 2-3 categories, ask the user to pick

### Pass 3: Writing

**These are COMPREHENSIVE summaries, not overviews.** The reader should finish feeling they deeply understand the book. Do not compress — expand.

Write using the three-depth structure:

**30-Second Read:** Blockquote paragraph (5-7 sentences) at the top.

**5-Minute Read:**
- About the Author (3-5 sentences — what gives them authority)
- The Big Idea (3-4 substantial paragraphs — the full thesis with reasoning)
- Key Concepts at a Glance (two-column table: concept name + one-line summary)

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

### Pass 4: Quality, Cross-References & Polish

**Validation:**
Run `python scripts/validate.py` on the newly written summary. Fix any FAIL results before saving.

**Cross-reference backfill:**
After writing the summary:
1. Read `summaries/_index.md` to find books in the same category or with overlapping tags
2. For each related book that has an existing summary:
   - Add it to this summary's Related Reading section with a connection description
   - Open the related summary's Related Reading section
   - If this book is not already linked there, add a backlink using `[[wikilinks]]`
3. This ensures bidirectional linking across the vault

**Checklist:**
- [ ] Works at all three reading depths (30-second, 5-minute, full)
- [ ] Every major concept/law/strategy covered (verify count against analysis)
- [ ] At least one illustrative story per major concept
- [ ] 3-5 key quotes, all under 15 words, properly attributed
- [ ] Quick Lookup Table present (taxonomy books)
- [ ] No career-specific language or framing
- [ ] No Toulmin structures or academic formatting
- [ ] Key terms bolded on first use
- [ ] Verdict section is honest and useful
- [ ] Cross-references using `[[wikilinks]]`
- [ ] No large chunks of reproduced text (copyright compliance)
- [ ] Spot-check 3 factual claims against analysis
- [ ] `_index.md` updated (in the summaries vault)
- [ ] 2-5 Mermaid diagrams present
- [ ] Stories in `> [!example]` callouts
- [ ] Explanatory content uses bullet points
- [ ] Coloured text uses `<b style="color:">` HTML — no colours inside callouts
- [ ] Related Reading includes bidirectional links

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

| Concept | One-line summary |
|---------|-----------------|
| **Concept** | Description |

---

## [Thematic Section]

### [Concept Name]

[Explanation + mechanism + best story + nuance]

---

## The Verdict

[3-4 paragraphs]

---

## Related Reading

- [[related-book|Title]] — how it connects
```

---

## After Completion

1. Update `summaries/_index.md` — set status to DONE and add wikilink (no path prefix, just `[[filename]]`)
2. Report summary statistics: line count, stories included, diagrams created, validation results
