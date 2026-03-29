---
description: Generate a human-readable lecture summary from an analysed lecture transcript
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /lecture-summarize — Lecture Summary

Generate a comprehensive, diagram-rich lecture summary for human reading.
These capture Prof. Jiang Xueqin's arguments, evidence, and historical narratives as he presented them.

This is Step 2 of the lecture pipeline: lecture-analyse → **lecture-summarize**.

**Usage:**
- `/lecture-summarize <analysis-reference>` — generate summary from an existing analysis (e.g. `/lecture-summarize jiang_civilization-01`)
- `/lecture-summarize` — scan for analysed lectures without summaries and process the first one found

---

## Pre-Flight

### If no arguments provided:
1. Scan `analysis/` for lecture analysis files (`jiang_civilization-*.md` or `jiang_geo-strategy-*.md`)
2. Check `summaries/Lectures/` for existing summaries
3. Identify analysed lectures that don't have a matching summary
4. If unprocessed: process the first one (by series order)
5. If none: report "No analysed lectures awaiting summarisation. Run `/lecture-analyse` first."

### If arguments provided:
1. Search `analysis/` for matching file:
   - Try `analysis/$ARGUMENTS.md` first
   - If not found, search for partial matches (lecture number, title keywords)
2. If no analysis found: report "No analysis found for '$ARGUMENTS'. Run `/lecture-analyse` first."

### Read analysis and validate:
1. Read the full analysis file
2. Verify it has the required sections: Core Question, Central Thesis, Argument Structure, Key Concepts, Historical Narratives, Diagram Opportunities
3. If the analysis is under 50 lines: WARN — "This analysis is too sparse. Recommend re-running `/lecture-analyse`."
4. Extract metadata: series, lecture-number, title

---

## Three-Pass Workflow

### Pass 1: Reconnaissance

1. **Read the analysis file** — the primary source for content:
   - Core question and central thesis
   - All theories and their evidence evaluations
   - Historical narratives flagged for preservation
   - Key concepts and frameworks
   - Student Q&A insights worth including
   - Diagram Opportunities section (planned diagrams)
   - Cross-lecture connections
   - Summarisation notes

2. **Read the original transcript** from `inbox/` to:
   - Verify key quotes and phrasings
   - Capture any nuance the analysis may have compressed
   - Confirm the professor's exact analogies and explanations

3. **Contextual research** — brief, targeted:
   - If the lecture covers historical events: verify key dates and names
   - If it references scholars or books: confirm spellings
   - If concepts are technical: ensure definitions are accurate

4. **Check adjacent lectures:**
   - Read `summaries/Lectures/<Series>/` for existing summaries of adjacent lectures
   - Note what was covered in the previous lecture (for "Builds on" section)
   - Note what the professor promises for the next lecture (for "Sets up" section)

**Output:** Mental model of the full lecture content, list of all sections to write, 4-8 diagrams to create.

### Pass 2: Writing

**Write the complete summary following the lecture summary template.**

#### Frontmatter
```yaml
---
date: YYYY-MM-DD
type: lecture-summary
tags: [lecture-summary, civilization|geo-strategy, topic1, topic2, topic3]
lecturer: Jiang Xueqin
series: Civilization|Geo-Strategy
lecture-number: N
title: "Episode Title"
---
```

#### 30-Second Read
Blockquote paragraph (3-5 sentences): what question is asked, what the answer is, why it matters.

```markdown
> Prof. Jiang asks why humanity transitioned from hunter-gatherer life to agriculture — a shift that made us shorter, sicker, and harder-working. After evaluating four theories (coercion, war, respect for elders, religion), he argues that religion was the driving force: charismatic shamans built places like Göbekli Tepe that drew people together, and over time these religious gatherings evolved into permanent settlements.
```

#### 5-Minute Read
- **The Question** — the driving question(s) of the lecture, framed as Prof. Jiang asked them
- **Key Concepts at a Glance** — two-column table: concept name + one-line summary

#### Full Summary
For each major question or theme:

1. **Section heading as a question** (when the professor frames it that way)
2. **Italic opener** (1-2 sentences previewing what this section covers)
3. **Content in bullet points:**
   - Theories presented with evidence for/against
   - Historical narratives in `> [!example]` callouts
   - Key insights in `> [!tip]` callouts (max 1 per section)
   - Theory evaluations in `> [!abstract]` callouts
   - Mermaid diagrams with interpretation sentences
4. **Visual variety:** no more than 3 consecutive prose paragraphs without a diagram, callout, or table

**Diagram requirements:**
- Minimum 4 diagrams, target 6-8
- At least 1 timeline/flowchart and 1 concept map
- Follow the Diagram Opportunities section from the analysis
- Every diagram gets 1-2 interpretation sentences below it
- Keep diagrams under 15 nodes
- Use `flowchart` syntax (not `graph`)
- Apply colour to key nodes: `style NodeName fill:#2980b9,color:#fff`

**Callout usage:**
- `> [!example] Title (Date)` — historical narratives (4-8 bullets, **The lesson:** closing)
- `> [!tip] Core Insight` — single most important takeaway per section (1-3 sentences)
- `> [!abstract] Theory Evaluation: Topic` — competing theories presented as table
- `> [!warning] Title` — critical misconceptions or dangers the professor highlights

**Colour usage:**
- Red `<b style="color: #e74c3c">` — dangers, fatal mistakes, what civilisations did wrong
- Green `<b style="color: #27ae60">` — key conclusions, what Prof. Jiang considers the answer
- Blue `<b style="color: #2980b9">` — named frameworks, models, key terms on first use
- Never use colour inside callout boxes
- ~4-7 coloured items per major section

#### Connections Section
```markdown
## Connections

**Builds on:** [[NN - Previous Lecture Title]] (specific concept referenced)
**Sets up:** [[NN - Next Lecture Title]] (what the professor promises next)
**Related books in vault:** [[Book Title - Author]] (how it connects)
```

- Use `[[wikilinks]]` with no path prefix
- Reference specific concepts, not just titles
- Cross-reference book summaries from `summaries/` where ideas overlap

#### The Takeaway
2-3 substantive paragraphs:
1. How this lecture fits into the series' big picture
2. Most surprising or counterintuitive insight
3. What questions remain open

---

### Pass 3: Quality, Polish & Series Update

**Quality checklist:**
- [ ] Works at all three reading depths (30-second, 5-minute, full)
- [ ] Every major question/argument from the lecture is covered
- [ ] At least 2-3 historical narratives per major section
- [ ] Theories evaluated with evidence (not just conclusions)
- [ ] **Minimum 4 Mermaid diagrams present**
- [ ] At least 1 timeline and 1 concept map
- [ ] 1-2 interpretation sentences after every diagram
- [ ] Stories in `> [!example]` callouts with bullet points
- [ ] Theory evaluations in `> [!abstract]` callouts
- [ ] Key insight callouts (`> [!tip]`) — max 1 per section
- [ ] No more than 3 consecutive dense paragraphs without a visual break
- [ ] Bullet points for all explanatory content
- [ ] Coloured text uses `<b style="color:">` HTML — no colours inside callouts
- [ ] Key Concepts at a Glance uses table format
- [ ] Each major section has an italic opener
- [ ] Connections section links to adjacent lectures and book summaries
- [ ] Frontmatter complete: date, type, tags, lecturer, series, lecture-number, title
- [ ] Line count in target range (400-800)
- [ ] No large chunks of transcript reproduced verbatim

**Spot-checks:**
- Verify 3 historical claims against analysis (dates, names, places)
- Confirm key quotes are accurate against transcript
- Test that Mermaid diagrams use valid syntax

**Save the summary:**
Write to `summaries/Lectures/<Series>/NN - Title.md`
- Series folder: `Civilization` or `Geo-Strategy`
- Filename: zero-padded number + cleaned title from analysis metadata

**Update series overview:**
1. Read `summaries/Lectures/<Series>/_overview.md`
2. Update the lecture table: mark this lecture as summarised, add one-line description
3. Add any new recurring themes discovered
4. If the overview doesn't exist yet, create it (see Series Overview Template below)

---

## Series Overview Template

If `summaries/Lectures/<Series>/_overview.md` doesn't exist, create it:

```markdown
---
date: YYYY-MM-DD
type: lecture-series
tags: [lecture-series, civilization|geo-strategy]
lecturer: Jiang Xueqin
series: Civilization|Geo-Strategy
---

# [Series Name] — Prof. Jiang Xueqin

> [2-3 sentence series description]

---

## About the Lecturer

Prof. Jiang Xueqin — [brief background based on what's known from the lectures]

---

## Lecture Map

| # | Title | Status | Key Topic |
|---|-------|--------|-----------|
| 1 | [[01 - Title]] | Summarised | One-line topic |
| 2 | [[02 - Title]] | Pending | One-line topic |
| ... | ... | ... | ... |

---

## Thematic Arcs

[To be populated as lectures are processed — group lectures into thematic arcs]

---

## Recurring Themes

[To be populated — themes that thread across multiple lectures]
```

---

## Output Report

After completion, report:
- **Lecture summarised:** [Series] #[N] — [Title]
- **Summary file:** `summaries/Lectures/<Series>/NN - Title.md`
- **Line count:** [N lines]
- **Mermaid diagrams:** [N diagrams]
- **Stories included:** [N]
- **Cross-references:** [list of linked lectures and books]
- **Series overview:** [updated/created]
