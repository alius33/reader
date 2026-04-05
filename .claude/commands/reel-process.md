---
description: Process Instagram reels — download, transcribe, summarize, and import to reader app
allowed-tools: Read, Glob, Grep, Bash
---

# /reel-process — Instagram Reels Pipeline

Download, transcribe, summarise, and import Instagram reels to the reader app.

**Usage:**
- `/reel-process URL1 URL2 ...` — process 1-10 Instagram reel URLs
- `/reel-process --file urls.txt` — process URLs from a text file (one per line)
- `/reel-process --folder inbox/reels/` — process local video files in a folder

**Flags (append to command):**
- `--cookies-from-browser chrome` — use Chrome cookies for Instagram auth (recommended)
- `--best` — use AssemblyAI Best model ($0.37/min instead of $0.12/min Nano)
- `--dry-run` — estimate cost without processing

---

## Pre-Flight

### Check dependencies:
1. Run: `python -c "import yt_dlp, requests, anthropic; print('OK')"` — if it fails, run `python -m pip install -r scripts/requirements.txt`
2. Run: `which ffmpeg` — if missing, tell user to install ffmpeg
3. Check `ASSEMBLYAI_API_KEY` exists in root `.env` — if missing, tell user to add it
4. Check `ANTHROPIC_API_KEY` exists in root `.env` — if missing, tell user to add it
5. Check `IMPORT_SECRET` exists in `reader-app/.env` — warn if missing (script will try session auth instead)

### Parse arguments:
- If raw URLs are provided (starts with http), use `--urls` mode
- If a `.txt` file path is provided, use `--file` mode
- If a folder path is provided, use `--folder` mode
- Default to `--cookies-from-browser chrome` unless user specifies otherwise

---

## Step 1: Run Processing Script

Build the command:

```bash
python scripts/reel_process.py [--urls URL1 URL2 ... | --file path.txt | --folder path/] [--cookies-from-browser chrome] [--best] [--dry-run]
```

Run via Bash. Watch the output for:
- `OK:` lines — successful imports
- `SKIP:` lines — duplicates (already imported)
- `FAIL:` lines — errors (report to user)
- `COMPLETE` banner with final counts

---

## Step 2: Report

After completion, report:
- Number imported, skipped, and failed
- Any errors with the specific URL that failed
- Remind user to check `/reels` in the reader app

If any reels failed due to yt-dlp authentication issues, suggest:
1. Make sure you're logged into Instagram in Chrome
2. Try with `--cookies-from-browser chrome` flag
3. If that fails, download the video manually and use `--folder` mode
