"""
Institution scraper — IMAS, INAMU, PANI, CONAPDIS, CONAPAM, MTSS
Each institution has its own page structure; falls back to generic extractor.
"""
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAW_DIR, TARGET_INSTITUTIONS
from utils.http import get
from utils.html_to_md import clean_html_to_markdown, wrap_with_frontmatter

from datetime import date
TODAY = date.today().isoformat()


# Per-institution selectors — confirmed via Playwright DOM inspection
# Order matters: first match with real content wins
SELECTORS = {
    "IMAS":     [".region-content", ".block-system", ".view-content"],
    "INAMU":    [".region-content", "#content", "main", "article"],
    "PANI":     ["#content", "main", ".view-content", "article"],
    "CONAPDIS": [".post-content", "#content", "main"],  # que-es-conapdis page, Avada theme
    "CONAPAM":  ["main", "#content", ".entry-content", "body"],
    "MTSS":     [".region-content", "#content", "main", ".field-body"],
}

# Minimum content length (chars) — below this = bad scrape, raise error
MIN_CONTENT_CHARS = {
    "IMAS": 500, "INAMU": 500, "PANI": 500,
    "CONAPDIS": 300, "CONAPAM": 300, "MTSS": 300,
}


def _extract_institution(name: str, url: str) -> str:
    resp = get(url)
    soup = BeautifulSoup(resp.text, "lxml")

    # Remove noise
    for tag in soup.select("nav, header, footer, script, style, .menu, .sidebar, .cookie-notice, .nav, #nav, #header, #footer, .breadcrumb, .pagination"):
        tag.decompose()

    selectors = SELECTORS.get(name, ["main", "#content", "body"])
    content_elem = None
    for sel in selectors:
        candidate = soup.select_one(sel)
        if not candidate:
            continue
        text_len = len(candidate.get_text(strip=True))
        if text_len >= MIN_CONTENT_CHARS.get(name, 200):
            content_elem = candidate
            break

    if not content_elem:
        content_elem = soup.find("body")

    md = clean_html_to_markdown(str(content_elem), base_url=url)

    min_chars = MIN_CONTENT_CHARS.get(name, 200)
    if len(md) < min_chars:
        raise ValueError(f"Content too small ({len(md)} chars < {min_chars}). Likely nav-only. URL: {url}")

    return md


def scrape_all_institutions() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    for name, (url, slug) in tqdm(TARGET_INSTITUTIONS.items(), desc="Institutions"):
        out_path = RAW_DIR / f"{TODAY}-{slug}.md"
        if out_path.exists():
            print(f"  [SKIP] {slug}.md already exists")
            continue

        print(f"  [INST] scraping {name}: {url}")
        try:
            content = _extract_institution(name, url)
            md = wrap_with_frontmatter(content, name, url, f"Servicios y programas — {name}")
            out_path.write_text(md, encoding="utf-8")
            print(f"  [OK] saved {out_path.name} ({len(content)} chars)")
        except Exception as e:
            print(f"  [ERROR] {name}: {e}")
            _write_stub(out_path, name, url)


def _write_stub(path: Path, name: str, url: str) -> None:
    path.write_text(
        f"""---
title: {name}
source: {url}
status: scrape_failed — retrieve manually
---

> Scrape failed. Visit {url} manually.
""",
        encoding="utf-8",
    )
