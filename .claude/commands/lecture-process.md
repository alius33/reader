---
description: Run the full pipeline for a lecture — analyse, summarize
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /lecture-process — Full Lecture Pipeline

Run the complete lecture processing pipeline: analyse → summarize.

**Usage:**
- `/lecture-process <search term>` — full pipeline for one lecture (e.g. `/lecture-process Civilization #1` or `/lecture-process Golden Age of Islam`)
- `/lecture-process --all-pending` — process all unprocessed lectures sequentially
- `/lecture-process --series Civilization` — process all pending lectures in a specific series

---

## Pipeline Steps

### Step 1: Identify Transcript

1. Scan `inbox/` for `.txt` files matching lecture patterns:
   - `Civilization #N; ...` — Civilization series
   - `Geo-Strategy #N; ...` — Geo-Strategy series
   - `Secret History #N; ...` — Secret History series
2. Parse filename: extract series name, lecture number, title (strip audio codec info)
3. If arguments provided: find the matching transcript
4. If `--all-pending`: list all transcripts without summaries, confirm with user, process sequentially
5. If `--series <name>`: filter to that series only

### Step 2: Analyse

1. Check if `analysis/` already has a matching analysis file (`jiang_<series>-<NN>.md`)
2. If not, run the `/lecture-analyse` logic:
   - Read transcript from `inbox/`
   - Multi-pass analysis with checkpointing
   - Write to `analysis/jiang_<series>-<NN>.md`
3. If analysis exists, skip to Step 3 (unless user requests re-analysis)
4. If analysis fails, STOP and report

### Step 3: Summarize

1. Run the `/lecture-summarize` logic:
   - Read from analysis file + original transcript
   - Contextual research for dates/names
   - Check adjacent lectures for continuity links
   - Write to `summaries/Lectures/<Series>/NN - Title.md`
   - Minimum 4 Mermaid diagrams
2. If summarisation fails, STOP and report

### Step 4: Update Series Overview

1. Read or create `summaries/Lectures/<Series>/_overview.md`
2. Update the lecture table: mark as summarised, add one-line description
3. Add any new recurring themes

---

## Batch Mode (`--all-pending`)

When processing multiple lectures:

1. Scan `inbox/` for all lecture transcripts
2. Check which already have summaries in `summaries/Lectures/`
3. List the unprocessed lectures and confirm with user before starting
4. Process each lecture sequentially through the full pipeline (in series order)
5. After each lecture, report progress: "[X/Y] completed — Series #N: Title"
6. If one lecture fails, skip it and continue with the next
7. At the end, report:
   - Total processed: [X]
   - Succeeded: [X]
   - Failed: [X] (with reasons)
   - Diagrams created: [total]

---

## Error Handling

- If transcript is unreadable or empty: skip, report error
- If analysis fails (context limit, garbled transcript): skip, report error
- If summarisation fails: skip, report error
- If series overview update fails: report but don't block

---

## Output Report

After completing each lecture:
```
PIPELINE COMPLETE: [Series] #[N] — [Title]
  Analyse:     OK ([N] concepts, [N] narratives, [N] diagrams planned)
  Summarize:   OK ([N] lines, [N] diagrams)
  Overview:    Updated
```

After batch completion:
```
BATCH COMPLETE
  Total:     [X] lectures
  Succeeded: [X]
  Failed:    [X]
  Series:    [breakdown by series]
```
