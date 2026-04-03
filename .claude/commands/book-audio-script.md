---
description: Convert a book summary into a production-ready ElevenLabs audio script
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /book-audio-script — Book Audio Script Generator

Convert a book summary from `summaries/` into a clean, multi-voice audio script for ElevenLabs Projects production.

**Usage:**
- `/book-audio-script <search term>` — e.g. `/book-audio-script 33 strategies` or `/book-audio-script deep work`

**Output:** `summaries/<Category>/Title - Author - AUDIO SCRIPT.md`

**Standards:** See `.claude/rules/audio-script-standards.md` for all ElevenLabs formatting rules, adaptation rules, voice recommendations, and prose standards. Read that file before generating any script.

---

## Step 1 — Read Standards

Read `.claude/rules/audio-script-standards.md` in full before proceeding.

---

## Step 2 — Find the Summary File

Search `summaries/**/*.md` for files matching the search term (title or author, case-insensitive).

Exclude from results: `_index.md`, `_audio_index.md`, `Book List.md`, `_overview.md`, any file ending in `AUDIO SCRIPT.md`.

- **0 matches:** Report "No summary found for '[term]'. Check the vault." — stop.
- **1 match:** Proceed.
- **2+ matches:** List them and ask the user to confirm which one before continuing.

Note the category from the file path (e.g. `summaries/Mindset & Self-Mastery/` → category is `Mindset & Self-Mastery`).

---

## Step 3 — Find the Analysis File

Derive the expected analysis filename:
- Author last name (kebab-case) + short title (kebab-case)
- Example: "Cal Newport, Deep Work" → `newport_deep-work.md`

Search `analysis/` for a match. If multiple possible matches, pick the most specific one.

- **Found:** Read both the summary AND the analysis file. The analysis provides context, additional stories, and nuance not always visible in the summary.
- **Not found:** Proceed with summary only. Note "No analysis file found" in the output report.

---

## Step 4 — Classify the Book

Read the summary and classify into one or more types:

| Type | Detection signal |
|------|-----------------|
| **Taxonomy** | Quick Lookup Table present; OR 20+ numbered entries (laws, strategies, rules, habits) |
| **Manual/How-to** | Majority of sections are step-by-step techniques; numbered protocols dominate |
| **Argument** | Linear thesis development; each chapter builds on previous; no lookup table |
| **Short** | Summary under ~500 lines |

A book can be multiple types (e.g. Taxonomy + Argument). Note both.

---

## Step 5 — Estimate Runtime

Count summary lines, then estimate:

| Summary lines | Target runtime |
|--------------|---------------|
| Under 500 | 30–45 min |
| 500–900 | 45–60 min |
| 900–1,400 | 60–80 min |
| Taxonomy (20–33 entries) | ~90–120 min |
| Taxonomy (34–48 entries) | ~110–150 min |

For taxonomy books: count the entries and multiply × 2.5–3 min per entry for the entries section, then add ~20–25 min for intro, frameworks, verdict, and outros.

Report the estimate to yourself before proceeding.

---

## Step 6 — Flag Check (PAUSE IF TRIGGERED)

Before generating anything, check all four conditions. If any trigger, STOP and report to the user. Present the issue, the options, and wait for their response before continuing.

**Flag A — Very short summary (under 300 lines)**
> "The summary for [Title] is only [N] lines — the audio script would likely run under 20 minutes. This may mean the summary is thin, or the book is genuinely short. How would you like to proceed?
> Options: (1) Proceed anyway, (2) Check the analysis file first, (3) Skip for now."

**Flag B — Visually-dominant summary (30%+ content in tables/diagrams/structured lists with no prose)**
> "A significant portion of [Title]'s summary is in visual formats that don't translate naturally to audio narration. The script may feel thin. Options: (1) Proceed — convert what's there, note gaps. (2) Produce a 30-min highlights version focusing on narrative sections only. (3) Skip."

**Flag C — Explicit quality warning in summary**
If the summary frontmatter or content contains notes like "NOTE: this summary is incomplete":
> "The summary for [Title] has a quality note: '[quote it]'. Continue with what's there, or skip?"

**Flag D — Fiction/poetry/memoir with plot-summary structure**
If frontmatter tags include `fiction`, `novel`, `poetry`, `memoir` AND the summary reads as plot summary rather than concept extraction:
> "[Title] appears to be [type]. An audio script would read like a book report rather than a lecture. Proceed anyway, or skip?"

---

## Step 7 — Build the Script

Read `.claude/rules/audio-script-standards.md` again if needed. Apply all adaptation rules and formatting standards strictly.

### File structure (in order):

1. YAML frontmatter
2. Production notes comment block
3. Standardised Intro
4. About the Author (absorbed into intro or as a brief standalone passage)
5. The Big Idea
6. [For taxonomy books: Five Key Frameworks or equivalent section before strategies]
7. Main content (by chapter/part/section — see structure rules below)
8. Verdict
9. Standardised Outro

### YAML frontmatter

```yaml
---
date: [today's date]
type: audio-script
source: "[[Title - Author]]"
author: Author Name
year: Publication Year
category: [Category from folder path]
runtime-estimate: X–Y minutes
word-count: ~X,XXX
voices: [daniel, charlotte]
---
```

### Production notes block

Use the book template from `.claude/rules/audio-script-standards.md`. Fill in actual runtime estimate and word count (estimate before writing; update after).

### Standardised Intro (~200–300 words)

Template:
```
[Narrator]: Welcome. Today we're exploring [Title] by [Author], published in [Year]. [1-2 sentence hook — specific, not generic: what problem this book solves, why it became influential, what makes it distinctive]. By the end of this, you'll understand [the book's central promise or transformation].

[Narrator]: [Author] is [2-3 sentence biography: credentials, background, why qualified, one memorable detail if available].
```

The hook must be specific. "This is a book about strategy" is wrong. "This is the book that rewrote how a generation of executives, lawyers, and military officers think about conflict — not by teaching them to fight harder, but by showing them how rarely they need to fight at all" is right.

### Verbal transitions between sections

Use these natural spoken forms — vary them:
- "Let's move now to [topic]..."
- "From here, Greene turns to..."
- "This brings us to [section]..."
- "Chapter [N] addresses something the previous argument left unresolved..."
- "Now, with that foundation in place..."

---

### Structure: Taxonomy Books

#### 1. Big Idea (~400–600 words)

State the central thesis. Explain why it matters. Describe the book's five-part (or equivalent) structure briefly — "Greene divides this into five domains..." Make clear the book is not a collection of tips but a curriculum.

#### 2. Key Frameworks (~600–900 words)

For books with 3–6 named frameworks (like 33 Strategies of War), cover each framework:
- What it is (1-2 sentences)
- The mechanism (1-2 paragraphs)
- The best illustrative example from the summary
- What it reveals that isn't obvious

Do not skip frameworks — they are the conceptual scaffolding. Mermaid diagrams of frameworks: skip the diagram, but convert the content to prose.

#### 3. Part/Group Introduction

Before each thematic group of strategies, add:
```
[Narrator]: [Part name]. [1-2 sentences: what this group is about, what Greene argues these strategies share, why this group comes before the next].

<break time="0.8s" />
```

#### 4. Per-Entry Structure (every single entry, no exceptions)

For each strategy/law/rule:
```
[Narrator]: [Strategy N]: [Full title].

[Narrator]: [Core principle — what this strategy says and why it matters, 2-4 sentences].

[Narrator]: [Main story — 4-8 sentences. Named people, specific year, what happened, what it proved. This is not summarised — it is told].

[Narrator]: [If summary provides both observance and transgression: tell the second story. If the entry is a key entry with extended treatment: add the nuance/limitation].

[Narrator]: [Closing insight — what the listener should take away, 1-2 sentences].

<break time="0.6s" />
```

**Voice 2 use in entries:** If the entry has a direct quote from the book (under 15 words) that crystallises the principle, use `[Author]:` for that quote before the narrator continues. Maximum one quote per entry.

**Story rules:**
- "The lesson:" from callouts must NOT be read as a label — weave it into the narrative: "And that's the pattern: Lincoln's entire strategy sharpened the moment he named his enemy."
- Keep real names, dates, specifics — these are what make entries memorable in audio
- Paraphrase stories — never reproduce verbatim from the source

**Key entries vs standard entries:**
- Standard entries: ~2.5 min (core principle + one main story + closing insight)
- Key entries (those with 4+ stories or extended treatment in the summary): ~4–5 min (add second story, add nuance section)
- You can identify key entries from the summary: they have more content, more stories, more nuance sections

#### 5. Verdict (~400–600 words)

```
[Narrator]: So where does that leave us with [Title]?

[Narrator]: Greene's greatest contribution here is [what the book adds — what problem it finally solved, what it changed in how people think]. [Then: where the evidence is thin, where the reasoning strains, where the advice is naive — honest assessment].

[Narrator]: Who gets the most from this book? [Describe the ideal reader — their situation, their problem, why this book speaks to them]. [Comparison: how does this book sit relative to others on the same topic — e.g., 48 Laws of Power, Art of War, On War].
```

#### 6. Standardised Outro

```
[Narrator]: That's [Title] by [Author]. [One final thought — the book's lasting contribution in one sentence, or the single question it leaves you with].

<break time="1.0s" />

[Narrator]: Thank you for listening.
```

---

### Structure: Argument Books

Follow the book's chapter flow. For each chapter:
```
[Narrator]: [Verbal transition into this chapter's topic, 1-2 sentences].

[Narrator]: [The chapter's central argument in plain language — what the author is trying to establish and why it matters].

[Narrator]: [Main story or example — told narratively, not as bullet points. 4-8 sentences].

[Narrator]: [Key insight from this chapter and its implication for the overall thesis].

<break time="1.0s" />
```

### Structure: Manual/How-to Books

For each technique or method:
```
[Narrator]: [Method name and what it's for, 1-2 sentences].

[Narrator]: Here's how it works. [Step-by-step in natural spoken prose — "You start by... Then you... The key at this stage is... Finally..."].

[Narrator]: [Why it works — the mechanism or psychology behind it].

[Narrator]: [Best illustrative story or example from the summary].

<break time="0.8s" />
```

---

## Step 8 — Quality Gate

Run this checklist before saving. Fix any issues found.

- [ ] No markdown syntax survives: scan for `#`, `**`, `[[`, `>`, `- `, ` ``` `, `|`
- [ ] No HTML tags survive: `<b>`, `<span>`, `<br>`, `<break` (only `<break time=.../>` is allowed)
- [ ] All speaker labels are `[Narrator]:` or `[Author]:` — consistent throughout
- [ ] `[Author]:` used only for direct quotes present in the original summary — not paraphrases
- [ ] Every major section of the summary is represented
- [ ] For taxonomy books: every single entry is present, none skipped
- [ ] Intro is standardised (welcome, title, author, year, hook, biog)
- [ ] Outro is standardised (title, final thought, thank you)
- [ ] Production notes block is complete and accurate
- [ ] YAML frontmatter is complete
- [ ] Break tags at section transitions; `---` dividers between chapters/parts
- [ ] Script reads naturally aloud — no list cadence, no heading cadence, no "bullet point voice"
- [ ] Stories have real names, dates, narrative arc — not compressed summaries
- [ ] "The lesson:" callout closers are woven into narrative — not read as labels
- [ ] Tables converted to spoken comparisons
- [ ] Mermaid diagrams skipped (no content lost — if the diagram added content not elsewhere, convert it to prose)
- [ ] Word count and runtime estimate updated in frontmatter and production notes

---

## Step 9 — Write the Output File

Path: `summaries/<same category as source>/Title - Author - AUDIO SCRIPT.md`

If the category folder doesn't exist, use the same folder as the source file.

---

## Step 10 — Update `_audio_index.md`

Read `summaries/_audio_index.md`. Find the row for this book (if it exists) or add a new row:

```markdown
| [[Title - Author]] | Book | Category | ✅ Done | [[Title - Author - AUDIO SCRIPT]] | ~X min | YYYY-MM-DD |
```

If the row has status `⏳ In Progress`, update it to `✅ Done`.

---

## Step 11 — Output Report

Report:
- **Book:** [Title] by [Author]
- **Type:** [Taxonomy / Argument / Manual]
- **Script:** [file path]
- **Word count:** ~X,XXX words
- **Estimated runtime:** X–Y minutes
- **Entries covered:** [N/N for taxonomy books]
- **Analysis file used:** Yes / No
- **Flags triggered:** None / [list]
- **Notes:** [anything the user should know]
