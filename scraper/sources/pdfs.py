"""
PDF scraper — downloads and extracts text from official Costa Rica PDFs.
"""
import sys
from pathlib import Path
from tqdm import tqdm
from datetime import date

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAW_LAWS, RAW_INSTITUTIONS, RAW_DIR, TARGET_PDFS
from utils.http import get_bytes
from utils.pdf_extractor import pdf_bytes_to_markdown

TODAY = date.today().isoformat()

FOLDER_MAP = {
    "laws": RAW_LAWS,
    "institutions": RAW_INSTITUTIONS,
    "programs": RAW_DIR,
}


def scrape_all_pdfs() -> None:
    for entry in tqdm(TARGET_PDFS, desc="PDFs"):
        folder = FOLDER_MAP.get(entry["folder"], RAW_LAWS)
        folder.mkdir(parents=True, exist_ok=True)

        out_path = folder / f"{TODAY}-{entry['slug']}.md"
        if out_path.exists():
            print(f"  [SKIP] {out_path.name} already exists")
            continue

        print(f"  [PDF] downloading: {entry['url']}")
        try:
            pdf_bytes = get_bytes(entry["url"])
            md = pdf_bytes_to_markdown(
                pdf_bytes,
                title=entry["slug"].replace("_", " ").title(),
                source_url=entry["url"],
                description=entry["description"],
            )
            out_path.write_text(md, encoding="utf-8")
            print(f"  [OK] saved {out_path.name} ({len(md)} chars)")
        except Exception as e:
            print(f"  [ERROR] {entry['url']}: {e}")
