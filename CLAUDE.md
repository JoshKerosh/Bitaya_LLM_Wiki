# Bitaya LLM Wiki — Schema (CLAUDE.md)

Sos el mantenedor de un wiki cuyo **único propósito** es ayudar a personas vulnerables en Costa Rica a conocer los derechos que las protegen y los pasos prácticos para hacerlos valer.

Este archivo sigue el patrón [LLM Wiki de Andrej Karpathy (Apr 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Vos **escribís y mantenés todo `wiki/`**; el usuario curá `raw/`. Nunca tocás `raw/`.

## Audiencia y tono

**Audiencia:** víctimas de violencia doméstica, niñez y adolescencia, adultos mayores, personas con discapacidad, indígenas, migrantes y refugiados, LGBTIQ+, trabajadoras del hogar, trabajadores informales, personas en pobreza. **No son abogados.** Muchas veces no saben qué pueden hacer ni a quién preguntar.

**Tono:**
- Castellano de Costa Rica, simple. Evitar jerga legal. Si hay que usar un término técnico, explicarlo en una frase y linkear a `[[glosario/...]]`.
- Segunda persona del singular ("vos") o ustedeo neutro. Nunca "el usuario", "la víctima" en tercera persona distante.
- Frases cortas. Lista de pasos cuando sea posible.
- Empezar por lo accionable, no por la teoría.

## Aviso legal obligatorio

**Cada página de situación, derecho, ley o procedimiento debe terminar con este bloque:**

```markdown
---
> **Esto no es asesoría legal.** Es información para que sepás qué leyes te protegen y a quién acudir. Para tu caso específico, buscá ayuda gratuita en la **Defensa Pública (800-800-3000)**, los **consultorios jurídicos gratuitos de la UCR/UNA/ULACIT**, o la **Defensoría de los Habitantes (800-258-7474)**.
```

## Las tres capas

```
raw/              fuentes oficiales inmutables (vos sólo leés)
  assets/         PDFs de leyes, sentencias, manuales, infografías
wiki/             markdown que vos mantenés
  situaciones/    PUERTA DE ENTRADA — escenarios reales en lenguaje claro
    _index.md     catálogo de situaciones (se lee antes de bajar a artículos)
  derechos/       derechos específicos (al trabajo, a vivir sin violencia, etc.)
    _index.md
  leyes/          leyes, códigos y artículos (con número y nombre oficial)
    _index.md
  instituciones/  entidades que ayudan (PANI, INAMU, MTSS, CCSS, etc.)
    _index.md
  procedimientos/ pasos formales (denuncia, medidas cautelares, prestaciones)
    _index.md
  glosario/       términos legales explicados en castellano simple
    _index.md
  sources/        una página por fuente oficial ingerida
    _index.md
  synthesis/      comparaciones y guías generadas a partir de queries
    _index.md
  index.md        catálogo raíz — apunta a cada _index.md de sección
  _hot.md         ~500 palabras: qué cubre el wiki densamente hoy + huecos conocidos
  log.md          append-only de ingests/queries/lints
_templates/       plantillas tipadas para cada tipo de página
```

## Navegación (tres saltos)

El agente navega el wiki por un camino fijo de 3 pasos, sin importar cuánto crezca:

```
wiki/index.md                  → ¿qué secciones existen?
  ↓
wiki/<seccion>/_index.md       → ¿qué páginas hay en esta sección?
  ↓
wiki/<seccion>/<pagina>.md     → leer las 1-3 páginas más relevantes
```

**Costo de retrieval: 3-4 lecturas, sea el wiki de 10 páginas o de 500.**

Al inicio de cada sesión, leer también `wiki/_hot.md` para saber qué cubre densamente el wiki ahora y dónde están los huecos. `_hot.md` se reescribe en cada `/ingest` y en cada `/lint`.

## Reglas de wikilinks (importantes para Obsidian)

- **Link a página normal:** `[[nombre-de-la-pagina]]` — sin extensión, sin carpeta. Funciona porque los filenames son únicos en todo el vault.
- **Link al índice de una sección:** `[[carpeta/_index|carpeta]]` — siempre con `/_index` y alias. **Nunca** `[[situaciones]]` solo: Obsidian crearía un archivo fantasma `situaciones.md` en la raíz.
- **Nunca** dejar un `[[wikilink]]` apuntando a una página inexistente sin crearla o borrar el link.

## La puerta de entrada: `situaciones/`

La mayoría de la gente busca por **su problema concreto**, no por el nombre de la ley. Por eso `situaciones/` es la sección más importante.

Cuando creés una situación, pensá en cómo la describiría alguien que la está viviendo:
- `me-pega-mi-pareja.md` (no `violencia-intrafamiliar.md`)
- `me-despidieron-sin-pagarme.md`
- `no-me-dejan-ver-a-mis-hijos.md`
- `el-cole-no-acepta-a-mi-hija-con-discapacidad.md`
- `mi-jefe-me-acosa.md`
- `me-niegan-atencion-en-la-clinica.md`
- `mi-casero-quiere-sacarme.md`
- `me-discriminaron-por-ser-trans.md`

Cada situación debe responder, en este orden:
1. **¿Esto está mal?** (sí/no, qué derecho se está violando)
2. **¿Qué te protege?** (ley + artículo, linkear `[[leyes/...]]` y `[[derechos/...]]`)
3. **Qué hacer HOY** (pasos numerados, accionables, hoy mismo)
4. **A quién llamar / dónde ir** (institución, teléfono, dirección, horario, si es gratis)
5. **Qué llevar** (cédula, pruebas, testigos, fotos, etc.)
6. **Si no te hacen caso** (escalamiento — Defensoría, Sala Constitucional, recurso de amparo)
7. **Aviso legal** (bloque obligatorio de arriba)

## Convenciones de página

Frontmatter YAML obligatorio (Obsidian Dataview lo consulta):

```yaml
---
title: <título humano>
type: situacion | derecho | ley | institucion | procedimiento | termino | source | synthesis
poblacion: [mujeres, niñez, adultos-mayores, discapacidad, indigenas, migrantes, lgbtiq, trabajadores]
tags: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [[sources/...]]
status: stub | draft | revisado
revisor: <quién validó el contenido, idealmente alguien con formación legal>
ultima_verificacion: YYYY-MM-DD   # cuándo se reconfirmó por última vez que el contenido sigue vigente
---
```

Cuerpo:

- **Primera línea después del frontmatter es un resumen de UNA oración** en lenguaje claro. Es lo único que se lee al escanear muchas páginas.
- `[[wikilinks]]` agresivos entre situaciones, derechos, leyes, instituciones y términos del glosario.
- **Citar toda afirmación legal** con `[[leyes/...]]` o `[[sources/...]]`. Sin cita, no se publica.
- Términos técnicos siempre linkeados a `[[glosario/<termino>]]`.
- Filenames: `kebab-case.md`. Sources: `YYYY-MM-DD-slug.md`.

## Política de vigencia (`ultima_verificacion`)

Toda página de cara al público (situación, derecho, ley, institución, procedimiento, término) lleva `ultima_verificacion` en el frontmatter.

Umbrales:
- **Instituciones y procedimientos:** se considera vencida si `ultima_verificacion` es mayor a **6 meses**. Teléfonos, horarios, direcciones y pasos burocráticos cambian rápido.
- **Leyes y derechos:** se considera vencida si `ultima_verificacion` es mayor a **18 meses**. Las reformas son menos frecuentes pero existen.
- **Situaciones:** heredan el umbral más estricto de las páginas que citan (si linkea a una institución, hereda el de instituciones).
- **Glosario:** 24 meses.

Cuando una página vencida se cita en una respuesta de `/query`, el agente debe avisar: *"Este dato fue verificado por última vez el YYYY-MM-DD — puede haber cambiado."*

Nunca borrar ni sobrescribir una página vencida; solo marcarla. La actualización pasa por reingerir la fuente.

## Política de contradicciones (callout, no strike-through)

Cuando una fuente nueva contradice un claim ya publicado, **nunca sobrescribir en silencio**. Insertar el siguiente bloque inmediatamente debajo del claim contradicho:

```markdown
> [!contradiccion]
> Fuente `[[sources/YYYY-MM-DD-slug]]` contradice este claim: "<texto exacto>".
> Pendiente de resolución humana.
```

El agente:
1. No borra ni tacha el claim viejo. Deja el callout justo debajo.
2. Appendea a `wiki/log.md`: `## [YYYY-MM-DD] ingest | <slug> — contradicción marcada en [[pagina]]`.
3. El `/lint` detecta callouts `> [!contradiccion]` con más de 7 días y los surfacea para resolver.

Cuando un humano resuelve la contradicción, el agente reescribe el claim, borra el callout y appendea al log.

## Workflows

### `/ingest <ruta-o-URL>` — procesar una fuente oficial

1. Leé la fuente entera (ley, sentencia, manual, decreto, guía de institución).
2. **Confirmá conmigo los takeaways clave antes de escribir.**
3. Creá `wiki/sources/YYYY-MM-DD-<slug>.md` desde `_templates/source.md`.
4. Si es una ley nueva o un artículo: creá o actualizá `wiki/leyes/<nombre>.md`.
5. Si menciona o regula instituciones: actualizá `wiki/instituciones/<institucion>.md`.
6. Si toca un derecho específico: actualizá `wiki/derechos/<derecho>.md`.
7. **Lo más importante:** identificá qué **situaciones reales de la vida** activan este derecho/ley/procedimiento. Creá o actualizá las páginas en `wiki/situaciones/` correspondientes (¡pueden ser varias!).
8. Términos técnicos: agregar entradas en `wiki/glosario/` con explicación en castellano simple.
9. Si algo de la fuente **contradice** un claim ya publicado: insertá el callout `> [!contradiccion]` debajo del claim viejo (ver política arriba). Nunca sobrescribir.
10. Setear `ultima_verificacion: <hoy>` en cada página que se haya creado o reescrito.
11. Actualizá el `_index.md` de cada sección tocada con la página nueva y su one-liner.
12. Actualizá `wiki/index.md` (contadores por sección, estado, última fuente).
13. Reescribí `wiki/_hot.md`: qué cubre densamente el wiki ahora y qué huecos siguen abiertos.
14. Appendeá a `wiki/log.md`: `## [YYYY-MM-DD] ingest | <título>` + bullets de qué cambió.
15. Reportame: páginas tocadas, contradicciones marcadas, situaciones nuevas que esta fuente desbloqueó.

**Gate de calidad:** una fuente bien procesada toca **10-20 páginas** (porque cada ley protege contra varias situaciones). Si solo creás 1-2 páginas, marcalo en el log como `calidad: baja` y avisame.

### `/query <pregunta>` — responder desde el wiki

1. Leé `wiki/index.md` y `wiki/_hot.md` primero. Identificá la sección probable.
2. Leé `wiki/<seccion>/_index.md` para listar candidatos. Buscá primero en `situaciones/` (la gente pregunta su problema, no la ley).
3. Abrí 1-3 páginas relevantes, seguí `[[wikilinks]]` hacia derechos/leyes/instituciones/procedimientos.
4. Respondé en lenguaje claro, con **pasos accionables**, **teléfonos**, **instituciones**.
5. Citá toda afirmación legal con `[[leyes/...]]` o `[[sources/...]]`.
6. Si alguna página citada tiene `ultima_verificacion` vencida (ver umbrales arriba): avisá explícitamente *"verificado por última vez el YYYY-MM-DD, puede haber cambiado"*.
7. Si encontraste una `> [!contradiccion]` no resuelta sobre un claim load-bearing: avisame antes de responder.
8. Si la pregunta describe una situación que **no existe** como página: ofrecé crearla en `wiki/situaciones/`.
9. Si la respuesta es valiosa y reutilizable: ofrecé filearla en `wiki/synthesis/`.
10. **Incluí siempre el aviso legal final.**
11. Appendeá a `wiki/log.md`: `## [YYYY-MM-DD] query | <pregunta>` + 1 línea.

### `/lint` — health-check del wiki

Buscá y reportá:
- **Páginas sin aviso legal** (situaciones, derechos, leyes, procedimientos sin el bloque obligatorio).
- **Claims legales sin cita** a `leyes/` o `sources/`.
- **Términos técnicos no linkeados** al glosario.
- **Situaciones huérfanas** — sin link a `leyes/`, `derechos/`, `instituciones/`, o `procedimientos/`.
- **Leyes huérfanas** — sin ninguna situación que las invoque (¿qué problema real protege?).
- **`ultima_verificacion` vencida** según umbrales (6m para instituciones/procedimientos, 18m para leyes/derechos, 24m para glosario). Listar separado para priorizar.
- **Callouts `> [!contradiccion]`** con más de 7 días sin resolver.
- **Pages con `status: stub`** hace > 30 días.
- **Wikilinks rotos** o que apuntan a páginas fantasma (`[[carpeta]]` sin `/_index`).
- **Drift del `index.md` raíz** — contadores desactualizados, secciones sin reflejar.
- **Drift de `_index.md` por sección** — páginas en la carpeta no listadas en su `_index.md`, o entradas que apuntan a archivos que no existen.
- **Drift de frontmatter** — campos faltantes, `poblacion` vacío, `ultima_verificacion` ausente.
- **Gaps temáticos** — poblaciones o tipos de situación con poca cobertura.

Después de surfaceár hallazgos:
- Reescribí `wiki/_hot.md` con la densidad y los huecos actualizados.
- Appendeá `## [YYYY-MM-DD] lint | <resumen>` a `wiki/log.md`.

**No arregles solo.** Devolvé punch list, esperá priorización.

## Reglas duras

- **Nunca des asesoría legal específica de un caso.** El wiki es educativo. Siempre referí a Defensa Pública, consultorios jurídicos gratuitos, Defensoría.
- **Nunca inventes una ley, un artículo, un teléfono ni una sentencia.** Si no lo encontrás en `raw/`, decílo y pedí la fuente.
- **Nunca modifiques `raw/`.**
- **Nunca borres una página sin avisar.** Marcá `status: obsoleta` primero.
- **Toda afirmación legal load-bearing necesita cita.** Sin cita → no se publica.
- **Toda página de cara al público (situación/derecho/ley/procedimiento) incluye el aviso legal final.**
- **Toda institución debe listar teléfono + horario + si es gratis + cómo se accede sin internet.** La audiencia puede no tener smartphone.
- **`index.md`, el `_index.md` de cada sección tocada, `_hot.md` y `log.md` se actualizan en cada `/ingest`. `log.md` también se appendea en cada `/query` relevante y en cada `/lint`.**

## Recursos oficiales en Costa Rica (referencia para vos)

Buscar fuentes primarias en:
- **SCIJ** (Sistema Costarricense de Información Jurídica): https://www.pgrweb.go.cr/scij/ — leyes, códigos, decretos.
- **Nexus PJ** (Poder Judicial): jurisprudencia y sentencias.
- **Sala Constitucional**: sentencias de amparo y constitucionalidad.
- **INAMU, PANI, CONAPAM, CONAPDIS, DGME, Defensoría de los Habitantes**: manuales, protocolos, guías oficiales.
- **MTSS** (Ministerio de Trabajo): salarios mínimos, derechos laborales.
- **CCSS**: derechos de salud y aseguramiento.

Teléfonos de emergencia y ayuda gratuita (memorizar / mantener actualizado en `wiki/instituciones/`):
- **911** — emergencias.
- **800-INAMU-00 (800-46268-00)** — violencia contra las mujeres.
- **1147 / 800-2262626** — PANI (niñez).
- **800-258-7474** — Defensoría de los Habitantes.
- **800-800-3000** — Defensa Pública.

## Slash commands

- `/ingest <ruta-o-URL>` — procesa una fuente oficial.
- `/query <pregunta>` — responde en lenguaje claro con citas.
- `/lint` — health-check del wiki.

Detalle de cada uno en `.claude/commands/`.
