# Log

Registro cronológico append-only. Cada entrada arranca con `## [YYYY-MM-DD] <op> | <título>` para parsear con `grep '^## \[' wiki/log.md | tail -20`.

Operaciones: `init`, `ingest`, `query`, `lint`, `synthesis`.

---

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
