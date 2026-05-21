from pathlib import Path

ROOT = Path(__file__).parent.parent
RAW_DIR = ROOT / "raw"          # flat raw/ at repo root per GUIA-CURADOR
RAW_LAWS = RAW_DIR              # alias — flat, no subdirs per GUIA-CURADOR
RAW_INSTITUTIONS = RAW_DIR      # alias — flat, no subdirs per GUIA-CURADOR

# Rate limiting — be respectful to .go.cr servers
REQUEST_DELAY_SECONDS = 2.0
MAX_RETRIES = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; BitayaResearchBot/1.0; educational use)"
}

# SINALEVI — Costa Rica's official legal DB
SINALEVI_BASE = "https://www.pgrweb.go.cr/scij"
SINALEVI_SEARCH = f"{SINALEVI_BASE}/Busqueda/Normativa/Normas/nrm_busqueda.aspx"
SINALEVI_TEXT = f"{SINALEVI_BASE}/Busqueda/Normativa/Normas/nrm_texto_completo.aspx"

# Laws — ley_number: (nValor2, slug_suffix, description)
# nValor2 confirmed via Playwright inspection of SINALEVI + site:pgrweb.go.cr search
# Output: raw/YYYY-MM-DD-{slug_suffix}.md  (flat, per GUIA-CURADOR)
TARGET_LAWS = {
    "7600": (23261, "ley-7600-igualdad-oportunidades-discapacidad",        "Ley de Igualdad de Oportunidades para Personas con Discapacidad"),
    "7586": (27926, "ley-7586-violencia-domestica",                        "Ley contra la Violencia Doméstica"),
    "7739": (43077, "ley-7739-codigo-ninez-adolescencia",                  "Código de la Niñez y la Adolescencia"),
    "5662": (2687,  "ley-5662-desarrollo-social-asignaciones-familiares",  "Ley de Desarrollo Social y Asignaciones Familiares (IMAS)"),
    "7060": (7060,  "ley-7060-creacion-imas",                              "Ley de Creación del Instituto Mixto de Ayuda Social"),
    "7972": (41967, "ley-7972-persona-adulta-mayor-conapam",               "Ley Integral para la Persona Adulta Mayor (CONAPAM)"),
    "7801": (28787, "ley-7801-inamu",                                      "Ley del Instituto Nacional de las Mujeres (INAMU)"),
    "8661": (64038, "ley-8661-convencion-derechos-personas-discapacidad",  "Aprueba Convención sobre los Derechos de las Personas con Discapacidad"),
    "9379": (82244, "ley-9379-autonomia-personal-discapacidad",            "Ley para Promoción de la Autonomía Personal de las Personas con Discapacidad"),
    "7143": (41328, "ley-7143-organica-pani",                              "Ley Orgánica del Patronato Nacional de la Infancia"),
}

# Institution sites — name: (url, filename_slug)
TARGET_INSTITUTIONS = {
    "IMAS":     ("https://www.imas.go.cr/es/general/bienestar-social", "imas"),
    "INAMU":    ("https://www.inamu.go.cr/web/inamu/inicio", "inamu"),
    "PANI":     ("https://www.pani.go.cr/servicios", "pani"),
    "CONAPDIS": ("https://conapdis.go.cr/que-es-conapdis/", "conapdis"),
    "CONAPAM":  ("https://www.conapam.go.cr/", "conapam"),
    "MTSS":     ("https://www.mtss.go.cr/empleo-formacion/", "mtss_ane"),
}

# PDFs to download and extract
TARGET_PDFS = [
    {
        "url": "https://www.mtss.go.cr/seguridad-social/discapacidad/compilacion_leyes_decretos_cr.pdf",
        "slug": "compilado_leyes_discapacidad",
        "description": "Compilado de leyes y decretos sobre discapacidad — MTSS",
        "folder": "laws",
    },
    {
        "url": "https://observatoriodegenero.poder-judicial.go.cr/images/Biblioteca/Otros/Guia-de-Servicios-INAMU.pdf",
        "slug": "inamu_guia_servicios",
        "description": "Guía de servicios institucionales dirigidos a mujeres — INAMU",
        "folder": "institutions",
    },
]
