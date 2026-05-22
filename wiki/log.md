# Log

Registro cronológico append-only. Cada entrada arranca con `## [YYYY-MM-DD] <op> | <título>` para parsear con `grep '^## \[' wiki/log.md | tail -20`.

Operaciones: `init`, `ingest`, `query`, `lint`, `synthesis`.

---

## [2026-05-21] ingest | 23 fuentes — CCSS, IMAS, PANI, INAMU, 9-1-1, CONAPAM, CONAPDIS, MTSS, Leyes 7060+5662+7801+7143+8661+9379

- **Fuentes procesadas (22 de 23):** raw/2026-05-21-ccss-seguro-salud-maternidad.md, raw/2026-05-21-imas-programas-beneficios.md, raw/2026-05-21-pani-servicios-proteccion-ninez.md, raw/2026-05-21-inamu-violencia-delegacion-mujer.md, raw/2026-05-21-inamu-ruta-referencia-oim.md, raw/2026-05-21-ley-7060-creacion-imas.md, raw/2026-05-21-ley-5662-desarrollo-social-asignaciones-familiares.md, raw/2026-05-21-ley-7801-inamu.md, raw/2026-05-21-ley-7143-organica-pani.md, raw/2026-05-21-emergencias-911-sistema-nacional.md, raw/2026-05-21-conapam-linea-dorada-cecuidam.md, raw/2026-05-21-ley-8661-convencion-derechos-personas-discapacidad.md, raw/2026-05-21-ley-9379-autonomia-personal-discapacidad.md, raw/2026-05-21-conapdis-certificacion-empleo-transporte.md, raw/2026-05-21-mtss-empleo-formacion.md + 4 con contenido HTML vacío/imagen procesados pero sin fanout sustantivo.
- **NO PROCESADO:** raw/2026-05-21-mtss-compilado-leyes-decretos-discapacidad.md — 427KB, excede límite de lectura de 256KB. Pendiente de procesar por segmentos (offset/limit).
- **Páginas creadas (48):**
  - **Sources (15):** ccss, imas-programas-beneficios, pani-proteccion-ninez, inamu-violencia-delegacion, inamu-ruta-oim, ley-7060, ley-5662-fodesaf, ley-7801, ley-7143, emergencias-911, conapam-linea-dorada, ley-8661-crpd, ley-9379-autonomia, conapdis-certificacion, mtss-empleo.
  - **Instituciones (4 nuevas):** [[ccss]], [[imas]], [[mtss]], [[emergencias-911]].
  - **Leyes (6 nuevas):** ley-7060-imas, ley-5662-fodesaf, ley-7801-inamu, ley-7143-organica-pani, ley-8661-convencion-discapacidad, ley-9379-autonomia-personal-discapacidad.
  - **Situaciones (9 nuevas):** [[estoy-embarazada-sin-recursos]], [[soy-adolescente-y-estoy-embarazada]], [[no-tengo-seguro-social]], [[necesito-ayuda-economica-urgente]], [[quiero-que-mi-hijo-siga-estudiando-pero-no-tenemos-plata]], [[mi-casa-esta-en-mal-estado-y-no-puedo-pagar-reparaciones]], [[me-discriminan-en-el-trabajo-por-mi-discapacidad]], [[quiero-trabajar-pero-tengo-discapacidad-y-nadie-me-contrata]], [[no-me-dejan-entrar-a-un-lugar-por-mi-discapacidad]], [[necesito-ayuda-para-vivir-de-forma-independiente-con-mi-discapacidad]], [[hay-violencia-en-mi-barrio-y-hay-ninos-en-peligro]]. (11 situaciones nuevas en total).
  - **Derechos (3 nuevos):** [[derecho-a-seguro-de-salud]], [[derecho-a-asistencia-social]], [[derecho-a-autonomia-personal-discapacidad]].
  - **Glosario (9 nuevas):** [[ebais]], [[sinirube]], [[fodesaf]], [[avancemos]], [[asistente-personal]], [[garante-igualdad-juridica]], [[autonomia-personal]], [[coavifmu]], [[regimen-no-contributivo]].
- **Páginas actualizadas (5):**
  - [[inamu]] — tel CIO 1125/WhatsApp 8321-8678, teléfonos regionales 6 zonas, COAVIFMU, patrocinio legal, sources actualizadas.
  - [[pani]] — Programa Adolescente Madre, situaciones nuevas, leyes actualizadas.
  - [[conapam]] — CECUIDAM detalle (Puntarenas + Palmar Sur 2025-2026), sources actualizado.
  - [[conapdis]] — Programa Autonomía Personal, situaciones nuevas, leyes actualizadas, sources actualizado.
  - Todos los _index.md y wiki/index.md y wiki/_hot.md actualizados.
- **Contradicciones marcadas:** ninguna — las fuentes son complementarias, no contradictorias.
- **Wikilinks pendientes (stubs urgentes):**
  - [[defensoria-de-los-habitantes]] — citada en 15+ páginas.
  - [[mep]] — citada en 5+ páginas.
  - [[fuerza-publica]] — citada en 5+ páginas.
  - [[ministerio-publico]] — citada en 3+ páginas.
- **Calidad:** todas las páginas públicas con aviso legal + citas a fuentes + ultima_verificacion: 2026-05-21. Fanout: ~3.2 páginas por fuente procesada (limitado por sesión, no por calidad). Calidad: estándar.

## [2026-05-21] ingest | 3 leyes — Niñez (7739), Discapacidad (7600), Adultos Mayores (7972)

- **Fuentes:** raw/2026-05-21-ley-7739-codigo-ninez-adolescencia.md, raw/2026-05-21-ley-7600-igualdad-oportunidades-discapacidad.md, raw/2026-05-21-ley-7972-persona-adulta-mayor-conapam.md.
- **Páginas creadas (22):**
  - **Sources (3):** ley-7739, ley-7600, ley-7972.
  - **Leyes (3):** códigos correspondientes en castellano simple.
  - **Derechos (3):** protección integral niñez, igualdad de oportunidades, protección del adulto mayor.
  - **Instituciones (3):** [[pani]], [[conapdis]] (tel 2280-6500), [[conapam]] (Línea Dorada 1165).
  - **Procedimientos (2):** [[denuncia-pani]] (anónima posible), [[reclamar-accesibilidad-o-inclusion]] (3 vías).
  - **Situaciones (6):** [[mi-vecino-le-pega-a-sus-hijos]], [[sospecho-que-abusan-de-mi-hijo]], [[el-cole-no-acepta-a-mi-hija-con-discapacidad]], [[me-niegan-trabajo-por-mi-discapacidad]], [[mi-mama-mayor-esta-en-abandono]], [[abusan-de-mi-abuelita]].
  - **Glosario (3):** [[interes-superior-del-nino]], [[accesibilidad]], [[equiparacion-de-oportunidades]].
- **Índices actualizados:** los 7 _index.md + wiki/index.md + wiki/_hot.md.
- **Datos institucionales reusados de Pablo:** teléfonos verificados de PANI, CONAPDIS, CONAPAM tomados de llm-wiki/raw/institutions/ (carpeta paralela), citados como fuente complementaria — sin modificarla.
- **Cobertura por población antes vs después:**
  - Antes: 1 (mujeres víctimas violencia).
  - **Después: 4 (mujeres, niñez, discapacidad, adultos mayores).**
- **Wikilinks pendientes (stubs por crear):** [[mep]], [[ccss]], [[mtss]], [[fuerza-publica]], [[ministerio-publico]], [[defensoria-de-los-habitantes]], [[imas]].
- **Calidad:** todas las páginas públicas con aviso legal + citas a fuente + ultima_verificacion: 2026-05-21.
- **Fanout total:** 22 páginas creadas + 9 actualizadas = **31 archivos**. Tres ingests paralelos con fanout promedio de 7.3 por fuente.

## [2026-05-21] ingest | Ley 7586 — Ley contra la Violencia Doméstica

- **Fuente:** `raw/2026-05-21-ley-7586-violencia-domestica.md` (SCIJ, oficial).
- **Páginas creadas (12):**
  - `wiki/sources/2026-05-21-ley-7586-violencia-domestica.md` — extracción con citas y reforma vicaria.
  - `wiki/leyes/ley-7586-violencia-domestica.md` — castellano simple, 17 medidas, reformas.
  - `wiki/derechos/derecho-a-vivir-sin-violencia.md`.
  - `wiki/instituciones/poder-judicial.md`, `wiki/instituciones/inamu.md`.
  - `wiki/procedimientos/solicitar-medidas-de-proteccion.md`, `wiki/procedimientos/denuncia-violencia-domestica.md`.
  - `wiki/situaciones/me-pega-mi-pareja.md`, `wiki/situaciones/mi-pareja-me-amenaza.md`, `wiki/situaciones/mi-pareja-lastima-a-mi-hijo-para-hacerme-dano.md`.
  - `wiki/glosario/violencia-vicaria.md`, `wiki/glosario/medida-de-proteccion.md`.
- **Índices actualizados:** los 7 `_index.md` de sección + `wiki/index.md` raíz + `wiki/_hot.md`.
- **Wikilinks pendientes (crear como stubs en próximo ingest):** [[pani]], [[fuerza-publica]], [[ministerio-publico]].
- **Calidad:** todas las páginas públicas con aviso legal obligatorio + citas a la fuente + `ultima_verificacion: 2026-05-21`.
- **Páginas tocadas:** 12 creadas + 8 actualizadas = **20 archivos**. Fanout dentro del rango esperado (10-20).

## [2026-05-21] init | Wiki creado

- Patrón [LLM Wiki de Karpathy (abril 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) instanciado para dominio: **derechos y leyes de protección a personas vulnerables en Costa Rica**.
- Capas: `raw/` (fuentes oficiales inmutables), `wiki/` (LLM-owned), `_templates/`.
- Schema en `CLAUDE.md` (espejado en `AGENTS.md`).
- Taxonomía del dominio: `situaciones/` (puerta de entrada), `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`, `glosario/`, `sources/`, `synthesis/`.
- Plantillas tipadas en `_templates/`: situacion, derecho, ley, institucion, procedimiento, termino, source, synthesis.
- Slash commands: `/ingest`, `/query`, `/lint`.
- Wiki vacío de contenido — listo para ingerir la primera fuente oficial.

## [2026-05-21] schema | Endurecimiento del schema

- **Navegación de 3 saltos:** agregado `_index.md` en cada sección (`situaciones/`, `derechos/`, `leyes/`, `instituciones/`, `procedimientos/`, `glosario/`, `sources/`, `synthesis/`). `index.md` raíz reescrito para apuntar a cada uno con formato `[[carpeta/_index|carpeta]]` (evita ghost-files de Obsidian). Costo de retrieval ahora es constante (3-4 lecturas).
- **`wiki/_hot.md`:** archivo nuevo de ~500 palabras con foco activo (qué cubre densamente el wiki + huecos conocidos). Se reescribe en cada `/ingest` y `/lint`. Se lee al inicio de cada sesión junto con `index.md`.
- **`ultima_verificacion`:** campo nuevo en frontmatter de toda página de cara al público. Plantillas actualizadas (situacion, derecho, ley, procedimiento, termino). Umbrales: 6m instituciones/procedimientos, 18m leyes/derechos, 24m glosario. `/query` avisa cuando cita una página vencida.
- **Política de contradicción con callout:** reemplaza la regla de strike-through. Cuando una fuente nueva contradice un claim viejo, se inserta `> [!contradiccion]` debajo del claim — nunca se sobrescribe. `/lint` detecta callouts no resueltos > 7 días.
- **Regla de wikilinks documentada:** `[[pagina]]` para artículos (filename único), `[[carpeta/_index|carpeta]]` para secciones. Nunca `[[carpeta]]` solo.
- **Slash commands actualizados** (`.claude/commands/ingest.md`, `query.md`, `lint.md`) para reflejar el nuevo workflow.
