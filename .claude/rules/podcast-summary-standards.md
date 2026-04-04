# Podcast Summary Standards

## Purpose

Podcast summaries in `summaries/Podcasts/` are written for human reading and learning.
They capture the core ideas, arguments, and stories from podcast episodes — whether interview, solo-educational, or narrative format.
The goal: feel like you listened to the full episode — not a brief overview, but a comprehensive walkthrough of every major idea, argument, and story presented, enriched with visual diagrams that clarify complex relationships.

## Depth Standard

**These are COMPREHENSIVE podcast summaries, not episode notes.**
The reader should finish the summary feeling they understand the episode's argument deeply — every claim weighed, every story preserved, every insight grounded.

- **Target length:** 400-800 lines per episode (scaled to content density — a 30-min focused interview may be 400 lines, a 3-hour deep-dive may reach 800+)
- Every major topic or argument discussed must be represented
- Do not summarise a claim in one sentence when two paragraphs would teach it properly
- Include the reasoning, not just the conclusions — explain WHY the guest/host believes what they believe
- Preserve the chain of logic: question → claim → evidence → counter-argument → conclusion

## Podcast Types

Different podcast formats require different structural approaches:

| Type | Structure | Focus | Example |
|------|-----------|-------|---------|
| **Interview** | Guest-centric, question-driven sections | Guest's expertise, unique perspectives, key stories | Lex Fridman, Joe Rogan |
| **Solo-educational** | Concept-driven, lecture-style sections | Host's argument, evidence, frameworks | Huberman Lab |
| **Solo-narrative** | Story-driven, chronological sections | Historical narrative, characters, dramatic arc | Hardcore History |
| **Panel** | Theme-driven, contrasting perspectives | Points of agreement and disagreement | — |

The `/podcast-analyse` skill identifies the type; the summary structure follows accordingly.

## Writing Standards

- Plain, engaging English — one idea per bullet, clear and direct
- Preserve the speaker's voice — if the host is conversational, mirror that energy; if academic, mirror that tone
- Use their terminology with clear definitions on first use
- Bold key terms on first use for scannability
- 3-5 key quotes per episode — short (under 15 words), memorable, attributed to the speaker
- Stories and anecdotes are the primary vehicle for retention — preserve ALL the best ones with real names, dates, and specifics

### Bullet Point Formatting

**All explanatory and analytical content must use bullet points and nested bullet points instead of dense prose paragraphs.**

**What to bullet-point:**
- Argument presentations (what's claimed, evidence for/against)
- Research findings and data cited
- Lists of characteristics, causes, or consequences
- Nuance and counter-arguments
- Reasoning chains (question → theories → evidence → verdict)
- Comparisons between approaches or perspectives

**What stays as short prose (1-3 sentences max):**
- Section openers (italic previews)
- Brief transition sentences between major ideas
- The 30-second blockquote at the top

**Inside callout boxes (`> [!example]`):**
- Story content also uses bullet points — but NO coloured text inside callouts
- The `**The lesson:**` closing line stays as a standalone line (not bulleted)

**Nesting rules:**
- Use nested bullets (`  -`) to break down a point into sub-components
- Maximum 3 levels of nesting
- Each top-level bullet should be a complete thought

### Colour and Emphasis Standards

Use coloured text to create visual hierarchy. Obsidian renders inline HTML.

**Colour rules:**
- Coloured text is **ALWAYS bolded** — never use colour on plain or italic-only text
- Use colour sparingly — if everything is coloured, nothing stands out

**Colour system (3 colours only):**

| Colour | HTML | Use for | Example |
|--------|------|---------|---------|
| Red | `<b style="color: #e74c3c">text</b>` | Warnings, dangers, common mistakes, what NOT to do | <b style="color: #e74c3c">The replication crisis undermines this claim</b> |
| Green | `<b style="color: #27ae60">text</b>` | Core insights, key conclusions, the episode's big idea | <b style="color: #27ae60">Sleep is the foundation of all other protocols</b> |
| Blue | `<b style="color: #2980b9">text</b>` | Named frameworks, models, key terms on first introduction | <b style="color: #2980b9">Non-Sleep Deep Rest (NSDR)</b> |

**Frequency guidelines:**
- **Red:** 1-2 per major section
- **Green:** 1-2 per major section
- **Blue:** 2-4 per major section
- Total coloured items per major section: roughly 4-7

## Mermaid Diagram Standards

Podcasts benefit from visual diagrams just like lectures — hosts often present complex, interconnected ideas.

### Minimum Requirements

- **Minimum 4 diagrams per episode, target 6-8**
- Every episode MUST have at least:
  1. A **concept map** showing how the episode's key ideas connect
  2. A **flowchart or timeline** showing a process, argument chain, or historical sequence

### Diagram Types

| Type | When to use | Mermaid syntax |
|------|-------------|---------------|
| **Concept Map** | How ideas relate within the episode | `flowchart TB` with concept nodes and labelled edges |
| **Argument Flow** | How the guest builds their case | `flowchart TB` with claim → evidence → conclusion |
| **Timeline** | Historical sequences, career arcs | `flowchart LR` with chronological nodes |
| **Comparison** | Contrasting approaches or worldviews | `flowchart LR` with parallel branches |
| **Process** | Step-by-step methods or protocols | `flowchart TB` with sequential steps |
| **Cause-Effect** | Why something happened (multi-causal) | `flowchart TB` with converging arrows |

### Diagram Rules

- Every diagram MUST have 1-2 sentences of interpretation immediately below it
- Use clear, short node labels (max 5-6 words per node)
- Use colour sparingly for emphasis (`style` for key nodes only)
- Keep diagrams under 15 nodes — split into multiple if larger
- Test that Obsidian's Mermaid renderer can handle the syntax

## Story & Example Standards

Stories and anecdotes are what make podcast summaries memorable.

- **2-4 stories per major section** — the best illustrative examples from the conversation
- Preserve real names, dates, and specifics
- For personal anecdotes: who, what happened, what it taught them
- For research citations: name the study, the finding, and the implication

### Story Callouts

Every story or extended example uses `> [!example]` with a bold title:

```
> [!example] The Stanford Marshmallow Study Revisited
> - The original 1972 study claimed delayed gratification predicted life success
> - Guest explains the 2018 replication found socioeconomic status was the real predictor
> - Children from stable homes waited longer — not because of willpower, but because they trusted the promise
> - The original conclusion was backwards: stability enables patience, not the other way around
> **The lesson:** Always check whether a famous study has been replicated before building on it.
```

### Key Insight Callouts

The single most important takeaway per major section gets `> [!tip]`:

```
> [!tip] Core Insight
> The most effective learning protocol is not repetition but spaced retrieval under mild stress — test yourself, don't re-read.
```

- Maximum one `> [!tip]` per major section
- Keep to 1-3 sentences

### Guest Quote Callouts (NEW — podcast-specific)

The 2-3 most striking direct quotes from the guest get `> [!quote]`:

```
> [!quote] Andrew Huberman
> "Your nervous system doesn't care about your goals. It cares about your state."
```

- Maximum 2-3 per episode
- Under 15 words
- Only the most memorable, crystallising moments

### Practical Technique Callouts

Step-by-step techniques and actionable methods get `> [!abstract]`:

```
> [!abstract] Huberman's Morning Light Protocol
> 1. Get outside within 30-60 minutes of waking
> 2. Face the sun (don't stare directly) for 5-10 minutes
> 3. Overcast days require 15-20 minutes
> 4. No sunglasses, but prescription glasses are fine
> 5. This sets your circadian clock for the next 24 hours
```

## Three-Depth Structure (Required)

Every podcast summary must work at three reading speeds:

1. **30-second scan** — blockquote at top (3-5 sentences): what episode is about, who the guest is, the key takeaway
2. **5-minute review** — Guest Profile (for interviews) or Episode Overview + Key Concepts at a Glance table
3. **Full read** — complete summary with all arguments, stories, diagrams, and connections

## Section Structure by Podcast Type

### Interview podcasts

```
## Guest Profile
[2-3 sentences: who they are, why they're credible, what they're known for]

## The Big Idea
[The central claim or framework the guest presents]

## [Question-Driven Sections]
[Each major topic as a question: "Why does X happen?" / "How does Y work?"]

## Connections
## The Takeaway
```

### Solo-educational podcasts

```
## Episode Overview
[What the host set out to explain/argue]

## [Concept-Driven Sections]
[Each major concept with mechanism, evidence, and practical implications]

## Connections
## The Takeaway
```

### Solo-narrative podcasts

```
## The Story
[1-2 sentence preview of the narrative]

## [Chronological Sections]
[Events in sequence, with context and analysis woven in]

## Connections
## The Takeaway
```

## Continuity & Cross-Reference Standards

### Connections Section (at the end, before The Takeaway)

```markdown
## Connections

**Previous episodes:** [[03 - Sleep Optimization]] (circadian rhythm foundation)
**Related books in vault:** [[Why We Sleep - Matthew Walker]], [[Atomic Habits - James Clear]]
**Related lectures:** [[07 - The Covert War]] (stress response overlap)
```

- Use `[[wikilinks]]` with no path prefix
- Reference specific concepts from linked content, not just titles
- Cross-reference book summaries in the vault when topics overlap

### Series Overview

After each podcast summary is completed:
1. Check/create `summaries/Podcasts/<Series>/_overview.md`
2. Add episode entry with one-line description

## Anti-Patterns — Never Do These

- No Toulmin structures (claim/grounds/warrant/qualifier/rebuttal)
- No implementation intentions or exercises
- No career-specific framing
- No academic or analytical formatting — this is a teaching document
- **No compressing a 2-hour podcast into 150 lines — that is a blurb, not a summary**
- No inventing content the speakers didn't discuss
- No correcting the speakers' claims unless flagging as `[Note: research disputes this]`

## The Takeaway Section

The Takeaway should be 2-3 substantive paragraphs:
1. What this episode adds to your understanding — what's the one idea that changes how you think?
2. The most surprising or counterintuitive insight — what would you not have expected?
3. What questions remain open — what did the conversation leave unresolved?

## Quality Gate

Before saving a podcast summary, verify:
- Every major topic/argument from the episode is covered
- At least 2-3 stories/anecdotes per major section
- Claims backed by evidence (not just assertions)
- Line count within target range (400-800)
- **Minimum 4 Mermaid diagrams present and rendering correctly**
- At least 1 concept map
- Stories wrapped in `> [!example]` callouts
- Key insights in `> [!tip]` callouts
- 2-3 guest quotes in `> [!quote]` callouts (interviews)
- Connections section links to related content in vault
- No more than 3 consecutive dense prose paragraphs without a visual break
- Key Concepts at a Glance uses table format
- Each major section has an italic opener
- Explanatory content uses bullet points
- Coloured text uses `<b style="color: ...">` HTML tags — no colours inside callouts
- Frontmatter includes: date, type, tags, author (host), title, series, episode-number, guest

## File Naming

Podcast files live inside the Obsidian vault at `summaries/Podcasts/<Series>/NN - Title.md`

Examples:
- `summaries/Podcasts/Lex Fridman/367 - Sam Altman.md`
- `summaries/Podcasts/Huberman Lab/01 - Sleep Optimization.md`
- `summaries/Podcasts/Hardcore History/69 - Supernova in the East.md`

Zero-pad the episode number. Sanitise characters that aren't valid in filenames.
