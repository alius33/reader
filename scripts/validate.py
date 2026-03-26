#!/usr/bin/env python3
"""Structural and formatting validator for book summaries and analysis files.

Usage:
    python scripts/validate.py "summaries/Category/Title - Author.md"
    python scripts/validate.py --all
    python scripts/validate.py --analysis "analysis/file.md"
    python scripts/validate.py --analysis --all
    python scripts/validate.py --report
"""

import argparse
import glob
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ── Constants ────────────────────────────────────────────────────────────────

SUMMARIES_DIR = "summaries"
ANALYSIS_DIR = "analysis"
INDEX_FILE = os.path.join(SUMMARIES_DIR, "_index.md")

REQUIRED_FRONTMATTER_SUMMARY = {"date", "type", "tags", "author", "title", "year"}
REQUIRED_FRONTMATTER_ANALYSIS = {"date", "type", "author", "title", "year", "book-type", "source-file"}

REQUIRED_SECTIONS_SUMMARY = [
    "About the Author",
    "The Big Idea",
    "Key Concepts at a Glance",
    "The Verdict",
    "Related Reading",
]

REQUIRED_SECTIONS_ANALYSIS = [
    "Central Thesis",
    "Structural Map",
    "Key Frameworks",
    "Key Principles",
    "Best Stories",
    "Critique",
    "Cross-References",
    "Summarisation Notes",
]

MIN_LINES_DEFAULT = 1000
MIN_LINES_TAXONOMY = 2400
MIN_LINES_ANALYSIS = 100

TAXONOMY_MARKERS = ["taxonomy", "48 laws", "33 strategies", "laws of human nature"]


# ── Data structures ──────────────────────────────────────────────────────────

@dataclass
class CheckResult:
    name: str
    status: str  # PASS, WARN, FAIL
    message: str
    line: Optional[int] = None


@dataclass
class FileReport:
    path: str
    line_count: int = 0
    results: list = field(default_factory=list)

    @property
    def pass_count(self):
        return sum(1 for r in self.results if r.status == "PASS")

    @property
    def warn_count(self):
        return sum(1 for r in self.results if r.status == "WARN")

    @property
    def fail_count(self):
        return sum(1 for r in self.results if r.status == "FAIL")

    @property
    def total_checks(self):
        return len(self.results)


# ── Helpers ──────────────────────────────────────────────────────────────────

def parse_frontmatter(lines: list[str]) -> tuple[dict[str, str], int]:
    """Parse YAML frontmatter. Returns (fields_dict, end_line_index)."""
    if not lines or lines[0].strip() != "---":
        return {}, 0
    end = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end == -1:
        return {}, 0
    fm = {}
    for line in lines[1:end]:
        if ":" in line:
            key = line.split(":", 1)[0].strip()
            value = line.split(":", 1)[1].strip()
            fm[key] = value
    return fm, end


def is_taxonomy(frontmatter: dict, lines: list[str]) -> bool:
    """Detect if this is a taxonomy book."""
    tags = frontmatter.get("tags", "").lower()
    for marker in TAXONOMY_MARKERS:
        if marker in tags:
            return True
    # Check first 50 lines for taxonomy indicators
    header_text = "\n".join(lines[:50]).lower()
    for marker in TAXONOMY_MARKERS:
        if marker in header_text:
            return True
    return False


def find_sections(lines: list[str]) -> dict[str, int]:
    """Find all markdown heading sections and their line numbers."""
    sections = {}
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("## "):
            section_name = stripped[3:].strip()
            sections[section_name] = i
        elif stripped.startswith("### "):
            section_name = stripped[4:].strip()
            sections[section_name] = i
    return sections


def load_index() -> str:
    """Load _index.md content."""
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            return f.read()
    return ""


def collect_summary_files() -> list[str]:
    """Find all summary .md files (excluding _index.md and .obsidian)."""
    files = []
    for root, dirs, filenames in os.walk(SUMMARIES_DIR):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fn in filenames:
            if fn.endswith(".md") and fn != "_index.md":
                files.append(os.path.join(root, fn))
    return sorted(files)


def collect_analysis_files() -> list[str]:
    """Find all analysis .md files."""
    return sorted(glob.glob(os.path.join(ANALYSIS_DIR, "*.md")))


def collect_all_summary_stems() -> set[str]:
    """Get all summary file stems for wikilink resolution."""
    stems = set()
    for f in collect_summary_files():
        stem = Path(f).stem
        stems.add(stem)
    # Also add category index files if they exist
    for root, dirs, filenames in os.walk(SUMMARIES_DIR):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fn in filenames:
            if fn.endswith(".md"):
                stems.add(Path(fn).stem)
    return stems


# ── Summary checks ───────────────────────────────────────────────────────────

def check_frontmatter_summary(lines: list[str]) -> list[CheckResult]:
    results = []
    fm, _ = parse_frontmatter(lines)
    if not fm:
        results.append(CheckResult("Frontmatter", "FAIL", "No YAML frontmatter found"))
        return results
    missing = REQUIRED_FRONTMATTER_SUMMARY - set(fm.keys())
    if missing:
        results.append(CheckResult("Frontmatter", "FAIL", f"Missing fields: {', '.join(sorted(missing))}"))
    else:
        results.append(CheckResult("Frontmatter", "PASS", "All required fields present"))
    return results


def check_required_sections_summary(lines: list[str]) -> list[CheckResult]:
    results = []
    sections = find_sections(lines)
    section_names = set(sections.keys())
    for req in REQUIRED_SECTIONS_SUMMARY:
        found = any(req.lower() in s.lower() for s in section_names)
        if found:
            results.append(CheckResult(f"Section: {req}", "PASS", "Present"))
        else:
            results.append(CheckResult(f"Section: {req}", "FAIL", f"Missing section: ## {req}"))
    return results


def check_blockquote(lines: list[str]) -> list[CheckResult]:
    _, fm_end = parse_frontmatter(lines)
    # Look for blockquote within 20 lines after frontmatter
    search_end = min(fm_end + 20, len(lines))
    for i in range(fm_end, search_end):
        if lines[i].strip().startswith(">") and not lines[i].strip().startswith("> [!"):
            return [CheckResult("30-second blockquote", "PASS", "Found", line=i + 1)]
    return [CheckResult("30-second blockquote", "FAIL", "No blockquote within first 20 lines after frontmatter")]


def check_line_count(lines: list[str], fm: dict) -> list[CheckResult]:
    count = len(lines)
    taxonomy = is_taxonomy(fm, lines)
    minimum = MIN_LINES_TAXONOMY if taxonomy else MIN_LINES_DEFAULT
    label = f"taxonomy ({MIN_LINES_TAXONOMY})" if taxonomy else f"standard ({MIN_LINES_DEFAULT})"
    if count >= minimum:
        return [CheckResult("Line count", "PASS", f"{count} lines (minimum {label})")]
    elif count >= minimum * 0.7:
        return [CheckResult("Line count", "WARN", f"{count} lines — below minimum {label}")]
    else:
        return [CheckResult("Line count", "FAIL", f"{count} lines — well below minimum {label}")]


def check_mermaid(lines: list[str]) -> list[CheckResult]:
    count = sum(1 for line in lines if line.strip() == "```mermaid")
    if count >= 2:
        return [CheckResult("Mermaid diagrams", "PASS", f"{count} diagrams found")]
    elif count == 1:
        return [CheckResult("Mermaid diagrams", "WARN", f"Only 1 diagram (target: 2-5)")]
    else:
        return [CheckResult("Mermaid diagrams", "FAIL", "No Mermaid diagrams found (target: 2-5)")]


def check_story_callouts(lines: list[str]) -> list[CheckResult]:
    count = sum(1 for line in lines if "> [!example]" in line.lower())
    if count >= 3:
        return [CheckResult("Story callouts", "PASS", f"{count} story callouts found")]
    elif count >= 1:
        return [CheckResult("Story callouts", "WARN", f"Only {count} story callouts (target: 3+)")]
    else:
        return [CheckResult("Story callouts", "FAIL", "No > [!example] callouts found")]


def check_tip_callouts(lines: list[str]) -> list[CheckResult]:
    count = sum(1 for line in lines if "> [!tip]" in line.lower())
    if count >= 1:
        return [CheckResult("Key insight callouts", "PASS", f"{count} tip callouts found")]
    else:
        return [CheckResult("Key insight callouts", "WARN", "No > [!tip] callouts found")]


def check_key_concepts_table(lines: list[str]) -> list[CheckResult]:
    in_section = False
    has_table = False
    for line in lines:
        stripped = line.strip()
        if "key concepts at a glance" in stripped.lower():
            in_section = True
            continue
        if in_section and stripped.startswith("## "):
            break
        if in_section and "|" in stripped and "---" not in stripped:
            has_table = True
            break
    if has_table:
        return [CheckResult("Key Concepts table", "PASS", "Table format used")]
    elif in_section:
        return [CheckResult("Key Concepts table", "WARN", "Section exists but no table format detected")]
    else:
        return [CheckResult("Key Concepts table", "FAIL", "Key Concepts section not found")]


def check_colour_html(lines: list[str]) -> list[CheckResult]:
    results = []
    issues = []
    pattern_open = re.compile(r'<b\s+style="color:\s*#[0-9a-fA-F]{6}">')
    pattern_close = re.compile(r"</b>")

    for i, line in enumerate(lines):
        opens = len(pattern_open.findall(line))
        closes = line.count("</b>")
        if opens > 0 and opens != closes:
            issues.append(i + 1)

    if not issues:
        # Count total coloured elements
        total = sum(len(pattern_open.findall(line)) for line in lines)
        if total > 0:
            results.append(CheckResult("Colour HTML", "PASS", f"{total} coloured elements, all well-formed"))
        else:
            results.append(CheckResult("Colour HTML", "WARN", "No coloured text found"))
    else:
        lines_str = ", ".join(str(l) for l in issues[:5])
        results.append(CheckResult("Colour HTML", "FAIL", f"Unclosed tags on lines: {lines_str}"))

    return results


def check_no_colours_in_callouts(lines: list[str]) -> list[CheckResult]:
    issues = []
    in_callout = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if "> [!example]" in stripped.lower():
            in_callout = True
            continue
        if in_callout and not stripped.startswith(">"):
            in_callout = False
            continue
        if in_callout and '<b style="color:' in stripped:
            issues.append(i + 1)

    if not issues:
        return [CheckResult("No colours in callouts", "PASS", "Clean")]
    else:
        lines_str = ", ".join(str(l) for l in issues[:5])
        return [CheckResult("No colours in callouts", "WARN", f"Colour HTML inside callouts on lines: {lines_str}")]


def check_consecutive_prose(lines: list[str]) -> list[CheckResult]:
    """Check for more than 3 consecutive prose paragraphs without a visual break."""
    issues = []
    consecutive = 0
    _, fm_end = parse_frontmatter(lines)

    for i in range(fm_end + 1, len(lines)):
        stripped = lines[i].strip()
        # Visual breaks: empty line, heading, callout, diagram, table row, horizontal rule
        is_break = (
            stripped == ""
            or stripped.startswith("#")
            or stripped.startswith("> [!")
            or stripped.startswith(">")
            or stripped.startswith("```")
            or stripped.startswith("|")
            or stripped == "---"
            or stripped.startswith("- ")
            or stripped.startswith("  -")
        )
        if is_break:
            consecutive = 0
        else:
            # It's a prose line
            consecutive += 1
            if consecutive > 3:
                issues.append(i + 1)
                consecutive = 0  # Reset to avoid flooding

    if not issues:
        return [CheckResult("Consecutive prose", "PASS", "No long prose blocks")]
    else:
        lines_str = ", ".join(str(l) for l in issues[:5])
        return [CheckResult("Consecutive prose", "WARN", f"Dense prose blocks near lines: {lines_str}")]


def check_section_openers(lines: list[str]) -> list[CheckResult]:
    """Check that ## headings are followed by an italic opener within 3 lines."""
    issues = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("## ") and not stripped.startswith("## About") and not stripped.startswith("## The Big") and not stripped.startswith("## The Verdict") and not stripped.startswith("## Related") and not stripped.startswith("## Key Concepts"):
            # Look for italic in next 3 non-empty lines
            found_italic = False
            for j in range(i + 1, min(i + 5, len(lines))):
                check = lines[j].strip()
                if check.startswith("*") and check.endswith("*") and len(check) > 2:
                    found_italic = True
                    break
            if not found_italic:
                issues.append((i + 1, stripped))

    if not issues:
        return [CheckResult("Section openers", "PASS", "All content sections have italic openers")]
    elif len(issues) <= 3:
        return [CheckResult("Section openers", "WARN", f"{len(issues)} sections missing italic openers")]
    else:
        return [CheckResult("Section openers", "WARN", f"{len(issues)} sections missing italic openers")]


def check_index_entry(lines: list[str], filepath: str) -> list[CheckResult]:
    index_content = load_index()
    if not index_content:
        return [CheckResult("Index entry", "WARN", "_index.md not found")]

    # Extract title from frontmatter or filename
    fm, _ = parse_frontmatter(lines)
    title = fm.get("title", "").strip('"').strip("'")
    stem = Path(filepath).stem  # "Title - Author"

    # Check if stem or title appears in index
    if stem in index_content or title in index_content:
        return [CheckResult("Index entry", "PASS", "Found in _index.md")]
    # Try partial match on the main title (before " - ")
    main_title = stem.split(" - ")[0].strip() if " - " in stem else stem
    if main_title in index_content:
        return [CheckResult("Index entry", "PASS", f"Found in _index.md (partial match: {main_title})")]
    return [CheckResult("Index entry", "FAIL", f"Not found in _index.md (searched: {stem})")]


def check_wikilinks_present(lines: list[str]) -> list[CheckResult]:
    count = sum(1 for line in lines if "[[" in line)
    if count >= 1:
        return [CheckResult("Wikilinks", "PASS", f"{count} lines with wikilinks")]
    else:
        return [CheckResult("Wikilinks", "WARN", "No [[wikilinks]] found")]


def check_wikilink_integrity(lines: list[str]) -> list[CheckResult]:
    """Check that every [[Target]] or [[Target|Label]] resolves to an existing file."""
    all_stems = collect_all_summary_stems()
    # Also add common category names that might be linked
    category_names = set()
    for root, dirs, _ in os.walk(SUMMARIES_DIR):
        for d in dirs:
            if not d.startswith("."):
                category_names.add(d)
        break  # Only top-level

    broken = []
    pattern = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]")
    for i, line in enumerate(lines):
        for match in pattern.finditer(line):
            target = match.group(1).strip()
            if target not in all_stems and target not in category_names:
                broken.append((i + 1, target))

    if not broken:
        total = sum(len(pattern.findall(line)) for line in lines)
        if total > 0:
            return [CheckResult("Wikilink integrity", "PASS", f"All {total} wikilinks resolve")]
        else:
            return [CheckResult("Wikilink integrity", "PASS", "No wikilinks to check")]
    else:
        examples = "; ".join(f"L{l}: [[{t}]]" for l, t in broken[:3])
        return [CheckResult("Wikilink integrity", "WARN", f"{len(broken)} broken wikilinks: {examples}")]


# ── Analysis checks ──────────────────────────────────────────────────────────

def check_frontmatter_analysis(lines: list[str]) -> list[CheckResult]:
    fm, _ = parse_frontmatter(lines)
    if not fm:
        return [CheckResult("Frontmatter", "FAIL", "No YAML frontmatter found")]
    missing = REQUIRED_FRONTMATTER_ANALYSIS - set(fm.keys())
    if missing:
        return [CheckResult("Frontmatter", "FAIL", f"Missing fields: {', '.join(sorted(missing))}")]
    return [CheckResult("Frontmatter", "PASS", "All required fields present")]


def check_required_sections_analysis(lines: list[str]) -> list[CheckResult]:
    results = []
    sections = find_sections(lines)
    section_names = set(sections.keys())
    for req in REQUIRED_SECTIONS_ANALYSIS:
        found = any(req.lower() in s.lower() for s in section_names)
        if found:
            results.append(CheckResult(f"Section: {req}", "PASS", "Present"))
        else:
            results.append(CheckResult(f"Section: {req}", "FAIL", f"Missing section: ## {req}"))
    return results


def check_chapter_detail(lines: list[str]) -> list[CheckResult]:
    sections = find_sections(lines)
    found = any("chapter-level detail" in s.lower() or "chapter level detail" in s.lower() for s in sections)
    if found:
        return [CheckResult("Chapter-Level Detail", "PASS", "Enhanced format")]
    else:
        return [CheckResult("Chapter-Level Detail", "WARN", "Missing — old sparse format, consider re-running /analyse")]


def check_analysis_depth(lines: list[str]) -> list[CheckResult]:
    count = len(lines)
    if count >= MIN_LINES_ANALYSIS:
        return [CheckResult("Analysis depth", "PASS", f"{count} lines")]
    else:
        return [CheckResult("Analysis depth", "FAIL", f"Only {count} lines (minimum {MIN_LINES_ANALYSIS}) — too sparse for quality summarisation")]


# ── Runners ──────────────────────────────────────────────────────────────────

def validate_summary(filepath: str) -> FileReport:
    """Run all summary checks on a file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")
    fm, _ = parse_frontmatter(lines)

    report = FileReport(path=filepath, line_count=len(lines))
    report.results.extend(check_frontmatter_summary(lines))
    report.results.extend(check_required_sections_summary(lines))
    report.results.extend(check_blockquote(lines))
    report.results.extend(check_line_count(lines, fm))
    report.results.extend(check_mermaid(lines))
    report.results.extend(check_story_callouts(lines))
    report.results.extend(check_tip_callouts(lines))
    report.results.extend(check_key_concepts_table(lines))
    report.results.extend(check_colour_html(lines))
    report.results.extend(check_no_colours_in_callouts(lines))
    report.results.extend(check_consecutive_prose(lines))
    report.results.extend(check_section_openers(lines))
    report.results.extend(check_index_entry(lines, filepath))
    report.results.extend(check_wikilinks_present(lines))
    report.results.extend(check_wikilink_integrity(lines))
    return report


def validate_analysis(filepath: str) -> FileReport:
    """Run all analysis checks on a file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")

    report = FileReport(path=filepath, line_count=len(lines))
    report.results.extend(check_frontmatter_analysis(lines))
    report.results.extend(check_required_sections_analysis(lines))
    report.results.extend(check_chapter_detail(lines))
    report.results.extend(check_analysis_depth(lines))
    return report


# ── Output formatting ────────────────────────────────────────────────────────

STATUS_ICONS = {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]"}


def print_report(report: FileReport, verbose: bool = True):
    """Print a single file report."""
    rel = os.path.relpath(report.path)
    print(f"\n{'-' * 70}")
    print(f"  {rel}  ({report.line_count} lines)")
    print(f"{'-' * 70}")

    for r in report.results:
        icon = STATUS_ICONS[r.status]
        line_info = f" (line {r.line})" if r.line else ""
        if verbose or r.status != "PASS":
            print(f"  {icon} {r.name}: {r.message}{line_info}")

    print(f"\n  Summary: {report.pass_count} pass, {report.warn_count} warn, {report.fail_count} fail")


def print_aggregate(reports: list[FileReport]):
    """Print aggregate statistics."""
    total_files = len(reports)
    total_pass = sum(r.pass_count for r in reports)
    total_warn = sum(r.warn_count for r in reports)
    total_fail = sum(r.fail_count for r in reports)
    total_checks = sum(r.total_checks for r in reports)

    clean_files = sum(1 for r in reports if r.fail_count == 0 and r.warn_count == 0)
    warn_files = sum(1 for r in reports if r.fail_count == 0 and r.warn_count > 0)
    fail_files = sum(1 for r in reports if r.fail_count > 0)

    print(f"\n{'=' * 70}")
    print(f"  AGGREGATE REPORT")
    print(f"{'=' * 70}")
    print(f"  Files: {total_files}")
    print(f"  Clean (all pass): {clean_files}")
    print(f"  Warnings only: {warn_files}")
    print(f"  Has failures: {fail_files}")
    print(f"  Total checks: {total_checks} ({total_pass} pass, {total_warn} warn, {total_fail} fail)")

    # Most common failures
    fail_counts: dict[str, int] = {}
    for r in reports:
        for check in r.results:
            if check.status == "FAIL":
                fail_counts[check.name] = fail_counts.get(check.name, 0) + 1
    if fail_counts:
        print(f"\n  Most common failures:")
        for name, count in sorted(fail_counts.items(), key=lambda x: -x[1])[:10]:
            print(f"    {count:3d}x  {name}")

    # Most common warnings
    warn_counts: dict[str, int] = {}
    for r in reports:
        for check in r.results:
            if check.status == "WARN":
                warn_counts[check.name] = warn_counts.get(check.name, 0) + 1
    if warn_counts:
        print(f"\n  Most common warnings:")
        for name, count in sorted(warn_counts.items(), key=lambda x: -x[1])[:10]:
            print(f"    {count:3d}x  {name}")

    # Line count distribution
    line_counts = sorted(r.line_count for r in reports)
    if line_counts:
        print(f"\n  Line count distribution:")
        print(f"    Min: {line_counts[0]}, Max: {line_counts[-1]}, Median: {line_counts[len(line_counts)//2]}")
        under_1000 = sum(1 for c in line_counts if c < 1000)
        under_500 = sum(1 for c in line_counts if c < 500)
        print(f"    Under 1000 lines: {under_1000}")
        print(f"    Under 500 lines: {under_500}")


def print_short_report(reports: list[FileReport]):
    """Print a one-line-per-file summary."""
    print(f"\n{'-' * 90}")
    print(f"  {'File':<55} {'Lines':>6}  {'Pass':>4} {'Warn':>4} {'Fail':>4}")
    print(f"{'-' * 90}")
    for r in sorted(reports, key=lambda x: x.fail_count, reverse=True):
        rel = os.path.relpath(r.path)
        # Truncate long paths
        if len(rel) > 53:
            rel = "..." + rel[-50:]
        status = "FAIL" if r.fail_count > 0 else ("WARN" if r.warn_count > 0 else "PASS")
        marker = STATUS_ICONS[status]
        print(f"  {marker} {rel:<50} {r.line_count:>6}  {r.pass_count:>4} {r.warn_count:>4} {r.fail_count:>4}")
    print_aggregate(reports)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Validate book summaries and analysis files")
    parser.add_argument("file", nargs="?", help="Path to a specific file to validate")
    parser.add_argument("--all", action="store_true", help="Validate all files")
    parser.add_argument("--analysis", action="store_true", help="Validate analysis files instead of summaries")
    parser.add_argument("--report", action="store_true", help="Short aggregate report")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show all checks including passes")
    args = parser.parse_args()

    if not args.file and not args.all and not args.report:
        parser.print_help()
        sys.exit(1)

    reports = []

    if args.file:
        filepath = args.file
        if not os.path.exists(filepath):
            print(f"Error: File not found: {filepath}")
            sys.exit(1)
        if args.analysis:
            reports.append(validate_analysis(filepath))
        else:
            reports.append(validate_summary(filepath))

    elif args.all or args.report:
        if args.analysis:
            files = collect_analysis_files()
            if not files:
                print("No analysis files found in analysis/")
                sys.exit(0)
            for f in files:
                reports.append(validate_analysis(f))
        else:
            files = collect_summary_files()
            if not files:
                print("No summary files found in summaries/")
                sys.exit(0)
            for f in files:
                reports.append(validate_summary(f))

    # Output
    if args.report or (args.all and not args.verbose):
        print_short_report(reports)
    elif len(reports) == 1:
        print_report(reports[0], verbose=True)
    else:
        for r in reports:
            print_report(r, verbose=args.verbose)
        print_aggregate(reports)

    # Exit code
    has_failures = any(r.fail_count > 0 for r in reports)
    sys.exit(1 if has_failures else 0)


if __name__ == "__main__":
    main()
