---
title: Foco activo
type: hot
updated: 2026-05-21
---

Resumen vivo (~500 palabras máx) de **qué cubre el wiki densamente hoy** y **dónde están los huecos**. El agente lo lee al inicio de cada sesión para situarse. Se reescribe en cada `/ingest` y en cada `/lint`.

---

## Qué cubre densamente

> **Violencia doméstica (Ley 7586)** — primera fuente ingerida. Cubre las 5 modalidades incluyendo **violencia vicaria** (reforma 2025). 3 situaciones: [[me-pega-mi-pareja]], [[mi-pareja-me-amenaza]], [[mi-pareja-lastima-a-mi-hijo-para-hacerme-dano]]. [[poder-judicial]] e [[inamu]] documentadas con teléfonos verificados. INAMU actualizado con tel CIO **1125** / WhatsApp **8321-8678**, teléfonos regionales de 6 regiones, COAVIFMU (Ley 10158/2022), patrocinio legal gratuito (Ley 10347/2023).

> **Niñez (Ley 7739 + Ley 7143 PANI)** — Código de la Niñez y Adolescencia + Ley Orgánica PANI. [[interes-superior-del-nino]]. [[pani]] con Programa Adolescente Madre y Acogimiento Prenatal documentados. 3 situaciones nuevas: [[soy-adolescente-y-estoy-embarazada]], [[hay-violencia-en-mi-barrio-y-hay-ninos-en-peligro]], más las 2 originales.

> **Discapacidad (Ley 7600 + Ley 8661 CRPD + Ley 9379)** — triple cobertura. Modelo social de discapacidad (CRPD ratificado 2008). Autonomía personal (Ley 9379/2016): asistente personal subsidiado, garante de igualdad jurídica, Programa Autonomía Personal en CONAPDIS. [[conapdis]] con dirección (Barrio Tournón), tel 2280-6500 y proceso de certificación completo. 4 situaciones nuevas: [[me-discriminan-en-el-trabajo-por-mi-discapacidad]], [[quiero-trabajar-pero-tengo-discapacidad-y-nadie-me-contrata]], [[no-me-dejan-entrar-a-un-lugar-por-mi-discapacidad]], [[necesito-ayuda-para-vivir-de-forma-independiente-con-mi-discapacidad]].

> **Adultos mayores (Ley 7972 — financiamiento)** — La ley sustantiva 7935 está pendiente. [[conapam]] actualizado con CECUIDAM (nuevos centros Puntarenas y Palmar Sur 2025-2026), consultorio jurídico gratuito. 2 situaciones originales vigentes.

> **Embarazo y asistencia social (CCSS + IMAS + Ley 7060 + Ley 5662 FODESAF)** — **Nueva cobertura.** [[ccss]] documentada: atención prenatal gratuita para toda embarazada (con o sin seguro), 4 tipos de aseguramiento, EBAIS. [[imas]] documentada: transferencias no reembolsables, AVANCEMOS (>274,000 estudiantes 2025), mejoramiento vivienda, FIDEIMAS, apoyo por violencia, seguro por Estado. 5 situaciones nuevas.

> **Sistema 9-1-1** — documentado como institución: protocolo de violencia doméstica, coordinación con INAMU + PANI.

## Densidad actual por sección

| Sección | Páginas | Profundidad |
|---|---|---|
| situaciones/ | 18 | violencia/niñez/discapacidad/adulto mayor/embarazo/ayuda social |
| derechos/ | 7 | violencia, niñez, discapacidad x3, salud, asistencia social |
| leyes/ | 10 | 7586+7739+7600+7972+7060+5662+7801+7143+8661+9379 |
| instituciones/ | 9 | INAMU, PJ, PANI, CONAPDIS, CONAPAM, CCSS, IMAS, MTSS, 911 |
| procedimientos/ | 4 | medidas, denuncia VD, denuncia PANI, amparo discapacidad |
| glosario/ | 14 | medida-protección, violencia-vicaria, interés-superior, accesibilidad, equiparación, EBAIS, SINIRUBE, FODESAF, AVANCEMOS, asistente-personal, garante-igualdad-jurídica, autonomía-personal, COAVIFMU, RNC |
| sources/ | 19 | 4 originales + 15 nuevas |
| synthesis/ | 0 | — |

## Huecos conocidos (priorizar para próximos `/ingest`)

**Por urgencia (leyes sustantivas que faltan):**
1. **Ley 7935** (Ley Integral para la Persona Adulta Mayor) — sustantiva, no solo financiera.
2. **Ley 8589** (Penalización de Violencia contra las Mujeres) — complementa la 7586 con sanciones penales. INAMU ya tiene patrocinio legal gratuito por esta ley (Ley 10347/2023, Art. 4ñ Ley 7801).
3. **Código de Trabajo** — para situaciones laborales (despido, acoso, prestaciones).
4. **Ley de Migración** (8764) — refugiados y migrantes. INAMU ya atiende sin importar migración pero falta la ley específica.
5. **`raw/2026-05-21-mtss-compilado-leyes-decretos-discapacidad.md`** — archivo de 427KB no procesado por tamaño.

**Wikilinks creados pero sin página destino (crear como stubs urgentes):**
- [[mep]] — referenciado en 5+ páginas (educación inclusiva, AVANCEMOS).
- [[defensoria-de-los-habitantes]] — referenciado en 15+ páginas como escalamiento. **MÁS URGENTE.**
- [[fuerza-publica]] — referenciado en 5+ páginas.
- [[ministerio-publico]] — referenciado en 3+ páginas.
- [[poder-judicial]] — existe como página pero no está actualizada con la nueva info de INAMU/violencia.

**Por población sub-cubierta:**
- Migrantes y refugiados — INAMU ya los atiende pero 0 páginas de situación específica.
- LGBTIQ+ — 0 páginas.
- Indígenas — 0 páginas.
- Trabajadoras informales / trabajadoras del hogar — 0 páginas.

## Próximas acciones sugeridas

1. **Crear stub [[defensoria-de-los-habitantes]]** — citada en 15+ páginas como escalamiento.
2. **Crear stub [[mep]]** — citada en 5+ páginas (educación inclusiva, AVANCEMOS).
3. **Ingerir Ley 7935** (Adulto Mayor sustantiva) — desbloquea cobertura completa.
4. **Ingerir Ley 8589** (Penalización VCM) — ya referenciada desde INAMU, falta la ley.
5. **Procesar raw MTSS compilado** (427KB) por segmentos — leyes de discapacidad laboral.
6. **Correr `/lint`** — el fanout de 50+ páginas creó varios wikilinks pendientes.
