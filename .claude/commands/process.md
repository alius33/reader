---
description: Run the full pipeline for a book — extract, analyse, summarize, validate
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /process — Full Pipeline

Run the complete book processing pipeline: extract → analyse → summarize → validate → cross-reference.

**Usage:**
- `/process <filename>` — full pipeline for one book from `inbox/`
- `/process --all-pending` — process all unprocessed books in `inbox/` sequentially

---

## Pipeline Steps

### Step 1: Extract

1. Check if `extracted/<stem>.txt` already exists
2. If not, run the `/extract` logic:
   - Determine format (PDF/EPUB/MOBI)
   - Extract to `extracted/<stem>.txt`
   - Verify extraction produced substantial content (100+ lines)
3. If extraction fails, STOP and report the failure

### Step 2: Analyse

1. Check if `analysis/` already has a matching analysis file
2. If not, run the `/analyse` logic:
   - Read from `extracted/<stem>.txt`
   - Four-pass analysis with checkpointing
   - Write to `analysis/<author>_<short-title>.md`
3. If analysis fails, STOP and report the failure

### Step 3: Auto-Detect Category

1. Read the analysis file's Summarisation Notes for a recommended category
2. If a category is recommended, use it
3. If not, match tags against category mappings:
   - power, influence, persuasion, negotiation → Power & Influence
   - career, promotion, corporate → Career Strategy
   - leadership, management, executive, team → Leadership & Management
   - stoicism, mindset, resilience, growth, focus, learning → Mindset & Self-Mastery
   - psychology, bias, decision, cognitive → Psychology & Decision Making
   - strategy, systems, mental-models, measurement → Strategy & Systems Thinking
   - presence, brand, networking, credibility → Personal Brand & Presence
   - manipulation, dark psychology, protection → Awareness & Protection
   - wisdom, history, economics → Wisdom & Big Ideas
   - office politics, managing up → Workplace Navigation
   - parenting, child development → Parenting & Child Development
   - robert greene → Robert Greene Canon
4. If ambiguous, ask the user to choose

### Step 4: Summarize

1. Run the `/summarize` logic:
   - Read from analysis file only (no re-reading original)
   - Online research for author interviews and criticisms
   - Write to `summaries/<Category>/Title - Author.md`
2. If summarization fails, STOP and report the failure

### Step 5: Validate

1. Run: `python scripts/validate.py "summaries/<Category>/Title - Author.md" -v`
2. If any FAIL results: report them but continue (don't block on warnings)
3. Record validation results for final report

### Step 6: Cross-Reference Backfill

1. Read the new summary's tags and category
2. Find existing summaries in the same category or with overlapping tags
3. For each related book with an existing summary:
   - Ensure this book appears in the new summary's Related Reading
   - Open the related summary and check its Related Reading section
   - If this book is not already linked there, add a `[[wikilink]]` backlink
4. Use the Edit tool for surgical additions to existing files

### Step 7: Update Index

1. Read `summaries/_index.md`
2. Add the new book to the appropriate category table
3. Set status to DONE with `[[wikilink]]`

---

## Batch Mode (`--all-pending`)

When processing multiple books:

1. Scan `inbox/` for all PDF/EPUB/MOBI files
2. Check which already have summaries (cross-reference with `summaries/` filenames)
3. List the unprocessed books and confirm with user before starting
4. Process each book sequentially through the full pipeline
5. After each book, report progress: "[X/Y] completed — Title by Author"
6. If one book fails, skip it and continue with the next
7. At the end, report:
   - Total processed: [X]
   - Succeeded: [X]
   - Failed: [X] (with reasons)
   - Validation results per book

---

## Error Handling

- If `/extract` fails (missing tools, corrupted file): skip book, report error
- If `/analyse` fails (context limit, unreadable): skip book, report error
- If `/summarize` fails: skip book, report error
- If validation has FAILs: report but don't block — the summary is usable
- If cross-referencing fails: report but don't block

---

## Output Report

After completing each book:
```
PIPELINE COMPLETE: [Title] by [Author]
  Extract:    OK (X lines)
  Analyse:    OK (Y principles, Z stories)
  Category:   [Category Name]
  Summarize:  OK (W lines)
  Validate:   X/Y checks pass
  Cross-refs: Z links added
  Index:      Updated
```
