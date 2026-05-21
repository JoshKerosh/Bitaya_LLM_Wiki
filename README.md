# Bitaya LLM Wiki

Wiki mantenido por un LLM para que **personas vulnerables en Costa Rica** conozcan las leyes y derechos que las protegen, y sepan qué hacer y a quién acudir.

> Mucha gente no sabe que tiene derechos, o no sabe a quién preguntar. Este wiki es esa ayuda.

Construido sobre el patrón [LLM Wiki de Andrej Karpathy (abril 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## 📚 Documentación

Para el hackatón, leer en este orden:

1. **[docs/01-PITCH.md](docs/01-PITCH.md)** — Problema, solución, impacto. _(para audiencia y jurado)_
2. **[docs/02-ARQUITECTURA.md](docs/02-ARQUITECTURA.md)** — Patrón LLM Wiki, anatomía del repo, por qué no RAG. _(para jurado técnico)_
3. **[docs/03-GUIA-DE-USO.md](docs/03-GUIA-DE-USO.md)** — Roles, comandos, reglas duras, workflow. _(para operadores)_
4. **[docs/04-DEMO.md](docs/04-DEMO.md)** — Script paso a paso para la demo en vivo de 5 min.
5. **[docs/05-GUIA-CURADOR.md](docs/05-GUIA-CURADOR.md)** — ⭐ **Si vas a alimentar el wiki, leé esto primero.** Cómo subir fuentes a `raw/`, qué entra y qué no, naming, checklist antes de `/ingest`.

El **schema completo** del agente vive en [`CLAUDE.md`](CLAUDE.md) — ese archivo es el "código fuente" del comportamiento del LLM.

## Quién es la audiencia

- Víctimas de violencia doméstica.
- Niñez y adolescencia en riesgo.
- Adultos mayores.
- Personas con discapacidad.
- Pueblos indígenas.
- Personas migrantes y refugiadas.
- Personas LGBTIQ+.
- Trabajadoras del hogar y trabajadores informales.
- Personas en pobreza.

El contenido se escribe **para ellas**, no para abogados. Lenguaje claro, pasos accionables, teléfonos y direcciones.

## La idea

No es un buscador, no es RAG. El LLM:
1. **Lee fuentes oficiales** (leyes, sentencias, manuales del PANI, INAMU, MTSS, etc.) que vos pones en `raw/`.
2. **Las compila** en un wiki interlinkeado de markdown en `wiki/`.
3. **Lo mantiene actualizado** cuando agregás más material — cruces, contradicciones, vacíos.
4. Responde preguntas como _"me despidieron sin pagarme, ¿qué hago?"_ con pasos concretos y citas a las leyes.

El wiki es un **artefacto que crece con el tiempo**, no una respuesta efímera de chat.

## Estructura

```
.
├── CLAUDE.md              ← schema completo (cómo el agente mantiene el wiki)
├── AGENTS.md              ← symlink a CLAUDE.md (Codex y otros agentes)
├── README.md              ← este archivo
├── raw/                   ← fuentes oficiales inmutables (LLM solo lee)
│   └── assets/            ← PDFs de leyes, sentencias, manuales
├── wiki/                  ← markdown que el LLM mantiene
│   ├── index.md           ← catálogo raíz (LLM lo lee primero)
│   ├── _hot.md            ← foco activo (~500 palabras): qué cubre densamente + huecos
│   ├── log.md             ← append-only de ingests/queries/lints
│   ├── situaciones/       ← 🆘 puerta de entrada — "me pasa esto, ¿qué hago?"
│   │   └── _index.md      ← índice de sección (idem para cada carpeta de abajo)
│   ├── derechos/          ← ⚖️ derechos específicos
│   ├── leyes/             ← 📜 leyes y artículos
│   ├── instituciones/     ← 🏛️ entidades que ayudan
│   ├── procedimientos/    ← 🧭 pasos formales (denuncias, recursos)
│   ├── glosario/          ← 📖 términos legales en castellano simple
│   ├── sources/           ← 📂 una página por fuente oficial ingerida
│   └── synthesis/         ← 🧪 comparaciones y guías generadas
├── _templates/            ← plantillas tipadas
│   ├── situacion.md
│   ├── derecho.md
│   ├── ley.md
│   ├── institucion.md
│   ├── procedimiento.md
│   ├── termino.md
│   ├── source.md
│   └── synthesis.md
└── .claude/commands/      ← slash commands: /ingest, /query, /lint
```

## Mecanismos del schema

Cuatro reglas operativas que vuelven al wiki escalable y confiable a medida que crece. Todas están especificadas en [`CLAUDE.md`](CLAUDE.md) y aplicadas por los slash commands.

### 1. Navegación de tres saltos

```
wiki/index.md  →  wiki/<seccion>/_index.md  →  wiki/<seccion>/<pagina>.md
```

Cada sección tiene su propio `_index.md`. El LLM siempre llega al artículo en 3-4 lecturas, sin importar cuánto crezca el wiki. Los enlaces a una sección usan `[[carpeta/_index|carpeta]]` (Obsidian evita crear archivos fantasma).

### 2. `_hot.md` — foco activo

Archivo de ~500 palabras que resume **qué cubre el wiki densamente hoy** y **qué huecos quedan abiertos**. Se lee al inicio de cada sesión junto con `index.md`, y se reescribe en cada `/ingest` y `/lint`. Es el mapa de calor del wiki — sirve para no preguntarse "¿esto ya está cubierto?" cada vez.

### 3. Vigencia (`ultima_verificacion`)

Toda página de cara al público lleva un campo `ultima_verificacion: YYYY-MM-DD` en el frontmatter. Umbrales:

| Tipo de página | Vence a los |
|---|---|
| Instituciones / procedimientos | 6 meses |
| Leyes / derechos | 18 meses |
| Glosario | 24 meses |

Cuando `/query` cita una página vencida, avisa explícitamente: *"verificado por última vez el YYYY-MM-DD — puede haber cambiado"*. `/lint` lista las vencidas para reingerir. Crítico porque teléfonos, horarios y leyes cambian.

### 4. Contradicciones con callout (no se sobrescribe nunca)

Cuando una fuente nueva contradice un claim ya publicado, el LLM **nunca borra ni tacha**. Inserta este bloque debajo del claim viejo:

```markdown
> [!contradiccion]
> Fuente `[[sources/YYYY-MM-DD-slug]]` contradice este claim: "<texto exacto>".
> Pendiente de resolución humana.
```

`/lint` detecta callouts con más de 7 días sin resolver y los surfacea. Esto garantiza que ningún cambio relevante pase sin revisión humana.

## Setup (~3 minutos)

### 1. Obsidian (editor)

1. Descargar [Obsidian](https://obsidian.md) (free).
2. **Open folder as vault** → este directorio.
3. Recomendado en Settings:
   - **Files and links** → Attachment folder path: `raw/assets`.
   - **Files and links** → New link format: `Shortest path when possible`.
   - **Files and links** → Use `[[Wikilinks]]`: ON.
4. Plugins community recomendados:
   - **Dataview** — queries dinámicas sobre el frontmatter (ej: listar todas las situaciones de mujeres víctimas de violencia ordenadas por urgencia).
   - **Obsidian Web Clipper** (extensión de browser) — clippear leyes desde SCIJ directo a `raw/`.

### 2. Claude Code (el agente)

```bash
cd /Users/joseph/Documents/Pernix/Bitaya_LLM_Wiki
claude
```

Lee automáticamente `CLAUDE.md` (el schema) y expone los slash commands.

### 3. Workflow

**Ingerir una fuente oficial:**

```
> /ingest raw/2026-05-21-ley-penalizacion-violencia-contra-las-mujeres.pdf
> /ingest https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=60057
```

El agente:
1. Resume los puntos clave y los confirma con vos.
2. Crea la página de la ley en `wiki/leyes/`.
3. Crea/actualiza páginas en `wiki/derechos/`, `wiki/instituciones/`, `wiki/procedimientos/`.
4. **Crea las situaciones reales** que esta ley cubre (`me-pega-mi-pareja`, `mi-pareja-me-amenaza`, etc.) en `wiki/situaciones/`.
5. Agrega términos al `wiki/glosario/`.
6. Actualiza `wiki/index.md` y appendea a `wiki/log.md`.

**Preguntar:**

```
> /query Me despidieron sin avisar y no me pagaron, ¿qué hago?
```

Responde con pasos concretos, teléfonos, instituciones y citas a las leyes.

**Health-check:**

```
> /lint
```

Revisa contradicciones, claims sin citar, páginas sin aviso legal, teléfonos viejos, gaps por población.

## Reglas duras del proyecto

- **No es asesoría legal.** Es educativo. Cada página termina con un bloque que refiere a Defensa Pública / consultorios jurídicos gratuitos / Defensoría.
- **Toda afirmación legal lleva cita** a `[[leyes/...]]` o `[[sources/...]]`. Sin cita, no se publica.
- **La audiencia puede no tener internet**: incluir siempre teléfonos, direcciones físicas y horarios.
- **Lenguaje claro siempre.** Los términos técnicos viven en `glosario/`.

## Fuentes oficiales (para alimentar `raw/`)

- **[SCIJ](https://www.pgrweb.go.cr/scij/)** — Sistema Costarricense de Información Jurídica (leyes, decretos).
- **[Nexus PJ](https://nexuspj.poder-judicial.go.cr/)** — Jurisprudencia.
- **[Sala Constitucional](https://salaconstitucional.poder-judicial.go.cr/)** — Sentencias de amparo.
- **INAMU, PANI, CONAPAM, CONAPDIS, DGME, Defensoría de los Habitantes, MTSS, CCSS** — manuales y guías oficiales.

## Teléfonos clave

- **911** — emergencias.
- **800-INAMU-00 (800-46268-00)** — violencia contra mujeres.
- **1147** o **800-2262626** — PANI (niñez).
- **800-258-7474** — Defensoría de los Habitantes.
- **800-800-3000** — Defensa Pública.

## Referencias

- [Karpathy, *LLM Wiki* gist (abril 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Beyond RAG: How Karpathy's LLM Wiki Pattern Builds Knowledge That Actually Compounds](https://levelup.gitconnected.com/beyond-rag-how-andrej-karpathys-llm-wiki-pattern-builds-knowledge-that-actually-compounds-31a08528665e)
- [obsidian-wiki framework (Ar9av)](https://github.com/Ar9av/obsidian-wiki)
