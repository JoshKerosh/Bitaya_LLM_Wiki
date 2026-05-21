---
title: Foco activo
type: hot
updated: 2026-05-21
---

Resumen vivo (~500 palabras máx) de **qué cubre el wiki densamente hoy** y **dónde están los huecos**. El agente lo lee al inicio de cada sesión para situarse. Se reescribe en cada `/ingest` y en cada `/lint`.

---

## Qué cubre densamente

> **Violencia doméstica contra mujeres (Ley 7586)** — primera fuente ingerida. Cubre las 5 modalidades (física, psicológica, sexual, patrimonial, **vicaria** — esta última agregada por reforma 2025). Tres situaciones completas: [[me-pega-mi-pareja]], [[mi-pareja-me-amenaza]], [[mi-pareja-lastima-a-mi-hijo-para-hacerme-dano]]. Procedimiento [[solicitar-medidas-de-proteccion]] paso a paso. Instituciones [[poder-judicial]] e [[inamu]] documentadas con teléfonos verificados al 2026-05-21. Glosario inicial con [[medida-de-proteccion]] y [[violencia-vicaria]].

## Densidad actual por sección

| Sección | Páginas | Profundidad |
|---|---|---|
| situaciones/ | 3 | violencia doméstica básica |
| derechos/ | 1 | derecho a vivir sin violencia |
| leyes/ | 1 | Ley 7586 completa |
| instituciones/ | 2 | Poder Judicial + INAMU |
| procedimientos/ | 2 | medidas de protección + denuncia penal |
| glosario/ | 2 | medida de protección + violencia vicaria |
| sources/ | 1 | Ley 7586 |
| synthesis/ | 0 | — |

## Huecos conocidos (priorizar para próximos `/ingest`)

**Por urgencia:**
1. **Niñez en riesgo** — falta Ley 7739 (Código de la Niñez y la Adolescencia). Pablo ya la subió a `raw/`. Faltan situaciones tipo `mi-vecino-le-pega-a-sus-hijos`, `mi-papa-me-toca`, página de [[pani]].
2. **Adultos mayores en abandono** — Ley 7972 está en `raw/`. Falta CONAPAM como institución.
3. **Personas con discapacidad** — Ley 7600 está en `raw/`. Falta CONAPDIS, MEP, situaciones de educación inclusiva.

**Wikilinks creados pero sin página destino (crear como stub para evitar ghost files):**
- [[pani]] — referenciado en 4+ páginas.
- [[fuerza-publica]] — referenciado en 5+ páginas.
- [[ministerio-publico]] — referenciado en 3+ páginas.

**Por población sub-cubierta:**
- Migrantes y refugiados — 0 páginas.
- LGBTIQ+ — 0 páginas.
- Indígenas — 0 páginas.
- Trabajadoras informales — 0 páginas.

## Próximas acciones sugeridas

1. **Ingerir Ley 7739 (Código Niñez)** — desbloquea PANI como institución completa y al menos 3 situaciones de niñez.
2. **Crear stubs** para [[pani]], [[fuerza-publica]], [[ministerio-publico]] para evitar ghost links.
3. **Correr `/lint`** después del próximo ingest para detectar huérfanos y wikilinks rotos.
