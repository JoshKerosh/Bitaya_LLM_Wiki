"""
Asamblea Legislativa SIL scraper — asamblea.go.cr
Searches for relevant bills/laws by keyword and saves full text.
"""
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAW_LAWS
from utils.http import get
from utils.html_to_md import wrap_with_frontmatter

BASE = "https://www.asamblea.go.cr/Centro_de_informacion/Consultas_SIL/SitePages"
SEARCH_URL = f"{BASE}/ConsultaLeyes.aspx"

KEYWORDS = [
    "personas vulnerables",
    "violencia doméstica",
    "persona adulta mayor",
    "discapacidad",
    "niñez adolescencia",
    "pobreza extrema",
    "IMAS",
    "INAMU",
    "PANI",
    "CONAPDIS",
    "CONAPAM",
]


def _search_asamblea(keyword: str) -> list[dict]:
    """Search SIL for laws matching keyword. Returns list of {title, url}."""
    try:
        resp = get(SEARCH_URL, params={"Buscar": keyword})
        soup = BeautifulSoup(resp.text, "lxml")

        results = []
        # SIL results are in a table or list — grab law links
        for link in soup.find_all("a", href=True):
            href = link["href"]
            text = link.get_text(strip=True)
            if "Ley" in text or "Código" in text or "Decreto" in text:
                if href.startswith("http"):
                    results.append({"title": text, "url": href})
                elif href.startswith("/"):
                    results.append({"title": text, "url": f"https://www.asamblea.go.cr{href}"})

        return results[:5]  # max 5 per keyword to avoid flood
    except Exception as e:
        print(f"  [ASAMBLEA] search failed for '{keyword}': {e}")
        return []


def _fetch_law_page(url: str) -> str:
    resp = get(url)
    soup = BeautifulSoup(resp.text, "lxml")

    for tag in soup.select("nav, header, footer, script, style"):
        tag.decompose()

    content = soup.find("main") or soup.find(id="content") or soup.find("body")
    if not content:
        return ""

    return content.get_text(separator="\n", strip=True)


def scrape_asamblea() -> None:
    # SIL is ASP.NET WebForms — GET search returns the empty form, not results.
    # Needs POST with __VIEWSTATE/__EVENTVALIDATION hidden fields to work.
    # Disabled for hackathon; SINALEVI covers all target laws already.
    print("  [ASAMBLEA] disabled — SIL requires POST+ViewState (ASP.NET WebForms). Use SINALEVI instead.")
    return

    RAW_LAWS.mkdir(parents=True, exist_ok=True)
    seen_urls: set[str] = set()

    for keyword in tqdm(KEYWORDS, desc="Asamblea"):
        print(f"  [ASAMBLEA] searching: {keyword}")
        results = _search_asamblea(keyword)

        for item in results:
            url = item["url"]
            if url in seen_urls:
                continue
            seen_urls.add(url)

            # Build safe filename from title
            slug = "asamblea_" + _slugify(item["title"])[:60]
            out_path = RAW_LAWS / f"{slug}.md"

            if out_path.exists():
                continue

            try:
                text = _fetch_law_page(url)
                if not text.strip():
                    continue
                md = wrap_with_frontmatter(text, item["title"], url, f"Asamblea Legislativa — {keyword}")
                out_path.write_text(md, encoding="utf-8")
                print(f"  [OK] {out_path.name}")
            except Exception as e:
                print(f"  [ERROR] {url}: {e}")


def _slugify(text: str) -> str:
    import re
    text = text.lower()
    text = re.sub(r"[áàä]", "a", text)
    text = re.sub(r"[éèë]", "e", text)
    text = re.sub(r"[íìï]", "i", text)
    text = re.sub(r"[óòö]", "o", text)
    text = re.sub(r"[úùü]", "u", text)
    text = re.sub(r"[ñ]", "n", text)
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")
