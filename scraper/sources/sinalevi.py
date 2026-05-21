"""
SINALEVI scraper — pgrweb.go.cr
Uses known nValor2 IDs to fetch law text directly (no search POST needed).
IDs sourced from Google search site:pgrweb.go.cr.
"""
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import SINALEVI_TEXT, RAW_LAWS, TARGET_LAWS
from utils.http import get
from utils.html_to_md import wrap_with_frontmatter


def _build_url(nvalor2: int) -> str:
    return f"{SINALEVI_TEXT}?param1=NRTC&nValor1=1&nValor2={nvalor2}&nValor3=0&strTipM=TC"


def _fetch_law_text(nvalor2: int) -> str:
    url = _build_url(nvalor2)
    resp = get(url)

    # If redirected to error page, law not found
    if "PagError" in resp.url or "nError" in resp.url:
        return ""

    soup = BeautifulSoup(resp.text, "lxml")

    # Remove navigation noise
    for tag in soup.select("nav, header, footer, script, style, #PanelMenu, #SubPanelDondeEstoy, #dvMenuIzquierdo"):
        tag.decompose()

    # SINALEVI content — try known div IDs first, fall back to body text
    content = (
        soup.find(id="divTextoCompleto")
        or soup.find(id="DivTextoCompleto")
        or soup.find("div", id=lambda x: x and "texto" in x.lower())
        or soup.find("div", id=lambda x: x and "ContentPlaceHolder" in str(x) and "texto" in str(x).lower())
        or soup.find("body")
    )

    if not content:
        return ""

    lines = []
    for elem in content.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        text = elem.get_text(separator=" ", strip=True)
        if not text or len(text) < 3:
            continue
        if elem.name in ("h1", "h2", "h3", "h4"):
            level = int(elem.name[1])
            lines.append(f"\n{'#' * level} {text}\n")
        elif elem.name == "li":
            lines.append(f"- {text}")
        else:
            lines.append(text)

    return "\n\n".join(lines)


def scrape_all_laws() -> None:
    RAW_LAWS.mkdir(parents=True, exist_ok=True)

    for ley_number, entry in tqdm(TARGET_LAWS.items(), desc="Laws"):
        nvalor2, slug, description = entry
        out_path = RAW_LAWS / f"{slug}.md"

        if out_path.exists():
            print(f"  [SKIP] {slug}.md already exists")
            continue

        if nvalor2 is None:
            print(f"  [STUB] ley {ley_number}: no nValor2 ID — write stub")
            _write_stub(out_path, ley_number, description)
            continue

        source_url = _build_url(nvalor2)
        print(f"  [SINALEVI] fetching ley {ley_number} (nValor2={nvalor2}): {description}")

        try:
            text = _fetch_law_text(nvalor2)
            if not text.strip():
                print(f"  [WARN] empty body for ley {ley_number} — writing stub")
                _write_stub(out_path, ley_number, description)
                continue

            md = wrap_with_frontmatter(text, f"Ley {ley_number} — {description}", source_url, description)
            out_path.write_text(md, encoding="utf-8")
            print(f"  [OK] {out_path.name} ({len(text):,} chars)")

        except Exception as e:
            print(f"  [ERROR] ley {ley_number}: {e}")
            _write_stub(out_path, ley_number, description)


def _write_stub(path: Path, ley_number: str, description: str) -> None:
    path.write_text(
        f"""---
title: Ley {ley_number}
description: {description}
status: stub — retrieve manually from SINALEVI
source: https://www.pgrweb.go.cr/scij
---

> No se pudo obtener automáticamente. Recuperar manualmente en:
> https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_busqueda.aspx
> Buscar número de ley: {ley_number}
""",
        encoding="utf-8",
    )
