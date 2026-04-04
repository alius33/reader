---
description: Run the full pipeline for a podcast — transcribe, analyse, summarize
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /podcast-process — Full Podcast Pipeline

Run the complete podcast pipeline: transcribe → analyse → summarize.
Optionally imports to the reader app database.

**Usage:**
- `/podcast-process <filename>` — process a specific file from `inbox/podcasts/`
- `/podcast-process` — find and process the newest file in `inbox/podcasts/`
- `/podcast-process all` — process all unprocessed files in `inbox/podcasts/`

**Flags:**
- `--denoise` — apply noise reduction during transcription
- `--best` — use AssemblyAI Best model instead of Nano
- `--skip-import` — don't import to reader app DB after summarising

---

## Pre-Flight

### Check dependencies
1. Verify Python packages: `pip show requests anthropic boto3 python-dotenv 2>/dev/null | grep -c "Name:"`
   - If < 4: run `pip install -r scripts/requirements.txt`
2. Verify `ASSEMBLYAI_API_KEY` in `reader-app/.env` or root `.env`
   - If missing: report error and stop

### Identify files to process

**If `all` argument:**
1. Scan `inbox/podcasts/` for all audio/video files
2. Check which have matching transcripts in `extracted/podcasts/`
3. Process only those without transcripts

**If specific filename:**
1. Find the file in `inbox/podcasts/` (exact or partial match)
2. If not found: report error and stop

**If no arguments:**
1. Find the newest audio/video file in `inbox/podcasts/`
2. Confirm with user before proceeding

### Parse metadata from filename
- Try `Series; NN - Title.ext` convention
- If filename doesn't follow convention: ask user for series name and episode title
- If user provides overrides, note them for passing to the transcription script

---

## Stage 1: Transcribe

Run the transcription Python script:

```bash
python scripts/podcast_transcribe.py "inbox/podcasts/<filename>" [--denoise] [--best]
```

Pass through any `--series`, `--title`, `--number` overrides the user specified.

**Wait for completion.** This is the longest step (5-20 minutes depending on episode length).

On success:
- Note the transcript path: `extracted/podcasts/<slug>.txt`
- Note the metadata path: `extracted/podcasts/<slug>.json`
- Read the metadata JSON to get series, title, episode number, duration, host

On failure:
- Report the error to the user
- Suggest common fixes (missing API key, unsupported format, network issues)
- Stop pipeline

---

## Stage 2: Analyse

Run the podcast analysis inline (do NOT call `/podcast-analyse` as a separate skill — execute the same steps here).

Follow the exact same 4-pass process defined in `/podcast-analyse`:

1. **Pass 1 — Structural Map:** Read transcript, identify type/topic/speakers, write analysis file
2. **Pass 2 — Deep Extraction:** Arguments, stories, frameworks, quotes, research citations
3. **Pass 3 — Connections & Diagrams:** Cross-references, diagram planning
4. **Pass 4 — Summarisation Notes:** Recommended structure, essential content, diagram suggestions

Output: `analysis/<host-lastname>_<series-slug>-<NN>.md`

---

## Stage 3: Summarize

Run the podcast summarisation inline (do NOT call `/podcast-summarize` as a separate skill — execute the same steps here).

Follow the exact same 3-pass process defined in `/podcast-summarize`:

1. **Pass 1 — Reconnaissance:** Read analysis + transcript + context research
2. **Pass 2 — Writing:** Full lecture-style summary following podcast-summary-standards
3. **Pass 3 — Quality & Integration:** Quality gate check, update overview + index

Output: `summaries/Podcasts/<Series>/NN - Title.md`

---

## Stage 4: Import to Reader App (unless --skip-import)

### Import summary to database
```bash
cd reader-app && npx tsx prisma/seed.ts --source ../../summaries --file "NN - Title.md"
```

### Register audio chapters
```bash
cd reader-app && npx tsx scripts/register-podcast-audio.ts "../../extracted/podcasts/<slug>.json"
```

If either command fails, report the error but don't consider the pipeline failed — the summary exists and can be imported manually later.

---

## Pipeline Report

```
PODCAST PIPELINE COMPLETE
═════════════════════════
File:       <original filename>
Series:     <series name>
Episode:    <number> - <title>
Guest:      <guest name(s)>
Type:       <podcast-type>
Duration:   <N>h <N>m

Outputs:
  Transcript:  extracted/podcasts/<slug>.txt
  Metadata:    extracted/podcasts/<slug>.json
  Analysis:    analysis/<host>_<series>-<NN>.md
  Summary:     summaries/Podcasts/<Series>/NN - Title.md
  Audio (R2):  <full episode URL>
  Chapters:    <N> chapters uploaded to R2

App Import:  ✓ imported / ✗ skipped / ⚠ failed (reason)

Cost estimate: $<N.NN> (AssemblyAI <model>)

You can now delete the original file from inbox/podcasts/.
```

---

## Batch Mode (`/podcast-process all`)

When processing multiple files:
1. List all files to be processed with their parsed metadata
2. Confirm with user before starting
3. Process sequentially (transcription is the bottleneck — no parallelism benefit)
4. Show running tally: `[2/5] Processing: Huberman Lab; Sleep.mp3`
5. At the end, show summary table:

```
BATCH COMPLETE
══════════════
| # | File                         | Status  | Duration | Cost  |
|---|------------------------------|---------|----------|-------|
| 1 | Lex Fridman; 367 - Sam.mp4   | ✓ Done  | 2h 15m   | $1.62 |
| 2 | Huberman; Sleep.mp3          | ✓ Done  | 1h 30m   | $1.08 |
| 3 | Hardcore; 69 - Supernova.mp3 | ✗ Error | —        | —     |

Total: 2 processed, 1 failed, $2.70 spent
```
