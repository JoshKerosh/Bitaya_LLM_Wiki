---
description: Health-check del wiki — citas faltantes, teléfonos viejos, gaps de población
---

Ejecutá el workflow `/lint` de `CLAUDE.md`. Devolveme una punch list agrupada por categoría:

**Calidad legal**
- Páginas de cara al público (situación / derecho / ley / procedimiento) **sin el aviso legal obligatorio**.
- **Afirmaciones legales sin cita** a `[[leyes/...]]` o `[[sources/...]]`.
- **Términos técnicos no linkeados** al glosario.
- **Citas inventadas** sospechosas (artículos que no aparecen en `raw/`).

**Vigencia (`ultima_verificacion`)**
- **Instituciones / procedimientos** con `ultima_verificacion` > **6 meses** o marcadas `necesita-verificar`.
- **Leyes / derechos** con `ultima_verificacion` > **18 meses**.
- **Glosario** con `ultima_verificacion` > **24 meses**.
- **Páginas sin `ultima_verificacion`** en frontmatter (drift del esquema).

**Contradicciones**
- Callouts `> [!contradiccion]` con **más de 7 días** sin resolver — listar página, claim afectado y fuente que contradice.

**Estructura**
- **Situaciones huérfanas** — sin link a `derechos/`, `leyes/`, `instituciones/` o `procedimientos/`.
- **Leyes huérfanas** — sin ninguna situación que las invoque.
- **Wikilinks rotos** o que apuntan a fantasmas (`[[carpeta]]` sin `/_index`).
- **Drift del `index.md` raíz** — contadores desactualizados.
- **Drift de `_index.md` por sección** — páginas en la carpeta no listadas en su `_index.md`, o al revés.
- **Drift de frontmatter** — campos faltantes, `poblacion` vacío en situaciones/derechos/leyes.

**Cobertura**
- **Poblaciones con poca cobertura** (ej: pocas situaciones para personas con discapacidad o pueblos indígenas).
- **`status: stub` hace > 30 días** sin avanzar.
- **Gaps temáticos** — sugerí qué buscar (qué ley, qué manual, qué institución).

**Accesibilidad**
- Páginas con **jerga legal sin explicar**.
- Procedimientos sin **teléfono** o sin **dirección física**.
- Instituciones sin **opción para gente sin internet**.

No arregles solo. Surfaceá la lista, esperá priorización.

Después de los arreglos acordados:
- Reescribí `wiki/_hot.md` reflejando la densidad y huecos actualizados.
- Appendeá `## [YYYY-MM-DD] lint | <resumen una línea>` a `wiki/log.md`.
