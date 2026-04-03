# Geo-Strategy Processing Plan

## What This Is

This plan processes 12 Geo-Strategy lecture transcripts by Prof. Jiang Xueqin into structured, diagram-rich summaries of **900+ lines each**. It is designed to be run in Claude Code with Opus 4.6 (1M context).

**Read these files first to understand the workflow:**
1. `CLAUDE.md` — project structure and rules
2. `.claude/rules/lecture-summary-standards.md` — formatting standards (colours, diagrams, callouts, bullet points)
3. `.claude/rules/human-summary-standards.md` — inherited formatting rules
4. `.claude/commands/lecture-analyse.md` — analysis step details
5. `.claude/commands/lecture-summarize.md` — summarization step details
6. `summaries/Lectures/Civilization/01 - Explaining Humanity's Transition to Agriculture.md` — reference example (695 lines at standard length)

---

## Key Differences from Standard Plan

| Parameter | Standard (Civilization) | This Plan (Geo-Strategy) |
|-----------|------------------------|--------------------------|
| Target summary length | 400-800 lines | **900+ lines** |
| Mermaid diagrams | 4-8 per lecture | **8-12 per lecture** |
| Summary chunking | 2-part write | **3-part write** |
| Web research | Minimal | **Moderate** — verify geopolitical claims, dates, operation names |

### How to Hit 900+ Lines

The extra length comes from:
- **More diagrams** (8-12 vs 4-8) — each diagram is ~10-20 lines plus interpretation
- **Deeper theory analysis** — expand Prof. Jiang's arguments with fuller evidence chains
- **More story callouts** — 3-5 per major section (vs 2-4), with richer narrative detail
- **Fuller Q&A sections** — student questions often prompt important clarifications; include all substantive ones as their own subsections
- **Extended Connections section** — cross-reference more aggressively with Civilization lectures and book summaries in vault
- **Richer concept definitions** — when Prof. Jiang introduces a framework (Iran Strategy Matrix, asymmetrical warfare, hubris), give it a full subsection with definition, mechanism, examples, and diagram
- **Geopolitical context subsections** — brief background paragraphs where needed (e.g., 1953 coup, Iran-Iraq War, Abraham Accords) since these are contemporary topics readers may want context on

---

## Inventory

| # | Title | Transcript File | Status |
|---|-------|----------------|--------|
| 1 | Iran's Strategy Matrix | `Geo-Strategy #1;  Iran's Strategy Matrix (128kbit_AAC).txt` | Pending |
| 2 | Christian Zionism and the Middle East Conflict | `Geo-Strategy #2;  Christian Zionism and the Middle East Conflict (128kbit_AAC-English).txt` | Pending |
| 3 | How Empire is Destroying America | `Geo-Strategy #3;  How Empire is Destroying America (128kbit_AAC-English).txt` | Pending |
| 4 | Saudi Arabia's Trump Card Against Iran | `Geo-Strategy #4;   Saudi Arabia's Trump Card Against Iran (128kbit_AAC).txt` | Pending |
| 5 | Why Trump Will Win | `Geo-Strategy #5;  Why Trump Will Win (And Pick Nikki Haley as VP) (128kbit_AAC-English).txt` | Pending |
| 6 | America's Imperial Hubris | `Geo-Strategy #6;  America's Imperial Hubris (128kbit_AAC).txt` | Pending |
| 7 | Who Killed Iranian President Ebrahim Raisi | `Geo-Strategy #7;  Who Killed Iranian President Ebrahim Raisi¿ (128kbit_AAC-English).txt` | Pending |
| 8 | The Iran Trap | `Geo-Strategy #8;  The Iran Trap (128kbit_AAC).txt` | Pending |
| 9 | Putin's War for the Soul of Russia | `Geo-Strategy #9;  Putin's War for the Soul of Russia (128kbit_AAC).txt` | Pending |
| 10 | Putin's Strategic Imagination | `Geo-Strategy #10;  Putin's Strategic Imagination (128kbit_AAC).txt` | Pending |
| 11 | The Second American Civil War | `Geo-Strategy #11;  The Second American Civil War (128kbit_AAC).txt` | Pending |
| 12 | Psychohistory | `Geo-Strategy #12;  Psychohistory (The Science of Imagining the Future) (128kbit_AAC).txt` | Pending |

---

## Output Locations

- Analysis files: `analysis/jiang_geo-strategy-NN.md` (e.g. `analysis/jiang_geo-strategy-01.md`)
- Summary files: `summaries/Lectures/Geo-Strategy/NN - Title.md` (e.g. `summaries/Lectures/Geo-Strategy/01 - Iran's Strategy Matrix.md`)
- Series overview: `summaries/Lectures/Geo-Strategy/_overview.md` (update after each lecture)

---

## Critical: Chunked Writing to Avoid Timeouts

**Sub-agents timeout at ~800 lines of output.** Each lecture produces an analysis (~200-350 lines) + summary (~900+ lines). To avoid timeouts, use a **4-step chunked approach**:

### Step 1: Analysis (one agent call)
- Read the transcript from `inbox/`
- Write the full analysis file to `analysis/jiang_geo-strategy-NN.md`
- This is ~200-350 lines — fits in one agent call
- **Enhanced for 900+ target:** Diagram Opportunities section should plan 8-12 diagrams (not 4-8)
- **Enhanced for 900+ target:** Historical Narratives section should capture ALL stories with maximum detail

### Step 2: Summary Part 1 — Opening + first major section (one agent call)
- Read the analysis file + original transcript
- Write the summary file with:
  - Frontmatter
  - 30-second blockquote
  - The Question section
  - Key Concepts at a Glance table
  - First major content section (with 3-4 Mermaid diagrams, callouts, coloured text, bullet points)
- End with `<!-- CONTINUE FROM HERE -->` marker
- Target: ~300-350 lines

### Step 3: Summary Part 2 — Middle sections (one agent call)
- Read the existing partial summary file
- Read the analysis file for remaining content
- Replace `<!-- CONTINUE FROM HERE -->` with:
  - Middle content sections (with 3-4 Mermaid diagrams, callouts, etc.)
- End with a new `<!-- CONTINUE FROM HERE -->` marker
- Target: ~300-350 lines

### Step 4: Summary Part 3 — Final sections + Connections + Takeaway (one agent call)
- Read the existing partial summary file
- Read the analysis for remaining content
- Replace `<!-- CONTINUE FROM HERE -->` with:
  - Remaining content sections (with 2-4 Mermaid diagrams)
  - Connections section (builds on, sets up, related books)
  - The Takeaway (2-3 paragraphs)
- Update `summaries/Lectures/Geo-Strategy/_overview.md`
- Target: ~300-350 lines

---

## Processing Order

Process sequentially, one lecture at a time. **Do not pause between lectures — start the next immediately.**

```
Geo-Strategy #1  — Iran's Strategy Matrix
Geo-Strategy #2  — Christian Zionism and the Middle East Conflict
Geo-Strategy #3  — How Empire is Destroying America
Geo-Strategy #4  — Saudi Arabia's Trump Card Against Iran
Geo-Strategy #5  — Why Trump Will Win
Geo-Strategy #6  — America's Imperial Hubris
Geo-Strategy #7  — Who Killed Iranian President Ebrahim Raisi
Geo-Strategy #8  — The Iran Trap
Geo-Strategy #9  — Putin's War for the Soul of Russia
Geo-Strategy #10 — Putin's Strategic Imagination
Geo-Strategy #11 — The Second American Civil War
Geo-Strategy #12 — Psychohistory
```

---

## Per-Lecture Processing Steps

### Step 1: Analysis

1. Find the transcript in `inbox/` matching the lecture
2. Read the full transcript
3. Clean mentally: timestamps (`Prof. Jiang  0:00`) are section markers, `Speaker 1`/`Unknown Speaker` = students, fix obvious transcription errors
4. Write the analysis file to `analysis/jiang_geo-strategy-NN.md` following `.claude/commands/lecture-analyse.md`:
   - Frontmatter (date, type, tags, lecturer, series, lecture-number, title, source-file, continuity)
   - Core Question
   - Lecture Type (most will be "Geopolitical analysis")
   - Structural Map
   - Central Thesis
   - Argument Structure (theories + evidence for/against + verdict)
   - Key Concepts & Frameworks
   - Historical Narratives & Examples (**capture ALL stories with maximum detail** — names, dates, specifics)
   - Evidence & Sources
   - Student Q&A Insights (**capture ALL substantive Q&A** — these expand the summary significantly)
   - Cross-Lecture Connections (within Geo-Strategy series AND back to Civilization)
   - Diagram Opportunities (**plan 8-12 Mermaid diagrams** — strategy matrices, cause-effect chains, timelines, concept maps, comparison diagrams)
   - Summarisation Notes

### Step 2: Summary Part 1 (write opening + first section)

1. Read the analysis file
2. Read the original transcript for quote verification
3. Write the summary file to `summaries/Lectures/Geo-Strategy/NN - Title.md` containing:
   - Frontmatter
   - 30-second blockquote
   - The Question section
   - Key Concepts at a Glance table
   - First major content section with:
     - 3-4 Mermaid diagrams
     - 2-3 story callouts (`> [!example]`)
     - 1 key insight callout (`> [!tip]`)
     - Theory evaluation callout if applicable (`> [!abstract]`)
     - Coloured text for key terms, dangers, insights
     - Full bullet-point explanatory content
4. End with `<!-- CONTINUE FROM HERE -->` marker

### Step 3: Summary Part 2 (append middle sections)

1. Read the existing partial summary
2. Read the analysis for remaining content
3. Replace `<!-- CONTINUE FROM HERE -->` with:
   - Middle content sections with:
     - 3-4 Mermaid diagrams
     - 2-3 story callouts
     - Theory evaluation callouts where applicable
     - Full Q&A subsections where student questions prompted important clarifications
4. End with new `<!-- CONTINUE FROM HERE -->` marker

### Step 4: Summary Part 3 (append final sections + connections + takeaway)

1. Read the existing partial summary
2. Read the analysis for remaining content
3. Replace `<!-- CONTINUE FROM HERE -->` with:
   - Remaining content sections with 2-4 Mermaid diagrams
   - Connections section:
     - **Builds on:** links to previous Geo-Strategy lectures AND relevant Civilization lectures
     - **Sets up:** links to next Geo-Strategy lectures
     - **Related books in vault:** cross-reference book summaries where ideas overlap
   - The Takeaway (2-3 paragraphs)
4. Update `summaries/Lectures/Geo-Strategy/_overview.md`: change lecture status from `Pending` to `Summarised`, update one-line description, add any new recurring themes

---

## Quality Checklist (verify after each lecture)

- [ ] Frontmatter complete (date, type, tags, lecturer, series, lecture-number, title)
- [ ] 30-second blockquote present
- [ ] Key Concepts at a Glance table present
- [ ] Every major question/argument covered
- [ ] **Minimum 8 Mermaid diagrams** (target 10-12)
- [ ] At least 1 timeline, 1 concept map, and 1 strategy matrix
- [ ] 1-2 interpretation sentences after every diagram
- [ ] Stories in `> [!example]` callouts (4-8 bullets, `**The lesson:**` closing)
- [ ] Theory evaluations in `> [!abstract]` callouts
- [ ] Coloured text: `<b style="color: #hex">` — red (#e74c3c), green (#27ae60), blue (#2980b9)
- [ ] NO coloured text inside callouts
- [ ] Bullet points for all explanatory content
- [ ] Connections section with `[[wikilinks]]` to adjacent lectures, Civilization lectures, and book summaries
- [ ] The Takeaway section (2-3 paragraphs)
- [ ] Series overview updated
- [ ] **900+ lines total**

## Diagram Guidance for Geo-Strategy

Geo-Strategy lectures are heavy on strategy, cause-effect, and geopolitical relationships. Prioritise these diagram types:

| Type | When to use | Expected frequency |
|------|-------------|-------------------|
| **Strategy Matrix** | Every time Prof. Jiang presents a multi-goal framework (Iran Strategy Matrix) | 1-2 per lecture |
| **Cause-Effect Chain** | Why something happened (multi-causal geopolitical events) | 2-3 per lecture |
| **Timeline** | Historical sequences (1953 coup → 1979 revolution → Iran-Iraq War → etc.) | 1-2 per lecture |
| **Comparison** | Contrasting strategies, powers, or approaches (Iran vs Saudi Arabia, Sunni vs Shia) | 1-2 per lecture |
| **Concept Map** | How the lecture's ideas connect to each other | 1 per lecture |
| **Decision Tree** | Theory or strategy evaluation | 0-1 per lecture |
| **Cycle Diagram** | Recurring patterns (empire rise/fall, escalation cycles) | 0-1 per lecture |

---

## Formatting Reference

**Colour system:**
- `<b style="color: #e74c3c">danger/warning/fatal mistake</b>`
- `<b style="color: #27ae60">key insight/conclusion/what Prof. Jiang considers the answer</b>`
- `<b style="color: #2980b9">named framework/model/key term</b>`

**Callout types:**
- `> [!example] Story Title (Date)` — historical narratives / geopolitical events
- `> [!tip] Core Insight` — max 1 per section
- `> [!abstract] Theory Evaluation: Topic` — competing theories as table
- `> [!warning] Title` — critical misconceptions or dangers

**Wikilinks:** `[[NN - Title]]` for lectures, `[[Title - Author]]` for books. No path prefix.

---

## Error Recovery

If a lecture fails mid-processing:
- Check if the analysis file was written — if yes, skip to summary step 2
- Check if a partial summary exists — look for `<!-- CONTINUE FROM HERE -->` and resume from there
- If the transcript is garbled or empty, skip it and note in this file

---

## Progress Tracking

After each lecture, update this section:

- [ ] Geo-Strategy #1 — Iran's Strategy Matrix
- [ ] Geo-Strategy #2 — Christian Zionism and the Middle East Conflict
- [ ] Geo-Strategy #3 — How Empire is Destroying America
- [ ] Geo-Strategy #4 — Saudi Arabia's Trump Card Against Iran
- [ ] Geo-Strategy #5 — Why Trump Will Win
- [ ] Geo-Strategy #6 — America's Imperial Hubris
- [ ] Geo-Strategy #7 — Who Killed Iranian President Ebrahim Raisi
- [ ] Geo-Strategy #8 — The Iran Trap
- [ ] Geo-Strategy #9 — Putin's War for the Soul of Russia
- [ ] Geo-Strategy #10 — Putin's Strategic Imagination
- [ ] Geo-Strategy #11 — The Second American Civil War
- [ ] Geo-Strategy #12 — Psychohistory
