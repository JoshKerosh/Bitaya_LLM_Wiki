---
description: Respondé en lenguaje claro con pasos accionables y citas
argument-hint: <pregunta o situación>
---

Pregunta o situación: **$ARGUMENTS**

Seguí el workflow `/query` de `CLAUDE.md`:

1. Leé `wiki/index.md` y `wiki/_hot.md` primero para situarte.
2. Bajá a `wiki/<seccion>/_index.md` de la sección probable. Buscá **primero en `situaciones/`** — la gente describe su problema, no el nombre de la ley.
3. Abrí 1-3 páginas candidatas y seguí los `[[wikilinks]]` hacia `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`.
4. Si alguna página citada tiene `ultima_verificacion` vencida (6m instituciones, 18m leyes, 24m glosario), avisalo: *"verificado por última vez el YYYY-MM-DD — puede haber cambiado"*.
5. Si encontrás un `> [!contradiccion]` no resuelto sobre algo load-bearing, avisame antes de responder.
6. Respondé en **castellano simple**, con esta estructura:
   - **¿Esto está mal?** (sí/no/depende — qué derecho se viola)
   - **Qué te protege** (ley + artículo, con `[[leyes/...]]`)
   - **Qué hacer HOY** (pasos numerados, accionables)
   - **A quién llamar / dónde ir** (institución, teléfono, horario, si es gratis)
   - **Qué llevar**
   - **Si no te hacen caso** (escalamiento)
7. Citá toda afirmación legal con `[[leyes/...]]` o `[[sources/...]]`.
8. Si la pregunta describe una situación **que no existe** como página en `wiki/situaciones/`: ofreceme crearla.
9. Si la respuesta es valiosa y reutilizable (guía, comparación, checklist): ofreceme filearla en `wiki/synthesis/`.
10. **Cerrá siempre con el aviso legal obligatorio** (ver `CLAUDE.md`).
11. Appendeá a `wiki/log.md`: `## [YYYY-MM-DD] query | <pregunta>` + 1 línea de qué devolviste y qué páginas creaste si aplicó.

Si la pregunta menciona una **emergencia activa** (violencia en curso, riesgo a niñez, persona herida), tu primera línea de respuesta debe ser el teléfono de emergencia correspondiente (**911** / **800-INAMU-00** / **1147**).
