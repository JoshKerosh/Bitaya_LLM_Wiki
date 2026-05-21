# 00 — Estado del proyecto

> **Reporte de salud del repositorio.** Generado tras una auditoría completa. Si vas a presentar al jurado, leé esto para saber qué está listo, qué está vacío por diseño, y qué falta para cargarlo con contenido real.

**Fecha de auditoría:** 2026-05-21
**Branch:** `dev`
**Último commit auditado:** ver `git log --oneline -1`

---

## Resumen ejecutivo

✅ **Infraestructura: 100% lista.** El scaffold está completo, validado y sin enlaces rotos.

🟡 **Contenido: 0% — por diseño.** El wiki empieza vacío. Se llena curando fuentes oficiales y ejecutando `/ingest`. Esto es intencional según el patrón LLM Wiki de Karpathy.

📚 **Documentación: 6 documentos cubriendo pitch, arquitectura, uso, demo y curación.**

---

## Checklist de auditoría

### Estructura del repositorio
- ✅ 30 archivos creados, organizados en 4 capas (`raw/`, `wiki/`, `_templates/`, `docs/`).
- ✅ Symlink `AGENTS.md` → `CLAUDE.md` funciona (compat con Codex/OpenCode/Gemini CLI).
- ✅ `.gitignore` cubre archivos personales de Obsidian, macOS y editores.
- ✅ Working tree limpio, rama `dev` sincronizada con `origin/dev`.

### Esquema y plantillas
- ✅ `CLAUDE.md` (schema completo) presente, 250+ líneas.
- ✅ 8 plantillas tipadas: `situacion`, `derecho`, `ley`, `institucion`, `procedimiento`, `termino`, `source`, `synthesis`.
- ✅ Las 4 plantillas públicas (`situacion`, `derecho`, `ley`, `procedimiento`) tienen el **aviso legal obligatorio**.
- ✅ `synthesis` también incluye el aviso legal (puede compartirse con usuarios).
- ✅ Frontmatter YAML válido en todas las plantillas (parseable por Dataview de Obsidian).
- ✅ Campo `ultima_verificacion` en todas las plantillas de cara al público.
- ✅ Sin referencias a la taxonomía vieja (`entities/`, `concepts/`) — limpiadas en la auditoría.

### Estructura del wiki
- ✅ 8 secciones con `_index.md` cada una (`situaciones/`, `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`, `glosario/`, `sources/`, `synthesis/`).
- ✅ `wiki/index.md` raíz con tabla de secciones y navegación de 3 saltos.
- ✅ `wiki/_hot.md` para foco activo de la sesión (~500 palabras, se reescribe en cada `/ingest` y `/lint`).
- ✅ `wiki/log.md` con primer evento `[2026-05-21] init` registrado.
- ✅ Todos los wikilinks de `wiki/index.md` resuelven a archivos existentes.

### Slash commands
- ✅ `/ingest` definido en `.claude/commands/ingest.md` con workflow de 16 pasos.
- ✅ `/query` definido con estructura fija de respuesta y detección de emergencia.
- ✅ `/lint` definido con punch list agrupada (calidad legal / estructura / cobertura / accesibilidad).
- ✅ Todos los slash commands referencian archivos y rutas que existen.

### Documentación (11 documentos)
- ✅ `docs/00-ESTADO.md` — este reporte de salud auditado.
- ✅ `docs/01-PITCH.md` — pitch para audiencia/jurado.
- ✅ `docs/02-ARQUITECTURA.md` — arquitectura técnica con **3 diagramas Mermaid** (sistema, navegación 3-saltos, flujo de ingest).
- ✅ `docs/03-GUIA-DE-USO.md` — workflow operativo con reglas duras.
- ✅ `docs/04-DEMO.md` — script de demo de 5 minutos con Q&A anticipadas.
- ✅ `docs/05-GUIA-CURADOR.md` — guía completa para el compañero que alimentará el wiki + `raw/README.md` como guardrail inline.
- ✅ `docs/06-FAQ-JURADO.md` — **37 preguntas anticipadas** del jurado por categoría (técnicas, producto, impacto, business, adversariales).
- ✅ `docs/07-EVALS.md` — framework de evaluación con golden questions y métricas por eje.
- ✅ `docs/08-SEGURIDAD-RESPONSABLE.md` — modelo de amenazas, AI ética, qué NO hacemos.
- ✅ `docs/09-ROADMAP.md` — plan a 90 días + visión 12 meses.
- ✅ `docs/10-COMPARATIVA.md` — matriz vs ChatGPT / RAG / sitios oficiales / knowledge graphs / apps legales / Karpathy gist.
- ✅ `README.md` raíz con índice a toda la documentación.
- ✅ Todos los links relativos del README resuelven.
- ✅ Sin caracteres mojibake / problemas de encoding UTF-8.

### Evals y CI
- ✅ `evals/golden-questions.json` — 5 golden questions iniciales con expected (leyes, instituciones, teléfonos, pasos).
- ✅ `.github/workflows/lint-wiki.yml` — GitHub Action que valida estructura, frontmatter YAML, disclaimers, links, golden questions JSON en cada push.
- ✅ El workflow corrió localmente y pasó todos los checks.

### Calidad legal
- ✅ Aviso legal obligatorio definido en `CLAUDE.md` y replicado en plantillas públicas.
- ✅ Regla "toda afirmación legal lleva cita" documentada como regla dura.
- ✅ Política de vigencia (`ultima_verificacion`) con umbrales por tipo (6 / 18 / 24 meses).
- ✅ Política de contradicciones con callout `> [!contradiccion]` (no strike-through silencioso).
- ✅ Teléfonos de emergencia (911 / 800-INAMU-00 / 1147 / 800-258-7474 / 800-800-3000) documentados en `CLAUDE.md` y en plantillas.

---

## Lo que está vacío (por diseño)

| Carpeta | Estado | Por qué está vacío |
|---|---|---|
| `raw/` | Sin fuentes | El curador las irá subiendo. Ver `docs/05-GUIA-CURADOR.md`. |
| `wiki/situaciones/` | Solo `_index.md` | Las situaciones se generan al ingerir fuentes reales. |
| `wiki/derechos/` | Solo `_index.md` | Idem. |
| `wiki/leyes/` | Solo `_index.md` | Idem. |
| `wiki/instituciones/` | Solo `_index.md` | Idem. |
| `wiki/procedimientos/` | Solo `_index.md` | Idem. |
| `wiki/glosario/` | Solo `_index.md` | Idem. |
| `wiki/sources/` | Solo `_index.md` | Idem. |
| `wiki/synthesis/` | Solo `_index.md` | Se llena cuando una respuesta de `/query` se filea. |

Esto es 100% intencional: el patrón LLM Wiki **separa scaffold (vacío y estable) de contenido (que crece curando)**. El scaffold completo permite que cualquier curador empiece a producir contenido en minutos.

---

## Cómo cargarlo de contenido (próximo paso)

1. Leer `docs/05-GUIA-CURADOR.md` completo.
2. Conseguir 3-5 fuentes oficiales sobre la población objetivo del primer batch (recomendado: violencia contra mujeres, por urgencia).
3. Bajarlas a `raw/` con nombre `YYYY-MM-DD-slug.ext`.
4. Por cada fuente: `> /ingest raw/<archivo>`.
5. Validar lo que el agente propone. Aprobar nombres de situaciones.
6. Probar con `/query` desde la voz de la persona vulnerable.
7. Cada 10-20 ingests: `/lint` y resolver punch list.
8. `git add . && git commit -m "ingest: <descripción>" && git push origin dev`.

**Meta sugerida para mostrar en el hackatón:** al menos **1 ley completamente ingerida con 5+ situaciones reales** + **1 query exitosa en vivo**. Eso prueba que el patrón funciona end-to-end.

---

## Inconsistencias arregladas durante la auditoría

Durante este pase encontré y arreglé:

1. **`_templates/source.md`** tenía referencias a la taxonomía vieja (`entities/`, `concepts/`) que se eliminó al especializar el wiki para CR. Reemplazadas por `instituciones/`, `derechos/`, `glosario/`.
2. **`_templates/source.md`** no tenía `ultima_verificacion`. Agregado (para reconfirmar liveness de URL).
3. **`_templates/source.md`** tenía `medium: article | paper | podcast` (taxonomía genérica). Cambiado a tipos legales: `ley | decreto | reglamento | sentencia | protocolo | manual | guia | tratado | otro`.
4. **`_templates/synthesis.md`** referenciaba `[[entities/...]]`. Reemplazado por la taxonomía actual.
5. **`_templates/synthesis.md`** no tenía `ultima_verificacion`. Agregado (las síntesis se vuelven obsoletas cuando reforman las leyes que citan).
6. **`_templates/synthesis.md`** no tenía aviso legal obligatorio. Agregado (puede ser compartido con usuarios).

---

## Sin issues abiertos

A esta fecha de auditoría: **0 enlaces rotos, 0 referencias a archivos inexistentes, 0 errores de YAML, 0 problemas de encoding, 0 inconsistencias entre schema y plantillas**.

El proyecto está listo para hackatón.
