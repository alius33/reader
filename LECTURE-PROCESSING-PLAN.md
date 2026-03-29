# Lecture Processing Plan — Cursor Execution

## What This Is

This plan processes ~100 lecture transcripts from Prof. Jiang Xueqin across 3 series into structured, diagram-rich summaries. It is designed to be run in Cursor with Opus 4.6 (1M context).

**Read these files first to understand the workflow:**
1. `CLAUDE.md` — project structure and rules
2. `.claude/rules/lecture-summary-standards.md` — formatting standards (colours, diagrams, callouts, bullet points)
3. `.claude/rules/human-summary-standards.md` — inherited formatting rules
4. `.claude/commands/lecture-analyse.md` — analysis step details
5. `.claude/commands/lecture-summarize.md` — summarization step details
6. `summaries/Lectures/Civilization/01 - Explaining Humanity's Transition to Agriculture.md` — reference example of a completed summary

## Inventory

| Series | Lectures | Already Done | Remaining |
|--------|----------|-------------|-----------|
| Civilization | 60 (#1-60) | #1 | 59 |
| Geo-Strategy | 12 (#1-12) | 0 | 12 |
| Secret History | 28 (#1-28) | 0 | 28 |
| **Total** | **100** | **1** | **99** |

Transcripts are in `inbox/` as `.txt` files with names like:
- `Civilization #2;  Religion and the Dawn of Society (128kbit_AAC).txt`
- `Geo-Strategy #1;  Iran's Strategy Matrix (128kbit_AAC).txt`
- `Secret History #1;  How Power Works (4K Re-Upload with Audio Fixed) (128kbit_AAC).txt`

**Note:** `Secret History #24` has a duplicate file (`(1).txt`). Use the one without `(1)`.

## Output Locations

- Analysis files → `analysis/jiang_<series>-<NN>.md` (e.g. `analysis/jiang_civilization-02.md`)
- Summary files → `summaries/Lectures/<Series>/NN - Title.md` (e.g. `summaries/Lectures/Civilization/02 - Religion and the Dawn of Society.md`)
- Series overviews → `summaries/Lectures/<Series>/_overview.md` (update after each lecture)

---

## Critical: Chunked Writing to Avoid Timeouts

**Sub-agents timeout at ~800 lines of output.** Each lecture produces an analysis (~150-250 lines) + summary (~350-500 lines). To avoid timeouts:

### For each lecture, use a 3-step chunked approach:

**Step 1: Analysis (one agent call)**
- Read the transcript from `inbox/`
- Write the full analysis file to `analysis/jiang_<series>-<NN>.md`
- This is ~150-250 lines — fits in one agent call

**Step 2: Summary Part 1 — Write the first half (one agent call)**
- Read the analysis file
- Write the summary file with: frontmatter, blockquote, The Question, Key Concepts table, and the FIRST HALF of the main content sections (roughly first 2-3 major sections with their diagrams and callouts)
- End with a clear `<!-- CONTINUE FROM HERE -->` marker
- Target: ~200-300 lines

**Step 3: Summary Part 2 — Append the second half (one agent call)**
- Read the existing partial summary file
- Read the analysis file for remaining content
- Use Edit (not Write) to replace the `<!-- CONTINUE FROM HERE -->` marker with: remaining content sections, Connections, The Takeaway
- Target: ~150-250 lines
- Update the series `_overview.md` to mark lecture as Summarised

### If a lecture is short/simple enough (transcript under 40 lines), steps 2+3 can be combined.

---

## Batch Execution Order

Process in this order, 10 lectures per batch. **Do not pause between batches — start the next immediately.**

### Batch 1: Civilization #2-11
```
Civilization #2  — Religion and the Dawn of Society
Civilization #3  — The Religious Imagination
Civilization #4  — The Paradise Lost of Marija Gimbutas
Civilization #5  — The Yamnaya Conquest of Europe
Civilization #6  — Elite Overproduction and the Bronze Age Collapse
Civilization #7  — Homer's Iliad and the Birth of Greek Civilization
Civilization #8  — Rat Utopia and the Peloponnesian War
Civilization #9  — Aeschylus, Sophocles, and Euripides as Prophets of Democracy
Civilization #10 — The Trial of Socrates and Plato's Allegory of the Cave
Civilization #11 — The Greatness of Philip II of Macedon
```

### Batch 2: Civilization #12-21
```
Civilization #12 — The Tyranny of Alexander the Great
Civilization #13 — Aristotle and the Greek Legacy
Civilization #14 — Hannibal Barca, Lucius Brutus, and the Triumph of Rome
Civilization #15 — The Myth-Making Genius of Julius Caesar
Civilization #16 — Julius Caesar's Will and Octavian's Birth of Empire
Civilization #17 — Homer, Vergil, and the War for the Soul of Rome
Civilization #18 — The Great Pyramid as Ancient Egypt's Manhattan Project
Civilization #19 — Gilgamesh and Mesopotamia's Quest for Immortality
Civilization #20 — The Proto-Buddhists of the Indus Valley Civilization
Civilization #21 — The Apology of King David of Israel
```

### Batch 3: Civilization #22-31
```
Civilization #22 — The Literary Genesis of the Yahwist
Civilization #23 — Cyrus the Great as Messiah
Civilization #24 — Resurrecting the Gnostic Jesus
Civilization #25 — Paul of Tarsus, Messiah of Rome
Civilization #26 — Constantine's Monotheistic Revolution
Civilization #27 — Augustine's Empire of God
Civilization #28 — Muhammad's Revolution of God
Civilization #29 — Dante's Divine Comedy and the Liberation of the Human Imagination
Civilization #30 — Dante as the Second Coming of Homer
Civilization #31 — The Oceanic Currents of History
```

### Batch 4: Civilization #32-41
```
Civilization #32 — Rome's Rise, Fall, and Legacy
Civilization #33 — The Rise and Fall of the Byzantine Empire
Civilization #34 — The Useful Fiction of the Holy Roman Empire
Civilization #35 — The Viking Legacy
Civilization #36 — Memory of the Norse
Civilization #37 — The Golden Age of Islam
Civilization #38 — Twilight of the Middle Kingdom
Civilization #39 — Genghis Khan, World Shatterer
Civilization #40 — Church and Empire
Civilization #41 — Dante's Quiet Revolution
```

### Batch 5: Civilization #42-51
```
Civilization #42 — The Protestant Reformation and the Birth of Capitalism
Civilization #43 — The Structure of Scientific Revolutions
Civilization #44 — The Spanish Conquest of the New World
Civilization #45 — The Gunpowder Revolution
Civilization #46 — The Revolution of Reason
Civilization #47 — The Passion of Robespierre
Civilization #48 — Napoleon's Empire of Myth
Civilization #49 — The Dutch Golden Age and the Rise of the Middle Class
Civilization #50 — Rule, Britannia!
Civilization #51 — Shakespeare's Language of Empire
```

### Batch 6: Civilization #52-60
```
Civilization #52 — Empire of Democracy
Civilization #53 — Dostoevsky and the Soul of Russia
Civilization #54 — The German Will to Power
Civilization #55 — Kant, Hegel, and the Theory of Everything
Civilization #56 — What Marx Got Wrong
Civilization #57 — How Modernism Ruined Everything
Civilization #58 — Birth of the Nation-State
Civilization #59 — The Man of Steel
Civilization #60 — The Decline and Fall of the American Empire
```

### Batch 7: Geo-Strategy #1-12 (all)
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

### Batch 8: Secret History #1-10
```
Secret History #1  — How Power Works
Secret History #2  — How Societies Collapse
Secret History #3  — Death by Gerontocracy
Secret History #4  — How Evil Triumphs
Secret History #5  — The Birth of Evil
Secret History #6  — The Psychology of Evil
Secret History #7  — Death by Meritocracy
Secret History #8  — Death by Bureaucracy
Secret History #9  — The Theory of Everything
Secret History #10 — The Conspiracy of Evil
```

### Batch 9: Secret History #11-20
```
Secret History #11 — Dawn of the Human Imagination
Secret History #12 — Heaven on Earth
Secret History #13 — Mandate of Heaven
Secret History #14 — Legacy of the Steppes
Secret History #15 — Capital and the Bronze Age Collapse
Secret History #16 — The Big Bang of Greek Civilization
Secret History #17 — Literary Genesis
Secret History #18 — Thus Spoke Zarathustra
Secret History #19 — Dawn of the Jews
Secret History #20 — The Hellenistic World
```

### Batch 10: Secret History #21-28
```
Secret History #21 — Roman Anti-Civilization
Secret History #22 — The Divine Spark of Jesus
Secret History #23 — The Organization of Evil
Secret History #24 — Empire of Church
Secret History #25 — Capital of Evil
Secret History #26 — Faith of Evil
Secret History #27 — Empire of Evil
Secret History #28 — Pax Judaica
```

---

## Per-Lecture Processing Steps (for each lecture in a batch)

### Step 1: Analysis

1. Find the transcript in `inbox/` matching the lecture
2. Read the full transcript
3. Clean mentally: timestamps (`Prof. Jiang  0:00`) are section markers, `Speaker 1`/`Unknown Speaker` = students, fix obvious transcription errors (place names, concept names)
4. Write the analysis file to `analysis/jiang_<series>-<NN>.md` following the structure in `.claude/commands/lecture-analyse.md`:
   - Frontmatter (date, type, tags, lecturer, series, lecture-number, title, source-file, continuity)
   - Core Question
   - Lecture Type
   - Structural Map
   - Central Thesis
   - Argument Structure (theories + evidence for/against + verdict)
   - Key Concepts & Frameworks
   - Historical Narratives & Examples (full detail for retelling)
   - Evidence & Sources
   - Student Q&A Insights
   - Cross-Lecture Connections
   - Diagram Opportunities (plan 4-8 Mermaid diagrams)
   - Summarisation Notes

### Step 2: Summary Part 1 (write first half)

1. Read the analysis file
2. Read the original transcript for quote verification
3. Write the summary file to `summaries/Lectures/<Series>/NN - Title.md` containing:
   - Frontmatter
   - 30-second blockquote
   - The Question section
   - Key Concepts at a Glance table
   - First 2-3 major content sections (with Mermaid diagrams, callouts, coloured text, bullet points)
4. End with `<!-- CONTINUE FROM HERE -->` marker

### Step 3: Summary Part 2 (append second half)

1. Read the existing partial summary
2. Read the analysis for remaining content
3. Replace `<!-- CONTINUE FROM HERE -->` with:
   - Remaining content sections (with diagrams, callouts, etc.)
   - Connections section (builds on, sets up, related books)
   - The Takeaway (2-3 paragraphs)
4. Update `summaries/Lectures/<Series>/_overview.md`: change lecture status from `Pending` to `Summarised`, update one-line description

---

## Quality Checklist (verify after each lecture)

- [ ] Frontmatter complete (date, type, tags, lecturer, series, lecture-number, title)
- [ ] 30-second blockquote present
- [ ] Key Concepts at a Glance table present
- [ ] Every major question/argument covered
- [ ] **Minimum 4 Mermaid diagrams** (target 6-8)
- [ ] At least 1 timeline and 1 concept map
- [ ] 1-2 interpretation sentences after every diagram
- [ ] Stories in `> [!example]` callouts (4-8 bullets, `**The lesson:**` closing)
- [ ] Theory evaluations in `> [!abstract]` callouts
- [ ] Coloured text: `<b style="color: #hex">` — red (#e74c3c), green (#27ae60), blue (#2980b9)
- [ ] NO coloured text inside callouts
- [ ] Bullet points for all explanatory content
- [ ] Connections section with `[[wikilinks]]` to adjacent lectures and book summaries
- [ ] The Takeaway section (2-3 paragraphs)
- [ ] Series overview updated
- [ ] 350-500 lines total (shorter transcripts may be 300)

## Formatting Reference

See the completed example: `summaries/Lectures/Civilization/01 - Explaining Humanity's Transition to Agriculture.md`

**Colour system:**
- `<b style="color: #e74c3c">danger/warning/anti-pattern</b>`
- `<b style="color: #27ae60">key insight/conclusion/what to do</b>`
- `<b style="color: #2980b9">named framework/model/key term</b>`

**Callout types:**
- `> [!example] Story Title (Date)` — historical narratives
- `> [!tip] Core Insight` — max 1 per section
- `> [!abstract] Theory Evaluation: Topic` — competing theories as table
- `> [!warning] Title` — critical misconceptions

**Wikilinks:** `[[NN - Title]]` for lectures, `[[Title - Author]]` for books. No path prefix.

---

## Error Recovery

If a lecture fails mid-processing:
- Check if the analysis file was written — if yes, skip to summary step
- Check if a partial summary exists — if yes, look for `<!-- CONTINUE FROM HERE -->` and resume from there
- If the transcript is garbled or empty, skip it and note in this file

## Progress Tracking

After each batch, update this section:

- [ ] Batch 1: Civilization #2-11
- [ ] Batch 2: Civilization #12-21
- [ ] Batch 3: Civilization #22-31
- [ ] Batch 4: Civilization #32-41
- [ ] Batch 5: Civilization #42-51
- [ ] Batch 6: Civilization #52-60
- [ ] Batch 7: Geo-Strategy #1-12
- [ ] Batch 8: Secret History #1-10
- [ ] Batch 9: Secret History #11-20
- [ ] Batch 10: Secret History #21-28
