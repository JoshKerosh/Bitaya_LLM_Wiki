"""
Institution scraper — IMAS, INAMU, PANI, CONAPDIS, CONAPAM, MTSS
Each institution has its own page structure; falls back to generic extractor.
"""
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAW_INSTITUTIONS, TARGET_INSTITUTIONS
from utils.http import get
from utils.html_to_md import clean_html_to_markdown, wrap_with_frontmatter


# Per-institution content selectors (CSS selector → tried in order)
SELECTORS = {
    "IMAS":     ["#block-system-main", ".field-items", "main", ".view-content"],
    "INAMU":    ["#content", "main", ".field-body", "article"],
    "PANI":     ["#content", "main", ".view-content", "article"],
    "CONAPDIS": ["main", "#content", ".field-body"],
    "CONAPAM":  ["main", "#content", ".view-content"],
    "MTSS":     ["#content", "main", ".field-body"],
}


def _extract_institution(name: str, url: str) -> str:
    resp = get(url)
    soup = BeautifulSoup(resp.text, "lxml")

    # Remove noise
    for tag in soup.select("nav, header, footer, script, style, .menu, .sidebar, .cookie-notice"):
        tag.decompose()

    selectors = SELECTORS.get(name, ["main", "#content", "body"])
    content_elem = None
    for sel in selectors:
        content_elem = soup.select_one(sel)
        if content_elem:
            break

    if not content_elem:
        content_elem = soup.find("body")

    md = clean_html_to_markdown(str(content_elem), base_url=url)
    return md


def scrape_all_institutions() -> None:
    RAW_INSTITUTIONS.mkdir(parents=True, exist_ok=True)

    for name, (url, slug) in tqdm(TARGET_INSTITUTIONS.items(), desc="Institutions"):
        out_path = RAW_INSTITUTIONS / f"{slug}.md"
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
