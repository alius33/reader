# Geo-Strategy Parallel Processing Plan

## Status

Lectures #1-#7 are complete. Five lectures remain.

| # | Title | Status |
|---|-------|--------|
| 1 | Iran's Strategy Matrix | ✅ Complete (922 lines) |
| 2 | Christian Zionism and the Middle East Conflict | ✅ Complete (903 lines) |
| 3 | How Empire is Destroying America | ✅ Complete (910 lines) |
| 4 | Saudi Arabia's Trump Card Against Iran | ✅ Complete (905 lines) |
| 5 | Why Trump Will Win | ✅ Complete (900 lines) |
| 6 | America's Imperial Hubris | ✅ Complete (900 lines) |
| 7 | Who Killed Iranian President Ebrahim Raisi | ✅ Complete (904 lines) |
| 8 | The Iran Trap | ⏳ Pending |
| 9 | Putin's War for the Soul of Russia | ⏳ Pending |
| 10 | Putin's Strategic Imagination | ⏳ Pending |
| 11 | The Second American Civil War | ⏳ Pending |
| 12 | Psychohistory | ⏳ Pending |

---

## Approach

Each of the five remaining lectures gets its **own dedicated agent** that owns the full pipeline from transcript to finished summary. All five agents run **in parallel**.

This eliminates the sequential bottleneck from the original plan and cuts total processing time by roughly 5×.

---

## Per-Agent Instructions (identical structure for each)

Each agent receives its lecture number/title and independently executes this 4-step pipeline:

### Step 1 — Analysis
- Read transcript from `inbox/`
- Write `analysis/jiang_geo-strategy-NN.md`
- Plan **8-12 Mermaid diagrams**
- Capture ALL stories, Q&A, and concepts with maximum detail

### Step 2 — Summary Part 1 (~300-350 lines)
- Write to `summaries/Lectures/Geo-Strategy/NN - Title.md`
- Frontmatter + 30-second blockquote + The Question + Key Concepts table + first major section
- End with `<!-- CONTINUE FROM HERE -->`

### Step 3 — Summary Part 2 (~300-350 lines)
- Replace `<!-- CONTINUE FROM HERE -->` with middle sections
- End with new `<!-- CONTINUE FROM HERE -->`

### Step 4 — Summary Part 3 (~300+ lines)
- Replace `<!-- CONTINUE FROM HERE -->` with final sections + Connections + The Takeaway
- **Do NOT update `_overview.md`** — handled by the orchestrator after all agents finish
- Verify line count; if under 900, expand immediately before finishing

---

## Collision Avoidance

Each agent writes to its **own unique files**:
- `analysis/jiang_geo-strategy-NN.md` — unique per lecture
- `summaries/Lectures/Geo-Strategy/NN - Title.md` — unique per lecture

The **only shared file** is `summaries/Lectures/Geo-Strategy/_overview.md`. To avoid race conditions, **no agent touches it**. The orchestrator (parent session) updates it once all five agents report completion.

---

## Quality Standard (enforced by each agent)

- **Minimum 900 lines** — agent verifies and expands if short
- **8-12 Mermaid diagrams** per summary
- Colour: `<b style="color: #hex">` only — never `<span>`, never inside callouts
- Stories in `> [!example]` callouts (4-8 bullets, `**The lesson:**` closing)
- All explanatory content in bullet points
- Connections section with `[[wikilinks]]` — no path prefix
- Frontmatter complete

---

## Lecture Continuity Notes

### #8 — The Iran Trap
- Follows lectures 1-7
- The Iran Trap is the series' climactic lecture: all threads converge (asymmetrical warfare, imperial hubris, IRGC strategy, three forces driving invasion). What does the actual war look like?
- Back-references: Lecture 1 (Iran Strategy Matrix, asymmetrical warfare), Lecture 6 (shock and awe failure conditions), Lecture 7 (IRGC provocation strategy)
- Sets up: Lectures 9-10 (Russia arc) — after the Iran scenario, the series pivots to Putin

### #9 — Putin's War for the Soul of Russia
- Series pivots from Middle East to Russia
- Connects back to Lectures 1-3 (rules of engagement with Russia, Russia in Iran conflict, imperial overextension)
- Sets up: Lecture 10 (Putin's Strategic Imagination)

### #10 — Putin's Strategic Imagination
- Follows #9 directly — same Putin/Russia arc
- Deepens #9 with specific strategic frameworks
- Sets up: Lecture 11 (American civil war arc)

### #11 — The Second American Civil War
- Returns to American domestic arc (connects to Lectures 3, 5, 6)
- America's internal fragmentation as both cause and consequence of imperial overreach
- Sets up: Lecture 12 (Psychohistory — the final synthesis)

### #12 — Psychohistory
- The series finale — Prof. Jiang applies historical patterns to predict the future
- Synthesises ALL prior lectures: Iran, empire, Russia, American civil war
- References Asimov's Foundation series (the science of predicting civilisational trajectories)
- No "Sets up" — this is the capstone

---

## Execution

Launch all five agents simultaneously in a single message. Each agent is given its transcript, continuity notes, and the full formatting requirements. The orchestrator (parent session) monitors completion and then does a single pass to update `_overview.md`.
