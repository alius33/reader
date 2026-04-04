---
description: Generate a human-readable podcast summary from an analysed podcast transcript
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /podcast-summarize — Podcast Summary Generation

Generate a comprehensive, lecture-style podcast summary from an analysis file.
This is Step 3 of the podcast pipeline: podcast-transcribe → podcast-analyse → **podcast-summarize**.

**Usage:**
- `/podcast-summarize <search term>` — summarize a specific analysis (e.g. `/podcast-summarize fridman_367`)
- `/podcast-summarize` — scan for analyses without summaries and process the first one found

---

## Pre-Flight

### If no arguments provided:
1. Scan `analysis/` for podcast analysis files (frontmatter `type: podcast-analysis`)
2. Check `summaries/Podcasts/` for existing summaries
3. Identify analyses that don't have matching summaries
4. If found: process the first one
5. If none: report "No unprocessed podcast analyses found."

### If arguments provided:
1. Search `analysis/` for matching podcast analysis files (try exact match, slug match, partial title match)
2. If not found: report "No podcast analysis found matching '$ARGUMENTS'."
3. Check if a summary already exists — if so, confirm with user before overwriting

### Load metadata:
1. Read the analysis file — extract frontmatter (series, episode-number, title, host, guest, podcast-type)
2. Read the matching `.json` metadata sidecar from `extracted/podcasts/` if it exists (for chapter info)
3. Determine output path: `summaries/Podcasts/<Series>/NN - Title.md`

---

## Step 1 (Pass 1): Reconnaissance

### Read the analysis file (primary source)
This is the sole source for episode content. Read it completely:
- Structural Map → understand the conversation flow
- Main Arguments → identify every claim to cover
- Key Stories → plan which stories to include
- Frameworks → note all models to explain
- Quotable Moments → select 2-3 for `> [!quote]` callouts
- Diagram Opportunities → review planned diagrams
- Summarisation Notes → follow the recommended structure

### Read the original transcript
Read `extracted/podcasts/<slug>.txt` to:
- Verify quotes are accurate
- Capture nuance the analysis may have simplified
- Find additional context for stories

### Contextual research (targeted, not exhaustive)
- Verify guest credentials, recent publications, or relevant context
- Check any specific claims or studies cited — are they accurately represented?
- Look up any proper nouns or technical terms that need clarification

### Check adjacent content
- Read `summaries/Podcasts/<Series>/_overview.md` if it exists — what episodes are already summarised?
- If this episode references other episodes, check if those summaries exist for cross-linking

---

## Step 2 (Pass 2): Writing

Follow the structure from `.claude/rules/podcast-summary-standards.md`. The podcast type (from the analysis) determines which template to use.

### Frontmatter

```yaml
---
date: YYYY-MM-DD
type: podcast-summary
tags: [podcast, <series-tag>, <topic-tags>, <guest-name-tag>]
author: <Host Name>
title: "<NN - Episode Title>"
series: <Series Name>
episode-number: <N>
guest: <Guest Name(s)>
duration: <N minutes>
---
```

**CRITICAL:** The `author` field MUST be the host's name (e.g. "Lex Fridman", "Andrew Huberman"). This is how the seed script identifies the author. Without it, the DB import will set author to "Unknown".

### Content Structure

**All podcast types:**

1. **30-Second Read** — blockquote at top:
   ```
   > Episode NNN of [Series]. [Host] talks with [Guest] about [topic]. [Guest's key claim in one sentence]. [Why this matters]. [The single most memorable insight].
   ```

2. **Key Concepts at a Glance** — two-column table:
   ```
   | Concept | One-line summary |
   |---------|-----------------|
   | **Term** | Brief explanation |
   ```

3. **Main body** — varies by podcast type (see below)

4. **Connections** section:
   ```
   ## Connections

   **Previous episodes:** [[NN - Title]] (specific concept referenced)
   **Related books in vault:** [[Title - Author]] (topic overlap)
   **Related lectures:** [[NN - Title]] (concept connection)
   ```

5. **The Takeaway** — 2-3 substantive paragraphs

### Interview podcasts — main body:

```
## Guest Profile
[2-3 sentences: credentials, why credible, what known for]

## The Big Idea
[The central insight — what does this guest bring that's unique?]

## [Question 1: Why does X happen?]
*Italic preview of what this section covers.*
[Bullet-point content with stories, evidence, frameworks]

## [Question 2: How does Y work?]
...

## [Question N]
...
```

### Solo-educational podcasts — main body:

```
## Episode Overview
[What the host set out to explain]

## [Concept 1: Name]
*Italic preview.*
[Mechanism, evidence, practical implications]

## [Concept 2: Name]
...
```

### Solo-narrative podcasts — main body:

```
## The Story
[1-2 sentence preview of the narrative arc]

## [Period/Event 1]
*Italic preview.*
[Chronological narrative with context and analysis]

## [Period/Event 2]
...
```

### Writing rules (apply to all types):

- **Section headings as questions** when the conversation explores a question
- **Minimum 4 Mermaid diagrams** — build from the analysis's Diagram Opportunities
  - At least 1 concept map and 1 flowchart/timeline
  - 1-2 sentences of interpretation below each diagram
- **Stories in `> [!example]` callouts** — 4-8 bullet points per story, `**The lesson:**` at the end
- **Key insights in `> [!tip]` callouts** — maximum 1 per major section
- **Guest quotes in `> [!quote]` callouts** — 2-3 per episode (interviews only)
- **Techniques in `> [!abstract]` callouts** — step-by-step methods when presented
- **Coloured text** — green for key insights, red for warnings, blue for named frameworks. NO colours inside callouts.
- **Bullet points for all explanatory content** — no dense prose paragraphs
- **Maximum 3 dense paragraphs** before a visual break (diagram, callout, table, or `---`)

**CHECKPOINT:** Write the complete summary to `summaries/Podcasts/<Series>/NN - Title.md`

---

## Step 3 (Pass 3): Quality, Cross-References & Polish

### Quality checklist
Verify against the podcast-summary-standards quality gate:
- [ ] Works at 3 reading depths (30-second, 5-minute, full)
- [ ] All major topics/arguments covered
- [ ] 2-3 stories per major section minimum
- [ ] Claims backed by evidence
- [ ] 400-800 lines
- [ ] 4+ Mermaid diagrams rendering correctly
- [ ] At least 1 concept map
- [ ] Stories in `> [!example]` callouts
- [ ] Key insights in `> [!tip]` callouts
- [ ] 2-3 guest quotes in `> [!quote]` (interviews)
- [ ] Connections section with wikilinks
- [ ] No more than 3 paragraphs without visual break
- [ ] Frontmatter has `author: <Host Name>`
- [ ] Bullet points for explanatory content
- [ ] No colours inside callouts

### Update series overview
1. Read/create `summaries/Podcasts/<Series>/_overview.md`
2. Add this episode to the episode table with one-line description

### Update master index
1. Read `summaries/_index.md`
2. If "Podcasts" category doesn't exist, add it
3. Add this episode's entry

### Cross-references
1. Check if any existing book or lecture summaries cover overlapping topics
2. Add wikilinks in the Connections section of this summary
3. Optionally add backlinks in related summaries' "Related Reading" sections

---

## Output Report

```
SUMMARY COMPLETE
────────────────
Series:     <series>
Episode:    <number> - <title>
Guest:      <guest name(s)>
Type:       <podcast-type>
Lines:      <N>
Diagrams:   <N>
Output:     summaries/Podcasts/<Series>/NN - Title.md
Overview:   summaries/Podcasts/<Series>/_overview.md (updated)
Index:      summaries/_index.md (updated)

To import to reader app:
  cd reader-app
  npx tsx prisma/seed.ts --source ../../summaries --file "NN - Title.md"
  npx tsx scripts/register-podcast-audio.ts ../../extracted/podcasts/<slug>.json
```
