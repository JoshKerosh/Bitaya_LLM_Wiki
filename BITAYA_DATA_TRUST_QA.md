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

---

## ¿Qué pasa si mi situación no está cubierta en el knowledge base?

**El sistema tiene dos niveles de cobertura:**

1. **Knowledge base local (8 categorías):** cubre las situaciones más frecuentes — pobreza, embarazo, niñez en riesgo, violencia doméstica, discapacidad, adulto mayor, empleo, emergencias. Si la situación encaja, la respuesta es precisa y fundamentada.

2. **LLM como red de seguridad:** si la situación no encaja en ninguna categoría, el LLM igual responde, pero con `confidence` bajo y con instrucción explícita de sugerir instituciones generales (IMAS, municipalidad, centro de salud) y pedir revisión humana. Nunca deja a la persona sin orientación.

**Lo que no hacemos:** inventar trámites específicos para situaciones no cubiertas. Si no está en el knowledge base, decimos "te orientamos hacia dónde empezar" — no "este es el trámite exacto".

**Gaps conocidos para v2:** vivienda, adicciones, situación migratoria, deudas, orientación educativa. Los scrapeamos desde SINALEVI + MTSS cuando el MVP escale.

---

## ¿Cómo se actualizan los datos? ¿Cada cuánto?

**Pipeline de actualización:**

```
SINALEVI / Instituciones (.go.cr)
        ↓ scraper (Python)
    raw/ (archivos .md con scraped_at)
        ↓ compilador LLM
    wiki/ (páginas estructuradas con last_compiled)
        ↓ curación manual
    knowledgeBase.ts (exportado al endpoint)
```

**Cadencia:**
- **Para el hackathon:** scrapeado el día del evento — datos de hoy.
- **Para producción:** scraper en cron mensual + re-run manual cuando se publican reformas relevantes en La Gaceta.
- **Trigger de urgencia:** si SINALEVI publica una reforma a alguna de las 10 leyes cubiertas, se re-scrapea esa ley y se recompila la wiki page afectada.

**Trazabilidad:** cada wiki page tiene `last_compiled` y `sources` en el frontmatter — el equipo institucional puede ver exactamente qué tan reciente es cada dato sin abrir código.

---

## ¿Guardan los mensajes o datos de los usuarios?

**No.** Para el MVP:
- No hay base de datos.
- El mensaje viaja de browser → `/api/analyze` → LLM → respuesta → browser.
- Nada se persiste en servidor.
- El dashboard institucional usa datos estáticos demo, no casos reales.

**Para producción:** si se quiere dashboard real con casos, se necesita consentimiento explícito del usuario, anonimización y política de retención. Eso está fuera del scope del MVP pero es diseñable.

---

## ¿Tienen responsabilidad legal si la IA da orientación incorrecta?

**Diseño defensivo en tres capas:**

1. **Disclaimer explícito en cada respuesta:** `"Esta orientación es informativa. La IA no determina elegibilidad ni reemplaza la revisión humana o institucional."` — visible, no escondido en términos.

2. **`humanReviewRequired: true` siempre** — el sistema nunca produce una respuesta que no requiera validación humana.

3. **La app orienta, no decide.** No dice "usted califica para X". Dice "podría considerar contactar X para verificar si califica". Esa distinción es legal y técnicamente importante.

La app es comparable a una guía telefónica inteligente, no a un dictamen jurídico.

---

## ¿Qué pasa si la persona escribe con faltas de ortografía, jerga o muy poco texto?

El LLM maneja lenguaje natural con variaciones ortográficas, jerga costarricense y textos cortos. El prompt instruye interpretar lenguaje humano, no lenguaje formal.

**Si el texto es demasiado ambiguo:** el campo `missingData` lista qué información falta para orientar mejor. La app puede mostrar esos datos faltantes como preguntas de seguimiento.

**Ejemplo real:** "me dejó mi marido y no tengo plata" → el LLM detecta posible vulnerabilidad económica y posible violencia, sugiere IMAS + INAMU, y pide datos adicionales: cantón, hijos, si hubo violencia.

---

## ¿Funciona fuera de San José? ¿Cubre todo Costa Rica?

**Sí, legalmente.** Las leyes en el knowledge base son nacionales — aplican en todo el territorio.

**Limitación actual:** las instituciones tienen oficinas regionales y los requisitos pueden variar por cantón. En v1 orientamos a la institución correcta; en v2 se puede añadir geolocalización o selección de cantón para dar dirección específica de la oficina más cercana.

El campo `missingData` ya pide `"Cantón"` en casi todos los casos — eso prepara la orientación regional sin necesitar GPS.

---

## ¿Por qué no simplemente buscar en Google?

Google devuelve 10 links. Una persona en situación vulnerable que no sabe qué institución buscar, qué ley aplica o cómo redactar su situación no puede usar esos links.

BITAYA Incluye hace tres cosas que Google no hace:
1. **Interpreta** la situación descrita en lenguaje humano.
2. **Clasifica** el tipo de vulnerabilidad y la urgencia.
3. **Produce** una acción concreta: institución, datos a preparar, mensaje listo para copiar.

No es un buscador. Es un orientador de primer paso.

---

## ¿Cómo saben que el sistema funciona bien?

Para el hackathon, validamos con 4 casos reales curados:
- Embarazo vulnerable → detecta CCSS + IMAS, urgencia media-alta ✓
- Adulto mayor solo → detecta CONAPAM, urgencia alta ✓
- Violencia doméstica → detecta INAMU + 9-1-1, prioridad seguridad ✓
- Discapacidad → detecta CONAPDIS, urgencia media ✓

Para producción, métricas de calidad: `confidence` promedio por categoría, tasa de `humanReviewRequired`, derivaciones correctas validadas por trabajadores sociales.

---

## ¿Cuánto cuesta mantener esto?

**Costo variable principal:** llamadas al LLM (GPT-4.1-mini).
- Costo estimado: ~$0.002–$0.005 por consulta.
- Para una municipalidad con 1,000 consultas/mes: ~$5/mes en tokens.

**Costo fijo:** hosting de Next.js (Vercel free tier para MVP, ~$20/mes para producción), scraper en cron (GitHub Actions free tier).

**El knowledge base es local** — no hay costo de vector DB ni embedding para el MVP.

---

## Frase para el pitch

> "Cada dato en nuestro knowledge base viene de un dominio `.go.cr`. Nada de Wikipedia, nada de blogs, nada de portales de noticias. La Procuraduría General como árbitro de leyes vigentes. Las instituciones como fuente de sus propios servicios. Y el LLM como traductor entre esa información oficial y la persona vulnerable que no sabe cómo usarla."
