# 10 — Comparativa con estado del arte

> Qué hay en el mundo que se parece a Bitaya, y por qué nuestro enfoque es distinto.

---

## TL;DR

| Solución | Quién la hace | Para qué sirve | Por qué no resuelve el problema |
|---|---|---|---|
| **ChatGPT / Gemini / Claude (uso directo)** | Persona vulnerable preguntando | Respuestas rápidas | **Aluciona leyes y teléfonos**, sin citas verificables, no actualiza cuando cambia la ley |
| **Sitio Defensoría / SCIJ / INAMU** | Instituciones oficiales | Info legal correcta | **Jerga legal**, búsqueda por institución no por problema, sin "qué hacer hoy" |
| **RAG sobre documentos legales** | Tools tipo Pinecone+OpenAI | Q&A sobre corpus | **Reconstruye en cada query**, no detecta contradicciones, opaco |
| **Knowledge graphs (Neo4j legal)** | Universidades, startups legales | Modelado estructurado | **Alta complejidad**, no escala para colaboración no-técnica |
| **Apps legales (Lex.Mx, ConsultorJurídico)** | Startups B2C | Conectar con abogados | **De pago**, modelo B2C no B2P (Para Persona vulnerable) |
| **obsidian-wiki framework (Ar9av)** | Patrón open source | Wiki personal con LLM | **Genérico**, no especializado a impacto social ni legal |
| **Karpathy LLM Wiki gist** | Pattern abstracto | Idea / blueprint | **No es producto**, hay que instanciarlo |
| **Bitaya LLM Wiki** | Nosotros | Persona vulnerable CR | _ver abajo_ |

---

## ChatGPT / Gemini / Claude directo

**Lo que hace bien:**
- Acceso inmediato, conoce LLM.
- Responde en castellano simple si se lo pedís.

**Donde falla para nuestro caso:**
- **Alucina artículos de ley que no existen.** Probálo: "Dame el artículo del Código Penal de Costa Rica que tipifica el femicidio." Te dará un número plausible, no necesariamente correcto.
- **Inventa teléfonos.** O da los de México por defecto.
- **Sin citas verificables.** No podés auditar.
- **Sin actualización.** Reforma del 2026 no la conoce.
- **Sin disclaimer legal.** Suena confiado donde no debería.
- **Sin trazabilidad.** Si la respuesta resulta mala, no podés rastrear de dónde salió.

**Bitaya:**
- Cita ley + artículo + fuente con link al SCIJ.
- Teléfonos verificados al `ultima_verificacion`.
- Re-ingest al reformar.
- Disclaimer obligatorio.
- Git versionado = auditoría total.

---

## Sitios oficiales (.go.cr)

**Lo que hacen bien:**
- Info legal correcta.
- Autoridad institucional.
- Gratuitos.

**Donde fallan para personas vulnerables:**
- **Jerga legal.** El sitio de la Defensoría usa "interposición de recurso de amparo", no "denunciar al colegio que no recibió a tu hija".
- **Organización por institución, no por problema.** La persona entra y ve "Áreas", "Programas", "Trámites" — no encuentra "me pega mi pareja".
- **Sin "qué hacer HOY"**. Explican el marco legal, no los pasos concretos.
- **Sin cross-referencing.** Una ley no linkea a la institución que la aplica.
- **Sin priorización por urgencia.** Una emergencia se mezcla con un trámite administrativo.

**Bitaya complementa, no compite.** El sitio oficial es la fuente; el wiki es el traductor para la audiencia.

---

## RAG (Retrieval-Augmented Generation)

**Cómo funciona:** indexás documentos en chunks, los almacenás como embeddings en una vector DB, en cada query retrievás los chunks relevantes y un LLM genera respuesta.

**Lo que hace bien:**
- Escala a corpus enormes (miles de PDFs).
- Recall razonable con buenas embeddings.

**Donde falla para nuestro caso:**
- **No acumula.** Cada query reconstruye desde cero. La cross-referenciación se redescubre cada vez.
- **No detecta contradicciones.** Si dos leyes se contradicen, RAG no lo señala — el LLM elige una y sigue.
- **Opaco.** "El sistema usó chunks 12, 47 y 89" no le dice nada al jurista que necesita auditar.
- **Infraestructura pesada.** Vector DB, embeddings, reranking, evals propios.
- **Mantenimiento.** Cuando reforman una ley, hay que re-indexar todo el corpus.

**Bitaya:** ingest una vez, wiki es persistente y auditable; contradicciones explícitas con callouts; cero infra (markdown + git).

---

## Knowledge graphs (Neo4j legal, etc.)

**Lo que hacen bien:**
- Modelado estructurado de relaciones (ley → institución → procedimiento).
- Queries Cypher poderosas.

**Donde fallan:**
- **Alta barrera de entrada.** Curar requiere conocer Cypher o herramientas especializadas.
- **No es texto narrativo.** La persona vulnerable lee párrafos, no ve nodos.
- **Costo de mantenimiento.** Cada nueva ley = modelado de nodos y aristas, no solo "subir PDF y `/ingest`".

**Bitaya:** los `[[wikilinks]]` SON un grafo — visible en Obsidian graph view. Pero sobre archivos planos. Si en el futuro necesitamos potencia de queries, exportamos a Neo4j (Karpathy lo menciona como evolución).

---

## Apps legales B2C (Lex.Mx, Justia, Avvo, etc.)

**Modelo:** matchear persona con abogado, vender consultas, suscripciones.

**Donde fallan para nuestro caso:**
- **De pago**, excluye exactamente a la audiencia vulnerable.
- **Optimizan engagement, no autonomía.** El interés está en que vuelvas y consumas.
- **Calidad legal variable.** Los abogados son contratistas, no validados por un proceso institucional.

**Bitaya:** gratis, sin login, optimizado para que la persona **resuelva y no vuelva a necesitarnos**.

---

## obsidian-wiki framework (Ar9av en GitHub)

**Lo que hace bien:**
- Implementación de referencia del patrón Karpathy.
- Multi-agente (Claude, Codex, Gemini, Hermes, Pi, Kiro).
- Skills modulares.

**Donde se diferencia de Bitaya:**
- **Genérico.** Sirve para cualquier dominio personal.
- **No tiene contexto social.** No hay reglas duras de citación legal, ni disclaimer, ni `poblacion:` en frontmatter, ni detección de emergencia, ni guía del curador con criterios de fuente oficial.

**Bitaya:** especialización a un dominio donde el costo del error es alto (información legal a poblaciones vulnerables) + reglas duras que el patrón genérico no tiene.

---

## El gist original de Karpathy

**Lo que es:** un pattern abstracto, ~2k palabras, sin código, sin instanciación.

**Lo que Bitaya agrega:**
- Schema concreto en `CLAUDE.md` (250+ líneas con reglas duras del dominio).
- 8 plantillas tipadas para el dominio legal.
- 3 slash commands implementados.
- Estructura de evals.
- Documentación pitch-ready, guía de curador, reporte de salud.
- CI workflow.
- Política de seguridad / AI responsable.
- Roadmap real.

Karpathy publicó la idea; nosotros la instanciamos para un problema social específico con la rigurosidad que el contexto legal demanda.

---

## Matriz de capacidades clave

| Capacidad | ChatGPT | RAG | Sitio oficial | Bitaya |
|---|:---:|:---:|:---:|:---:|
| Responde en lenguaje claro | ✅ | ⚠️ | ❌ | ✅ |
| Citas verificables | ❌ | ⚠️ | ✅ | ✅ |
| Pasos accionables hoy | ⚠️ | ⚠️ | ❌ | ✅ |
| Teléfonos verificados | ❌ | ⚠️ | ✅ | ✅ |
| Detecta emergencia | ❌ | ❌ | ❌ | ✅ |
| Búsqueda por problema (no por ley) | ⚠️ | ⚠️ | ❌ | ✅ |
| Detecta contradicciones entre fuentes | ❌ | ❌ | ❌ | ✅ |
| Audita decisiones (git log) | ❌ | ❌ | ⚠️ | ✅ |
| Conoce reformas recientes | ⚠️ | ✅ | ✅ | ✅ |
| Disclaimer legal obligatorio | ❌ | ❌ | ⚠️ | ✅ |
| Costo en producción | $$ | $$$ | $0 | $ |
| Privacy del usuario | ❌ | ⚠️ | ✅ | ✅ |
| Replicable a otro país | ❌ | ⚠️ | ❌ | ✅ |

✅ = sí ⚠️ = parcial / depende ❌ = no

---

## Por qué este equipo, en este momento

- **Patrón LLM Wiki de Karpathy (abril 2026) tiene 6 semanas de vida.** Somos primeros adoptantes aplicándolo a impacto social.
- **Claude Code llegó a un nivel de slash commands + schemas en `CLAUDE.md`** que hace el patrón viable sin infra.
- **Costa Rica tiene corpus legal accesible (SCIJ)** + red de instituciones documentadas + idioma uniforme + alianzas posibles con UCR / Colegio de Abogados.
- **Las herramientas estaban; faltaba la combinación.** Esto es lo que aportamos.

---

## Si solo recuerdas una cosa

> **Las otras soluciones son chatbots que olvidan o sitios que no entendés. Bitaya es un wiki que aprende, cita, y traduce — para la persona que más lo necesita.**
