---
description: Show pipeline dashboard — status of all books across all stages
allowed-tools: Read, Glob, Grep, Bash
---

# /status — Pipeline Dashboard

Show the state of every book across all pipeline stages.

**Usage:**
- `/status` — full dashboard
- `/status --stage inbox|extracted|analysed|summarised` — filter to one stage

---

## Execution

1. **Scan all stages:**
   - `inbox/` — list all PDF, EPUB, MOBI files
   - `extracted/` — list all `.txt` files
   - `analysis/` — list all `.md` files, read frontmatter for title/author/source-file
   - `summaries/` subfolders — list all `.md` files (excluding `_index.md`, `Book List.md`)

2. **Match books across stages:**
   - Match by filename stem (e.g. `Deep Work - Cal Newport` across directories)
   - For analysis files, also check the `source-file` and `extracted-file` frontmatter fields
   - Build a unified book list with status at each stage

3. **Get validation counts** (if summaries exist):
   - Run: `python scripts/validate.py --report` and parse the per-file pass/warn/fail counts
   - Or count checks manually by reading the summary file

4. **Get line counts** for all summaries:
   - Count lines per summary file

5. **Display the dashboard:**

```
PIPELINE STATUS
===============

Stage counts:
  Inbox:      [X] books
  Extracted:  [X] books
  Analysed:   [X] books
  Summarised: [X] books

Books needing attention:
  In inbox, not extracted:     [list]
  Extracted, not analysed:     [list]
  Analysed, not summarised:    [list]
  Summarised, under min lines: [list]

Full status:
| Book                              | Inbox | Extracted | Analysed | Summary (lines) |
|-----------------------------------|-------|-----------|----------|-----------------|
| Deep Work - Cal Newport           |   Y   |     Y     |    Y     |   1204          |
| New Book - Author                 |   Y   |     Y     |    N     |   —             |
```

6. **If `--stage` filter provided**, only show books at that stage and what's blocking them from advancing.

---

## Actionable Recommendations

At the end of the dashboard, suggest next actions:
- "Run `/extract` to process [X] books in inbox"
- "Run `/analyse` to process [X] extracted books"
- "Run `/summarize` to process [X] analysed books"
- "Run `/expand --all-short` to fix [X] summaries under minimum line count"
- "Run `/validate --all` to check quality across all [X] summaries"
