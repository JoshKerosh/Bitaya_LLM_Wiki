# 05 — Guía del curador

> **Lee esto primero si vas a alimentar el wiki.** Tu rol es traer fuentes oficiales a `raw/`. El LLM hace el resto. Si seguís esta guía, todo sale perfecto. Si te desviás, el agente puede confundirse o generar contenido que no podemos verificar.

---

## ⚠️ Las dos reglas más importantes

1. **Vos NUNCA escribís ni editás nada dentro de `wiki/`.** Eso lo hace el LLM corriendo `/ingest`. El `wiki/` es propiedad del agente. Si querés cambiar algo del wiki, **pediselo al agente** (no edites el markdown directamente).

2. **Vos NUNCA inventás ni modificás lo que pongas en `raw/`.** Solo pegás la fuente oficial **tal cual sale de la institución**. Si no es oficial, no entra. Si la modificás, el agente cita una versión que no existe.

Si entendiste estas dos reglas, el resto es seguir un checklist.

---

## Qué hace cada quien

| Vos (curador) | LLM (agente) | NO hace |
|---|---|---|
| Buscar fuentes oficiales | Leer las fuentes de `raw/` | — |
| Bajarlas a `raw/` con el nombre correcto | Resumir y proponer takeaways | Modificar `raw/` |
| Pedir `/ingest` al agente | Crear/actualizar páginas en `wiki/` | Inventar leyes o teléfonos |
| Validar lo que el agente propone | Citar todo con `[[sources/...]]` | Borrar páginas sin avisar |
| Pedir `/lint` cada cierto tiempo | Marcar contradicciones con callouts | Dar asesoría legal específica |

---

## Qué cuenta como "fuente oficial"

Solo entran a `raw/` cosas que vengan de una de estas fuentes:

✅ **SÍ entra**

- **SCIJ** — https://www.pgrweb.go.cr/scij/ (leyes, códigos, decretos, reglamentos)
- **Sala Constitucional / Poder Judicial** — sentencias, jurisprudencia, resoluciones de amparo
- **Sitios oficiales de instituciones** con dominio `.go.cr`:
  - INAMU, PANI, CONAPAM, CONAPDIS, DGME, MTSS, CCSS, MEP, Defensoría de los Habitantes, Defensa Pública, etc.
- **Tratados internacionales ratificados por Costa Rica** (CEDAW, Convención de los Derechos del Niño, etc.) — bajados desde sitios oficiales (OEA, ONU, OACNUDH).
- **Manuales, protocolos y guías oficiales** publicados por las instituciones de arriba (PDFs en sus sitios web).
- **La Gaceta** (gaceta.go.cr) — publicación oficial.

❌ **NO entra**

- Blogs de abogados, aunque expliquen bien.
- Noticias de medios (La Nación, CRHoy, Semanario, etc.) — aunque cubran el tema.
- Wikipedia, Quora, Yahoo Respuestas.
- ChatGPT, Gemini, Claude — ningún output de IA.
- Cualquier documento de una persona en particular (su caso, su cédula, su contrato). El wiki es educativo, no contiene casos personales.
- PDFs sin atribución clara o sin URL oficial verificable.

**Regla mental:** "¿Si un juez me pregunta de dónde saqué esto, le puedo dar el link oficial?" Si la respuesta es **no**, no entra a `raw/`.

---

## Cómo nombrar los archivos en `raw/`

Formato obligatorio: `YYYY-MM-DD-slug-descriptivo.<ext>`

- `YYYY-MM-DD` = fecha de **descarga** (cuándo vos lo bajaste), no fecha de publicación de la ley.
- `slug-descriptivo` = nombre en kebab-case (palabras separadas por guión, sin tildes, sin espacios).
- `<ext>` = `pdf`, `md`, `html`, `txt`, `jpg`, `png`.

**Ejemplos buenos:**
```
raw/2026-05-21-ley-8589-penalizacion-violencia-mujeres.pdf
raw/2026-05-21-codigo-trabajo-art-94-discriminacion.html
raw/2026-05-21-protocolo-inamu-atencion-violencia.pdf
raw/2026-05-21-sentencia-sala-cuarta-2024-015432.pdf
raw/2026-05-21-pani-procedimiento-denuncia.md
raw/2026-05-21-defensoria-guia-derechos-adultos-mayores.pdf
```

**Ejemplos malos:**
```
raw/ley.pdf                                ← sin fecha, slug genérico
raw/Ley de Penalización.pdf                ← espacios, mayúsculas
raw/2026-05-21-Ley-Nº8589.pdf              ← caracteres especiales (Nº)
raw/penalizacion_violencia_mujeres.pdf     ← underscores en vez de guiones
raw/document(1).pdf                        ← nombre del navegador
raw/articulo-blog-violencia.html           ← no es fuente oficial
```

**Si no sabés cómo llamarlo:** abrí la fuente, mirá el título oficial, pasalo a kebab-case y antepuestale la fecha. Ejemplo:
- Título oficial: *"Ley N° 8589 — Ley de Penalización de la Violencia Contra las Mujeres"*
- Nombre del archivo: `2026-05-21-ley-8589-penalizacion-violencia-mujeres.pdf`

---

## Estructura interna de `raw/`

```
raw/
├── README.md           ← guardrails inline (lee esto en el folder)
├── assets/             ← imágenes, infografías, anexos que acompañan las fuentes
│   └── 2026-05-21-flujograma-denuncia-pani.png
├── 2026-05-21-ley-8589-penalizacion-violencia-mujeres.pdf
├── 2026-05-21-codigo-de-trabajo.pdf
├── 2026-05-21-protocolo-inamu-atencion-violencia.pdf
└── ...
```

**¿Hace falta crear subcarpetas por tema (raw/violencia/, raw/laboral/)?**

**NO.** Mantener todo plano en `raw/`. El agente busca por nombre de archivo y prefijo de fecha. Subcarpetas complican el ingest y los wikilinks. Las únicas subcarpetas válidas son:

- `raw/assets/` — para imágenes y anexos.

Si en el futuro `raw/` crece a > 500 archivos, ahí evaluamos splitting. Hoy no.

---

## Antes de pedir `/ingest`: checklist

Cada vez que agregás una fuente a `raw/`, antes de pedir el ingest al agente, validá:

- [ ] **¿Es fuente oficial?** Está en la lista de SÍ entra.
- [ ] **¿Tiene URL verificable?** Anotala mentalmente — el agente te la va a pedir.
- [ ] **¿El nombre del archivo cumple el formato** `YYYY-MM-DD-slug.ext`?
- [ ] **¿El PDF se puede leer (no es imagen escaneada)?** Si es imagen, hacela OCR primero o subila a otro formato. El agente no lee imágenes de leyes con calidad.
- [ ] **¿Es la versión vigente?** Si bajaste una ley vieja por error, marcá `derogada` en el slug: `2026-05-21-ley-XXXX-derogada.pdf`.
- [ ] **¿Hay reformas posteriores que tendría que bajar también?** Las leyes suelen tener reformas — bajalas todas, el agente las correlaciona.

Si los 6 checks pasan, podés pedir `/ingest`.

---

## Cómo pedir el `/ingest`

En Claude Code, dentro del repo:

```
> /ingest raw/2026-05-21-ley-8589-penalizacion-violencia-mujeres.pdf
```

O si bajaste algo desde una URL y querés que el agente lo capture:

```
> /ingest https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=60057
```

**Qué va a hacer el agente:**

1. Te resume los puntos clave **antes** de escribir nada.
2. Te pide confirmación de qué cubrir.
3. Te muestra qué páginas va a crear/actualizar (ley, derechos, instituciones, procedimientos, situaciones, glosario).
4. Procede.
5. Te reporta: páginas creadas, contradicciones encontradas con páginas viejas, situaciones nuevas desbloqueadas.

**Tu trabajo durante el ingest:**

- **Leé el resumen.** Si algo está mal interpretado, decílo antes de que avance.
- **Validá los teléfonos y direcciones.** El agente puede sacarlos de fuentes viejas. Confirmalos contra el sitio oficial actual.
- **Validá los nombres de situaciones propuestos.** Cuando el agente propone `me-pega-mi-pareja.md`, eso lo va a buscar la persona vulnerable. Si suena raro o demasiado formal, sugerí uno mejor.
- **No aceptes nada sin cita.** Si el agente dice "esto lo cubre la ley X" pero no linkea a `[[leyes/...]]` o `[[sources/...]]`, pedíle la cita.

---

## Qué hacer si el agente se equivoca

| Problema | Qué hacer |
|---|---|
| Inventó un artículo que no existe | "Mostrame en `raw/...` dónde aparece ese artículo. Si no aparece, sacalo y marcá `(unsourced)`." |
| Puso un teléfono viejo | "Verificá contra https://sitio-oficial.go.cr. Corregí y actualizá `ultima_verificacion`." |
| Sub-cross-referenció (tocó solo 1-2 páginas) | "Esa ley cubre más situaciones. Pasá de nuevo identificando situaciones reales en `wiki/situaciones/`." |
| Usó jerga legal sin explicar | "Linkeá los términos técnicos al glosario." |
| Omitió el aviso legal en una página pública | "Agregá el aviso legal obligatorio que está en `CLAUDE.md`." |

**Nunca edites el `wiki/` vos directamente para arreglar esto.** Pedíle al agente que lo arregle. Si vos editás, la próxima vez que el agente toque esa página puede pisar tu cambio.

---

## Flujo de un día típico de curación

```
1. Identificá una población con poca cobertura en wiki/_hot.md
   (el agente lo escribe en cada ingest/lint).

2. Buscá 1-3 fuentes oficiales sobre esa población:
   - SCIJ para leyes.
   - Sitio de la institución relevante (INAMU, PANI, CONAPAM…) para
     manuales y protocolos.
   - Sala Constitucional si hay sentencias importantes del tema.

3. Bajá las fuentes a raw/ con nombres correctos (YYYY-MM-DD-slug.ext).

4. Por cada fuente: > /ingest raw/<archivo>
   - Leé el resumen, validá, confirmá.
   - El agente actualiza wiki/.

5. Probá con preguntas reales:
   > /query <una pregunta que haría alguien de esa población>
   - Si la respuesta es buena, perfecto.
   - Si revela un hueco, agregá la fuente que falta y volvé al paso 4.

6. Cada 10-20 ingests:
   > /lint
   - Resolvé la punch list con el agente.

7. git add . && git commit -m "ingest: <resumen del día>"
   git push origin dev

8. Anotá en el log mental: "qué población quedó cubierta hoy, qué huecos
   sigo viendo". Eso guía la próxima sesión.
```

**Ritmo realista:** 3-5 fuentes por sesión de 1-2 horas. No intentes ingerir 30 fuentes seguidas — el agente alcanza su contexto y las páginas pierden calidad.

---

## Cheatsheet (imprimible)

```
┌─────────────────────────────────────────────────────────────────┐
│  RAW: lo que vos hacés                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Solo fuentes oficiales (.go.cr, SCIJ, SalaIV, tratados)     │
│  ✓ Nombre: YYYY-MM-DD-slug-kebab-case.ext                      │
│  ✓ Todo plano en raw/, sin subcarpetas (excepto assets/)       │
│  ✗ NUNCA modificás la fuente                                    │
│  ✗ NUNCA escribís en wiki/ a mano                               │
│  ✗ NUNCA subís casos personales o documentos privados           │
│                                                                 │
│  COMANDOS                                                       │
│  > /ingest raw/<archivo>     procesar fuente                    │
│  > /query <pregunta>          probar respuestas                 │
│  > /lint                      auditar wiki cada 10-20 ingests   │
│                                                                 │
│  ANTES DE INGEST                                                │
│  [ ] fuente oficial                                             │
│  [ ] URL verificable                                            │
│  [ ] nombre con fecha+slug                                      │
│  [ ] PDF legible (no escaneo)                                   │
│  [ ] versión vigente                                            │
│  [ ] traje también las reformas                                 │
│                                                                 │
│  DURANTE INGEST                                                 │
│  [ ] leí el resumen del agente                                  │
│  [ ] validé teléfonos contra sitio oficial                      │
│  [ ] aprobé nombres de situaciones                              │
│  [ ] toda afirmación legal tiene cita                           │
│                                                                 │
│  DESPUÉS                                                        │
│  [ ] /query con una pregunta real de esa población              │
│  [ ] git commit + push a dev                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Preguntas frecuentes

**¿Y si quiero apurar el proceso y editar el markdown del `wiki/` yo mismo?**

No lo hagas. Lo que parece más rápido se convierte en deuda: el agente la próxima vez que toque esa página puede pisar tu cambio, o peor, dejar una página inconsistente con el resto del wiki. Si una página necesita un fix urgente, decíle al agente: *"Editá `wiki/situaciones/me-pega-mi-pareja.md` para que <X>"*.

**¿Y si la fuente está en inglés (tratado internacional, manual de OACNUDH)?**

Bajala igual a `raw/`. El agente la lee en inglés pero genera las páginas en español. Anotá en el nombre que es en inglés: `2026-05-21-cedaw-text-en.pdf`.

**¿Y si encuentro un blog buenísimo que explica una ley?**

No entra a `raw/`. Si te sirve como pista, usalo vos para encontrar la ley original (que cita), y bajá la ley original al `raw/`. El blog se queda como referencia mental.

**¿Y si la institución cambió su teléfono?**

Decíle al agente: *"Actualizá `wiki/instituciones/inamu.md` con el teléfono nuevo XXX-XXXX según <fuente oficial>, y subí `ultima_verificacion` a hoy."*

**¿Y si hay una contradicción entre dos leyes?**

Eso es exactamente lo que el agente está diseñado para detectar y marcar. Cuando ingerís la segunda, va a aparecer un callout `> [!contradiccion]` en la página afectada. **No la resuelvas vos solo** — es decisión legal. Marcala en el log y resolvela con alguien con formación legal.

**¿Y si no sé si una fuente es oficial?**

Regla de oro: dominio `.go.cr` o `.cr` con sello institucional claro. Si dudás, no la subas. Mejor preguntar antes que contaminar `raw/`.

---

## Si solo vas a leer una cosa de toda esta guía

> **Vos pones fuentes oficiales en `raw/` con nombre `YYYY-MM-DD-slug.ext`. Pedís `/ingest`. Validás lo que el agente propone. Nunca editás `wiki/` a mano. Nunca subís nada que no sea oficial.**
