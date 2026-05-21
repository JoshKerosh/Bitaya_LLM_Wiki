# BITAYA Incluye — Web Scraper

Scrapes Costa Rica legal sources → `llm-wiki/raw/` for LLM Wiki compilation.

## Sources

| Source | What | Where |
|---|---|---|
| SINALEVI | Full law text (10 key laws) | pgrweb.go.cr |
| Institution sites | Services, programs, requirements | imas.go.cr, inamu.go.cr, pani.go.cr, conapdis.go.cr, conapam.go.cr, mtss.go.cr |
| PDFs | Official guides and compilations | Multiple .go.cr domains |
| Asamblea Legislativa | Bills and law status | asamblea.go.cr |

## Setup

```bash
cd scraper
pip install -r requirements.txt
```

## Run

```bash
# All scrapers
python main.py

# Individual scrapers
python main.py --laws
python main.py --institutions
python main.py --pdfs
python main.py --asamblea
```

## Output

```
llm-wiki/raw/
├── laws/         ← SINALEVI + Asamblea laws as markdown
├── institutions/ ← Institution pages + PDFs
└── programs/     ← Program-specific docs
```

## Next Step (LLM Wiki compile)

After scraping, run the compile pass to build `llm-wiki/wiki/`:

```
Read all files in llm-wiki/raw/.
Follow llm-wiki/SCHEMA.md.
Write compiled pages to llm-wiki/wiki/.
```

Use Claude Code with MCP or `llmwiki` PyPI package.

## Laws Scraped

| Ley | Description |
|---|---|
| 7600 | Igualdad de Oportunidades — Personas con Discapacidad |
| 7586 | Ley contra la Violencia Doméstica |
| 7739 | Código de la Niñez y la Adolescencia |
| 5662 | Desarrollo Social y Asignaciones Familiares (IMAS) |
| 7972 | Integral para la Persona Adulta Mayor (CONAPAM) |
| 7801 | Instituto Nacional de las Mujeres (INAMU) |
| 8661 | Convención Derechos Personas con Discapacidad |
| 9379 | Ley General de la Persona Adulta Mayor |
| 8929 | Creación del CONAPDIS |
| 7143 | Ley Orgánica del PANI |
