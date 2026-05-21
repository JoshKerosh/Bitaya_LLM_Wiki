# 01 — Pitch

> **Bitaya LLM Wiki**: una base de conocimiento que un LLM construye y mantiene, para que las personas vulnerables en Costa Rica sepan qué derechos las protegen y qué hacer hoy.

---

## El problema

En Costa Rica hay leyes muy completas que protegen a las personas más vulnerables: víctimas de violencia, niñez, adultos mayores, personas con discapacidad, migrantes, indígenas, LGBTIQ+, trabajadoras del hogar.

**Pero el acceso a esa información está roto:**

- 📚 Las leyes están escritas para abogados, no para quien las necesita.
- 🌐 Los sitios oficiales (SCIJ, Poder Judicial) son inentendibles para no juristas.
- ☎️ La gente no sabe **a quién llamar** ni **qué pasos dar primero**.
- 💰 Pagar un abogado es inaccesible para quien más lo necesita.
- 🤖 Preguntar a un chatbot genérico (ChatGPT, Gemini) devuelve respuestas **inventadas, sin fuentes y a veces incorrectas**.

**Resultado:** las personas que tienen los derechos más fuertes son las que menos saben cómo ejercerlos.

---

## La solución

Un **wiki vivo, en castellano simple, mantenido por un LLM**, donde:

1. **Vos curás fuentes oficiales** (leyes del SCIJ, manuales del PANI, INAMU, MTSS, Defensoría…). Las dejás en `raw/`.
2. **El LLM las compila** en un wiki interlinkeado de markdown — situaciones, derechos, leyes, instituciones, procedimientos, glosario.
3. **Las personas consultan por su problema concreto** ("me pega mi pareja", "me despidieron sin pagarme") y reciben:
   - Pasos accionables HOY.
   - Teléfonos, direcciones, horarios.
   - Citas a la ley exacta que las protege.
   - A dónde escalar si no las atienden.

El wiki es **un artefacto que crece** — cada ley nueva que ingerís enriquece todas las páginas relacionadas automáticamente.

---

## Por qué es distinto

| Solución típica | Bitaya LLM Wiki |
|---|---|
| Chatbot que inventa respuestas | **Cada claim cita una ley o fuente oficial.** Sin cita, no se publica. |
| Sitio gov con jerga legal | **Castellano simple**, escrito para la persona, no para el abogado. |
| "Hablá con un abogado" | **"Llamá al 800-INAMU-00 hoy, llevá tu cédula y pedí medida de protección."** |
| RAG que reconstruye en cada query | **Compila el conocimiento una vez** y lo mantiene actualizado. |
| Información desactualizada | Cada institución tiene `ultima_verificacion`; el `/lint` marca lo viejo. |
| Hay que tener internet rápido | Páginas dan **opciones presenciales y teléfonos** para gente sin smartphone. |

---

## Diferenciador técnico

Bitaya implementa el patrón **LLM Wiki** propuesto por **Andrej Karpathy** (co-fundador de OpenAI) en abril 2026 — un patrón con 16M de views en su anuncio, pero que casi nadie ha aplicado a impacto social real.

Mientras la industria persigue agentes y RAG cada vez más complejos, este patrón es radicalmente simple: **carpetas, markdown, un LLM disciplinado**. Y por eso escala.

**Nuestra aplicación lo lleva a un dominio donde el costo del error es alto:** información legal incorrecta puede revictimizar. Por eso agregamos:

- Reglas duras: toda afirmación legal **debe** citar la fuente.
- Aviso legal obligatorio en cada página pública.
- Estructura por **población vulnerable** (frontmatter `poblacion:`).
- Detección de emergencias en `/query` (responde primero con teléfono de auxilio).
- Plantillas tipadas en español que fuerzan formato accionable.

---

## Impacto

Si una sola persona evita una segunda noche de violencia porque encontró el teléfono del INAMU y los pasos de denuncia en su idioma, **el proyecto ya valió la pena**.

A escala:
- 🏛️ ONGs y consultorios jurídicos gratuitos pueden adoptar el wiki como **base operativa**.
- 📱 El mismo markdown sirve para alimentar un sitio web, un bot de WhatsApp, una app, o impresos para zonas sin conexión.
- 🌎 El patrón es **replicable a otros países** de la región (Honduras, Panamá, Guatemala) cambiando las fuentes en `raw/`.

---

## Métricas de éxito (lo que mediríamos)

| Métrica | Por qué importa |
|---|---|
| # de situaciones cubiertas | Cobertura real del catálogo de problemas humanos |
| % de páginas con citas verificadas | Confiabilidad legal |
| Tiempo desde que aparece una ley nueva hasta estar en el wiki | Frescura |
| # de poblaciones vulnerables con cobertura ≥ 10 situaciones | Equidad |
| Última verificación de teléfonos de instituciones | Operatividad |

---

## Tagline

**"Las leyes ya existen. Faltaba que estuvieran a la mano."**
