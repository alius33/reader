---
description: Convert a lecture summary into a production-ready ElevenLabs audio script in Prof. Jiang's voice
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /lecture-audio-script — Lecture Audio Script Generator

Convert a lecture summary from `summaries/Lectures/` into a clean, two-voice audio script for ElevenLabs Projects production. Prof. Jiang speaks in first person throughout. Q&A sections become genuine dialogue.

**Usage:**
- `/lecture-audio-script <search term>` — e.g. `/lecture-audio-script civilization 5` or `/lecture-audio-script how evil triumphs`

**Output:** `summaries/Lectures/<Series>/NN - Title - AUDIO SCRIPT.md`

**Standards:** See `.claude/rules/audio-script-standards.md` for all ElevenLabs formatting rules, adaptation rules, voice recommendations, and prose standards. Read that file before generating any script.

---

## Step 1 — Read Standards

Read `.claude/rules/audio-script-standards.md` in full before proceeding.

---

## Step 2 — Find the Lecture Summary

Search `summaries/Lectures/**/*.md` for files matching the search term.

Match against:
- Lecture title (e.g. "how evil triumphs")
- Series + number (e.g. "civilization 5" → `Civilization/05 - *.md`)
- Series name alone (e.g. "geo-strategy" → list all Geo-Strategy lectures)

Exclude files ending in `AUDIO SCRIPT.md` and `_overview.md`.

- **0 matches:** Report "No lecture summary found for '[term]'." — stop.
- **1 match:** Proceed.
- **2+ matches:** List them and ask which one.

Detect the series from the folder path:
- `Civilization/` → series: "Civilization", lecture count: 60
- `Geo-Strategy/` → series: "Geo-Strategy", lecture count: 12
- `Secret History/` → series: "Secret History", lecture count: 28

Extract the lecture number from the filename (e.g. `04 - How Evil Triumphs.md` → lecture 4).

---

## Step 3 — Find the Analysis File

Derive the analysis filename from series + lecture number:
- Civilization lecture 5 → `jiang_civilization-05.md`
- Geo-Strategy lecture 3 → `jiang_geo-strategy-03.md`
- Secret History lecture 4 → `jiang_secret-history-04.md`

Search `analysis/` for the match.

- **Found:** Read both summary and analysis. The analysis contains the cleaned transcript, fuller Q&A, and additional context.
- **Not found:** Proceed with summary only. Note this in the output report.

---

## Step 4 — Identify Structural Elements

Before writing, scan the summary for:

1. **The central question(s)** — usually in the first section heading or the `> blockquote` at top
2. **Theory evaluation sections** — multiple theories presented and compared (will become spoken theory evaluation)
3. **Mermaid diagrams** — note each one; all must be converted to verbal content (not skipped)
4. **Q&A section** — identify how many exchanges exist; plan to keep 3–4 best
5. **Connections section** — note the previous and next lecture references for intro/outro

---

## Step 5 — Estimate Runtime

Lecture audio scripts target 45–60 minutes (~7,000–9,000 words).

Shorter, denser lectures may yield 35–50 min scripts — that's acceptable.
Do not pad to hit a target.

---

## Step 6 — Build the Script

Apply all adaptation rules and formatting standards from `.claude/rules/audio-script-standards.md`.

### YAML frontmatter

```yaml
---
date: [today's date]
type: audio-script
source: "[[NN - Title]]"
series: [Series Name]
lecture: [NN]
runtime-estimate: X–Y minutes
word-count: ~X,XXX
voices: [daniel, liam]
---
```

### Production notes block

Use the lecture template from `.claude/rules/audio-script-standards.md`.

---

### Standardised Intro (~150–200 words)

```
[Prof. Jiang]: Welcome back. This is Lecture [N] of [Series Name]. Today's question — [the central question, stated as Prof. Jiang would state it: direct, slightly provocative, framed as a genuine mystery that matters].

[Prof. Jiang]: Last time, we established [1-2 sentences referencing the previous lecture's conclusion from the Connections section]. Today's question builds directly from that.

<break time="1.0s" />
```

If there is no previous lecture (lecture 1 of a series):
```
[Prof. Jiang]: Welcome. This is the first lecture of [Series Name]. [What the series is about and why it matters — 2-3 sentences].
```

---

### The Question Section (~300–500 words)

```
[Prof. Jiang]: [Expand the central question. Why is it important? What are the stakes? What do most people assume the answer is — and why is that assumption probably wrong?]

[Prof. Jiang]: [Set up the structure of today's lecture: "To answer this, I want to look at [N] things..." or "I want to take you through [the sequence of the lecture]..."]
```

---

### Theory Evaluation Sections

When the summary presents Prof. Jiang evaluating competing theories:

```
[Prof. Jiang]: The first theory — and the obvious one — is [Theory Name]. The argument goes like this: [state the theory in its strongest form, 2-3 sentences].

[Prof. Jiang]: But here's the problem. [Evidence against it — specific sites, dates, findings, counterexamples]. So we can set this one aside.

<break time="0.5s" />

[Prof. Jiang]: The second theory is [Theory Name]. [State it and evaluate it].

[repeat for each theory]

[Prof. Jiang]: Which brings me to the theory I find most convincing. [State it]. Here's why. [The evidence for it. Specific sites, findings, patterns across civilisations. Why it's better than the alternatives].
```

---

### Historical Narrative Sections

For stories and extended examples from the summary:

```
[Prof. Jiang]: Let me give you an example. [Name, event, date, context]. [4-8 sentences of story — what happened, the sequence of events, the outcome]. And here's why I find that significant: [what the story proves for the lecture's argument].
```

Convert `> [!example]` callouts into the above format. Drop the callout title and the "The lesson:" label — weave the lesson naturally into Prof. Jiang's conclusion.

---

### Mermaid Diagram Conversion (never skip)

Every Mermaid diagram carries content. Convert each:

**Timeline/flowchart → Verbal sequence:**
```
[Prof. Jiang]: Let me walk you through the sequence, because the order matters. [Starting point] — that's [date/context, what it meant]. From there, [next step] — [what changed and why]. By the time we reach [endpoint], [what the full sequence reveals about the lecture's argument].
```

**Concept map → Verbal connection:**
```
[Prof. Jiang]: What I want you to see is how these ideas connect. [Concept A] creates the conditions for [Concept B], which in turn makes [Concept C] possible. This isn't coincidence — this is the pattern we see repeating across [civilisations/periods/cases].
```

**Theory evaluation diagram → Already handled in theory section above.**

**Strategy matrix → Verbal framework:**
```
[Prof. Jiang]: I think about this as four simultaneous requirements — and this is important, because if you only satisfy three of them, the whole strategy fails. The first requirement is [arm 1]: [explanation and example]. The second is [arm 2]...
```

---

### Q&A as Dialogue

Select the 3–4 most intellectually valuable exchanges from the Q&A section.

**Include:**
- Questions that add a genuinely new angle or challenge Prof. Jiang's thesis
- Questions where Jiang's response reframes something covered earlier
- Questions that a thoughtful student would actually ask

**Cut:**
- Questions asking for clarification of something already covered
- Questions where the response is essentially "yes, that's right"
- Weak or tangential exchanges

Format:
```
[Prof. Jiang]: Let me take some questions. [A brief framing sentence if there's an important question about to land].

[Student]: [The question as a natural spoken sentence — 1-3 sentences. First person: "Professor, I'm wondering about..." or "But doesn't that mean..." — not a bullet point].

[Prof. Jiang]: [Jiang's response. Conversational. May push back on the premise. May use an analogy. Lands a conclusion. Can be 3-8 sentences depending on the depth of the response].

<break time="0.5s" />

[Student]: [Next question if present]

[Prof. Jiang]: [Response]
```

If the original Q&A has 6+ exchanges, summarise the others briefly:
```
[Prof. Jiang]: There were other questions about [topic] and [topic], which I want to briefly address. [2-3 sentences covering the substance without full dialogue format].
```

---

### The Takeaway (~300–400 words)

```
[Prof. Jiang]: So what have we established today? Let me bring this together.

[Prof. Jiang]: [What this lecture adds to the series' big picture — how it connects to what came before and what it sets up for what comes next].

[Prof. Jiang]: [The most surprising or counterintuitive conclusion from today's lecture — the thing that should change how a listener sees something].

[Prof. Jiang]: [What remains open. What question didn't get fully resolved. What the next lecture will address].
```

---

### Standardised Outro (~60–80 words)

Pull the next lecture reference from the Connections section of the summary:

```
[Prof. Jiang]: That's Lecture [N]: [Title]. Next time, we'll be asking [next lecture's central question or topic, stated as a genuine question or teaser]. I'll see you then.

<break time="1.5s" />
```

For the final lecture of a series:
```
[Prof. Jiang]: That's Lecture [N] — and the final lecture of [Series Name]. [One sentence: what the series as a whole has established]. Thank you.
```

---

## Step 7 — Quality Gate

- [ ] No markdown syntax survives (scan: `#`, `**`, `[[`, `>`, `- `, ` ``` `, `|`)
- [ ] No HTML tags survive
- [ ] `[Prof. Jiang]:` used throughout all lecture content
- [ ] `[Student]:` used only for Q&A questions; student lines are 1–3 sentences max
- [ ] Every major question/argument from the lecture is represented
- [ ] All competing theories presented AND evaluated — not just the winner
- [ ] All Mermaid diagrams converted to verbal content (none skipped)
- [ ] Q&A: 3–4 best exchanges selected; flows as natural spoken dialogue
- [ ] Break tags at theory transitions and major section breaks
- [ ] `---` dividers between major sections (intro, question, theories, narratives, Q&A, takeaway)
- [ ] Intro references previous lecture (or series intro for lecture 1)
- [ ] Outro previews next lecture (or closes series for final lecture)
- [ ] Stories have real names, dates, specifics — not compressed
- [ ] Standardised intro and outro present
- [ ] Production notes block complete and accurate
- [ ] YAML frontmatter complete
- [ ] Word count and runtime updated in frontmatter and production notes

---

## Step 8 — Write the Output File

Path: `summaries/Lectures/<Series>/NN - Title - AUDIO SCRIPT.md`

Example: `summaries/Lectures/Secret History/04 - How Evil Triumphs - AUDIO SCRIPT.md`

---

## Step 9 — Update Trackers

**Update `summaries/_audio_index.md`:**
```markdown
| [[NN - Title]] | Lecture | [Series] | ✅ Done | [[NN - Title - AUDIO SCRIPT]] | ~X min | YYYY-MM-DD |
```

**Update `summaries/Lectures/<Series>/_overview.md`:**
Find the row for this lecture and add or update: `🎧 Audio script: [[NN - Title - AUDIO SCRIPT]]`

---

## Step 10 — Output Report

Report:
- **Lecture:** [N] — [Title] ([Series])
- **Script:** [file path]
- **Word count:** ~X,XXX words
- **Estimated runtime:** X–Y minutes
- **Diagrams converted:** [N] diagrams → verbal content
- **Q&A exchanges:** [N kept out of N total]
- **Analysis file used:** Yes / No
- **Notes:** [anything the user should know — e.g. a diagram that was ambiguous, Q&A that was thin]
