import io
import pdfplumber
from utils.html_to_md import wrap_with_frontmatter


def pdf_bytes_to_markdown(pdf_bytes: bytes, title: str, source_url: str, description: str = "") -> str:
    text_parts = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if text and text.strip():
                text_parts.append(f"<!-- page {i} -->\n{text.strip()}")

    full_text = "\n\n".join(text_parts)

    # Basic cleanup: normalize whitespace
    import re
    full_text = re.sub(r"[ \t]{2,}", " ", full_text)
    full_text = re.sub(r"\n{3,}", "\n\n", full_text)

    return wrap_with_frontmatter(full_text, title, source_url, description)
