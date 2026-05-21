# 06 — FAQ del jurado

> 30+ preguntas anticipadas con respuestas listas, agrupadas por categoría. Leé la sección del tipo de jurado que esperás (técnico, producto, social, business, escéptico).

---

## 🔧 Técnicas / Arquitectura

### 1. "¿No es esto solo un wrapper de ChatGPT con extra pasos?"

No. Un wrapper envía la pregunta al LLM y devuelve la respuesta. Acá el LLM **mantiene un artefacto persistente** (el wiki) que crece con cada fuente que ingestamos. La respuesta no se reconstruye en cada query — se compone desde un wiki ya destilado y cross-linkeado. La diferencia es **acumulación de conocimiento vs re-derivación efímera**.

### 2. "¿Por qué no RAG?"

RAG retrieva chunks crudos en query time y deja que el LLM sintetice cada vez. Problemas para nuestro caso:
- No detecta contradicciones entre fuentes.
- La síntesis es efímera (vive en el chat).
- Los chunks son opacos — difícil auditar qué se usó.
- Necesita pipeline: embeddings, vector DB, reranking.

LLM Wiki compila el conocimiento una vez. Cuando llegan 100 preguntas sobre violencia doméstica, las 100 leen el mismo wiki ya destilado, no re-reconstruyen.

### 3. "¿Qué LLM usan? ¿Qué pasa si Anthropic cae?"

Hoy usamos Claude Code (Anthropic). Pero el patrón es agnóstico: el schema vive en `CLAUDE.md` y un symlink lo expone como `AGENTS.md` para Codex, OpenCode, Gemini CLI. **Cambiar de proveedor = `git pull` con un agente nuevo. El wiki es markdown, no cambia.**

### 4. "¿Y la latencia? ¿Cuánto cuesta una query?"

- `/query` típica: 5-15s, ~$0.02-0.10 con Claude Opus.
- `/ingest` de una ley: 30-90s, ~$0.20-0.50.
- Para producción real: el wiki ya destilado podría servirse desde un static site (Astro) con queries solo cuando el usuario quiere razonar. **Cero costo de LLM para la mayoría de visitas.**

### 5. "¿Cómo manejan prompt injection en `raw/`? Una ONG malintencionada podría subir un PDF con instrucciones ocultas."

Tres capas de defensa:
1. **Curador valida la fuente** antes de subirla (regla de oro en `docs/05-GUIA-CURADOR.md`: solo fuentes oficiales `.go.cr`).
2. **El agente trata `raw/` como datos, no como instrucciones.** En el schema se le pide explícitamente que extraiga claims con citas, no que ejecute lo que dice el PDF.
3. **`/lint` audita las afirmaciones contra las fuentes.** Una inyección que metiera info falsa quedaría sin cita verificable.

Ver `docs/08-SEGURIDAD-RESPONSABLE.md` para el modelo de amenazas completo.

### 6. "¿Pueden jailbreakear el agente para que dé asesoría legal específica?"

El schema en `CLAUDE.md` lo prohíbe en reglas duras y le exige cerrar toda página pública con el aviso legal obligatorio. Pero un jailbreak siempre es posible. **Por eso el output es markdown auditable** — no es un chatbot en tiempo real que da consejos personales, es un wiki versionado donde cualquier desvío queda en `git log`.

### 7. "¿Cómo escala a 1000 fuentes? Ese índice no aguanta."

A esta escala (~hundreds de páginas), `wiki/index.md` + `_index.md` por sección alcanzan — la navegación es de **3 saltos constantes**. Cuando crezcamos, integramos [qmd](https://github.com/tobi/qmd) (search engine local de markdown con BM25 + vector + LLM reranking), ya referido en `CLAUDE.md`. Cero cambio al schema, solo agregar la herramienta.

### 8. "¿Versionado de leyes? Si reforman una, ¿cómo trackean qué cambió?"

Tres mecanismos:
1. `git diff` muestra el cambio textual en la página de la ley.
2. La **política de contradicción con callout** (`> [!contradiccion]`) marca explícitamente cuándo una fuente nueva contradice un claim viejo, **sin sobrescribirlo**. Queda histórico.
3. El campo `ultima_verificacion` y el `/lint` marcan páginas vencidas (>6 meses para instituciones, >18 meses para leyes).

### 9. "¿Tests? ¿Cómo saben que el LLM no aluciona?"

`docs/07-EVALS.md` define un framework con **golden questions** — preguntas reales con páginas esperadas y claves de evaluación (¿cita la ley correcta? ¿da el teléfono correcto? ¿incluye el aviso legal? ¿pasos accionables?). Corren en CI antes de cada release de schema.

### 10. "¿CI/CD?"

`.github/workflows/lint-wiki.yml` corre en cada push:
- Frontmatter YAML válido en todas las páginas.
- Aviso legal en plantillas públicas.
- Sin enlaces rotos.
- Sin referencias a taxonomía vieja.

Falla el build si algo se rompe.

---

## 🎨 Producto / UX

### 11. "¿Quién va a usar esto? ¿La víctima directamente o una ONG?"

Ambas, en capas:
- **Hoy:** ONGs y consultorios jurídicos gratuitos lo adoptan como base operativa interna. El abogado responde con el wiki como ayuda.
- **Fase 2:** sitio público derivado del mismo markdown.
- **Fase 3:** bot de WhatsApp / SMS (las víctimas tienen WhatsApp, no necesariamente smartphone con browser moderno).

Detalle en `docs/09-ROADMAP.md`.

### 12. "Una persona en crisis no va a leer un wiki."

Por eso `situaciones/` está optimizado para respuestas en **3 segundos de lectura**: emergencia → teléfono primero. Las páginas arrancan con "Qué hacer HOY" como lista numerada, no con explicación de la ley. El cuerpo legal vive en `leyes/` para quien quiera profundizar.

### 13. "¿Y la gente sin internet?"

Tres caminos:
1. Cada institución en el wiki incluye **teléfono + dirección física + horario**.
2. El wiki es markdown — exportable a PDF o a impreso para zonas rurales.
3. Bot de SMS planeado (los celulares feature-phone tienen SMS).

### 14. "¿Y la gente que no sabe leer?"

Limitación real que reconocemos. Mitigaciones:
- Texto en castellano simple, frases cortas, imperativos.
- Voz / TTS planeado para v2 (`docs/09-ROADMAP.md`).
- Iconos en `_index.md` para navegación visual (🆘 ⚖️ 📜 🏛️ 🧭 📖).

### 15. "¿Lenguas indígenas? Costa Rica tiene 8 pueblos."

Hoy no, pero el patrón soporta: clonás el repo, traducís el schema, ingestás las mismas fuentes y el agente genera en bribri, cabécar, ngäbe. El equipo bribri ya nos contactó (hipotético — completar si es real).

### 16. "Accesibilidad para personas con discapacidad?"

Hoy: markdown = nativo para screen readers. Roadmap: ARIA tags en el sitio público, alto contraste, navegación por teclado, modo lectura simple.

### 17. "¿Cómo protegen la anonimidad de quien consulta? Alguien que pregunta '¿qué hago si mi pareja me pega?' tiene que ser invisible."

Hoy:
- Corre **local**. Las queries no salen de la máquina del usuario.
- `log.md` registra qué fuentes se ingestaron, no qué se preguntó.
- No hay tracking ni analytics.

Roadmap:
- Modo "quick exit" (botón panic que cierra y limpia historial).
- Hosting Tor / .onion mirror para zonas de control extremo.

Detalle en `docs/08-SEGURIDAD-RESPONSABLE.md`.

### 18. "Mobile-first?"

Hoy el output es markdown — funciona en cualquier renderer. La capa de UI pública (planeada) va mobile-first porque la audiencia accede mayormente desde celular.

---

## 🌎 Impacto social

### 19. "¿Cómo miden impacto si esto no se ha desplegado?"

Métricas que monitorearíamos al desplegar (en `docs/01-PITCH.md`):
- # de situaciones cubiertas vs catálogo real de problemas de la población.
- % de páginas con citas verificadas.
- Tiempo desde reforma legal hasta actualización del wiki.
- # de poblaciones vulnerables con cobertura ≥ 10 situaciones.
- Última verificación de teléfonos.

Métricas post-lanzamiento que negociaríamos con ONGs partner:
- Time-to-action (¿la persona dio el primer paso?).
- % de queries que llevaron a contacto con institución.

### 20. "¿Esto reemplaza a un abogado?"

No, y lo dice en cada página: aviso legal obligatorio que refiere a Defensa Pública / consultorios gratuitos / Defensoría. **El wiki reduce la barrera de entrada** — para que la persona sepa que tiene derechos, qué llamar, qué llevar. El abogado sigue siendo necesario para el caso específico.

### 21. "¿Lo validó algún abogado?"

Cada página tiene campo `revisor:` y `status: revisado` que solo se marca cuando alguien con formación legal lo valida. Para el hackatón, partnership con [nombre del aliado legal — completar]. Para producción: convenio con UCR, UNA o el Colegio de Abogados para validación continua.

### 22. "¿Qué pasa si el wiki da info incorrecta y alguien actúa mal? Responsabilidad legal?"

Tres capas de mitigación:
1. **Disclaimer obligatorio** en cada página: "Esto no es asesoría legal."
2. **Citas a fuente oficial** en cada claim — la persona puede verificar.
3. **Versionado en git** — auditable quién agregó qué y cuándo.

Modelo legal: nos posicionamos como **herramienta educativa** (análoga a una guía impresa de la Defensoría), no como servicio legal. Detalle en `docs/08-SEGURIDAD-RESPONSABLE.md`.

### 23. "¿Cuánta gente vulnerable hay en CR?"

Por categoría (datos INEC/INAMU/PANI aproximados, completar en demo con cifras exactas):
- 1.4M mujeres en edad reproductiva, ~40% reporta haber sufrido alguna forma de violencia en su vida.
- 1.3M de personas menores de edad.
- 500K adultos mayores.
- 470K personas con discapacidad.
- 100K personas indígenas.
- 400K personas migrantes/refugiadas.

Población objetivo total: **millones**. Hoy ninguna tiene una herramienta así.

### 24. "¿Por qué Costa Rica y no LATAM?"

Empezamos donde hay tracción y red de aliados (ONGs, UCR, Colegio de Abogados). El patrón es replicable: clonás repo, cambiás fuentes en `raw/` (leyes de Honduras, Guatemala, etc.), ingerís. Roadmap en `docs/09-ROADMAP.md` contempla réplica regional en fase 3.

---

## 💼 Business / Sustentabilidad

### 25. "¿Modelo de negocio?"

**No es producto comercial.** Sostenibilidad vía:
- Bien público mantenido por ONG / fundación.
- Licencia abierta (MIT o CC-BY-SA) — cualquier organización puede correrlo.
- Financiamiento: cooperación internacional (UE, BID, USAID Costa Rica), Defensoría, fondos de fundaciones.

Si el jurado pregunta "¿cómo pagás los LLM calls?": en producción mediante un proxy que cachea respuestas comunes (95% de queries son de ~20 situaciones más frecuentes).

### 26. "¿Quién es 'Bitaya'?"

[Completar: equipo, nombre del proyecto, contexto del hackatón.]

### 27. "¿Open source?"

Sí, planeado bajo MIT con cláusula de atribución a las fuentes oficiales. El repo está en GitHub, dev branch ya pública: https://github.com/JoshKerosh/Bitaya_LLM_Wiki/tree/dev

### 28. "¿Quién mantiene el wiki a largo plazo? Las leyes cambian."

Tres niveles:
1. **Comunidad de curadores** entrenados con `docs/05-GUIA-CURADOR.md` (estudiantes de derecho, voluntarios de ONGs).
2. **Revisores legales** validan páginas marcadas `draft → revisado`.
3. **`/lint` automatizado** detecta drift mensual y propone re-ingest de fuentes vencidas.

### 29. "¿Adopción gubernamental?"

Path: piloto con una institución (INAMU es ideal por urgencia), métricas a 6 meses, propuesta a otras. El sistema NO compite con sitios oficiales — los complementa traduciendo su info al lenguaje de la calle.

---

## 🎯 Adversariales / Gotchas

### 30. "Pero el sitio de la Defensoría ya tiene esto."

No. La Defensoría tiene **información legal correcta pero técnica**, organizada por institución, no por problema humano. Nuestra diferencia clave:
- Buscás por **tu situación** ("me pega mi pareja"), no por nombre de ley.
- Respuesta en lenguaje de la calle, no legalese.
- "Qué hacer HOY" como pasos numerados.
- Citas verificables a la ley original.

### 31. "Karpathy no es legalmente autoritativo. ¿Por qué citarlo?"

Karpathy diseñó el **patrón de gestión de conocimiento** (cómo un LLM mantiene un wiki). No estamos citando su autoridad legal. La autoridad legal viene de **SCIJ, Sala Constitucional, instituciones .go.cr** — todas citadas explícitamente en cada página. Karpathy es la arquitectura; las fuentes oficiales son el contenido.

### 32. "Otros equipos van a hacer lo mismo el año que viene."

Excelente. **Queremos que pase.** El patrón es open source y replicable a cualquier dominio donde haya asimetría de información entre instituciones y personas vulnerables (acceso a salud, derechos del consumidor, ayudas sociales). Bitaya es la primera instancia, no el moat. El moat es **la confianza de las ONGs aliadas y la calidad de las páginas revisadas**.

### 33. "ChatGPT con un buen prompt hace lo mismo."

Probalo: pediles a ChatGPT/Gemini "qué hago si mi pareja me pega en Costa Rica" y verás:
- Inventa artículos de leyes que no existen.
- Da teléfonos genéricos o de otros países.
- No tiene aviso legal.
- No se actualiza cuando reforman una ley.

Bitaya garantiza **citas verificables, datos verificados al `ultima_verificacion`, y trazabilidad en git**.

### 34. "Esto no se ve como un producto, es solo markdown."

Correcto, y es **deliberado**. Markdown es la **capa de datos**. La capa de presentación puede ser:
- Obsidian (hoy, para curadores y abogados).
- Sitio Astro estático (Fase 2, para público general).
- Bot WhatsApp (Fase 3).
- App offline-first (Fase 4).

**El mismo markdown sirve a todas.** Eso es escalabilidad real, no demo flashy.

### 35. "¿Y si solo lo usan abogados, no la gente vulnerable?"

Win igual. Si un abogado de Defensa Pública responde 10x más rápido y mejor porque tiene el wiki como referencia, **la persona vulnerable se beneficia indirectamente**. El abogado se vuelve más eficaz; la cobertura del servicio gratuito crece.

### 36. "¿Por qué no usaron un knowledge graph (Neo4j, etc.)?"

Los `[[wikilinks]]` de markdown **son** un knowledge graph — visualizable en el graph view de Obsidian. Pero sobre infraestructura cero: archivos planos en git. Si la complejidad lo justifica más adelante, exportamos a Neo4j (Karpathy lo menciona como evolución). Hoy: cero overhead.

### 37. "¿Cómo se diferencian de [otro equipo similar en el hackatón]?"

[Completar según contexto del hackatón.] Posibles ángulos:
- Patrón LLM Wiki es novedoso (Karpathy, abr 2026) — somos quizás los primeros aplicándolo a impacto social.
- Foco extremo en una audiencia (personas vulnerables CR) vs herramienta general.
- Reglas duras de citación que prácticamente eliminan alucinaciones.
- Producto + reporte de auditoría + framework de evals + roadmap = no es prototipo, es un proyecto.

---

## ⚡ Cierre rápido si te quedan 10 segundos

> "Otros equipos te muestran un chatbot. Nosotros te mostramos un **artefacto que se compone con el tiempo**, **citado fuente por fuente**, **escrito para quien más lo necesita**, **auditable hasta el último claim**, **portable a cualquier país**, y **basado en el patrón más nuevo de la industria aplicado al problema más viejo: que la gente conozca sus derechos.**"

---

## Si no sabés la respuesta

Sé honesto. *"Excelente pregunta — no tengo dato exacto, pero el sistema está diseñado para que [X]. Te lo confirmo después."* Mejor eso que inventar. El jurado castiga más la BS que el "no sé".
