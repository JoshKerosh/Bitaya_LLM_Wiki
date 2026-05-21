# BITAYA Incluye

> **IA responsable para convertir una situación vulnerable en una ruta clara de ayuda.**

BITAYA Incluye ayuda a **personas vulnerables en Costa Rica** a describir su situación en lenguaje simple y recibir una ruta inicial de orientación: institución sugerida, datos faltantes, próximos pasos, mensaje listo para solicitar ayuda y revisión humana obligatoria.

Mucha gente no sabe que tiene derechos, o no sabe a quién preguntar. Este proyecto cierra esa brecha.

---

## Los tres componentes del monorepo

```
                     ┌────────────────────────────────────────┐
                     │     Frontend React (chat UI)           │
                     │     src/  ·  bitaya-incluye.html       │
                     └──────────────────┬─────────────────────┘
                                        │ POST /api/chat
                                        ▼
                     ┌────────────────────────────────────────┐
                     │  Wiki + agente LLM (este es el core)   │
                     │  CLAUDE.md  ·  wiki/  ·  _templates/   │
                     │  .claude/commands/ (/ingest /query)    │
                     └──────────────────┬─────────────────────┘
                                        │ lee
                                        ▼
                     ┌────────────────────────────────────────┐
                     │  Fuentes oficiales (CR .go.cr / SCIJ)  │
                     │  raw/ — bajadas por scraper/           │
                     └────────────────────────────────────────┘
```

| Componente | Carpeta | Qué hace |
|---|---|---|
| 🧠 **LLM Wiki** | `wiki/`, `_templates/`, `CLAUDE.md`, `.claude/commands/` | Base de conocimiento mantenida por un LLM. Patrón [Karpathy LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (abril 2026). |
| 🎨 **Frontend** | `src/`, `bitaya-incluye.html`, `package.json`, `vite.config.ts` | UI de chat en React + Vite + Tailwind. Llama al backend. |
| 🤖 **Scraper** | `scraper/` | Tool en Python que baja fuentes oficiales de SCIJ / SINALEVI a `raw/`. |

---

## 📚 Documentación

Para el hackatón, leer en este orden:

0. **[docs/00-ESTADO.md](docs/00-ESTADO.md)** — 🩺 Reporte de salud auditado: qué está listo, qué está vacío por diseño, sin issues abiertos.
1. **[docs/01-PITCH.md](docs/01-PITCH.md)** — Problema, solución, impacto. _(para audiencia y jurado)_
2. **[docs/02-ARQUITECTURA.md](docs/02-ARQUITECTURA.md)** — Patrón LLM Wiki, anatomía del repo, **diagramas Mermaid**, por qué no RAG. _(para jurado técnico)_
3. **[docs/03-GUIA-DE-USO.md](docs/03-GUIA-DE-USO.md)** — Roles, comandos, reglas duras, workflow. _(para operadores)_
4. **[docs/04-DEMO.md](docs/04-DEMO.md)** — Script paso a paso para la demo en vivo de 5 min.
5. **[docs/05-GUIA-CURADOR.md](docs/05-GUIA-CURADOR.md)** — ⭐ **Si vas a alimentar el wiki, leé esto primero.** Cómo subir fuentes a `raw/`, qué entra y qué no, naming, checklist antes de `/ingest`.
6. **[docs/06-FAQ-JURADO.md](docs/06-FAQ-JURADO.md)** — 🎤 **37 preguntas anticipadas** del jurado con respuestas listas (técnicas, producto, impacto, business, adversariales).
7. **[docs/07-EVALS.md](docs/07-EVALS.md)** — Framework de evaluación con golden questions ([`evals/golden-questions.json`](evals/golden-questions.json)) y métricas por eje.
8. **[docs/08-SEGURIDAD-RESPONSABLE.md](docs/08-SEGURIDAD-RESPONSABLE.md)** — Modelo de amenazas, anonimato de víctimas, qué NO hacemos, decisiones éticas.
9. **[docs/09-ROADMAP.md](docs/09-ROADMAP.md)** — Plan a 90 días + visión 12 meses: validación con ONG, sitio público, WhatsApp bot, réplica regional.
10. **[docs/10-COMPARATIVA.md](docs/10-COMPARATIVA.md)** — Matriz vs ChatGPT / RAG / sitios oficiales / knowledge graphs / apps legales / Karpathy gist.
11. **[docs/11-LO-BUENO.md](docs/11-LO-BUENO.md)** — ✨ Highlights consolidados, stats, los 10 diferenciadores, demo end-to-end, quotes para pitch.

**Otros documentos relevantes:**
- [`BITAYA_Incluye_PROJECT_SPEC.md`](BITAYA_Incluye_PROJECT_SPEC.md) — spec del producto.
- [`BITAYA_DATA_TRUST_QA.md`](BITAYA_DATA_TRUST_QA.md) — política de data trust y Q&A.
- [`CLAUDE.md`](CLAUDE.md) — schema completo del agente LLM (es el "código fuente" de su comportamiento).

---

## Audiencia

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

---

## La idea (en 4 líneas)

No es un buscador, no es RAG. El LLM:
1. **Lee fuentes oficiales** (leyes, sentencias, manuales del PANI, INAMU, MTSS, etc.) que vos pones en `raw/`.
2. **Las compila** en un wiki interlinkeado de markdown en `wiki/`.
3. **Lo mantiene actualizado** cuando agregás más material — cruces, contradicciones, vacíos.
4. Responde preguntas como _"me despidieron sin pagarme, ¿qué hago?"_ con pasos concretos y citas a las leyes.

El wiki es un **artefacto que crece con el tiempo**, no una respuesta efímera de chat.

---

## Estructura del repositorio

```
.
├── CLAUDE.md                ← schema completo del agente LLM
├── AGENTS.md                ← symlink a CLAUDE.md (Codex y otros)
├── BITAYA_Incluye_PROJECT_SPEC.md  ← spec del producto
├── BITAYA_DATA_TRUST_QA.md  ← política de data trust
├── README.md                ← este archivo
│
│ ── 🧠 LLM Wiki ───────────────────────────────────────────
├── raw/                     ← fuentes oficiales inmutables (LLM solo lee)
├── wiki/                    ← markdown que el LLM mantiene
│   ├── index.md             ← catálogo raíz
│   ├── _hot.md              ← foco activo (~500 palabras)
│   ├── log.md               ← append-only de ingests/queries/lints
│   ├── situaciones/         ← 🆘 puerta de entrada
│   ├── derechos/            ← ⚖️
│   ├── leyes/               ← 📜
│   ├── instituciones/       ← 🏛️
│   ├── procedimientos/      ← 🧭
│   ├── glosario/            ← 📖
│   ├── sources/             ← 📂
│   └── synthesis/           ← 🧪
├── _templates/              ← 8 plantillas tipadas
├── .claude/commands/        ← /ingest, /query, /lint
├── evals/                   ← golden questions JSON
│
│ ── 🤖 Scraper ────────────────────────────────────────────
├── scraper/                 ← Python scraper de SINALEVI
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   └── sources/
│
│ ── 🎨 Frontend ───────────────────────────────────────────
├── src/                     ← React + Vite + Tailwind
├── bitaya-incluye.html      ← UI single-file alternativa
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── postcss.config.js
└── .env.example
│
│ ── 📚 Docs y CI ─────────────────────────────────────────
├── docs/                    ← 12 documentos del proyecto
└── .github/workflows/       ← CI que valida estructura
```

---

## Mecanismos del schema (qué hace al wiki escalar)

Cuatro reglas operativas que vuelven al wiki escalable y confiable. Todas en [`CLAUDE.md`](CLAUDE.md), aplicadas por los slash commands.

### 1. Navegación de tres saltos

```
wiki/index.md  →  wiki/<seccion>/_index.md  →  wiki/<seccion>/<pagina>.md
```

El LLM siempre llega al artículo en 3-4 lecturas, sin importar cuánto crezca el wiki.

### 2. `_hot.md` — foco activo

Archivo de ~500 palabras que resume **qué cubre el wiki densamente hoy** y **qué huecos quedan abiertos**. Se lee al inicio de cada sesión y se reescribe en cada `/ingest` y `/lint`.

### 3. Vigencia (`ultima_verificacion`)

| Tipo de página | Vence a los |
|---|---|
| Instituciones / procedimientos | 6 meses |
| Leyes / derechos | 18 meses |
| Glosario | 24 meses |

Cuando `/query` cita una página vencida, avisa explícitamente.

### 4. Contradicciones con callout (no se sobrescribe nunca)

Cuando una fuente nueva contradice un claim ya publicado, el LLM inserta `> [!contradiccion]` debajo del claim viejo. `/lint` los surfacea después de 7 días.

---

## Setup

### 1. LLM Wiki — Obsidian + Claude Code

```bash
# 1. Bajar Obsidian (https://obsidian.md), Open folder as vault → este directorio.
# 2. En la terminal, dentro del repo:
claude
> /ingest raw/2026-05-21-ley-7586-violencia-domestica.md
> /query mi pareja me pegó anoche y tengo miedo
> /lint
```

Ver guía completa: [docs/03-GUIA-DE-USO.md](docs/03-GUIA-DE-USO.md) y [docs/05-GUIA-CURADOR.md](docs/05-GUIA-CURADOR.md).

### 2. Frontend + backend (chat web)

**Requisito:** tener el CLI de [Claude Code](https://docs.claude.com/en/docs/claude-code) instalado y autenticado (corré `claude` una vez para login). **No necesitás API key.**

**Inicio rápido para correr la app:**

```bash
npm install
cp .env.example .env   # ajustá el modelo si querés, todos los valores son opcionales
npm run dev
```

Después abrí `http://127.0.0.1:5173/`.

`npm run dev` levanta dos cosas:
- El backend de Bitaya en el puerto `8787`.
- El frontend en el puerto `5173`.

Si ya habías corrido el repo antes y tu `.env` todavía dice `PORT=8000`, cambialo a:

```env
PORT=8787
VITE_API_BASE_URL=
```

Si la consola muestra `GET /api/health 404` y la respuesta dice `server: uvicorn`, el frontend está llegando a otro backend Python, no al backend Express de Bitaya. Cambiá el `.env` como arriba, cerrá el proceso viejo y volvé a correr `npm run dev`.

Arquitectura (patrón inspirado en QA-BRAIN):

```
Browser → POST /api/chat → Express (server/index.ts)
                                  ↓
                          spawn('claude', ['-p', ...])  ← tu Claude Code local
                                  ↓ stdin
                          system prompt + wiki/ completo + pregunta
                                  ↓ stdout JSON
                          { result: "<JSON con answer + sources>" }
```

El backend:
- Carga todas las páginas de `wiki/` en memoria al arrancar (~46 páginas, 127 KB).
- Por cada pregunta, pipea el wiki completo + las reglas duras (tono, citas, aviso legal) a `claude -p --output-format json --tools "" --system-prompt ...` por stdin.
- Parsea el JSON que devuelve el CLI y verifica que las `sources` apunten a paths reales del wiki.
- Devuelve `{ answer, sources: [{ title, url }] }` al frontend.

Comandos útiles:
- `npm run dev` — backend + frontend (dev)
- `npm run server` — solo backend
- `npm run dev:client` — solo frontend (apunta al backend configurado en `PORT` via Vite proxy)
- `npm run build` — build de producción del frontend

### 3. MCP server (uso desde Claude Code en terminal)

Para consultar el wiki desde Claude Code (o Claude Desktop / Cursor / Windsurf) en terminal, hay un MCP server stdio que expone el wiki como herramientas (`search_wiki`, `get_page`, `list_section`, `reload_wiki`).

**Registrarlo en Claude Code (desde la raíz del repo):**

```bash
claude mcp add bitaya-wiki -- npx tsx server/mcp.ts
```

Esto agrega el server a tu config de Claude Code apuntando al repo actual. Después en cualquier sesión de `claude` podés preguntar cosas como:

```
> ¿qué dice el wiki sobre violencia vicaria?
> dame los pasos para pedir medidas de protección
> ¿qué teléfono tiene el PANI?
```

Claude llamará automáticamente a `search_wiki` y `get_page` cuando necesite mirar el wiki.

**Config manual** (`~/.claude.json` o el `.mcp.json` del proyecto):

```json
{
  "mcpServers": {
    "bitaya-wiki": {
      "command": "npx",
      "args": ["tsx", "/ruta/absoluta/al/repo/server/mcp.ts"],
      "env": { "WIKI_ROOT": "/ruta/absoluta/al/repo" }
    }
  }
}
```

`WIKI_ROOT` es opcional — por defecto el server resuelve el repo desde su ubicación.

### 4. Scraper de fuentes oficiales

```bash
cd scraper
pip install -r requirements.txt
python main.py
```

Detalles en [`scraper/README.md`](scraper/README.md).

---

## CI

GitHub Actions valida en cada push (`.github/workflows/lint-wiki.yml`):
- `CLAUDE.md` y `AGENTS.md` existen y el symlink es correcto.
- 8 `_index.md` de sección presentes.
- 8 plantillas presentes.
- Frontmatter YAML parseable en todas las páginas.
- Aviso legal obligatorio en plantillas públicas.
- Sin wikilinks a taxonomía deprecada.
- Slash commands referencian templates reales.
- Todos los links del README resuelven.
- `evals/golden-questions.json` válido.

---

## Cómo contribuir

- **Curar contenido legal** → leer [docs/05-GUIA-CURADOR.md](docs/05-GUIA-CURADOR.md).
- **Mejorar la UI** → editar `src/` y mandar PR.
- **Agregar fuentes** → ejecutar el scraper o subir manual con nombre `YYYY-MM-DD-slug.ext`.
- **Validar legalmente** → comentar en páginas marcadas `status: draft` y proponer pasar a `revisado` con tu firma como `revisor:`.

---

## Tagline

**"Las leyes ya existen. Faltaba que estuvieran a la mano."**
