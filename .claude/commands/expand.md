---
description: Surgically expand existing summaries that are below minimum quality
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /expand — Expand Existing Summaries

Surgically add missing content to existing summaries without rewriting from scratch.
Preserves all existing content — only ADDS to what's there.

**Usage:**
- `/expand <summary-path>` — expand a specific summary
- `/expand --all-short` — find and expand all summaries under minimum line count

---

## Process

### Step 1: Diagnose

1. Read the existing summary
2. Run validation: `python scripts/validate.py "<path>" -v`
3. Parse the validation output to identify specific gaps:
   - Missing sections (Verdict, Related Reading, About the Author, etc.)
   - Under line count (how many lines short?)
   - Missing Mermaid diagrams (how many needed?)
   - Too few story callouts (how many more needed?)
   - Missing tip callouts
   - Missing Key Concepts table
   - Missing section openers (italic previews)
4. Read the matching analysis file from `analysis/` if one exists

### Step 2: Plan Additions

Based on the diagnosis, create an ordered list of additions:

| Priority | Gap | Fix |
|----------|-----|-----|
| 1 | Missing required sections | Write and append the section |
| 2 | Under line count | Identify thin chapter sections, expand with mechanism + stories |
| 3 | Missing Mermaid diagrams | Generate and insert at natural locations |
| 4 | Too few story callouts | Add stories from analysis or online research |
| 5 | Missing tip callouts | Add key insight callouts per major section |
| 6 | Missing section openers | Add italic previews after ## headings |
| 7 | Missing Key Concepts table | Convert existing bullet list to table format |

### Step 3: Execute Additions

For each gap, use the Edit tool to surgically insert content:

**Missing sections:**
- Append at the appropriate location in the file
- Follow the formatting standards from `.claude/rules/human-summary-standards.md`

**Thin chapter sections:**
- Identify which sections are shortest relative to their importance
- Expand with:
  - Deeper mechanism explanation (WHY it works — 2-3 paragraphs)
  - Additional stories from the analysis file's Best Stories section
  - When it applies / when it doesn't apply analysis
  - Connection to other concepts in the book
- Use bullet points for explanatory content

**Mermaid diagrams:**
- Add flowcharts for sequential processes
- Add concept maps for how key ideas relate
- Place after the first mention of the concept being visualised
- Include 1 sentence of interpretation below each diagram

**Story callouts:**
- Wrap in `> [!example] Title (Date/Context)` format
- 4-8 bullet points per story
- Include `**The lesson:**` closing line
- No coloured text inside callouts

**Section openers:**
- Add 1-2 sentence italic preview after each `##` heading
- Focus on the shift or surprise the reader is about to encounter

### Step 4: Validate & Report

1. Re-run: `python scripts/validate.py "<path>" -v`
2. Compare before/after:
   - Original line count → new line count
   - Original check results → new check results
   - List which gaps were fixed

**Key constraint:** NEVER rewrite or modify existing content. Only ADD new content at appropriate locations. This preserves any manual edits.

---

## Batch Mode (`--all-short`)

1. Run: `python scripts/validate.py --report` to find summaries under minimum line count
2. Also include summaries with 3+ FAIL results
3. List all candidates and confirm with user before starting
4. Process each sequentially
5. After each, report: "Expanded [Title] — [original lines] → [new lines], [X] checks fixed"
6. At the end, report total books expanded and aggregate improvement
