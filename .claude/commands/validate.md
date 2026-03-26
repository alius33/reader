---
description: Validate book summaries and analysis files against quality standards
allowed-tools: Bash, Read, Glob
---

# /validate — Quality Validation

Run structural and formatting checks on summary or analysis files using `scripts/validate.py`.

**Usage:**
- `/validate <path>` — validate a specific summary file
- `/validate --all` — validate all summaries, show aggregate report
- `/validate --analysis <path>` — validate a specific analysis file
- `/validate --analysis --all` — validate all analysis files

---

## Execution

### If a specific file path is provided:

1. Run the validation script:
   ```bash
   python scripts/validate.py "$ARGUMENTS" -v
   ```
2. Read the output and present results to the user
3. For each FAIL or WARN, suggest a specific fix:
   - **Missing section:** "Add a `## Section Name` heading with appropriate content"
   - **Low line count:** "This summary needs expansion — consider running `/expand`"
   - **Missing Mermaid diagrams:** "Add 2-3 flowcharts or concept maps to visualise key relationships"
   - **Missing story callouts:** "Wrap stories in `> [!example] Title` callout blocks"
   - **Broken wikilinks:** "Check that the linked summary file exists in `summaries/`"
   - **Colours in callouts:** "Move coloured `<b>` tags outside of `> [!example]` blocks"
   - **Dense prose:** "Break prose into bullet points or add visual breaks (callouts, diagrams, tables, `---`)"
   - **Missing section openers:** "Add a 1-2 sentence italic preview after each `##` heading"

### If `--all` is provided:

1. Run the aggregate report:
   ```bash
   python scripts/validate.py --report
   ```
2. Present the summary statistics
3. Highlight the most common failures and suggest batch fixes

### If `--analysis` is provided:

1. Run the analysis validation:
   ```bash
   python scripts/validate.py --analysis "$ARGUMENTS" -v
   ```
   Or for all:
   ```bash
   python scripts/validate.py --analysis --all --report
   ```
2. For analysis files flagged as too sparse or missing Chapter-Level Detail, recommend re-running `/analyse`

---

## Output Report

After running, summarise:
- **Files checked:** [count]
- **Clean (all pass):** [count]
- **Warnings:** [count] — [most common warning]
- **Failures:** [count] — [most common failure]
- **Recommended action:** [what to fix first]
