# 04 — Demo

> Script paso a paso para la demo en vivo del hackatón. Pensado para 5 minutos.

---

## Antes de empezar (checklist)

- [ ] Terminal abierta en `/Users/joseph/Documents/Pernix/Bitaya_LLM_Wiki`
- [ ] Obsidian abierto con el vault en este directorio, **graph view activado**
- [ ] Una fuente real ya descargada en `raw/` (ej: PDF de la Ley de Penalización de Violencia contra las Mujeres)
- [ ] `claude` corriendo en la terminal
- [ ] Ventanas acomodadas: terminal a la izquierda, Obsidian a la derecha (split screen)
- [ ] Zoom de Obsidian + terminal subido para que el jurado lea
- [ ] WiFi probado

---

## Estructura (5 minutos)

```
[0:00 - 0:30]  Hook + problema
[0:30 - 1:30]  La idea en una imagen
[1:30 - 3:30]  Demo en vivo
[3:30 - 4:30]  Por qué es distinto (vs ChatGPT / vs RAG)
[4:30 - 5:00]  Cierre + impacto
```

---

## [0:00 - 0:30] Hook

> "Pregunta rápida: si esta noche alguien que conocés sufre violencia doméstica en Costa Rica… ¿sabe a qué número llamar? ¿Sabe qué llevar para denunciar? ¿Sabe que tiene derecho a una medida de protección sin abogado?
>
> Las leyes existen. El problema es que **están escritas para abogados, no para quien las necesita**."

---

## [0:30 - 1:30] La idea

Mostrá esta imagen en pantalla (o explicala con las manos):

```
RAW  →  el LLM compila  →  WIKI  →  persona pregunta  →  respuesta
```

> "Bitaya LLM Wiki implementa un patrón propuesto por Andrej Karpathy, co-fundador de OpenAI, en abril de este año. La idea es radicalmente simple:
>
> 1. Yo curo **fuentes oficiales** — leyes del SCIJ, manuales del PANI, del INAMU.
> 2. Un LLM las **compila en un wiki** de markdown — situaciones, derechos, leyes, instituciones.
> 3. La gente pregunta por su **problema concreto** y recibe pasos accionables HOY, con citas a la ley.
>
> No es un chatbot. No es RAG. Es un **artefacto que crece** — cada ley nueva enriquece todas las páginas relacionadas."

---

## [1:30 - 3:30] Demo en vivo

### Paso 1 — Mostrar la estructura (15s)
```bash
tree -L 2 -I '.git|node_modules'
```

> "Mirá: tres carpetas. `raw/` para fuentes inmutables, `wiki/` para lo que el agente mantiene, `_templates/` para forzar formato. **El comportamiento del agente vive en `CLAUDE.md` — es markdown.**"

### Paso 2 — Ingestar una ley real (45s)
En Claude Code:
```
> /ingest raw/2026-05-21-ley-penalizacion-violencia-mujeres.pdf
```

> "Le pido al agente que ingiera la Ley de Penalización de Violencia contra las Mujeres. Mirá lo que hace…"

[Mostrar mientras el agente:]
- Resume los puntos clave en castellano simple.
- **Pide confirmación.**
- Crea `wiki/leyes/ley-penalizacion-violencia-contra-las-mujeres.md`.
- Actualiza `wiki/instituciones/inamu.md`, `wiki/instituciones/pani.md`.
- Crea `wiki/situaciones/me-pega-mi-pareja.md`, `mi-pareja-me-amenaza.md`, `mi-pareja-me-controla-el-dinero.md`.
- Agrega términos al `wiki/glosario/`.
- Actualiza el índice y appendea al log.

> "Una sola ley acaba de generar 12 páginas interlinkeadas, no inventadas, todas citando el artículo exacto."

### Paso 3 — Mostrar el graph view en Obsidian (20s)
Cambiá a Obsidian, abrí el **graph view**.

> "Esto es lo que la persona ve. La ley conecta con instituciones, instituciones con procedimientos, procedimientos con situaciones reales. **La cross-referenciación ya está hecha, no se recalcula en cada query.**"

### Paso 4 — Query desde la perspectiva de la persona (60s)
Volvé a Claude Code:
```
> /query mi pareja me pegó anoche y tengo miedo de que vuelva
```

> "Esta es la voz real de alguien en crisis. Miren la respuesta…"

[La respuesta arranca con:]
```
🚨 911 (emergencia) — 800-INAMU-00 (apoyo 24h gratuito)

¿Esto está mal?
Sí. Lo que describís es violencia doméstica. Te protege la Ley 8589
(Penalización de Violencia contra las Mujeres), art. 22 (maltrato),
y la Ley contra la Violencia Doméstica (Ley 7586).

Qué hacer HOY:
1. Si estás en peligro inmediato, llamá al 911.
2. Llamá al INAMU al 800-INAMU-00 (gratuito, 24/7). Te asignan
   acompañamiento.
3. Pedí una medida de protección en el Juzgado de Violencia
   Doméstica más cercano. No necesitás abogado.
...

> Esto no es asesoría legal. Es información para que sepás qué
> leyes te protegen y a quién acudir. Para tu caso específico,
> buscá ayuda gratuita en la Defensa Pública (800-800-3000)...
```

> "Mirá tres cosas: **emergencia primero**, **pasos accionables hoy**, **citas a la ley exacta**. Y el aviso legal obligatorio al cierre."

---

## [3:30 - 4:30] Por qué es distinto

Sacá la tabla en pantalla:

| Chatbot genérico | RAG con embeddings | **Bitaya LLM Wiki** |
|---|---|---|
| Inventa leyes | Reconstruye en cada query | **Compila una vez, mantiene** |
| Sin fuentes | Cita chunks opacos | **Cita el artículo exacto** |
| Jerga legal | Cualquier idioma del corpus | **Castellano CR, lenguaje claro** |
| "Buscá un abogado" | "Acá tenés el texto" | **"Llamá al X hoy y llevá Y"** |
| Vector DB + pipeline | Vector DB + chunking + reranking | **Markdown + git** |
| Cero auditabilidad | Difícil de auditar | **100% auditable, version-controlled** |

> "La diferencia clave: nuestro patrón **acumula conocimiento**. Cada ley que ingiero hace al wiki más útil para todas las preguntas que vengan después — no solo las que mencionan esa ley."

---

## [4:30 - 5:00] Cierre

> "Si una sola persona evita una segunda noche de violencia porque encontró el teléfono del INAMU y los pasos de denuncia en su idioma, **el proyecto ya valió la pena**.
>
> El mismo markdown que ven acá puede alimentar:
> - Un sitio público.
> - Un bot de WhatsApp.
> - Material impreso para zonas sin internet.
> - Una réplica para Honduras, Panamá, Guatemala.
>
> **Las leyes ya existen. Faltaba que estuvieran a la mano. Gracias.**"

---

## Si el jurado pregunta…

**"¿Qué pasa si el LLM se equivoca?"**
> Por eso impusimos la regla dura: toda afirmación legal **debe** citar la fuente. Si el agente no cita, no publica. Y el `/lint` detecta claims sin citar. Además, hay un campo `status: revisado` y `revisor:` que requiere validación humana antes de marcar una página como confiable.

**"¿Por qué no RAG?"**
> RAG reconstruye conocimiento en cada query, no acumula. No puede detectar contradicciones entre fuentes. Es opaco. Para información legal con alto costo del error, queremos algo **auditable, persistente y que mejora con el tiempo**. Karpathy mostró este patrón en abril; nosotros lo aplicamos al primer dominio donde realmente importa.

**"¿Quién valida la información legal?"**
> El campo `status` distingue `stub` / `draft` / `revisado`. Solo páginas validadas por alguien con formación legal pasan a `revisado`. El wiki es transparente — cualquiera ve qué nivel de validación tiene cada página.

**"¿Es escalable?"**
> El patrón es markdown + git + un agente. Cero infra. Para escalar el contenido: agregás fuentes a `raw/` y corrés `/ingest`. Para escalar a otros países: clonás el repo, cambiás las fuentes oficiales. El schema en `CLAUDE.md` es el mismo.

**"¿Y la privacidad de quien consulta?"**
> Corre **local**. Las consultas no salen de la máquina del usuario (o del servidor de la ONG que lo aloja). No hay tracking. No hay logs de consultas atadas a personas — el `log.md` solo registra qué fuentes se ingestaron y cuándo, no quién preguntó qué.

**"¿Cómo se actualiza cuando cambia una ley?"**
> Ingestás la reforma. El agente detecta contradicción con la versión vieja, marca con strike-through, agrega el nuevo claim citando la nueva fuente. El `log.md` deja constancia. Git guarda el diff.

---

## Plan B (si falla el internet o el LLM)

- Tené **un ingest pre-grabado** (terminal recording con `asciinema` o screenshots) por si Claude Code no responde.
- Tené **una query pre-corrida** y guardada en `wiki/synthesis/demo-query.md` para mostrar el resultado aunque no haya conexión.
- El graph view de Obsidian funciona 100% offline. Es tu fallback más fuerte.
