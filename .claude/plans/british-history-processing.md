# British History — Processing Plan

15 books to process through the full pipeline: extract → analyse → summarize → validate → cross-reference.

Each book is triggered manually with `/process <filename>`.

---

## Processing Order

### Tier 1 — The Backbone

| # | Command | Book | Format | Period | Status |
|---|---------|------|--------|--------|--------|
| 1 | `/process The English and Their History - Robert Tombs.epub` | The English and Their History | EPUB | Prehistory–present | Done |

*Process this first. It's the 900-page single-volume overview that gives context for everything else.*

---

### Tier 2 — Period Specialists (chronological)

| # | Command | Book | Format | Period | Status |
|---|---------|------|--------|--------|--------|
| 2 | `/process The Anglo-Saxons - Marc Morris.epub` | The Anglo-Saxons | EPUB | c.400–1066 | Pending |
| 3 | `/process The Norman Conquest - Marc Morris.epub` | The Norman Conquest | EPUB | 1066 | Done |
| 4 | `/process The Plantagenets - Dan Jones.epub` | The Plantagenets | EPUB | 1154–1399 | Done |
| 5 | `/process The Wars of the Roses - Dan Jones.epub` | The Wars of the Roses | EPUB | 1399–1485 | Done |
| 6 | `/process Foundation - Peter Ackroyd.epub` | Foundation | EPUB | Prehistory–1485 | Done |
| 7 | `/process Tudors - Peter Ackroyd.epub` | Tudors | EPUB | 1485–1603 | Done |
| 8 | `/process Revolution - Peter Ackroyd.epub` | Revolution | EPUB | 1688–1815 | Done |
| 9 | `/process The Victorians - A.N. Wilson.epub` | The Victorians | EPUB | 1837–1901 | Done |
| 10 | `/process A History of Modern Britain - Andrew Marr.epub` | A History of Modern Britain | EPUB | 1945–2007 | Done |

*Chronological by period. Each builds on Tombs as the backbone.*

---

### Tier 3 — Sweeping Narratives + Empire

| # | Command | Book | Format | Period | Status |
|---|---------|------|--------|--------|--------|
| 11 | `/process A History of Britain Vol 1 - Simon Schama.pdf` | A History of Britain Vol 1 | PDF | 3000 BC–1603 | Pending |
| 12 | `/process A History of Britain Vol 2 - Simon Schama.pdf` | A History of Britain Vol 2 | PDF | 1603–1776 | Pending |
| 13 | `/process A History of Britain Vol 3 - Simon Schama.pdf` | A History of Britain Vol 3 | PDF | 1776–2000 | Pending |
| 14 | `/process Empire - Niall Ferguson.epub` | Empire | EPUB | 1600s–1956 | Done |
| 15 | `/process Black and British - David Olusoga.epub` | Black and British | EPUB | 43 AD–present | Done |

*Schama and the Empire books last — by then all the period detail is in the vault, so cross-referencing is richest.*

---

## Why This Order

1. **Tombs first** — the skeleton everything hangs on
2. **Period specialists next** — deep detail on each era, building chronologically
3. **Ackroyd's Foundation (#6) after Morris and Jones** — it covers the same prehistory-to-1485 period but from a different angle. Having Morris and Jones processed first means the cross-references are richer
4. **Schama last among the narratives** — his 3 volumes overlap heavily with everything above. Processing them last means the summaries can reference all the specialist books
5. **Ferguson and Olusoga at the very end** — the empire debate reads best when all the underlying history is already in the vault

---

## Per-Book Notes

| Book | Notes |
|------|-------|
| **Tombs** | Massive (~900 pages). Analysis will be the longest. Expect 1600+ line summary |
| **Morris (Anglo-Saxons)** | Category: British History. Cross-ref with Tombs (early chapters) |
| **Morris (Norman Conquest)** | Category: British History. Cross-ref with Tombs, Anglo-Saxons |
| **Jones (Plantagenets)** | Category: British History. Cross-ref with Norman Conquest (transition) |
| **Jones (Wars of the Roses)** | Category: British History. UK title is "The Hollow Crown" — use "Wars of the Roses" for the summary filename |
| **Ackroyd (Foundation)** | Heavy overlap with Morris and Jones — summary should focus on what Ackroyd adds that they don't |
| **Ackroyd (Tudors)** | Cross-ref with Wars of the Roses (Henry VII) and Schama Vol 1 (Elizabeth) |
| **Ackroyd (Revolution)** | Covers Glorious Revolution → Napoleonic Wars. Cross-ref with Schama Vol 2 |
| **Wilson (Victorians)** | The industrial/cultural era. Cross-ref with Schama Vol 3, Empire |
| **Marr (Modern Britain)** | Post-war only. Cross-ref with Schama Vol 3 (overlapping final chapters) |
| **Schama Vol 1** | PDF — slower extraction (page-by-page). Overlaps with Morris, Jones, Ackroyd Foundation/Tudors |
| **Schama Vol 2** | PDF. Overlaps with Ackroyd Revolution |
| **Schama Vol 3** | PDF. Overlaps with Wilson, Marr, Ferguson |
| **Ferguson (Empire)** | Provocative thesis — summary should present his argument fairly then note criticism |
| **Olusoga (Black and British)** | The counterbalance to Ferguson. Cross-ref extensively with Empire |

---

## After All 15 Are Done

1. Update `summaries/British History/_overview.md` — mark all as Summarised
2. Update `summaries/Britain & The World Wars/_overview.md` — refresh the chronological backbone with links to actual summaries
3. Update `summaries/_index.md` — set all to DONE with wikilinks
4. Review cross-references — ensure bidirectional links between all related books

---

## Progress Tracker

- [x] 1/15 — The English and Their History - Robert Tombs
- [x] 2/15 — The Anglo-Saxons - Marc Morris
- [x] 3/15 — The Norman Conquest - Marc Morris
- [x] 4/15 — The Plantagenets - Dan Jones
- [x] 5/15 — The Wars of the Roses - Dan Jones
- [x] 6/15 — Foundation - Peter Ackroyd
- [x] 7/15 — Tudors - Peter Ackroyd
- [x] 8/15 — Revolution - Peter Ackroyd
- [x] 9/15 — The Victorians - A.N. Wilson
- [x] 10/15 — A History of Modern Britain - Andrew Marr
- [x] 11/15 — A History of Britain Vol 1 - Simon Schama
- [x] 12/15 — A History of Britain Vol 2 - Simon Schama
- [x] 13/15 — A History of Britain Vol 3 - Simon Schama
- [x] 14/15 — Empire - Niall Ferguson
- [x] 15/15 — Black and British - David Olusoga
