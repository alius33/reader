# Narrative Summary Structure

This is the **preferred structure** for all podcast summaries and lecture summaries. It follows the content chronologically with collapsible detail, rather than reorganising thematically.

## When to Use

- All podcast summaries (`/podcast-summarize`)
- All lecture summaries (`/lecture-summarize`)
- Any content that is a recording of someone speaking (interview, lecture, panel, solo)

## Why This Structure

Thematic reorganisation strips the conversation of its narrative flow — the back-and-forth, the follow-up questions, the moments where a speaker shifts direction. This structure preserves that flow while still providing analytical formatting (highlights, diagrams, callouts) and a scannable overview.

The collapsible sections solve the length problem: the overview and section previews give you the 5-minute read, while expanding any section gives you the full exchange-by-exchange detail.

---

## Document Structure

### 1. Frontmatter

Standard YAML frontmatter with type, tags, author, title, series, guest, duration, etc.

### 2. Title + 30-Second Blockquote

```markdown
# Episode Title

> 3-5 sentence overview. Who is speaking, what the topic is, what the central argument is, why it matters.
```

### 3. Overview: Key Highlights

Always visible. The reader's 5-minute scan layer.

```markdown
## Overview: Key Highlights

- <b style="color: #27ae60">Key insight 1</b> — one-sentence explanation
- <b style="color: #2980b9">Named Framework</b> — what it is in one line
- <b style="color: #e74c3c">Critical warning</b> — what to watch out for
- ...8-12 highlights total, using all three colours

| Concept | One-line summary |
|---------|-----------------|
| **Term** | Brief explanation |
| ...     | 8-12 entries     |
```

**Rules:**
- 8-12 coloured bullet highlights covering the biggest ideas
- Key Concepts table with 8-12 entries
- This section alone should give a reader the episode's value in 2 minutes

### 4. The Conversation (Chronological Sections)

The body of the summary. Follows the actual content chronologically.

```markdown
# The Conversation

## Section Title [Timestamp Range]

*2-3 sentence italic preview describing what happens in this section. Names the speakers and the topic shift.*

> [!tip] Core Insight  (optional — max 1 per section, only for the biggest moments)
> The distilled takeaway in 1-2 sentences.

```mermaid
flowchart TB
    ...
```
*1 sentence interpreting the diagram.* (optional — only where a diagram genuinely helps)

> [!note]- Expand: Full Conversation
> - Speaker opens by asking/saying...
> - Other speaker responds by explaining that...
>   - Sub-point with detail
>   - Sub-point with evidence
> - Speaker follows up with...
> - <b style="color: #27ae60">Key insight highlighted inline</b>
> - <b style="color: #e74c3c">Warning or danger highlighted inline</b>
>
> > [!example] Story Title
> > - Bullet point narrative of the story
> > - What happened
> > - The outcome
> > **The lesson:** One sentence.
>
> > [!quote] Speaker Name
> > "Direct quote under 15 words."
```

### 5. Connections

```markdown
## Connections

**Related books in vault:**
- [[Title - Author]] — specific concept overlap
- ...
```

---

## Section Rules

### What Gets Its Own Section
- Each major topic shift in the conversation
- Natural chapter boundaries (from AssemblyAI auto_chapters or lecture structure)
- Target: 15-30 sections for a 2-3 hour recording, 8-15 for a 1-hour recording

### Section Heading Format
```
## Descriptive Title [Timestamp or Timestamp Range]
```
- Title should describe the TOPIC, not just "Part 5"
- Timestamp helps listeners locate the section in the audio
- Use question format when the content is driven by a question: `## Why Does Empire Building Exist? [2:39 - 5:52]`

### The Italic Preview (Always Visible)
- 2-3 sentences maximum
- Names the speakers and what they do in this section
- Tells the reader whether they want to expand or skip
- Written in narrative voice: "Ryan asks about X. Ethan responds by explaining Y, drawing on his experience at Z."

### The Collapsible Section (`> [!note]-`)
- The `-` after `[!note]` makes it **collapsed by default** in Obsidian
- Contains the FULL exchange-by-exchange narrative
- Every significant point made by either speaker gets a bullet
- Use nested bullets for sub-points and evidence
- Coloured text (`<b style="color:">`) allowed inside the collapsible section but NOT inside nested callouts
- Nested callouts (`> [!example]`, `> [!quote]`) go inside the collapsible section — NO coloured text inside these

### Diagrams
- Place OUTSIDE the collapsible section (always visible)
- 1-2 sentences of interpretation below
- Target 4-8 diagrams per episode for podcasts, 6-10 for lectures
- Only where a diagram genuinely helps — do not force diagrams on linear narrative

### Story Callouts (`> [!example]`)
- Nested INSIDE the collapsible `> [!note]-` section
- 4-8 bullet points of narrative
- End with `**The lesson:**` on its own line
- NO coloured text inside

### Key Insight Callouts (`> [!tip]`)
- Place OUTSIDE the collapsible section (always visible)
- Maximum 1 per section — only for the genuinely biggest moments
- 1-2 sentences

### Quote Callouts (`> [!quote]`)
- Can be inside or outside the collapsible section
- Under 15 words
- Attributed to speaker

---

## Exchange-by-Exchange Writing Style

Inside the collapsible sections, write in narrative voice that names speakers:

**Good:**
```
> - Ryan asks whether it is possible to change the incentive structure to reward impact instead of headcount
> - Ethan says yes in theory — but it takes more effort because comparing impact across teams is inherently subjective
>   - He illustrates: if one leader's product generates direct revenue and another runs infrastructure, who has more impact?
>   - That judgment call "just makes you mad" — which is why headcount remains the default
> - Ryan pushes: "But doesn't Amazon's leadership principle explicitly say no bonus for headcount?"
> - Ethan laughs: "There damn sure is a bonus — several hundred thousand dollars a year"
```

**Bad:**
```
> - Empire building exists because headcount is rewarded
> - It's rewarded because counting people is easy
> - Impact is subjective
```

The bad version strips out the conversation dynamics. The good version tells you WHO said what, WHEN they pushed back, and HOW the other person responded.

---

## Length Targets

| Content type | Expected sections | Expected lines |
|-------------|-------------------|----------------|
| 30-min podcast | 5-8 | 300-500 |
| 1-hour podcast | 10-15 | 500-800 |
| 2-hour podcast | 18-25 | 800-1200 |
| 3-hour podcast | 25-35 | 1000-1400 |
| 45-min lecture | 8-12 | 400-700 |
| 60-min lecture | 12-18 | 600-900 |

These are guides, not hard limits. A dense episode may exceed them.

---

## Quality Gate

Before saving a narrative summary, verify:
- [ ] Overview has 8-12 coloured highlights and a Key Concepts table
- [ ] Every section has an italic preview (always visible)
- [ ] Every section has a collapsible `> [!note]-` with full exchange detail
- [ ] Speakers are named throughout ("Ryan asks", "Ethan explains")
- [ ] Sections follow chronological order of the actual content
- [ ] 4-8 Mermaid diagrams present and outside collapsible sections
- [ ] Stories in `> [!example]` callouts inside collapsible sections
- [ ] No coloured text inside `> [!example]` or `> [!quote]` callouts
- [ ] Connections section with wikilinks to related vault content
- [ ] Frontmatter includes author (= host name for podcasts, = "Unknown" for lectures)
