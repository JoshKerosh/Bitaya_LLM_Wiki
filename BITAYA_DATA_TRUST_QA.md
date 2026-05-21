# BITAYA Incluye — Data Trust Q&A

Respuestas a preguntas sobre origen, actualidad y confiabilidad del knowledge base.

---

## ¿Cómo se aseguran de que las leyes sean solo del gobierno de Costa Rica?

**Respuesta corta:** Solo scrapeamos dominios `.go.cr`, que es el dominio oficial exclusivo del Gobierno de Costa Rica.

**Detalle técnico:**

| Fuente | Dominio | Entidad |
|---|---|---|
| SINALEVI | `pgrweb.go.cr` | Procuraduría General de la República |
| IMAS | `imas.go.cr` | Instituto Mixto de Ayuda Social |
| INAMU | `inamu.go.cr` | Instituto Nacional de las Mujeres |
| PANI | `pani.go.cr` | Patronato Nacional de la Infancia |
| CONAPDIS | `conapdis.go.cr` | Consejo Nacional de Personas con Discapacidad |
| CONAPAM | `conapam.go.cr` | Consejo Nacional de la Persona Adulta Mayor |
| Asamblea Legislativa | `asamblea.go.cr` | Poder Legislativo |

Ninguna fuente es Wikipedia, blog, portal de noticias ni sitio tercero. Todo proviene de instituciones públicas con dominio `.go.cr`.

---

## ¿Cómo saben que las leyes están actualizadas?

**Tres capas:**

1. **SINALEVI es la fuente oficial de leyes vigentes.** Es la base de datos jurídica de la Procuraduría General — el organismo que dictamina qué leyes están vigentes en Costa Rica. Cuando una ley se reforma o deroga, SINALEVI lo refleja. No usamos PDFs de terceros ni copias desactualizadas.

2. **Cada documento scrapeado lleva `scraped_at`** — fecha exacta de cuándo se extrajo. El metadata es parte del archivo:
   ```
   source: https://www.pgrweb.go.cr/...
   scraped_at: 2026-05-21
   ```

3. **El schema impone `last_compiled` en cada wiki page** — cuando el LLM compila las páginas, estampa la fecha. Así se sabe qué tan reciente es cada pieza del knowledge base.

**Para producción:** el scraper puede correr en cron mensual o cuando SINALEVI publica cambios. Para el hackathon, scrapeamos el día del evento.

---

## ¿Qué pasa si una ley cambia después de que la scrapearon?

La app muestra en cada respuesta la fuente y fecha de referencia. El disclaimer de IA responsable dice explícitamente que se requiere revisión humana e institucional. La IA no promete que la información es la última versión — orienta y dirige a la institución correcta para confirmar.

---

## ¿Por qué no usan una base de datos pública existente?

No existe una base de datos pública en Costa Rica que consolide leyes + servicios + requisitos institucionales + trámites en formato machine-readable. SINALEVI tiene las leyes pero no los servicios. Cada institución tiene su propio sitio. Nosotros construimos ese puente.

---

## ¿La IA puede inventar leyes o trámites?

**No**, por tres razones:

1. **Knowledge base local en TypeScript** — el LLM recibe como contexto solo lo que está en `knowledgeBase.ts`, que fue curado manualmente desde los documentos scrapeados. No navega internet en tiempo real.

2. **Prompt explícito:** `"No inventes trámites específicos si no están en la base de conocimiento."`

3. **Campo `confidence` en la respuesta** — si el LLM no está seguro, baja el score y el sistema puede marcar el caso para revisión.

---

## ¿Cómo se diferencia raw/ de wiki/?

| Capa | Qué es | Quién escribe |
|---|---|---|
| `raw/` | Documentos fuente tal como vinieron del sitio oficial | Scraper automático |
| `wiki/` | Páginas compiladas, estructuradas, en lenguaje simple | LLM (Claude/GPT) siguiendo SCHEMA.md |

`raw/` es inmutable — nunca se modifica manualmente. Es el registro de qué dijo la fuente oficial en qué fecha. `wiki/` es la versión procesada para el LLM y para el usuario.

---

## ¿Pueden una municipalidad o institución usar esto?

Sí. El sistema está diseñado para que instituciones puedan:

- Conectar su propio catálogo al knowledge base.
- Personalizar las entradas por región o servicio.
- Ver el dashboard institucional para monitorear casos orientados.
- Mantener revisión humana como paso obligatorio.

La arquitectura es: fuentes `.go.cr` → scraper → `raw/` → compilador LLM → `wiki/` → `knowledgeBase.ts` → API → app ciudadana.

---

## ¿Qué leyes cubren en el knowledge base?

| Ley | Tema |
|---|---|
| 7600 | Igualdad de oportunidades — discapacidad |
| 7586 | Violencia doméstica |
| 7739 | Código de la niñez y la adolescencia |
| 5662 | Desarrollo social y asignaciones familiares (IMAS) |
| 7972 | Persona adulta mayor integral (CONAPAM) |
| 7801 | Instituto Nacional de las Mujeres (INAMU) |
| 8661 | Convención derechos personas con discapacidad |
| 9379 | Ley General de la Persona Adulta Mayor |
| 8929 | Creación del CONAPDIS |
| 7143 | Ley Orgánica del PANI |

Todas extraídas directamente de SINALEVI (`pgrweb.go.cr`).

---

## ¿La IA tiene acceso a internet cuando responde?

No. El LLM trabaja exclusivamente con el contexto que le pasa el endpoint: el knowledge base local (`knowledgeBase.ts`) + el mensaje de la persona. No navega, no busca, no consulta fuentes externas en tiempo real. Eso reduce alucinaciones y mantiene las respuestas dentro del ámbito oficial.

---

## ¿Cómo garantizan que no haya datos de fuentes no oficiales mezclados?

El scraper tiene allowlist explícita de dominios — solo procesa URLs que empiecen con dominios `.go.cr` aprobados. Cualquier link externo en las páginas scrapeadas es ignorado. El `raw/` resultante solo contiene documentos de esa whitelist.

---

## Frase para el pitch

> "Cada dato en nuestro knowledge base viene de un dominio `.go.cr`. Nada de Wikipedia, nada de blogs, nada de portales de noticias. La Procuraduría General como árbitro de leyes vigentes. Las instituciones como fuente de sus propios servicios. Y el LLM como traductor entre esa información oficial y la persona vulnerable que no sabe cómo usarla."
