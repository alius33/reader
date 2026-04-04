---
description: Analyse a podcast transcript and produce a structured analysis file
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /podcast-analyse — Podcast Transcript Analysis

Read a podcast transcript from `extracted/podcasts/` and produce a structured analysis for later summarisation.
This is Step 2 of the podcast pipeline: podcast-transcribe → **podcast-analyse** → podcast-summarize.

**Usage:**
- `/podcast-analyse <search term>` — analyse a specific transcript (e.g. `/podcast-analyse lex-fridman_367`)
- `/podcast-analyse` — scan for transcripts without analysis files and process the first one found

---

## Pre-Flight

### Identify podcast transcripts

Podcast transcripts are `.txt` files in `extracted/podcasts/` with matching `.json` metadata sidecars.

### If no arguments provided:
1. Scan `extracted/podcasts/` for `.txt` files
2. Check `analysis/` for existing podcast analysis files (matching `*_podcast_*.md` or similar patterns)
3. Identify transcripts that don't have a matching analysis
4. If unprocessed transcripts found: process the first one
5. If none: report "No unprocessed podcast transcripts found."

### If arguments provided:
1. Search `extracted/podcasts/` for matching `.txt` files (try exact match, then partial filename/slug match)
2. If not found: report "No podcast transcript found matching '$ARGUMENTS'."
3. Check if `analysis/` already has an analysis — if so, confirm with user before re-processing

### Load metadata:
1. Read the matching `.json` sidecar from `extracted/podcasts/`
2. Extract: series, episode_number, title, host, duration, chapters
3. If no JSON found: parse what you can from the transcript and filename

### Determine analysis filename:
- Format: `<host-lastname>_<series-slug>-<NN>.md` (e.g. `fridman_lex-fridman-367.md`)
- If no series: `<host-lastname>_<title-slug>.md`
- If host unknown: `podcast_<title-slug>.md`

---

## Step 1: Read and Understand the Transcript

Read the full transcript from `extracted/podcasts/`. These are auto-generated transcripts that have already been LLM-corrected but may still have:
- Minor transcription errors in proper nouns
- No speaker attribution (speakers are not labelled)
- Chapter markers at the top (from AssemblyAI auto_chapters)

While reading, identify:
- **Who is speaking** — use context clues (introductions, "my guest today", expertise signals) to determine host vs guest
- **Topic shifts** — where does the conversation move to a new subject?
- **The episode type:** interview / solo-educational / solo-narrative / panel

---

## Step 2 (Pass 1): Structural Map

Analyse the overall structure and write the initial analysis file.

Identify:
- **Podcast Type:** interview, solo-educational, solo-narrative, panel
- **Core Topic:** the central subject or question explored
- **Host:** name and brief description (inferred from transcript or metadata)
- **Guest(s):** name(s), credentials, why they're on this episode (for interviews)
- **Structural Map:** section-by-section outline of the conversation's flow
  - For each section: approximate topic, who drives the discussion, key shift points

**CHECKPOINT:** Write the analysis file to `analysis/<filename>.md` with frontmatter:

```yaml
---
date: YYYY-MM-DD
type: podcast-analysis
tags: [podcast-analysis, <series-slug>, <topic-tags>]
host: <Host Name>
guest: <Guest Name(s)>
series: <Series Name>
episode-number: <N>
title: <Episode Title>
source-file: <transcript filename>
podcast-type: <interview|solo-educational|solo-narrative|panel>
duration-minutes: <N>
---
```

Followed by: Podcast Type, Core Topic, Host, Guest(s), Structural Map sections.

---

## Step 3 (Pass 2): Deep Extraction

Read the transcript in detail, section by section. Extract:

### Main Arguments & Claims
For each significant claim made during the episode:
- **The claim** — stated clearly
- **Who makes it** — host or guest (by name)
- **Evidence offered** — research, personal experience, analogy, none
- **Strength of evidence** — strong (peer-reviewed), moderate (anecdotal), weak (assertion only)

### Key Stories & Anecdotes
For each memorable story (target 5-10):
- **Who tells it** — and why at that moment
- **The narrative** — who, what happened, the outcome (4-8 bullet points of detail)
- **What it illustrates** — the concept or argument it supports
- **Emotional weight** — is this a pivotal moment in the conversation?

### Frameworks & Mental Models
Any structured thinking tools introduced:
- **Name** of the framework
- **How it works** — the mechanism or structure
- **When to apply it** — context and conditions

### Quotable Moments
3-5 short quotes (under 15 words) that crystallise key ideas:
- The quote itself
- Who said it
- What it captures

### Data & Research Citations
Any studies, statistics, or data points mentioned:
- What was cited
- The finding
- How it was used in the argument

**CHECKPOINT:** Append all 5 sections to the analysis file.

---

## Step 4 (Pass 3): Connections & Diagrams

### Cross-References
1. Read `summaries/_index.md` to check for books covering similar topics
2. Check `summaries/Podcasts/` for prior episodes of the same series
3. Note:
   - **Convergences** — where this episode agrees with books/lectures in the vault
   - **Contradictions** — where it disagrees or presents an alternative view
   - **Extends** — where it goes beyond what existing summaries cover

### Diagram Opportunities
Plan 4-8 Mermaid diagrams for the summary. For each:
- **Type:** concept map, argument flow, timeline, comparison, process, cause-effect
- **What it shows:** brief description
- **Key nodes:** 5-10 items that should appear

**CHECKPOINT:** Append Cross-References and Diagram Opportunities sections.

---

## Step 5 (Pass 4): Summarisation Notes

Write guidance for the `/podcast-summarize` step:

- **Recommended structure** — which podcast-type template to follow
- **Key content that MUST be preserved** — the 3-5 ideas the summary cannot skip
- **Essential stories** — which stories are load-bearing for the argument
- **Supplementary stories** — interesting but could be cut if summary runs long
- **Guest credibility notes** — what makes this guest worth listening to
- **Suggested diagrams** — which 4-6 of the planned diagrams to actually build
- **Transcript sections that were unclear** — flag anything that may need verification

**CHECKPOINT:** Append Summarisation Notes section.

---

## Step 6: Update Index

1. Check if `summaries/Podcasts/<Series>/` directory exists — create if not
2. Check if `summaries/Podcasts/<Series>/_overview.md` exists — create if not (with series title and empty episode table)
3. Do NOT update `_index.md` yet — that happens after summarisation

---

## Output Report

```
ANALYSIS COMPLETE
─────────────────
Series:    <series>
Episode:   <number> - <title>
Type:      <podcast-type>
Guest:     <guest name(s)>
Duration:  <N> minutes
Output:    analysis/<filename>.md
Sections:  Structural Map, Arguments, Stories, Frameworks, Quotes, Cross-Refs, Diagrams
Next step: /podcast-summarize <search term>
```
