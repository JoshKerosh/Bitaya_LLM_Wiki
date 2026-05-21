import re
from bs4 import BeautifulSoup
import markdownify


def clean_html_to_markdown(html: str, base_url: str = "") -> str:
    soup = BeautifulSoup(html, "lxml")

    # Remove noise elements
    for tag in soup.select("nav, header, footer, script, style, [class*='menu'], [class*='sidebar'], [class*='cookie'], [id*='menu'], [id*='nav']"):
        tag.decompose()

    # Find main content — try common containers first
    main = (
        soup.find("main")
        or soup.find(id="content")
        or soup.find(id="main-content")
        or soup.find(class_="content")
        or soup.find(class_="entry-content")
        or soup.find("article")
        or soup.find("body")
    )

    md = markdownify.markdownify(
        str(main),
        heading_style="ATX",
        bullets="-",
        strip=["script", "style", "nav", "footer"],
    )

    # Collapse excessive blank lines
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def wrap_with_frontmatter(content: str, title: str, source_url: str, description: str = "") -> str:
    return f"""---
title: {title}
source: {source_url}
description: {description}
scraped_at: {_today()}
---

{content}
"""


def _today() -> str:
    from datetime import date
    return date.today().isoformat()
