---
title: Foco activo
type: hot
updated: 2026-05-21
---

Resumen vivo (~500 palabras máx) de **qué cubre el wiki densamente hoy** y **dónde están los huecos**. El agente lo lee al inicio de cada sesión para situarse. Se reescribe en cada `/ingest` y en cada `/lint`.

---

## Qué cubre densamente

> **Violencia doméstica (Ley 7586)** — primera fuente ingerida. Cubre las 5 modalidades incluyendo **violencia vicaria** (reforma 2025). 3 situaciones: [[me-pega-mi-pareja]], [[mi-pareja-me-amenaza]], [[mi-pareja-lastima-a-mi-hijo-para-hacerme-dano]]. [[poder-judicial]] e [[inamu]] documentadas con teléfonos verificados.

> **Niñez (Ley 7739)** — Código de la Niñez y Adolescencia. Principio del [[interes-superior-del-nino]]. [[pani]] como rector. 2 situaciones: [[mi-vecino-le-pega-a-sus-hijos]], [[sospecho-que-abusan-de-mi-hijo]]. Procedimiento [[denuncia-pani]] paso a paso (anónimo posible).

> **Discapacidad (Ley 7600)** — Igualdad de oportunidades. Reformada por Ley 9207/2014 al modelo social (CDPD-ONU). [[conapdis]] como rector con tel verificado 2280-6500. 2 situaciones: [[el-cole-no-acepta-a-mi-hija-con-discapacidad]], [[me-niegan-trabajo-por-mi-discapacidad]]. Procedimiento [[reclamar-accesibilidad-o-inclusion]] con 3 vías incluyendo amparo.

> **Adultos mayores (Ley 7972 — financiamiento)** — La ley sustantiva 7935 está pendiente. [[conapam]] documentada con Línea Dorada 1165 (gratuita, 24/7). 2 situaciones: [[mi-mama-mayor-esta-en-abandono]], [[abusan-de-mi-abuelita]].

## Densidad actual por sección

| Sección | Páginas | Profundidad |
|---|---|---|
| situaciones/ | 8 | violencia/niñez/discapacidad/adulto mayor |
| derechos/ | 4 | uno por población principal cubierta |
| leyes/ | 4 | 7586 + 7739 + 7600 + 7972 |
| instituciones/ | 5 | INAMU, PJ, PANI, CONAPDIS, CONAPAM |
| procedimientos/ | 4 | medidas, denuncia VD, denuncia PANI, amparo discapacidad |
| glosario/ | 5 | medida de protección, violencia vicaria, interés superior, accesibilidad, equiparación |
| sources/ | 4 | las 4 leyes ingeridas |
| synthesis/ | 0 | — |

## Huecos conocidos (priorizar para próximos `/ingest`)

**Por urgencia (leyes sustantivas que faltan):**
1. **Ley 7935** (Ley Integral para la Persona Adulta Mayor) — sustantiva, no solo financiera.
2. **Ley 8589** (Penalización de Violencia contra las Mujeres) — complementa la 7586 con sanciones penales.
3. **Código de Trabajo** — para situaciones laborales (despido, acoso, prestaciones).
4. **Ley de Migración** (8764) — refugiados y migrantes.

**Wikilinks creados pero sin página destino (crear como stubs):**
- [[mep]] — referenciado en 4+ páginas (educación inclusiva).
- [[ccss]] — referenciado en 5+ páginas (salud, pensiones).
- [[mtss]] — referenciado en 4+ páginas (empleo).
- [[fuerza-publica]] — referenciado en 6+ páginas.
- [[ministerio-publico]] — referenciado en 4+ páginas.
- [[defensoria-de-los-habitantes]] — referenciado en 8+ páginas.
- [[imas]] — referenciado en 3+ páginas.

> Nota: Pablo creó algunas de estas en `llm-wiki/raw/institutions/` con datos verificados. Próximo `/ingest` puede consolidar.

**Por población sub-cubierta:**
- Migrantes y refugiados — 0 páginas.
- LGBTIQ+ — 0 páginas.
- Indígenas — 0 páginas.
- Trabajadoras informales / trabajadoras del hogar — 0 páginas.

## Próximas acciones sugeridas

1. **Crear stubs** para MEP, CCSS, MTSS, Fuerza Pública, Ministerio Público, Defensoría, IMAS — usando los datos verificados de `llm-wiki/raw/institutions/` (Pablo) como fuente complementaria.
2. **Ingerir Ley 8589** (Penalización Violencia Mujeres) — refuerza casos de [[me-pega-mi-pareja]] con sanciones penales.
3. **Ingerir Ley 7935** (Adulto Mayor sustantiva) — desbloquea cobertura completa de derechos del adulto mayor.
4. **Correr `/lint`** ahora — el fanout de 30+ páginas creó varios wikilinks pendientes.
