# Execution Plan — Book Summary Pipeline

**Date:** 2026-03-25
**Context:** Continuing from SESSION_HANDOFF.md. This session expanded 34 summaries from under 520 lines to 1000+ each. This plan covers all remaining work.

---

## Session Accomplishments (Before This Plan)

### Prior Session (Cursor)
- 7 books expanded to 900+ lines (Four Agreements, Daily Stoic, Zero to One, Mind for Numbers, Smart Notes, Peak, Meditations)

### This Session (Claude Code)
- **34 books expanded to 1000+ lines** in 4 parallel batches of 8-10 agents each
- All Priority 1 (24 books under 200 lines) and Priority 2 (10 books 200-520 lines) from SESSION_HANDOFF.md are DONE
- Total: ~34,500 new lines written

---

## Remaining Work — Three Phases

### Phase A: Create 33 New Summaries (books in inbox/ with no summary)

These books have source files in `inbox/` but no summary yet. Each needs: extract ebook text, create analysis file, write 1000+ line summary.

**Pre-extracted text available at `/tmp/extract_*.txt`** (run the extraction commands below if files are missing):

#### Tier 1 — Good extractions (1000+ lines of source text, highest quality)

| # | Book | Author | Extract File | Lines | Category | Format |
|---|------|--------|-------------|------:|----------|--------|
| 1 | The Dictator's Handbook | Bruce Bueno de Mesquita | /tmp/extract_mesquita.txt | 8019 | Wisdom & Big Ideas | epub |
| 2 | Critical Thinking | Richard W. Paul | /tmp/extract_paul.txt | 4291 | Strategy & Systems Thinking | epub |
| 3 | Who's Pulling Your Strings | Harriet B. Braiker | /tmp/extract_braiker.txt | 3932 | Awareness & Protection | epub |
| 4 | Originals | Adam Grant | /tmp/extract_grant.txt | 3537 | Mindset & Self-Mastery | epub |
| 5 | Never Eat Alone | Keith Ferrazzi | /tmp/extract_ferrazzi.txt | 3357 | Power & Influence | epub |
| 6 | Trust Me I'm Lying | Ryan Holiday | /tmp/extract_holiday_trust.txt | 3063 | Psychology & Decision Making | epub |
| 7 | Invent and Wander | Jeff Bezos | /tmp/extract_bezos.txt | 2870 | Wisdom & Big Ideas | epub |
| 8 | Wooden on Leadership | John Wooden | /tmp/extract_wooden.txt | 2857 | Leadership & Management | epub |
| 9 | Winning Now Winning Later | David M. Cote | /tmp/extract_cote.txt | 2324 | Leadership & Management | epub |
| 10 | 13 Things Mentally Strong People Don't Do | Amy Morin | /tmp/extract_morin.txt | 1944 | Mindset & Self-Mastery | epub |
| 11 | Humour Seriously | Jennifer Aaker | /tmp/extract_aaker.txt | 1704 | Power & Influence | epub |
| 12 | The Power Paradox | Dacher Keltner | /tmp/extract_keltner.txt | 1655 | Power & Influence | epub |
| 13 | The Expectation Effect | David Robson | /tmp/extract_robson.txt | 1136 | Psychology & Decision Making | epub |
| 14 | Sapiens | Yuval Noah Harari | /tmp/extract_harari.txt | 1055 | Strategy & Systems Thinking | epub |
| 15 | An Astronaut's Guide to Life on Earth | Chris Hadfield | /tmp/extract_hadfield.txt | 1052 | Mindset & Self-Mastery | epub |

#### Tier 2 — Partial extractions (300-720 lines, supplement with agent knowledge)

| # | Book | Author | Extract File | Lines | Category | Format |
|---|------|--------|-------------|------:|----------|--------|
| 16 | Making Numbers Count | Chip Heath | /tmp/extract_heath.txt | 718 | Strategy & Systems Thinking | epub |
| 17 | Edge | Laura Huang | /tmp/extract_huang.txt | 676 | Mindset & Self-Mastery | epub |
| 18 | Predatory Thinking | Dave Trott | /tmp/extract_trott.txt | 633 | Strategy & Systems Thinking | epub |
| 19 | The Motive | Patrick M. Lencioni | /tmp/extract_lencioni_motive.txt | 405 | Leadership & Management | epub |
| 20 | Strengths Finder 2.0 | Tom Rath | /tmp/extract_rath.txt | 376 | Mindset & Self-Mastery | epub |
| 21 | The Road to Character | David Brooks | /tmp/extract_brooks.txt | 355 | Mindset & Self-Mastery | epub |

#### Tier 3 — Failed extractions (DRM or format issues — use agent knowledge only)

| # | Book | Author | Category | Format | Extraction Issue |
|---|------|--------|----------|--------|-----------------|
| 22 | Strategy: A History | Lawrence Freedman | Strategy & Systems Thinking | epub | Only 220 lines extracted |
| 23 | The Infinite Game | Simon Sinek | Leadership & Management | epub | Only 138 lines extracted |
| 24 | Don't Believe Everything You Think | Joseph Nguyen | Mindset & Self-Mastery | epub | Only 98 lines extracted |
| 25 | The Road Less Stupid | Keith J. Cunningham | Wisdom & Big Ideas | epub | Only 51 lines extracted |
| 26 | How Asia Works | Joe Studwell | Strategy & Systems Thinking | epub | Only 15 lines extracted |
| 27 | The Law of Success | Napoleon Hill | Wisdom & Big Ideas | mobi | 0 lines — DRM/format |
| 28 | Siddhartha | Hermann Hesse | Mindset & Self-Mastery | mobi | 0 lines — DRM/format |
| 29 | Power vs Force | David R. Hawkins | Psychology & Decision Making | mobi | 0 lines — DRM/format |
| 30 | The Changing World Order | Ray Dalio | Wisdom & Big Ideas | mobi | 0 lines — DRM/format |
| 31 | Atlas of the Heart | Brene Brown | Psychology & Decision Making | mobi | 0 lines — DRM/format |
| 32 | Humankind | Rutger Bregman | Wisdom & Big Ideas | mobi | 0 lines — DRM/format |
| 33 | How to Fail at Almost Everything | Scott Adams | Mindset & Self-Mastery | mobi | 0 lines — DRM/format |

#### Extraction Commands (re-run if /tmp files are missing)

EPUB extraction:
```bash
cd "C:\Users\maila\Music\reader" && python3 -c "
import ebooklib; from ebooklib import epub; from bs4 import BeautifulSoup
book = epub.read_epub(r'inbox/FILENAME.epub')
for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
    soup = BeautifulSoup(item.get_content(), 'html.parser')
    t = soup.get_text()
    if t.strip(): print(t)
" > /tmp/extract_SLUG.txt
```

MOBI extraction:
```bash
cd "C:\Users\maila\Music\reader" && python3 -c "
import mobi, os, glob; from bs4 import BeautifulSoup
filepath, _ = mobi.extract(r'inbox/FILENAME.mobi')
for f in sorted(glob.glob(os.path.join(filepath, '**/*.html'), recursive=True)):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
        soup = BeautifulSoup(fh.read(), 'html.parser')
        t = soup.get_text()
        if t.strip(): print(t)
" > /tmp/extract_SLUG.txt
```

#### Agent Prompt Template for Phase A

For each book, launch a background agent with this prompt (customize the bracketed fields):

```
Create a brand-new book summary for "[TITLE]" by [AUTHOR].

1. Read quality standards: C:\Users\maila\Music\reader\.claude\rules\human-summary-standards.md
2. Read the extracted book text: [EXTRACT_FILE] (use Read tool, paginate through the full file)
   - If the extract file is empty or missing, use your training knowledge of this well-known book.
3. Write analysis to: C:\Users\maila\Music\reader\analysis\[SLUG].md
4. Write 1000+ line summary to: C:\Users\maila\Music\reader\summaries\[CATEGORY]\[TITLE] - [AUTHOR].md

The summary MUST include: frontmatter (date: 2026-03-25), 30-second blockquote, About the Author,
Big Idea, Key Concepts table, chapter-by-chapter coverage, italic openers, colored HTML
(<b style="color: #e74c3c/27ae60/2980b9">), 10+ callout boxes, 3-6 mermaid diagrams, comparison
tables, bullet points for all explanatory content, Verdict, Related Reading with [[wikilinks]].
NO colours inside callouts. Verify line count with: wc -l "[SUMMARY_PATH]"
```

#### Execution Strategy for Phase A

- **Run 8-10 agents in parallel** per batch (all in background)
- **Batch A1:** Books 1-10 (Tier 1, best extractions)
- **Batch A2:** Books 11-21 (Tier 1 remainder + Tier 2)
- **Batch A3:** Books 22-33 (Tier 3, agent knowledge only)
- Each agent reads extracted text, creates analysis + summary
- Verify line counts after each batch completes

---

### Phase B: Expand 50 Existing Summaries to 1000+ Lines

These books already have summaries (673-998 lines) but need expansion to meet the 1000-line minimum. Same approach as the 34 books already completed this session.

| # | Book | Current Lines | Category |
|---|------|:------------:|----------|
| 1 | So Good They Can't Ignore You - Cal Newport | 673 | Mindset & Self-Mastery |
| 2 | The Almanack of Naval Ravikant - Eric Jorgenson | 682 | Mindset & Self-Mastery |
| 3 | Fierce Conversations - Susan Scott | 726 | Power & Influence |
| 4 | Mindset - Carol S. Dweck | 728 | Mindset & Self-Mastery |
| 5 | Playing to Win - A.G. Lafley & Roger L. Martin | 737 | Strategy & Systems Thinking |
| 6 | The Unnatural Networker - Charlie Lawson | 752 | Personal Brand & Presence |
| 7 | Digital Transformation - Thomas M. Siebel | 768 | Strategy & Systems Thinking |
| 8 | The Start-Up of You - Reid Hoffman & Ben Casnocha | 771 | Personal Brand & Presence |
| 9 | Corporate Confidential - Cynthia Shapiro | 778 | Power & Influence |
| 10 | Strategize to Win - Carla A. Harris | 783 | Career Strategy |
| 11 | The Unspoken Truths for Career Success - Tessa White | 786 | Career Strategy |
| 12 | Who Gets Promoted, Who Doesn't, and Why - Donald Asher | 788 | Career Strategy |
| 13 | The Subtle Art of Not Giving a F-ck - Mark Manson | 799 | Mindset & Self-Mastery |
| 14 | Working Backwards - Colin Bryar & Bill Carr | 805 | Leadership & Management |
| 15 | Career Warfare - David D'Alessandro | 820 | Career Strategy |
| 16 | Rise - Patty Azzarello | 822 | Career Strategy |
| 17 | The Credibility Code - Cara Hale Alter | 822 | Personal Brand & Presence |
| 18 | Thinking Strategically - Avinash K. Dixit & Barry J. Nalebuff | 822 | Strategy & Systems Thinking |
| 19 | Measure What Matters - John Doerr | 835 | Leadership & Management |
| 20 | The Four Obsessions of an Extraordinary Executive - Patrick M. Lencioni | 856 | Leadership & Management |
| 21 | Range - David Epstein | 863 | Mindset & Self-Mastery |
| 22 | Words That Change Minds - Shelle Rose Charvet | 870 | Power & Influence |
| 23 | Power - Jeffrey Pfeffer | 876 | Power & Influence |
| 24 | Managing Up - Mary Abbajay | 882 | Workplace Navigation |
| 25 | Executive Presence - Sylvia Ann Hewlett | 894 | Personal Brand & Presence |
| 26 | Emotional Intelligence - Daniel Goleman | 895 | Psychology & Decision Making |
| 27 | Tribe of Mentors - Timothy Ferriss | 896 | Wisdom & Big Ideas |
| 28 | Zero to One - Peter Thiel | 900 | Leadership & Management |
| 29 | Peak - Anders Ericsson | 900 | Mindset & Self-Mastery |
| 30 | A Mind for Numbers - Barbara Oakley | 901 | Mindset & Self-Mastery |
| 31 | Meditations - Marcus Aurelius | 901 | Mindset & Self-Mastery |
| 32 | The Daily Stoic - Ryan Holiday | 901 | Mindset & Self-Mastery |
| 33 | An Elegant Puzzle - Will Larson | 905 | Leadership & Management |
| 34 | Invaluable - Maya Grossman | 906 | Career Strategy |
| 35 | How to Take Smart Notes - Sonke Ahrens | 906 | Mindset & Self-Mastery |
| 36 | Expect to Win - Carla A. Harris | 910 | Career Strategy |
| 37 | How Will You Measure Your Life - Clayton M. Christensen | 915 | Mindset & Self-Mastery |
| 38 | The First 90 Days - Michael D. Watkins | 919 | Career Strategy |
| 39 | The Right and Wrong Stuff - Carter Cast | 919 | Workplace Navigation |
| 40 | Yes! 50 Scientifically Proven Ways - Goldstein, Martin & Cialdini | 925 | Power & Influence |
| 41 | Your Brain at Work - David Rock | 931 | Psychology & Decision Making |
| 42 | Making Things Happen - Scott Berkun | 937 | Leadership & Management |
| 43 | Secrets to Winning at Office Politics - Marie G. McIntyre | 951 | Workplace Navigation |
| 44 | Relentless - Tim S. Grover | 959 | Mindset & Self-Mastery |
| 45 | Stealing the Corner Office - Brendan Reid | 981 | Career Strategy |
| 46 | The Four Agreements - Don Miguel Ruiz | 982 | Mindset & Self-Mastery |
| 47 | Nice Girls Don't Get the Corner Office - Lois P. Frankel | 983 | Career Strategy |
| 48 | Tribes - Seth Godin | 990 | Leadership & Management |
| 49 | Interviews with the Masters - Robert Greene | 992 | Robert Greene Canon |
| 50 | Thriving at Work - Dennis Mark & Michael Dam | 998 | Workplace Navigation |

#### Agent Prompt Template for Phase B

Same approach that successfully completed 34 books this session:

```
You are expanding a book summary to 1000+ lines for an Obsidian vault.

1. Read quality standards: C:\Users\maila\Music\reader\.claude\rules\human-summary-standards.md
2. Read the existing summary: C:\Users\maila\Music\reader\summaries\[CATEGORY]\[FILENAME].md
3. Read the analysis file (if exists): C:\Users\maila\Music\reader\analysis\[SLUG].md

Then REWRITE the summary file completely to 1000+ lines following ALL quality standards.

KEY REQUIREMENTS:
- 1000+ lines minimum
- Frontmatter, 30-second blockquote, About the Author, Big Idea, Key Concepts table
- Chapter-by-chapter coverage, italic openers, colored HTML, 10+ callout boxes
- 3-6 mermaid diagrams, comparison tables, bullet points
- Verdict, Related Reading with [[wikilinks]]
- NO colours inside callout boxes

Write the complete file using Write tool. Verify line count with wc -l.
```

#### Execution Strategy for Phase B

- **Run 8-10 agents in parallel** per batch (all in background)
- **Batch B1:** Books 1-10 (shortest, most work needed)
- **Batch B2:** Books 11-20
- **Batch B3:** Books 21-30
- **Batch B4:** Books 31-40
- **Batch B5:** Books 41-50
- Verify line counts after each batch

---

### Phase C: Update Index

After Phases A and B, update `summaries/_index.md`:
- Add all 33 new summaries from Phase A
- Verify category counts are correct
- Verify total count matches actual file count

---

## Summary of All Work

| Phase | Task | Books | Status |
|-------|------|:-----:|--------|
| Done | Expand 24 books under 200 lines to 1000+ | 24 | COMPLETE |
| Done | Expand 10 books 200-520 lines to 1000+ | 10 | COMPLETE |
| A | Create 33 new summaries from inbox books | 33 | TODO |
| B | Expand 50 existing summaries to 1000+ | 50 | TODO |
| C | Update _index.md | 1 | TODO |

**After all phases:** 128 summaries, all at 1000+ lines minimum.

---

## Key Technical Notes

- **Agents CAN use Write tool** to overwrite existing files (proven with 34 books this session)
- **Agents CANNOT use Bash** in background mode — extract ebooks in main conversation first
- **Run with bypass permissions** (`--dangerously-skip-permissions`) for new file creation
- **8-10 parallel agents per batch** is the sweet spot
- **Quality standards** are in `.claude/rules/human-summary-standards.md`
- **File naming:** `Title - Author.md` (main title only, no subtitle)
- **Wikilinks:** `[[filename|Display Title]]` with NO path prefix
- **Python deps installed:** ebooklib, beautifulsoup4, mobi
