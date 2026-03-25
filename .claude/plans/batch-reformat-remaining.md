# Implementation Plan: Reformat Remaining 17 Summaries

## Background

31 of 48 summaries have been reformatted:
- 3 pilot summaries (Never Split the Difference, Range, Your Brain at Work)
- 28 summaries completed in Phases 1-3

The formatting standards are in `.claude/rules/human-summary-standards.md`. All files below are under 715 lines — single-agent per book is fine (no splitting needed).

## What "reformatted" means

Same as the original plan — see `.claude/plans/batch-reformat-summaries.md` for full details. In short: bullet points everywhere, coloured `<b>` tags, callout boxes, mermaid diagrams, tables, section openers, breathing rules.

---

## Agent Prompt Template

Use this prompt for each summary, replacing `{FILENAME}`:

```
You are reformatting the book summary at `C:\Users\maila\Music\reader\summaries\{FILENAME}` to improve readability.

**Read the full file first**, then read the COMPLETE standards at `C:\Users\maila\Music\reader\.claude\rules\human-summary-standards.md`.

Then rewrite the ENTIRE file applying ALL formatting rules:

1. **BULLET POINTS** — Convert ALL explanatory/analytical prose paragraphs into bullet points with nesting. Only exceptions: italic section openers (1-2 sentences), brief transitions, 30-second blockquote, About the Author.
2. **BULLET POINTS INSIDE CALLOUTS** — Story content inside `> [!example]` uses `> - ` bullets. `**The lesson:**` stays standalone. NO coloured text inside callouts.
3. **COLOURED BOLD TEXT** — `<b style="color: ...">text</b>` HTML tags only. Red `#e74c3c` warnings, Green `#27ae60` insights, Blue `#2980b9` frameworks. ~5-8 per chapter section.
4. **CALLOUT BOXES** — Stories: `> [!example]`. Techniques: `> [!abstract]`. Insights: `> [!tip]` one per chapter.
5. **TABLES** — Key Concepts at a Glance as two-column table. Comparisons with 3+ items as tables.
6. **MERMAID DIAGRAMS** (2-5) — Flowcharts, concept maps. Each followed by 1 interpretation sentence.
7. **SECTION OPENERS** — 1-2 sentence italic preview per chapter/section.
8. **BREATHING RULES** — Max 3 consecutive bullet blocks without visual break.

Critical: Preserve ALL content, keep frontmatter as-is, keep wikilinks, British English. Write complete file with Write tool.
```

---

## Cleanup Scripts (run after each phase)

### Script 1: Fix any `<span>**text**</span>` → `<b>text</b>` issues

```bash
python3 -c "
import re, glob

files = glob.glob('C:/Users/maila/Music/reader/summaries/*.md')
pattern = r'<span style=\"color: (#[a-fA-F0-9]+)\">\*{2,3}(.*?)\*{2,3}</span>'

for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    count = len(re.findall(pattern, content))
    if count > 0:
        new_content = re.sub(pattern, r'<b style=\"color: \1\">\2</b>', content)
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        print(f'{count} fixes in {f.split(chr(92))[-1]}')
"
```

### Script 2: Bullet-point any remaining prose inside `> [!example]` callouts

```bash
python3 -c "
import re, glob

files = glob.glob('C:/Users/maila/Music/reader/summaries/*.md')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    in_example = False
    is_title_line = False
    converted = 0

    for line in lines:
        stripped = line.rstrip('\n')

        if re.match(r'^> \[!example\]', stripped):
            in_example = True
            is_title_line = True
            new_lines.append(line)
            continue

        if in_example:
            if not stripped.startswith('>'):
                in_example = False
                new_lines.append(line)
                continue

            if is_title_line:
                is_title_line = False
                new_lines.append(line)
                continue

            if stripped.rstrip() in ('>', '> '):
                new_lines.append(line)
                continue

            content = stripped[2:] if stripped.startswith('> ') else stripped[1:]

            if content.startswith('- ') or content.startswith('  - '):
                new_lines.append(line)
                continue

            if content.startswith('**The lesson:**'):
                new_lines.append(line)
                continue

            new_lines.append('> - ' + content + '\n')
            converted += 1
        else:
            new_lines.append(line)

    if converted > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f'{converted} lines fixed in {filepath.split(chr(92))[-1]}')
"
```

---

## Batch Schedule

All books are under 715 lines. Run 10 parallel `coder` agents with `run_in_background: true` per phase.

### Phase 4 (10 books)
1. `Thinking Strategically - Avinash K. Dixit & Barry J. Nalebuff.md` (714)
2. `Power - Jeffrey Pfeffer.md` (714)
3. `Who Gets Promoted, Who Doesn't, and Why - Donald Asher.md` (711)
4. `Digital Transformation - Thomas M. Siebel.md` (704)
5. `Executive Presence - Sylvia Ann Hewlett.md` (699)
6. `Invaluable - Maya Grossman.md` (694)
7. `Rise - Patty Azzarello.md` (691)
8. `Measure What Matters - John Doerr.md` (681)
9. `The Four Obsessions of an Extraordinary Executive - Patrick M. Lencioni.md` (680)
10. `Strategize to Win - Carla A. Harris.md` (670)

### Phase 5 (7 books)
11. `Fierce Conversations - Susan Scott.md` (662)
12. `Working Backwards - Colin Bryar & Bill Carr.md` (654)
13. `Corporate Confidential - Cynthia Shapiro.md` (647)
14. `Mindset - Carol S. Dweck.md` (642)
15. `Playing to Win - A.G. Lafley & Roger L. Martin.md` (620)
16. `The Start-Up of You - Reid Hoffman & Ben Casnocha.md` (616)
17. `So Good They Can't Ignore You - Cal Newport.md` (615)

---

## Execution Checklist

For each phase:
- [ ] Launch all agents in parallel with the prompt template above
- [ ] Wait for all to complete
- [ ] Run cleanup Script 1
- [ ] Run cleanup Script 2
- [ ] Spot-check one file in Obsidian
- [ ] Move to next phase

## After Phase 5 (final verification)

- [ ] Open 5-6 summaries across different sizes in Obsidian
- [ ] Verify Mermaid diagrams render correctly
- [ ] Verify coloured text displays as bold
- [ ] Verify callout boxes work
- [ ] Verify story callout content is bulleted
- [ ] Verify no content was lost
- [ ] Verify wikilinks still work

## How to run

Tell Claude: `implement this plan: .claude/plans/batch-reformat-remaining.md`
