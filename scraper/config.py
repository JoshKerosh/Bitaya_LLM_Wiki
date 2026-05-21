from pathlib import Path

ROOT = Path(__file__).parent.parent
RAW_DIR = ROOT / "llm-wiki" / "raw"

RAW_LAWS = RAW_DIR / "laws"
RAW_INSTITUTIONS = RAW_DIR / "institutions"
RAW_PROGRAMS = RAW_DIR / "programs"

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

# Laws to scrape — ley_number: (nValor2, filename_slug, description)
# nValor2 = SINALEVI internal ID (found via Google search site:pgrweb.go.cr)
# nValor2=None → scraper writes stub, retrieve manually
TARGET_LAWS = {
    "7600": (23261,  "ley_7600_discapacidad",          "Ley de Igualdad de Oportunidades para Personas con Discapacidad"),
    "7586": (27926,  "ley_7586_violencia_domestica",   "Ley contra la Violencia Doméstica"),
    "7739": (43077,  "ley_7739_ninez_adolescencia",    "Código de la Niñez y la Adolescencia"),
    "5662": (2687,   "ley_5662_desarrollo_social_imas","Ley de Desarrollo Social y Asignaciones Familiares (IMAS)"),
    "7060": (7060,   "ley_7060_creacion_imas",         "Ley de Creación del Instituto Mixto de Ayuda Social"),
    "7972": (41967,  "ley_7972_conapam",               "Ley Integral para la Persona Adulta Mayor (CONAPAM)"),
    "7801": (28787,  "ley_7801_inamu",                 "Ley del Instituto Nacional de las Mujeres (INAMU)"),
    "8661": (None,   "ley_8661_discapacidad_convencion","Convención sobre los Derechos de las Personas con Discapacidad"),
    "9379": (None,   "ley_9379_personas_adultas_mayores","Ley General de la Persona Adulta Mayor"),
    "8929": (None,   "ley_8929_conapdis",              "Ley de Creación del CONAPDIS"),
    "7143": (None,   "ley_7143_pani",                  "Ley Orgánica del Patronato Nacional de la Infancia"),
}

# Institution sites — name: (url, filename_slug)
TARGET_INSTITUTIONS = {
    "IMAS":     ("https://www.imas.go.cr/es/general/bienestar-social", "imas"),
    "INAMU":    ("https://www.inamu.go.cr/web/inamu/inicio", "inamu"),
    "PANI":     ("https://www.pani.go.cr/servicios", "pani"),
    "CONAPDIS": ("https://conapdis.go.cr/tramites-y-servicios/", "conapdis"),
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
        "url": "https://costarica.iom.int/sites/g/files/tmzbdl1016/files/documents/2025-06/8.-ruta-de-referencia-inamu-para-imprimir.pdf",
        "slug": "inamu_ruta_referencia",
        "description": "Ruta de referencia INAMU — OIM Costa Rica",
        "folder": "institutions",
    },
    {
        "url": "https://observatoriodegenero.poder-judicial.go.cr/images/Biblioteca/Otros/Guia-de-Servicios-INAMU.pdf",
        "slug": "inamu_guia_servicios",
        "description": "Guía de servicios institucionales dirigidos a mujeres — INAMU",
        "folder": "institutions",
    },
]
