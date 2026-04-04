---
description: Transcribe a podcast audio/video file using AssemblyAI + Claude correction
allowed-tools: Read, Glob, Grep, Bash
---

# /podcast-transcribe — Podcast Transcription

Transcribe a podcast audio or video file. Extracts audio, sends to AssemblyAI, corrects with Claude Haiku, splits into chapters, uploads to R2.

This is Step 1 of the podcast pipeline: **podcast-transcribe** → podcast-analyse → podcast-summarize.

**Usage:**
- `/podcast-transcribe <filename>` — transcribe a specific file from `inbox/podcasts/`
- `/podcast-transcribe` — find and transcribe the newest file in `inbox/podcasts/`

**Flags (append to command):**
- `--denoise` — apply noise reduction (for low-quality recordings)
- `--best` — use AssemblyAI Best model ($0.37/min instead of $0.12/min Nano)
- `--skip-correction` — skip the Claude Haiku correction pass

---

## Pre-Flight

### If no arguments provided:
1. Scan `inbox/podcasts/` for audio/video files (mp4, mov, mkv, avi, webm, mp3, m4a, wav, ogg, flac, aac)
2. Sort by modification time (newest first)
3. If files found: confirm the newest file with user before processing
4. If none: report "No audio/video files found in inbox/podcasts/."

### If arguments provided:
1. Search `inbox/podcasts/` for matching files (try exact match, then partial)
2. If not found: report "No file found matching '$ARGUMENTS' in inbox/podcasts/."

### Check dependencies:
1. Run: `pip show requests anthropic boto3 python-dotenv 2>/dev/null | grep -c "Name:"` — if < 4, run `pip install -r scripts/requirements.txt`
2. Check `ASSEMBLYAI_API_KEY` exists in `reader-app/.env` or root `.env` — if missing, tell user to add it

---

## Step 1: Run Transcription Script

Run the Python script via Bash:

```bash
python scripts/podcast_transcribe.py "inbox/podcasts/<filename>" [--denoise] [--best] [--skip-correction]
```

If the user specified `--series`, `--title`, or `--number` overrides, pass them through.

Watch the output for:
- Successful completion → "COMPLETE" banner with transcript path and metadata path
- Errors → report to user with the error message

---

## Step 2: Report

After successful transcription, report:
- Transcript location: `extracted/podcasts/<slug>.txt`
- Metadata location: `extracted/podcasts/<slug>.json`
- Number of chapters detected
- Episode duration
- Estimated cost
- R2 audio URL

Then remind user: "Run `/podcast-analyse` to analyse this transcript, or `/podcast-process` for the full pipeline."
