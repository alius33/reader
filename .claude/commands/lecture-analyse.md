---
description: Analyse a lecture transcript and produce a structured analysis file
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /lecture-analyse — Lecture Transcript Analysis

Read a lecture transcript from `inbox/` and produce a structured analysis for later summarisation.
This is Step 1 of the lecture pipeline: **lecture-analyse** → lecture-summarize.

**Usage:**
- `/lecture-analyse <search term>` — analyse a specific transcript (e.g. `/lecture-analyse Civilization #1` or `/lecture-analyse Golden Age of Islam`)
- `/lecture-analyse` — scan for lecture transcripts without analysis files and process the first one found

---

## Pre-Flight

### Identify lecture transcripts

Lecture transcripts are `.txt` files in `inbox/` with filenames matching the pattern:
- `Civilization #N; ...` — Civilization series by Prof. Jiang Xueqin
- `Geo-Strategy #N; ...` — Geo-Strategy series by Prof. Jiang Xueqin
- `Secret History #N; ...` — Secret History series by Prof. Jiang Xueqin

### If no arguments provided:
1. Scan `inbox/` for `.txt` files matching lecture patterns
2. Check `analysis/` for existing lecture analysis files (`jiang_civilization-*.md` or `jiang_geo-strategy-*.md`)
3. Identify transcripts that don't have a matching analysis
4. If unprocessed lectures found: process the first one (by series order)
5. If none: report "No unprocessed lecture transcripts found."

### If arguments provided:
1. Search `inbox/` for matching `.txt` files:
   - Try exact match first
   - If not found, search for partial filename matches (title keywords, lecture number)
2. If no transcript found: report "No lecture transcript found matching '$ARGUMENTS'."
3. Check if `analysis/` already has an analysis for this lecture — if so, confirm with user before re-processing

### Parse filename metadata:
Extract from the filename:
- **Series:** "Civilization" or "Geo-Strategy"
- **Lecture number:** the `#N` from the filename
- **Title:** the text after the semicolon, stripped of audio codec info (remove `(128kbit_AAC...)` suffixes)

---

## Step 1: Read and Clean the Transcript

Read the full transcript from `inbox/`. These are auto-generated audio transcripts with artifacts that need handling:

### Cleaning Rules (mental — don't modify the source file):
- **Timestamps:** Lines like `Prof. Jiang  0:00` are section markers — use them to understand structure but don't include in analysis
- **Speaker labels:** `Prof. Jiang` = the professor, `Speaker 1`/`Unknown Speaker` = students
- **Transcription errors:** Common issues:
  - Place names mangled (e.g. "goblin tepei" = Göbekli Tepe, "kanahojack" = Çatalhöyük, "Oman" = Umayyad)
  - Concept names phonetically transcribed (e.g. "azmaia" = asabiyyah, "Azmain" = various context-dependent)
  - Words run together or split incorrectly
- **Q&A sections:** Student questions are often prefixed with `Speaker 1` or appear as short Prof. Jiang responses. These contain valuable clarifications — extract them, don't skip them
- **Verbal artifacts:** "Okay?", "Does that make sense?", "Right?" — skip these but note that content between them is often the professor's clearest restatements

---

## Step 2: Pass 1 — Structural Map (then CHECKPOINT)

Understand the lecture as a whole:

1. **Identify the core question(s):** Prof. Jiang always opens with a driving question. What is it? Sometimes there are 2-3 sub-questions.
2. **Map the argument structure:** How does he build his case? What theories does he present? In what order? Which does he endorse?
3. **Identify the series context:** What lecture number is this? What did he reference from past lectures? What does he promise for future ones?
4. **Classify the lecture type:**
   - **Single-topic deep dive** (e.g. "The Golden Age of Islam")
   - **Multi-topic survey** (e.g. covering 3 archaeological sites)
   - **Theory evaluation** (e.g. testing 4 theories for agriculture)
   - **Geopolitical analysis** (Geo-Strategy series)
   - **Literary/philosophical analysis** (e.g. Dante, Homer)

**CHECKPOINT:** Write the analysis file with frontmatter + Core Question + Structural Map. Use the Write tool to create `analysis/jiang_<series>-<NN>.md`:

```markdown
---
date: YYYY-MM-DD
type: lecture-analysis
tags: [lecture-analysis, civilization|geo-strategy, topic1, topic2]
lecturer: Jiang Xueqin
series: Civilization|Geo-Strategy
lecture-number: N
title: "Episode Title"
source-file: inbox/original-filename.txt
continuity:
  references-back: [list of lecture numbers/topics referenced]
  sets-up: [topics promised for future lectures]
---

# Lecture Title

## Core Question
[The driving question — phrased as Prof. Jiang asked it]

## Lecture Type
[Single-topic / Multi-topic / Theory evaluation / Geopolitical analysis / Literary analysis]

## Structural Map
[Section-by-section outline: what he covers, in what order, how the argument flows]
```

---

## Step 3: Pass 2 — Deep Extraction (then CHECKPOINT)

Process the transcript section by section. Extract:

### Central Thesis
- What does Prof. Jiang conclude? What is his answer to the core question?
- How does he arrive at this conclusion?
- What is the chain of reasoning? (premise → evidence → conclusion → implications)

### Argument Structure
For each theory or argument presented:
- **The theory:** what it claims, in plain language
- **Evidence for:** what supports it (archaeological, historical, anthropological, psychological)
- **Evidence against:** what undermines it
- **Verdict:** does Prof. Jiang endorse or reject it? Why?
- **Source discipline:** archaeology, anthropology, psychology, primatology, history, etc.

### Key Concepts & Frameworks
- Named concepts, models, matrices (e.g. Iran Strategy Matrix, asymmetrical warfare, asabiyyah)
- For each: definition, how it works, what it explains, which lecture introduced it

### Historical Narratives & Examples
- Every historical story, example, or case study the professor uses
- For each: who, what, when, where, why, outcome, which argument it supports
- Include enough detail for a 4-8 bullet point retelling
- Preserve real names, dates, and specifics

### Evidence & Sources
- Specific archaeological sites, texts, or scholars cited
- Data points or research findings mentioned
- Books or authors referenced (e.g. Sapiens by Harari)

### Student Q&A Insights
- Questions students asked that prompted important clarifications
- Prof. Jiang's responses that added new angles not in the main lecture
- Debates or challenges that revealed nuance

**CHECKPOINT:** Use Edit to append Central Thesis + Argument Structure + Key Concepts + Narratives + Evidence + Q&A sections to the analysis file.

---

## Step 4: Pass 3 — Connections & Diagram Planning (then CHECKPOINT)

### Cross-Lecture Connections
- **References back:** Which past lectures or concepts does he reference? Be specific (lecture number + concept)
- **Sets up:** What does he promise for future lectures? What questions remain open?
- **Recurring themes:** Which of Prof. Jiang's big themes appear here? (religion as civilisation driver, empire cycles, hubris, asymmetric strategies, the role of charismatic leaders, East-West divergence)

### Cross-Reference with Book Summaries
- Check `summaries/_index.md` for books on similar topics
- Note where Prof. Jiang's ideas converge with or diverge from books in the vault

### Diagram Opportunities
Plan 4-8 Mermaid diagrams. For each, specify:
- **Type:** timeline, concept map, comparison, cause-effect chain, strategy matrix, decision tree, cycle
- **Content:** what nodes and edges to include
- **Purpose:** what relationship or process does it clarify

Aim for variety — don't use the same diagram type repeatedly.

Suggested diagram patterns by lecture type:
- **Historical lectures:** timeline + concept map + cause-effect chain
- **Theory evaluation:** decision tree + comparison + concept map
- **Geopolitical analysis:** strategy matrix + cause-effect chain + comparison
- **Literary/philosophical:** concept map + comparison + influence flow

**CHECKPOINT:** Use Edit to append Cross-Lecture Connections + Book Cross-References + Diagram Opportunities sections.

---

## Step 5: Summarisation Notes (then CHECKPOINT)

Structure the final section:

### Summarisation Notes
- Recommended section structure for the summary (follow the professor's question flow, or reorganise?)
- Key content that MUST be preserved (the 2-3 ideas that define this lecture)
- Which stories are essential vs. supplementary
- Suggested Mermaid diagrams with brief descriptions
- Any transcript sections that were unclear or potentially mistranscribed

**CHECKPOINT:** Use Edit to append Summarisation Notes section.

---

## Step 6: Update Series Overview

After saving the analysis file:
1. Check if `summaries/Lectures/<Series>/_overview.md` exists
2. If not, this will be created during summarisation
3. If it exists, no update needed at analysis stage

---

## Output Report

After analysis, report:
- **Lecture processed:** [Series] #[N] — [Title]
- **Analysis file:** `analysis/jiang_<series>-<NN>.md`
- **Lecture type:** [classification]
- **Core question:** [the driving question]
- **Theories evaluated:** [count]
- **Historical narratives preserved:** [count]
- **Key concepts identified:** [count]
- **Diagrams planned:** [count]
- **Cross-lecture references:** [list]
- **Ready for:** `/lecture-summarize jiang_<series>-<NN>`

---

## Important Safeguards

- NEVER reproduce large sections of transcript verbatim — extract in your own wording
- Every claim must be attributable to a specific section of the transcript
- If an insight cannot be grounded in the actual transcript, mark with `[INFERENCE]`
- Do NOT correct Prof. Jiang's historical interpretations — note scholarly debates with `[Note: scholars debate this]` only when egregiously contested
- Fix obvious transcription errors (mangled place names, concept names) but note the original transcription in case the correction is wrong
- Preserve the professor's analogies — they are often his best explanatory tools
