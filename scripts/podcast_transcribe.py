"""
Podcast transcription pipeline.

Extracts audio from video/audio files, transcribes via AssemblyAI,
corrects via Claude Haiku, splits into chapters, uploads to R2.

Usage:
    python scripts/podcast_transcribe.py "inbox/podcasts/Lex Fridman; 367 - Sam Altman.mp4"
    python scripts/podcast_transcribe.py "inbox/podcasts/file.mp3" --denoise
    python scripts/podcast_transcribe.py "inbox/podcasts/file.mp3" --best
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
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
EXTRACTED_DIR = PROJECT_ROOT / "extracted" / "podcasts"

# Load env from reader-app/.env (R2 creds) and root .env (API keys)
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(READER_APP_DIR / ".env")

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
R2_ENDPOINT = os.getenv("R2_ENDPOINT", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "")
R2_BASE_URL = os.getenv("R2_BASE_URL", "")

ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2"

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".avi", ".webm"}
AUDIO_EXTS = {".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "-", s)
    return s.strip("-")


def format_duration(seconds: int) -> str:
    h, m = divmod(seconds, 3600)
    m, s = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    return f"{m}m {s}s"


# ---------------------------------------------------------------------------
# 1. Parse filename
# ---------------------------------------------------------------------------


def parse_filename(filepath: Path) -> dict:
    """
    Parse podcast filename convention:
        Series Name; NN - Episode Title.ext
        Series Name; Episode Title.ext
    """
    stem = filepath.stem
    ext = filepath.suffix.lower()

    result = {
        "series": None,
        "episode_number": None,
        "title": stem,
        "slug": slugify(stem),
        "is_video": ext in VIDEO_EXTS,
    }

    # Try to parse "Series; NN - Title" or "Series; Title"
    if ";" in stem:
        parts = stem.split(";", 1)
        result["series"] = parts[0].strip()
        rest = parts[1].strip()

        # Try "NN - Title"
        num_match = re.match(r"^(\d+)\s*-\s*(.+)$", rest)
        if num_match:
            result["episode_number"] = int(num_match.group(1))
            result["title"] = num_match.group(2).strip()
        else:
            result["title"] = rest

    series_slug = slugify(result["series"]) if result["series"] else "unknown"
    ep_num = result["episode_number"]
    title_slug = slugify(result["title"])

    if ep_num is not None:
        result["slug"] = f"{series_slug}_{ep_num}"
        result["r2_folder"] = f"podcasts/{series_slug}/{ep_num:03d}-{title_slug}"
    else:
        result["slug"] = f"{series_slug}_{title_slug}"
        result["r2_folder"] = f"podcasts/{series_slug}/{title_slug}"

    return result


# ---------------------------------------------------------------------------
# 2. Extract audio
# ---------------------------------------------------------------------------


def extract_audio_for_listening(input_path: str, denoise: bool = False) -> bytes:
    """Extract/convert audio to MP3 for human listening (stereo, 44.1kHz, 128kbps)."""
    filters = []
    if denoise:
        filters.append("afftdn=nr=15:nf=-40,highpass=f=80")
    filters.append("loudnorm=I=-16:LRA=7:tp=-1")

    args = ["ffmpeg", "-i", input_path, "-vn", "-ac", "2", "-ar", "44100"]
    if filters:
        args += ["-af", ",".join(filters)]
    args += ["-b:a", "128k", "-f", "mp3", "pipe:1"]

    print(f"  Extracting audio for listening...")
    result = subprocess.run(args, capture_output=True, timeout=600)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.decode()[:500]}")
    print(f"  Audio extracted: {len(result.stdout) / 1_048_576:.1f} MB")
    return result.stdout


def extract_audio_for_transcription(input_path: str) -> bytes:
    """Extract/convert to 16kHz mono WAV for AssemblyAI."""
    filters = "afftdn=nr=15:nf=-40,highpass=f=80,loudnorm=I=-23:LRA=1:tp=-1"
    args = [
        "ffmpeg", "-i", input_path, "-vn", "-ac", "1", "-ar", "16000",
        "-af", filters, "-f", "wav", "pipe:1",
    ]
    print(f"  Extracting audio for transcription (16kHz mono)...")
    result = subprocess.run(args, capture_output=True, timeout=600)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.decode()[:500]}")
    print(f"  WAV extracted: {len(result.stdout) / 1_048_576:.1f} MB")
    return result.stdout


# ---------------------------------------------------------------------------
# 3. Transcribe via AssemblyAI
# ---------------------------------------------------------------------------


def upload_to_assemblyai(audio_bytes: bytes) -> str:
    """Upload audio to AssemblyAI CDN, return URL."""
    print(f"  Uploading to AssemblyAI CDN ({len(audio_bytes) / 1_048_576:.1f} MB)...")
    resp = requests.post(
        f"{ASSEMBLYAI_BASE}/upload",
        headers={"authorization": ASSEMBLYAI_API_KEY},
        data=audio_bytes,
        timeout=300,
    )
    resp.raise_for_status()
    url = resp.json()["upload_url"]
    print(f"  Uploaded: {url[:60]}...")
    return url


def submit_transcription(audio_url: str, use_best: bool = False) -> str:
    """Submit transcription job, return transcript ID."""
    body = {
        "audio_url": audio_url,
        "auto_chapters": True,
        "language_code": "en",
    }
    if not use_best:
        body["speech_model"] = "nano"

    model_name = "Best" if use_best else "Nano"
    print(f"  Submitting transcription ({model_name} model)...")

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
    transcript_id = resp.json()["id"]
    print(f"  Transcript ID: {transcript_id}")
    return transcript_id


def poll_transcription(transcript_id: str) -> dict:
    """Poll until transcription completes. Returns full result."""
    url = f"{ASSEMBLYAI_BASE}/transcript/{transcript_id}"
    headers = {"authorization": ASSEMBLYAI_API_KEY}

    print(f"  Waiting for transcription", end="", flush=True)
    while True:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        status = data["status"]

        if status == "completed":
            print(f"\n  Transcription complete!")
            duration = (data.get("audio_duration") or 0)
            print(f"  Duration: {format_duration(int(duration))}")
            print(f"  Words: {len(data.get('words', []))}")
            print(f"  Chapters: {len(data.get('chapters', []))}")
            return data

        if status == "error":
            raise RuntimeError(f"Transcription failed: {data.get('error', 'unknown')}")

        print(".", end="", flush=True)
        time.sleep(5)


# ---------------------------------------------------------------------------
# 4. LLM Correction
# ---------------------------------------------------------------------------


CORRECTION_SYSTEM = """You are a podcast transcript corrector. Fix obvious speech-to-text errors:
- Proper nouns (people, places, companies, products)
- Book titles, academic terms, technical jargon
- Well-known phrases and idioms that were garbled

Rules:
- NEVER change informal speech, filler words, or conversational style
- NEVER add or remove punctuation
- NEVER change meaning — if unsure, leave the original
- NEVER add explanations or commentary
- Return ONLY the corrected transcript text, nothing else"""


def correct_transcript(text: str, series_hint: str | None = None) -> str:
    """Run Claude Haiku correction on transcript chunks."""
    if not ANTHROPIC_API_KEY:
        print("  Skipping LLM correction (no ANTHROPIC_API_KEY)")
        return text

    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    chunks = _split_into_chunks(text, max_chars=4000)
    print(f"  LLM correction: {len(chunks)} chunk(s) via Claude Haiku...")

    corrected_parts = []
    corrections_made = 0

    for i, chunk in enumerate(chunks):
        context = ""
        if series_hint:
            context = f'This transcript is from the podcast series "{series_hint}". '

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=8192,
            system=CORRECTION_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"{context}Correct ASR errors in this transcript segment:\n\n{chunk}",
            }],
        )
        corrected = response.content[0].text

        # Count changes
        if corrected.strip() != chunk.strip():
            corrections_made += 1

        corrected_parts.append(corrected)
        if (i + 1) % 5 == 0:
            print(f"    Processed {i + 1}/{len(chunks)} chunks")

    print(f"  Correction complete: {corrections_made}/{len(chunks)} chunks modified")
    return "\n\n".join(corrected_parts)


def _split_into_chunks(text: str, max_chars: int = 4000) -> list[str]:
    """Split text into chunks at sentence boundaries."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        if end >= len(text):
            chunks.append(text[start:])
            break
        # Find last sentence boundary before end
        last_period = text.rfind(". ", start, end)
        if last_period > start:
            end = last_period + 2
        else:
            last_space = text.rfind(" ", start, end)
            if last_space > start:
                end = last_space + 1
        chunks.append(text[start:end])
        start = end

    return chunks


# ---------------------------------------------------------------------------
# 5. Split audio into chapters
# ---------------------------------------------------------------------------


def split_audio_chapters(
    mp3_bytes: bytes, chapters: list[dict], r2_folder: str
) -> list[dict]:
    """Split MP3 into chapter files using ffmpeg codec copy."""
    if not chapters:
        return []

    chapter_files = []

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(mp3_bytes)
        tmp_path = tmp.name

    try:
        for i, ch in enumerate(chapters):
            start_s = ch["start"] / 1000
            end_s = ch["end"] / 1000
            title = ch.get("headline") or ch.get("gist") or f"Chapter {i + 1}"
            chapter_slug = slugify(title)[:40]
            filename = f"{i + 1:02d}_{chapter_slug}.mp3"

            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out:
                out_path = out.name

            args = [
                "ffmpeg", "-y", "-i", tmp_path,
                "-ss", str(start_s), "-to", str(end_s),
                "-c", "copy", out_path,
            ]
            result = subprocess.run(args, capture_output=True, timeout=120)
            if result.returncode != 0:
                print(f"    Warning: failed to split chapter {i + 1}: {result.stderr.decode()[:200]}")
                continue

            with open(out_path, "rb") as f:
                chapter_bytes = f.read()
            os.unlink(out_path)

            chapter_files.append({
                "number": i + 1,
                "title": title,
                "filename": filename,
                "r2_key": f"{r2_folder}/{filename}",
                "bytes": chapter_bytes,
                "start_ms": ch["start"],
                "end_ms": ch["end"],
            })

        print(f"  Split into {len(chapter_files)} chapters")
    finally:
        os.unlink(tmp_path)

    return chapter_files


# ---------------------------------------------------------------------------
# 6. Upload to R2
# ---------------------------------------------------------------------------


def get_r2_client():
    """Create boto3 S3 client for Cloudflare R2."""
    import boto3

    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def upload_to_r2(
    mp3_bytes: bytes, chapter_files: list[dict], r2_folder: str
) -> tuple[str, list[dict]]:
    """Upload full episode + chapters to R2. Returns (full_url, chapter_list)."""
    s3 = get_r2_client()

    # Upload full episode
    full_key = f"{r2_folder}/full-episode.mp3"
    print(f"  Uploading full episode to R2 ({len(mp3_bytes) / 1_048_576:.1f} MB)...")
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=full_key,
        Body=mp3_bytes,
        ContentType="audio/mpeg",
    )
    full_url = f"{R2_BASE_URL}/{full_key}"
    print(f"  Full episode: {full_url}")

    # Upload chapters
    chapters_out = []
    for ch in chapter_files:
        print(f"    Uploading chapter {ch['number']}: {ch['title']}")
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=ch["r2_key"],
            Body=ch["bytes"],
            ContentType="audio/mpeg",
        )
        chapters_out.append({
            "number": ch["number"],
            "title": ch["title"],
            "url": f"{R2_BASE_URL}/{ch['r2_key']}",
            "start_ms": ch["start_ms"],
            "end_ms": ch["end_ms"],
        })

    print(f"  Uploaded {len(chapters_out)} chapters to R2")
    return full_url, chapters_out


# ---------------------------------------------------------------------------
# 7. Save outputs
# ---------------------------------------------------------------------------


def format_transcript(text: str, chapters: list[dict]) -> str:
    """Format transcript with chapter headers prepended."""
    lines = ["=" * 50]
    lines.append("=== CHAPTERS ===")

    for ch in chapters:
        start_s = ch["start"] // 1000
        mins, secs = divmod(start_s, 60)
        hours, mins = divmod(mins, 60)
        if hours > 0:
            ts = f"{hours}:{mins:02d}:{secs:02d}"
        else:
            ts = f"{mins}:{secs:02d}"
        title = ch.get("headline") or ch.get("gist") or "Untitled"
        summary = ch.get("summary", "")
        lines.append(f"{ts} — {title}")
        if summary:
            lines.append(f"      {summary}")

    lines.append("=" * 50)
    lines.append("")
    lines.append(text)
    return "\n".join(lines)


def save_outputs(
    transcript: str,
    chapters: list[dict],
    raw_chapters: list[dict],
    metadata: dict,
    full_url: str,
    chapter_urls: list[dict],
) -> tuple[Path, Path]:
    """Save transcript .txt and metadata .json to extracted/podcasts/."""
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)

    slug = metadata["slug"]
    txt_path = EXTRACTED_DIR / f"{slug}.txt"
    json_path = EXTRACTED_DIR / f"{slug}.json"

    # Format and save transcript
    formatted = format_transcript(transcript, raw_chapters)
    txt_path.write_text(formatted, encoding="utf-8")
    print(f"  Transcript saved: {txt_path}")

    # Save metadata JSON
    meta_out = {
        "series": metadata.get("series"),
        "episode_number": metadata.get("episode_number"),
        "title": metadata["title"],
        "host": metadata.get("series", "Unknown"),  # host defaults to series name
        "full_episode_url": full_url,
        "chapters": chapter_urls,
        "transcribed_at": datetime.now(timezone.utc).isoformat(),
        "duration_seconds": metadata.get("duration_seconds", 0),
        "source_file": metadata.get("source_file", ""),
    }
    json_path.write_text(json.dumps(meta_out, indent=2), encoding="utf-8")
    print(f"  Metadata saved: {json_path}")

    return txt_path, json_path


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def validate_env():
    """Check required environment variables."""
    missing = []
    if not ASSEMBLYAI_API_KEY:
        missing.append("ASSEMBLYAI_API_KEY")
    if not R2_ENDPOINT:
        missing.append("R2_ENDPOINT")
    if not R2_ACCESS_KEY_ID:
        missing.append("R2_ACCESS_KEY_ID")
    if not R2_SECRET_ACCESS_KEY:
        missing.append("R2_SECRET_ACCESS_KEY")
    if not R2_BUCKET_NAME:
        missing.append("R2_BUCKET_NAME")
    if not R2_BASE_URL:
        missing.append("R2_BASE_URL")
    if missing:
        print(f"ERROR: Missing environment variables: {', '.join(missing)}")
        print(f"Set them in reader-app/.env or .env at project root")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Transcribe podcast audio/video")
    parser.add_argument("file", help="Path to audio/video file")
    parser.add_argument("--denoise", action="store_true", help="Apply noise reduction (for low-quality audio)")
    parser.add_argument("--best", action="store_true", help="Use AssemblyAI Best model instead of Nano")
    parser.add_argument("--skip-correction", action="store_true", help="Skip LLM correction step")
    parser.add_argument("--series", help="Override series name (if filename doesn't follow convention)")
    parser.add_argument("--title", help="Override episode title")
    parser.add_argument("--number", type=int, help="Override episode number")
    args = parser.parse_args()

    validate_env()

    filepath = Path(args.file).resolve()
    if not filepath.exists():
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)

    ext = filepath.suffix.lower()
    if ext not in VIDEO_EXTS and ext not in AUDIO_EXTS:
        print(f"ERROR: Unsupported format: {ext}")
        print(f"Supported: {', '.join(sorted(VIDEO_EXTS | AUDIO_EXTS))}")
        sys.exit(1)

    print(f"\n{'=' * 60}")
    print(f"PODCAST TRANSCRIPTION PIPELINE")
    print(f"{'=' * 60}")
    print(f"File: {filepath.name}")
    print(f"Size: {filepath.stat().st_size / 1_048_576:.1f} MB")

    # 1. Parse filename
    metadata = parse_filename(filepath)
    if args.series:
        metadata["series"] = args.series
    if args.title:
        metadata["title"] = args.title
    if args.number is not None:
        metadata["episode_number"] = args.number

    metadata["source_file"] = filepath.name
    print(f"\nSeries: {metadata.get('series', 'Unknown')}")
    print(f"Episode: {metadata.get('episode_number', 'N/A')}")
    print(f"Title: {metadata['title']}")
    print(f"R2 folder: {metadata.get('r2_folder', 'N/A')}")

    # 2. Extract audio
    print(f"\n--- STEP 1: Audio Extraction ---")
    mp3_bytes = extract_audio_for_listening(str(filepath), denoise=args.denoise)
    wav_bytes = extract_audio_for_transcription(str(filepath))

    # 3. Transcribe
    print(f"\n--- STEP 2: Transcription (AssemblyAI) ---")
    cdn_url = upload_to_assemblyai(wav_bytes)
    del wav_bytes  # free memory
    transcript_id = submit_transcription(cdn_url, use_best=args.best)
    result = poll_transcription(transcript_id)

    transcript_text = result.get("text", "")
    raw_chapters = result.get("chapters", [])
    duration = int(result.get("audio_duration", 0))
    metadata["duration_seconds"] = duration

    if not transcript_text:
        print("ERROR: Empty transcript returned")
        sys.exit(1)

    # 4. LLM Correction
    print(f"\n--- STEP 3: LLM Correction ---")
    if args.skip_correction:
        print("  Skipped (--skip-correction)")
        corrected = transcript_text
    else:
        corrected = correct_transcript(transcript_text, metadata.get("series"))

    # 5. Save transcript immediately (before R2 — never lose work)
    print(f"\n--- STEP 4: Save Transcript ---")
    txt_path, json_path = save_outputs(
        corrected, [], raw_chapters, metadata, "", []
    )

    # 6. Split and upload to R2
    print(f"\n--- STEP 5: Split & Upload to R2 ---")
    try:
        chapter_files = split_audio_chapters(mp3_bytes, raw_chapters, metadata["r2_folder"])
        full_url, chapter_urls = upload_to_r2(mp3_bytes, chapter_files, metadata["r2_folder"])
        del mp3_bytes  # free memory

        # Update metadata JSON with R2 URLs
        print(f"  Updating metadata with R2 URLs...")
        txt_path, json_path = save_outputs(
            corrected, chapter_urls, raw_chapters, metadata, full_url, chapter_urls
        )
    except Exception as e:
        print(f"\n  WARNING: R2 upload failed: {e}")
        print(f"  Transcript saved at: {txt_path}")
        print(f"  Audio NOT uploaded — fix R2 permissions and re-run with --skip-transcription")
        full_url = ""
        chapter_urls = []

    # Summary
    print(f"\n{'=' * 60}")
    print(f"COMPLETE")
    print(f"{'=' * 60}")
    print(f"Duration: {format_duration(duration)}")
    print(f"Chapters: {len(raw_chapters)}")
    print(f"Transcript: {txt_path}")
    print(f"Metadata: {json_path}")
    if full_url:
        print(f"Full audio: {full_url}")
        print(f"Chapters uploaded: {len(chapter_urls)}")
    else:
        print(f"Audio: NOT uploaded (R2 error — fix and re-upload)")

    model_name = "Best" if args.best else "Nano"
    rate = 0.37 if args.best else 0.12
    cost = (duration / 60) * rate
    print(f"Est. cost: ${cost:.2f} (AssemblyAI {model_name})")


if __name__ == "__main__":
    main()
