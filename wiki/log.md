# Log

Registro cronológico append-only. Cada entrada arranca con `## [YYYY-MM-DD] <op> | <título>` para parsear con `grep '^## \[' wiki/log.md | tail -20`.

Operaciones: `init`, `ingest`, `query`, `lint`, `synthesis`.

---

## [2026-05-21] ingest | Ley 7586 — Ley contra la Violencia Doméstica

- **Fuente:** `raw/2026-05-21-ley-7586-violencia-domestica.md` (SCIJ, oficial).
- **Páginas creadas (12):**
  - `wiki/sources/2026-05-21-ley-7586-violencia-domestica.md` — extracción con citas y reforma vicaria.
  - `wiki/leyes/ley-7586-violencia-domestica.md` — castellano simple, 17 medidas, reformas.
  - `wiki/derechos/derecho-a-vivir-sin-violencia.md`.
  - `wiki/instituciones/poder-judicial.md`, `wiki/instituciones/inamu.md`.
  - `wiki/procedimientos/solicitar-medidas-de-proteccion.md`, `wiki/procedimientos/denuncia-violencia-domestica.md`.
  - `wiki/situaciones/me-pega-mi-pareja.md`, `wiki/situaciones/mi-pareja-me-amenaza.md`, `wiki/situaciones/mi-pareja-lastima-a-mi-hijo-para-hacerme-dano.md`.
  - `wiki/glosario/violencia-vicaria.md`, `wiki/glosario/medida-de-proteccion.md`.
- **Índices actualizados:** los 7 `_index.md` de sección + `wiki/index.md` raíz + `wiki/_hot.md`.
- **Wikilinks pendientes (crear como stubs en próximo ingest):** [[pani]], [[fuerza-publica]], [[ministerio-publico]].
- **Calidad:** todas las páginas públicas con aviso legal obligatorio + citas a la fuente + `ultima_verificacion: 2026-05-21`.
- **Páginas tocadas:** 12 creadas + 8 actualizadas = **20 archivos**. Fanout dentro del rango esperado (10-20).

## [2026-05-21] init | Wiki creado

- Patrón [LLM Wiki de Karpathy (abril 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) instanciado para dominio: **derechos y leyes de protección a personas vulnerables en Costa Rica**.
- Capas: `raw/` (fuentes oficiales inmutables), `wiki/` (LLM-owned), `_templates/`.
- Schema en `CLAUDE.md` (espejado en `AGENTS.md`).
- Taxonomía del dominio: `situaciones/` (puerta de entrada), `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`, `glosario/`, `sources/`, `synthesis/`.
- Plantillas tipadas en `_templates/`: situacion, derecho, ley, institucion, procedimiento, termino, source, synthesis.
- Slash commands: `/ingest`, `/query`, `/lint`.
- Wiki vacío de contenido — listo para ingerir la primera fuente oficial.

## [2026-05-21] schema | Endurecimiento del schema

- **Navegación de 3 saltos:** agregado `_index.md` en cada sección (`situaciones/`, `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`, `glosario/`, `sources/`, `synthesis/`). `index.md` raíz reescrito para apuntar a cada uno con formato `[[carpeta/_index|carpeta]]` (evita ghost-files de Obsidian). Costo de retrieval ahora es constante (3-4 lecturas).
- **`wiki/_hot.md`:** archivo nuevo de ~500 palabras con foco activo (qué cubre densamente el wiki + huecos conocidos). Se reescribe en cada `/ingest` y `/lint`. Se lee al inicio de cada sesión junto con `index.md`.
- **`ultima_verificacion`:** campo nuevo en frontmatter de toda página de cara al público. Plantillas actualizadas (situacion, derecho, ley, procedimiento, termino). Umbrales: 6m instituciones/procedimientos, 18m leyes/derechos, 24m glosario. `/query` avisa cuando cita una página vencida.
- **Política de contradicción con callout:** reemplaza la regla de strike-through. Cuando una fuente nueva contradice un claim viejo, se inserta `> [!contradiccion]` debajo del claim — nunca se sobrescribe. `/lint` detecta callouts no resueltos > 7 días.
- **Regla de wikilinks documentada:** `[[pagina]]` para artículos (filename único), `[[carpeta/_index|carpeta]]` para secciones. Nunca `[[carpeta]]` solo.
- **Slash commands actualizados** (`.claude/commands/ingest.md`, `query.md`, `lint.md`) para reflejar el nuevo workflow.
