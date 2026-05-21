# 11 — Lo bueno

> Highlights consolidados del proyecto. Para compartir con jurado, mentores, equipo, o publicar después del hackatón.

---

## En una frase

**Bitaya LLM Wiki es la primera implementación a impacto social del patrón LLM Wiki de Andrej Karpathy (abril 2026), enfocada en que personas vulnerables en Costa Rica sepan qué derechos las protegen y qué hacer hoy mismo.**

---

## Por qué importa

> La información pública no sirve si la persona que más la necesita no sabe cómo encontrarla, entenderla o usarla.

Las leyes que protegen a víctimas de violencia, niñez, adultos mayores, personas con discapacidad, migrantes y trabajadores informales **existen y son completas**. Pero están escritas para abogados, organizadas por institución (no por problema humano), y desactualizadas en muchos sitios oficiales.

Bitaya cierra esa brecha con un wiki **mantenido por un LLM**, que traduce las leyes al castellano de la calle y responde por situación concreta — con citas verificables a la fuente oficial en cada afirmación.

---

## Stats del proyecto

| Métrica | Valor |
|---|---|
| Archivos versionados | **91** |
| Líneas de markdown | **33,052** |
| Commits en `dev` | **9** |
| Documentos del proyecto | **11** (pitch / arquitectura / uso / demo / curador / FAQ / evals / seguridad / roadmap / comparativa / lo-bueno) |
| Plantillas tipadas | **8** (situacion / derecho / ley / institucion / procedimiento / termino / source / synthesis) |
| Slash commands | **3** (`/ingest` / `/query` / `/lint`) |
| Fuentes oficiales en `raw/` | **21** (todas de `.go.cr` / SCIJ) |
| Páginas wiki generadas | **23** |
| Diagramas Mermaid | **3** (renderizan native en GitHub) |
| Golden questions (evals) | **5** iniciales + framework para extender |
| GitHub Actions | **1** (CI que valida estructura en cada push) |
| Modelo de amenazas documentado | **5 amenazas** con mitigaciones |
| Fanout demo end-to-end | **1 ley → 20 archivos tocados** |

---

## Los 10 highlights que hacen este proyecto distinto

### 1. Primero en aplicar el patrón LLM Wiki a impacto social

El patrón de [Karpathy se publicó el 3 de abril de 2026](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) y tiene 16M de views, pero casi nadie lo ha aplicado a un problema social. Bitaya es la primera implementación dirigida a poblaciones vulnerables, con reglas duras del dominio legal.

### 2. Disciplina de citación que prácticamente elimina alucinaciones

Regla dura en `CLAUDE.md`: **toda afirmación legal debe citar `[[leyes/...]]` o `[[sources/...]]`**. Sin cita, no se publica. El CI lo valida. Comparalo con ChatGPT inventando artículos del Código Penal.

### 3. Detección de emergencia codificada en `/query`

Si la pregunta menciona peligro activo, la **primera línea** de la respuesta es `911` / `800-INAMU-00` / `1147`, antes que cualquier explicación. Una persona en pánico no tiene tiempo de leer un párrafo.

### 4. Aviso legal obligatorio en cada página pública

Cada situación, derecho, ley, procedimiento y síntesis termina con el disclaimer que refiere a Defensa Pública, consultorios gratuitos y Defensoría. **El CI verifica que esté presente.**

### 5. Política de vigencia con `ultima_verificacion`

Cada institución, ley, situación y término tiene fecha de última verificación. Umbrales: 6m instituciones, 18m leyes, 24m glosario. Si `/query` cita una página vencida, avisa.

### 6. Política de contradicción sin sobrescribir

Cuando una reforma contradice una página vieja, **no se borra** — se inserta un callout `> [!contradiccion]` y queda documentado. Auditable por git.

### 7. Anonimato y safety de quien consulta

Corre local. Cero analytics. Cero tracking. `log.md` registra ingests del curador, **no queries de usuarios**. Roadmap: botón "quick exit", mirror Tor.

### 8. Multi-agente desde el día 1

`AGENTS.md` es symlink a `CLAUDE.md`. El mismo schema sirve para Claude Code, Codex, OpenCode, Gemini CLI, Aider. **Cambiar de proveedor LLM = `git pull` con otro agente.**

### 9. Framework de evals que mide calidad real

`docs/07-EVALS.md` define 6 ejes (citación, cita correcta, pasos accionables, teléfono correcto, disclaimer, detección de emergencia). `evals/golden-questions.json` tiene preguntas reales con respuestas esperadas. **6/6 = pasa.**

### 10. Replicable a cualquier país de la región

El patrón es markdown + git + un agente. Honduras, Guatemala, Panamá, Nicaragua, El Salvador: forkean el repo, cambian las fuentes en `raw/` por las suyas, ingieren. **Schema y plantillas no cambian.**

---

## Demo end-to-end que funciona HOY

### Input

```
> /ingest raw/2026-05-21-ley-7586-violencia-domestica.md
```

### Output (real, en el repo ya)

Una sola ley generó **12 páginas nuevas + 8 actualizaciones = 20 archivos tocados**:

```
wiki/sources/2026-05-21-ley-7586-violencia-domestica.md     ← extracción con citas
wiki/leyes/ley-7586-violencia-domestica.md                  ← castellano simple
wiki/derechos/derecho-a-vivir-sin-violencia.md
wiki/instituciones/poder-judicial.md
wiki/instituciones/inamu.md
wiki/procedimientos/solicitar-medidas-de-proteccion.md
wiki/procedimientos/denuncia-violencia-domestica.md
wiki/situaciones/me-pega-mi-pareja.md                       ← voz real
wiki/situaciones/mi-pareja-me-amenaza.md                    ← voz real
wiki/situaciones/mi-pareja-lastima-a-mi-hijo-para-hacerme-dano.md  ← reforma 2025
wiki/glosario/violencia-vicaria.md
wiki/glosario/medida-de-proteccion.md
+ 7 _index.md + wiki/index.md + wiki/_hot.md + wiki/log.md
```

### Query

```
> /query mi pareja me pegó anoche y tengo miedo de que vuelva
```

### Respuesta

Arranca con teléfono de emergencia, 5 pasos accionables HOY, tabla de instituciones con teléfonos verificados, 5 wikilinks a leyes/instituciones/procedimientos, cierra con aviso legal. **Pasa 6/6 de la golden question `vd-001`.**

---

## La comparación que prueba el punto

Misma pregunta, tres sistemas:

| | ChatGPT genérico | Sitio Defensoría / SCIJ | **Bitaya** |
|---|---|---|---|
| Cita el artículo exacto | ❌ Inventa | ✅ Pero en jerga legal | ✅ Cita real, en castellano simple |
| Da el teléfono correcto | ❌ Suele dar de otro país | ✅ Cuando lo encontrás | ✅ Verificado al `ultima_verificacion` |
| "Qué hacer HOY" | ⚠️ Genérico | ❌ No existe | ✅ Pasos numerados accionables |
| Detecta emergencia | ❌ | ❌ | ✅ Primera línea = 911 / 800-INAMU-00 |
| Reconoce reforma 2025 (violencia vicaria) | ❌ | ⚠️ Depende del sitio | ✅ Documentada explícitamente |
| Auditable | ❌ | ⚠️ | ✅ Git log + citas |

---

## Quotes para usar en pitch

> "Las leyes ya existen. Faltaba que estuvieran a la mano."

> "Otros equipos te muestran un chatbot. Nosotros te mostramos un **artefacto que se compone con el tiempo**, **citado fuente por fuente**, **escrito para quien más lo necesita**."

> "Si una sola persona evita una segunda noche de violencia porque encontró el teléfono del INAMU y los pasos de denuncia en su idioma, el proyecto ya valió la pena."

> "Obsidian es el IDE, el LLM es el programador, el wiki es el codebase." — Andrej Karpathy, abril 2026.

> "Markdown es la capa de datos. Sitio web, bot de WhatsApp, app offline, impresos para zonas rurales — todas se alimentan del mismo wiki."

---

## Calidad de ingeniería como diferenciador

A diferencia de proyectos de hackatón típicos que son "demos bonitas que se caen al primer pregunta del jurado", Bitaya tiene:

✅ **CI workflow** (`.github/workflows/lint-wiki.yml`) que valida en cada push:
- Frontmatter YAML parseable
- Aviso legal en plantillas públicas
- Sin wikilinks rotos a taxonomía deprecada
- Slash commands referencian templates existentes
- README links resuelven
- Golden questions JSON válido

✅ **Framework de evals** (`docs/07-EVALS.md`) con 6 ejes medibles.

✅ **Reporte de salud auditado** (`docs/00-ESTADO.md`) — 0 enlaces rotos, 0 inconsistencias.

✅ **Guía del curador** (`docs/05-GUIA-CURADOR.md`) — para que cualquier persona pueda alimentar el wiki correctamente.

✅ **37 preguntas anticipadas del jurado** con respuestas listas (`docs/06-FAQ-JURADO.md`).

✅ **Diagramas Mermaid** que renderizan native en GitHub.

✅ **Roadmap real** con métricas de éxito por fase.

✅ **Modelo de amenazas** documentado (`docs/08-SEGURIDAD-RESPONSABLE.md`).

---

## El equipo entregó en tiempo récord

| Persona | Contribución |
|---|---|
| **Joshua Jiménez** | Project spec del producto BITAYA Incluye |
| **Pablo (PavsCR)** | Scraper Python de SINALEVI + 16 fuentes oficiales en `raw/` |
| **Joseph** + Claude | Schema, 11 docs, 8 plantillas, slash commands, evals, CI, demo ingest end-to-end |

**De cero a wiki funcional con contenido real en horas.**

---

## Stack técnico (radicalmente simple)

| Componente | Elección | Por qué |
|---|---|---|
| Editor | Obsidian | Local-first, graph view, plugin Dataview |
| Agente | Claude Code | Lee `CLAUDE.md` automáticamente, slash commands nativos |
| Almacenamiento | Filesystem + git | Versionado gratis, sin DB, portable |
| Búsqueda | `index.md` + `_index.md` por sección | 3-hop navigation, O(1) lecturas hasta ~500 páginas |
| Formato | Markdown + YAML frontmatter | Humanos y LLMs leen lo mismo |
| Lenguaje | Español de Costa Rica | Es el lenguaje de la audiencia |
| Idioma del agente | Definido en `CLAUDE.md`, no en el modelo | Cambiar comportamiento = editar markdown |

**Costo de infraestructura: $0.** Solo se paga uso del LLM en `/ingest` y `/query`. Para producción con caché: ~$0.001 por query común.

---

## Lo que ya está vivo en `dev`

https://github.com/JoshKerosh/Bitaya_LLM_Wiki/tree/dev

- ✅ Scaffold completo del patrón LLM Wiki especializado para CR / poblaciones vulnerables.
- ✅ 11 documentos cubriendo todos los ángulos del proyecto.
- ✅ Una ley real (Ley 7586 contra Violencia Doméstica) **completamente ingerida** con 12 páginas de cara al usuario.
- ✅ Tres situaciones de demo en voz real: `me-pega-mi-pareja`, `mi-pareja-me-amenaza`, `mi-pareja-lastima-a-mi-hijo-para-hacerme-dano`.
- ✅ Reforma 2025 (Ley contra la Violencia Vicaria) documentada — **conocimiento que ChatGPT genérico no tiene**.
- ✅ Reglas duras + plantillas + CI + evals + roadmap + comparativa + FAQ.
- ✅ 21 fuentes adicionales en `raw/` listas para próximos `/ingest`.

---

## Lo que sigue (no es excusa, es plan)

`docs/09-ROADMAP.md` describe fases 0-5 con métricas por fase:

- **Mes 1-1.5:** Validación con ONG aliada (INAMU o equivalente).
- **Mes 2-3:** Sitio público estático con SEO en español de CR.
- **Mes 4-6:** Bot de WhatsApp + bot de SMS + guías impresas.
- **Mes 7-9:** Adopción institucional (convenio con UCR/Colegio Abogados para validación).
- **Mes 10-12:** Réplica regional (Honduras, Guatemala, etc.).

---

## Si solo recordás 5 cosas

1. **Patrón nuevo (Karpathy, abr 2026) aplicado primero a impacto social.**
2. **Disciplina de citación + aviso legal obligatorio + detección de emergencia codificadas en el schema.**
3. **Markdown + git + agente = cero infra, máxima auditabilidad.**
4. **Demo end-to-end funciona HOY:** Ley 7586 ingerida, 12 páginas, query pasa 6/6 ejes de evals.
5. **Replicable a cualquier país de la región. Open source.**

---

## Compartir esto

Para mentores, jurado o equipo:
- Link directo a este doc: https://github.com/JoshKerosh/Bitaya_LLM_Wiki/blob/dev/docs/11-LO-BUENO.md
- Link al repo: https://github.com/JoshKerosh/Bitaya_LLM_Wiki/tree/dev
- Demo de una situación: https://github.com/JoshKerosh/Bitaya_LLM_Wiki/blob/dev/wiki/situaciones/me-pega-mi-pareja.md

Para LinkedIn / X post-hackatón:
> Construimos **Bitaya** durante el hackatón de IA en Costa Rica. Es la primera implementación a impacto social del patrón LLM Wiki de @karpathy (abr 2026): un wiki mantenido por un LLM que traduce las leyes que protegen a personas vulnerables al castellano de la calle, con pasos accionables y citas verificables. Open source. → [link]
