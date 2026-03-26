---
description: Extract text from book files in inbox/ to plain text in extracted/
allowed-tools: Read, Write, Bash, Glob
---

# /extract — Text Extraction

Extract raw text from book files in `inbox/` and save as clean plain text in `extracted/`.
This is a pre-processing step that separates file format handling from the LLM analysis.

**Usage:**
- `/extract <filename>` — extract a specific file from `inbox/` (e.g. `/extract Deep Work - Cal Newport.epub`)
- `/extract` — extract all unprocessed files in `inbox/` (batch mode)

---

## Pre-Flight

1. Ensure `extracted/` directory exists — create it if not
2. Scan `inbox/` for book files (PDF, EPUB, MOBI)

### If no arguments provided:
1. List all book files in `inbox/`
2. Check `extracted/` for existing `.txt` files
3. Identify files that don't have a matching `.txt` in `extracted/`
4. Process each unprocessed file
5. If none found: report "No unprocessed books in inbox/"

### If filename provided:
1. Verify `inbox/$ARGUMENTS` exists
2. Check if `extracted/` already has a matching `.txt` — if so, report "Already extracted" and skip (unless user confirms re-extraction)

---

## Extraction by Format

### PDF files

Use the Read tool with the `pages` parameter to extract text:

1. Read pages in batches of 20: pages "1-20", "21-40", etc.
2. Concatenate all text
3. Write to `extracted/<stem>.txt` where `<stem>` is the filename without extension

### EPUB files

Extract using Python:
```bash
pip install ebooklib beautifulsoup4 2>/dev/null
python3 -c "
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import sys

book = epub.read_epub('inbox/$FILEPATH')
for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
    soup = BeautifulSoup(item.get_content(), 'html.parser')
    text = soup.get_text()
    if text.strip():
        print(text)
" > "extracted/$STEM.txt"
```

### MOBI files

Convert to EPUB first using Calibre, then extract:
```bash
ebook-convert "inbox/$FILEPATH" /tmp/converted.epub 2>/dev/null
```

Then follow the EPUB extraction process on `/tmp/converted.epub`.

If Calibre is not installed:
- Report: "MOBI extraction requires Calibre. Install from https://calibre-ebook.com (free)."
- Skip the file and continue with others in batch mode

---

## Post-Extraction

For each extracted file:

1. Count lines: `wc -l "extracted/$STEM.txt"`
2. Verify the file has substantial content (at least 100 lines)
3. If under 100 lines, flag as potentially corrupted or DRM-protected

---

## Output Report

After extraction, report for each file:
- **File:** [original filename]
- **Format:** [PDF/EPUB/MOBI]
- **Output:** `extracted/[stem].txt`
- **Lines extracted:** [count]
- **Issues:** [any problems encountered, or "None"]

If batch mode, also report:
- **Total files processed:** [count]
- **Skipped (already extracted):** [count]
- **Failed:** [count and reasons]
