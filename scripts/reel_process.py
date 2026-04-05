"""
Instagram Reels processing pipeline.

Downloads reels via yt-dlp, transcribes via AssemblyAI,
summarises via Claude Haiku, imports to reader app.

Usage:
    python scripts/reel_process.py --urls URL1 URL2 ...
    python scripts/reel_process.py --file urls.txt
    python scripts/reel_process.py --folder inbox/reels/
    python scripts/reel_process.py --urls URL1 --cookies-from-browser chrome
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import requests
from anthropic import Anthropic
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
READER_APP_DIR = PROJECT_ROOT / "reader-app"

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(READER_APP_DIR / ".env")

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
IMPORT_SECRET = os.getenv("IMPORT_SECRET", "")
READER_APP_URL = os.getenv("READER_APP_URL", "http://localhost:3006")

ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2"

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".avi", ".webm"}
AUDIO_EXTS = {".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"}

SUMMARIZE_SYSTEM = """You extract structured summaries from Instagram reel content.
Given a transcript and optional caption, produce a JSON response with exactly these fields:
- title: a clear, descriptive title (5-12 words, not the caption verbatim)
- summary: 2-4 sentences capturing the core message
- keyPoints: array of 3-7 actionable insights or key claims (short bullet-point strings)
- tags: array of 3-8 relevant topic tags (lowercase, no hashtags)
- topic: single primary topic category. Pick the best fit from: parenting, productivity, finance, psychology, career, leadership, health, relationships, philosophy, technology, education. Use "other" only if nothing fits.

Return ONLY valid JSON, no markdown fences, no extra text."""


# ---------------------------------------------------------------------------
# AssemblyAI functions (copied from podcast_transcribe.py)
# ---------------------------------------------------------------------------


def extract_audio_for_transcription(input_path: str) -> bytes:
    """Extract/convert to 16kHz mono WAV for AssemblyAI."""
    filters = "afftdn=nr=15:nf=-40,highpass=f=80,loudnorm=I=-23:LRA=1:tp=-1"
    args = [
        "ffmpeg", "-i", input_path, "-vn", "-ac", "1", "-ar", "16000",
        "-af", filters, "-f", "wav", "pipe:1",
    ]
    result = subprocess.run(args, capture_output=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.decode()[:500]}")
    return result.stdout


def upload_to_assemblyai(audio_bytes: bytes) -> str:
    """Upload audio to AssemblyAI CDN, return URL."""
    resp = requests.post(
        f"{ASSEMBLYAI_BASE}/upload",
        headers={"authorization": ASSEMBLYAI_API_KEY},
        data=audio_bytes,
        timeout=300,
    )
    resp.raise_for_status()
    return resp.json()["upload_url"]


def submit_transcription(audio_url: str, use_best: bool = False) -> str:
    """Submit transcription job, return transcript ID."""
    body = {
        "audio_url": audio_url,
        "language_code": "en",
    }
    if not use_best:
        body["speech_model"] = "nano"

    resp = requests.post(
        f"{ASSEMBLYAI_BASE}/transcript",
        headers={
            "authorization": ASSEMBLYAI_API_KEY,
            "content-type": "application/json",
        },
        json=body,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def poll_transcription(transcript_id: str) -> dict:
    """Poll until transcription completes."""
    url = f"{ASSEMBLYAI_BASE}/transcript/{transcript_id}"
    headers = {"authorization": ASSEMBLYAI_API_KEY}

    while True:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        status = data["status"]

        if status == "completed":
            return data
        if status == "error":
            raise RuntimeError(f"Transcription failed: {data.get('error', 'unknown')}")

        time.sleep(3)


# ---------------------------------------------------------------------------
# yt-dlp download
# ---------------------------------------------------------------------------


def download_reel(url: str, cookies_browser: str | None = None) -> dict:
    """Download an Instagram reel via yt-dlp. Returns metadata dict + video path."""
    tmpdir = tempfile.mkdtemp(prefix="reel_")
    outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")

    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--no-playlist",
        "--write-info-json",
        "-o", outtmpl,
        "--format", "best[ext=mp4]/best",
    ]
    if cookies_browser:
        cmd += ["--cookies-from-browser", cookies_browser]
    cmd.append(url)

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr[:500]}")

    # Find the downloaded files
    video_file = None
    info_file = None
    for f in Path(tmpdir).iterdir():
        if f.suffix == ".json":
            info_file = f
        elif f.suffix in VIDEO_EXTS | AUDIO_EXTS:
            video_file = f

    if not video_file:
        raise RuntimeError(f"No video file found in {tmpdir}")

    # Parse metadata
    meta = {}
    if info_file:
        with open(info_file, encoding="utf-8") as fh:
            info = json.load(fh)
        meta["caption"] = info.get("description") or info.get("title") or ""
        meta["source_handle"] = info.get("uploader") or info.get("channel") or ""
        if not meta["source_handle"].startswith("@") and meta["source_handle"]:
            meta["source_handle"] = "@" + meta["source_handle"]
        meta["duration"] = int(info.get("duration") or 0)
        meta["title"] = info.get("title") or ""
    else:
        meta["caption"] = ""
        meta["source_handle"] = ""
        meta["duration"] = 0
        meta["title"] = ""

    meta["video_path"] = str(video_file)
    meta["source_url"] = url
    meta["tmpdir"] = tmpdir
    return meta


# ---------------------------------------------------------------------------
# Claude summarization
# ---------------------------------------------------------------------------


def summarize_reel(transcript: str, caption: str | None) -> dict:
    """Use Claude Haiku to generate structured summary from transcript + caption."""
    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    user_msg = f"Caption: {caption or 'Not available'}\n\nTranscript: {transcript or 'Not available'}"

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SUMMARIZE_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )

    text = response.content[0].text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    return json.loads(text)


# ---------------------------------------------------------------------------
# Import to reader app
# ---------------------------------------------------------------------------


def import_reel(data: dict) -> dict:
    """POST reel data to the reader app import endpoint."""
    url = f"{READER_APP_URL}/api/reels/import"
    headers = {"Content-Type": "application/json"}
    if IMPORT_SECRET:
        headers["x-import-key"] = IMPORT_SECRET

    resp = requests.post(url, json=data, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# Process a single reel
# ---------------------------------------------------------------------------


def process_reel_from_url(url: str, cookies_browser: str | None, use_best: bool) -> dict:
    """Full pipeline for a single reel URL."""
    print(f"\n  Downloading: {url}")
    meta = download_reel(url, cookies_browser)

    return _process_reel(
        video_path=meta["video_path"],
        source_url=meta["source_url"],
        source_handle=meta["source_handle"],
        caption=meta["caption"],
        duration=meta["duration"],
        use_best=use_best,
        tmpdir=meta.get("tmpdir"),
    )


def process_reel_from_file(filepath: Path, use_best: bool) -> dict:
    """Full pipeline for a local video file."""
    # Check for sidecar JSON with caption/metadata
    sidecar = filepath.with_suffix(".json")
    caption = None
    source_handle = None
    source_url = None
    duration = None

    if sidecar.exists():
        with open(sidecar, encoding="utf-8") as fh:
            info = json.load(fh)
        caption = info.get("caption")
        source_handle = info.get("source_handle") or info.get("handle")
        source_url = info.get("source_url") or info.get("url")
        duration = info.get("duration")

    return _process_reel(
        video_path=str(filepath),
        source_url=source_url,
        source_handle=source_handle,
        caption=caption,
        duration=duration,
        use_best=use_best,
    )


def _process_reel(
    video_path: str,
    source_url: str | None,
    source_handle: str | None,
    caption: str | None,
    duration: int | None,
    use_best: bool,
    tmpdir: str | None = None,
) -> dict:
    """Core processing: extract audio, transcribe, summarize, import."""
    try:
        # 1. Extract audio
        print(f"  Extracting audio...")
        wav_bytes = extract_audio_for_transcription(video_path)

        # 2. Transcribe
        print(f"  Transcribing...")
        cdn_url = upload_to_assemblyai(wav_bytes)
        del wav_bytes
        transcript_id = submit_transcription(cdn_url, use_best=use_best)
        result = poll_transcription(transcript_id)

        transcript_text = result.get("text", "")
        if not duration:
            duration = int(result.get("audio_duration", 0))

        # 3. Check if we have enough content
        word_count = len(transcript_text.split()) if transcript_text else 0
        has_transcript = word_count >= 10
        has_caption = bool(caption and len(caption.strip()) > 20)

        if not has_transcript and not has_caption:
            return {"skipped": True, "reason": "No meaningful transcript or caption"}

        if not has_transcript:
            print(f"  Short transcript ({word_count} words) — using caption only")
            transcript_text = ""

        # 4. Summarize with Claude
        print(f"  Summarizing...")
        summary_data = summarize_reel(transcript_text, caption)

        # 5. Import to reader app
        import_data = {
            "title": summary_data.get("title", "Untitled Reel"),
            "sourceUrl": source_url,
            "sourceHandle": source_handle,
            "caption": caption,
            "transcript": transcript_text or None,
            "summary": summary_data.get("summary", ""),
            "keyPoints": summary_data.get("keyPoints", []),
            "tags": summary_data.get("tags", []),
            "topic": summary_data.get("topic"),
            "duration": duration,
        }

        print(f"  Importing: {import_data['title']}")
        result = import_reel(import_data)

        if result.get("skipped"):
            return {"skipped": True, "reason": "Duplicate URL", "title": result.get("title")}

        return {"imported": True, "id": result.get("id"), "title": import_data["title"]}

    finally:
        # Clean up temp directory from yt-dlp downloads
        if tmpdir:
            import shutil
            shutil.rmtree(tmpdir, ignore_errors=True)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def validate_env():
    missing = []
    if not ASSEMBLYAI_API_KEY:
        missing.append("ASSEMBLYAI_API_KEY")
    if not ANTHROPIC_API_KEY:
        missing.append("ANTHROPIC_API_KEY")
    if missing:
        print(f"ERROR: Missing environment variables: {', '.join(missing)}")
        sys.exit(1)
    if not IMPORT_SECRET:
        print("WARNING: IMPORT_SECRET not set — will use session auth (requires login)")


def main():
    parser = argparse.ArgumentParser(description="Process Instagram reels")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--urls", nargs="+", help="Instagram reel URLs to process")
    group.add_argument("--file", help="Text file with one URL per line")
    group.add_argument("--folder", help="Directory of downloaded video files")

    parser.add_argument("--best", action="store_true", help="Use AssemblyAI Best model")
    parser.add_argument("--dry-run", action="store_true", help="Estimate cost without processing")
    parser.add_argument("--cookies-from-browser", help="Browser to get Instagram cookies from (e.g. chrome)")
    args = parser.parse_args()

    validate_env()

    # Collect URLs or file paths
    items = []
    mode = None

    if args.urls:
        items = args.urls
        mode = "url"
    elif args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"ERROR: File not found: {file_path}")
            sys.exit(1)
        items = [line.strip() for line in file_path.read_text().splitlines() if line.strip() and not line.startswith("#")]
        mode = "url"
    elif args.folder:
        folder = Path(args.folder)
        if not folder.is_dir():
            print(f"ERROR: Directory not found: {folder}")
            sys.exit(1)
        items = sorted([
            str(f) for f in folder.iterdir()
            if f.suffix.lower() in VIDEO_EXTS | AUDIO_EXTS
        ])
        mode = "folder"

    if not items:
        print("No items to process.")
        sys.exit(0)

    print(f"\n{'=' * 60}")
    print(f"INSTAGRAM REELS PIPELINE")
    print(f"{'=' * 60}")
    print(f"Mode: {mode}")
    print(f"Items: {len(items)}")

    if args.dry_run:
        avg_duration = 45  # seconds
        total_minutes = (len(items) * avg_duration) / 60
        rate = 0.37 if args.best else 0.12
        aai_cost = total_minutes * rate
        haiku_cost = len(items) * 0.001
        print(f"\nDRY RUN — estimated cost:")
        print(f"  AssemblyAI ({('Best' if args.best else 'Nano')}): ${aai_cost:.2f}")
        print(f"  Claude Haiku: ${haiku_cost:.2f}")
        print(f"  Total: ${aai_cost + haiku_cost:.2f}")
        print(f"  (Assumes ~{avg_duration}s average reel duration)")
        return

    imported = 0
    skipped = 0
    failed = 0
    errors = []

    for i, item in enumerate(items):
        print(f"\n--- [{i + 1}/{len(items)}] ---")
        try:
            if mode == "url":
                result = process_reel_from_url(item, args.cookies_from_browser, args.best)
            else:
                result = process_reel_from_file(Path(item), args.best)

            if result.get("imported"):
                imported += 1
                print(f"  OK: {result.get('title', 'imported')}")
            elif result.get("skipped"):
                skipped += 1
                print(f"  SKIP: {result.get('reason', 'skipped')}")
        except Exception as e:
            failed += 1
            errors.append({"item": item, "error": str(e)})
            print(f"  FAIL: {e}")

        # Small delay between API calls
        if i < len(items) - 1:
            time.sleep(0.5)

    # Summary
    print(f"\n{'=' * 60}")
    print(f"COMPLETE")
    print(f"{'=' * 60}")
    print(f"Imported: {imported}")
    print(f"Skipped:  {skipped}")
    print(f"Failed:   {failed}")

    if errors:
        print(f"\nErrors:")
        for err in errors:
            print(f"  {err['item'][:60]}: {err['error'][:100]}")


if __name__ == "__main__":
    main()
