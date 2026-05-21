# 03 — Guía de uso

> Reglas, comandos y workflow operativo del wiki.

---

## Roles

| Rol | Qué hace | Qué NO hace |
|---|---|---|
| **Humano curador** | Pone fuentes oficiales en `raw/`. Pide ingest, queries y lints. Revisa lo que el LLM produce. | Editar páginas del `wiki/` a mano (lo hace el agente). |
| **Agente (LLM)** | Lee `raw/`, escribe y mantiene `wiki/`. Sigue las reglas de `CLAUDE.md`. | Modificar `raw/`. Inventar leyes, teléfonos o sentencias. |
| **Revisor legal** | Valida páginas marcadas `status: draft` y las mueve a `status: revisado`. Firma con su nombre en `revisor:`. | Reescribir leyes desde cero — usar las plantillas. |
| **Persona usuaria** | Consulta el wiki (o un sitio/bot derivado de él). | Nada — el wiki está al servicio suyo. |

---

## Setup local (3 minutos)

### 1. Obsidian
1. Descargá [Obsidian](https://obsidian.md) (free).
2. **Open folder as vault** → seleccioná este directorio.
3. Settings → **Files and links**:
   - Attachment folder path: `raw/assets`
   - New link format: `Shortest path when possible`
   - Use `[[Wikilinks]]`: **ON**
4. Settings → **Community plugins** → habilitar y instalar:
   - **Dataview** — queries sobre frontmatter (listar todas las situaciones para mujeres, ordenadas por urgencia)
   - **Obsidian Web Clipper** (extensión de browser) — clippear leyes desde SCIJ a `raw/`

### 2. Claude Code
```bash
cd /Users/joseph/Documents/Pernix/Bitaya_LLM_Wiki
claude
```

Lee automáticamente `CLAUDE.md` (el schema) y expone los slash commands.

---

## Los 3 comandos

### `/ingest <ruta-o-URL>` — procesar una fuente oficial

Le das al agente:
- Una ruta a un archivo en `raw/`: `/ingest raw/2026-05-21-codigo-trabajo.pdf`
- O una URL oficial: `/ingest https://www.pgrweb.go.cr/scij/.../ley-X.html`

El agente:
1. Lee la fuente entera.
2. **Te resume y pide confirmación antes de escribir.**
3. Crea `wiki/sources/YYYY-MM-DD-<slug>.md` con extracción literal y citas.
4. Crea/actualiza páginas en `wiki/leyes/`, `wiki/derechos/`, `wiki/instituciones/`, `wiki/procedimientos/`.
5. **Identifica situaciones reales que esta ley cubre** y crea páginas en `wiki/situaciones/`.
6. Agrega términos técnicos al `wiki/glosario/`.
7. Actualiza `wiki/index.md`.
8. Appendea entrada a `wiki/log.md`.
9. Te reporta: páginas tocadas, contradicciones, preguntas abiertas.

**Una fuente bien ingerida toca 10-20 páginas.** Si solo tocó 1-2, sub-cross-referenció.

### `/query <pregunta>` — responder en lenguaje claro

```
> /query me despidieron sin avisar y no me pagaron, ¿qué hago?
> /query mi pareja me amenaza con un cuchillo
> /query mi hijo tiene discapacidad y el cole no lo acepta
```

El agente:
1. Lee `wiki/index.md` primero. Busca en `situaciones/`.
2. Sigue `[[wikilinks]]` hacia `derechos/`, `leyes/`, `instituciones/`.
3. Responde con la estructura fija:
   - **¿Esto está mal?**
   - **Qué te protege** (con cita a `[[leyes/...]]`)
   - **Qué hacer HOY** (pasos numerados)
   - **A quién llamar / dónde ir** (teléfono, horario, gratis o no)
   - **Qué llevar**
   - **Si no te hacen caso**
4. Cierra con el aviso legal obligatorio.
5. Appendea a `log.md`.

**Si detecta emergencia activa**, la primera línea es el teléfono (**911 / 800-INAMU-00 / 1147**).

### `/lint` — health-check del wiki

Sin argumentos:

```
> /lint
```

Te devuelve una punch list agrupada en:
- **Calidad legal** — citas faltantes, aviso legal ausente, claims sospechosos.
- **Estructura** — wikilinks rotos, drift del index, huérfanos.
- **Cobertura** — poblaciones con poca cobertura, contradicciones.
- **Accesibilidad** — jerga sin explicar, instituciones sin teléfono.

Vos priorizás. El agente arregla lo que aprobaste.

---

## Las reglas duras (no negociables)

### Sobre el contenido legal
1. **Toda afirmación legal lleva cita** a `[[leyes/...]]` o `[[sources/...]]`. Sin cita, no se publica.
2. **Nunca inventar** una ley, artículo, teléfono o sentencia. Si no está en `raw/`, se pide la fuente.
3. **Nunca dar asesoría legal específica** de un caso — el wiki es educativo. Cada respuesta refiere a Defensa Pública / consultorios gratuitos / Defensoría.
4. **Toda página pública termina con el aviso legal obligatorio** (definido en `CLAUDE.md`).

### Sobre el contenido para personas
5. **Castellano de Costa Rica, simple.** Jerga legal → linkear a `[[glosario/...]]`.
6. **Pasos accionables hoy mismo**, no teoría.
7. **Teléfono + horario + opción sin internet** en toda institución.
8. **Si hay emergencia, el teléfono va primero**, antes de explicar.

### Sobre el sistema
9. **Nunca modificar `raw/`** — es source of truth.
10. **Nunca borrar páginas** — marcar `status: obsoleta` primero.
11. **Nunca sobrescribir un claim contradicho** — strike-through, agregar el nuevo, linkear la fuente.
12. **`index.md` y `log.md` se actualizan en cada ingest/query relevante.**
13. **Cada institución tiene `ultima_verificacion`.** El `/lint` marca lo que tiene > 6 meses.

---

## Workflow recomendado para una sesión de curación

```
1. Identificá una población con poca cobertura (ej: adultos mayores).
2. Buscá una ley/manual oficial sobre el tema en SCIJ o sitio del CONAPAM.
3. Bajalo a `raw/` con nombre `YYYY-MM-DD-slug.pdf`.
4. > /ingest raw/2026-05-21-conapam-protocolo.pdf
5. Revisá las situaciones que el agente propone crear. Validá los teléfonos.
6. > /query como puede un adulto mayor denunciar abandono familiar?
7. Si la respuesta vale guardarse: aceptá el ofrecimiento de filearla en synthesis/.
8. Cada 20-30 ingests: > /lint
9. Marcá como `status: revisado` las páginas que un humano legalmente entrenado validó.
10. git commit -m "ingest: protocolo CONAPAM adultos mayores"
```

---

## Cómo extender / customizar

### Agregar un nuevo tipo de página
1. Creá `_templates/<tipo>.md`.
2. Agregalo al schema en `CLAUDE.md` (sección "Convenciones de página").
3. Si necesita workflow propio, agregá un slash command en `.claude/commands/`.

### Agregar una población nueva
1. Editá la lista de `poblacion:` en `CLAUDE.md` y en todas las plantillas.
2. Agregalo al `/lint` como criterio de cobertura.

### Cambiar el comportamiento del agente
**Editá `CLAUDE.md`. Eso es todo.** No hay redeploys.

---

## Mantenimiento periódico

| Cuándo | Acción |
|---|---|
| Cada ingest | El agente actualiza index + log automáticamente |
| Cada 20-30 fuentes | `/lint` y resolver punch list |
| Cada 6 meses | Re-verificar teléfonos de instituciones (auditar `ultima_verificacion`) |
| Cuando sale ley nueva | `/ingest` y revisar contradicciones que surjan con leyes viejas |
| Antes de publicar/exportar | `/lint` completo + revisión humana de páginas marcadas `status: revisado` |

---

## Antipatrones (lo que NO hacer)

- ❌ Editar páginas del wiki a mano — lo hace el agente. Si querés cambiar algo, pedíselo o editá el schema (`CLAUDE.md`).
- ❌ Aceptar respuestas del agente sin citas. Si no cita, pedí la fuente o rechazá.
- ❌ Promover páginas `status: stub` a `status: revisado` sin revisión humana legalmente competente.
- ❌ Borrar `log.md` o reescribir entradas viejas — es append-only.
- ❌ Subir documentos personales identificables a `raw/` — son fuentes oficiales, no casos.
- ❌ Usar el wiki como reemplazo de un abogado en un caso específico.
