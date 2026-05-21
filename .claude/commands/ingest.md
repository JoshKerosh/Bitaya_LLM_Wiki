---
description: Procesa una fuente oficial (ley, sentencia, manual) e integrala al wiki
argument-hint: <ruta-a-raw/...-o-URL>
---

Procesá la fuente: **$ARGUMENTS**

Seguí estrictamente el workflow `/ingest` definido en `CLAUDE.md`:

1. Si es URL (preferentemente de SCIJ, Sala Constitucional, Poder Judicial, INAMU, PANI, MTSS, CCSS, Defensoría, etc.), bajá el contenido a `raw/` con nombre `YYYY-MM-DD-slug.<ext>`. Si es ruta a `raw/`, leela completa.
2. **Antes de escribir nada**, resumime los puntos clave en lenguaje claro y pedime confirmación de qué cubrir.
3. Creá `wiki/sources/YYYY-MM-DD-<slug>.md` desde `_templates/source.md` con resumen, citas textuales y extracción de claims con número de artículo/párrafo.
4. Si es una ley: creá `wiki/leyes/<nombre>.md` desde `_templates/ley.md` con artículos clave en castellano simple.
5. Actualizá `wiki/instituciones/<institucion>.md` para cada entidad mencionada (verificá teléfonos y horarios — marcá `status: necesita-verificar` si no podés confirmar).
6. Actualizá `wiki/derechos/<derecho>.md` para cada derecho protegido.
7. Creá `wiki/procedimientos/<nombre>.md` para cada trámite o recurso que la fuente describa (denuncias, medidas cautelares, prestaciones, amparos).
8. **Lo más importante:** identificá las situaciones reales de la vida cotidiana que esta fuente cubre. Creá o actualizá `wiki/situaciones/<descripcion-en-primera-persona>.md` desde `_templates/situacion.md`. Una ley típicamente cubre varias situaciones.
9. Para cada término técnico que aparezca: creá una entrada en `wiki/glosario/<termino>.md` con explicación en castellano simple.
10. **Contradicciones:** si algo en la fuente contradice un claim ya publicado, insertá `> [!contradiccion]` debajo del claim viejo (ver política en `CLAUDE.md`). Nunca sobrescribir en silencio.
11. **`ultima_verificacion`:** setealo a hoy en cada página creada o reescrita.
12. Actualizá el `_index.md` de cada sección tocada con la página nueva y su one-liner.
13. Actualizá `wiki/index.md` (contadores por sección, estado, última fuente).
14. **Reescribí `wiki/_hot.md`:** qué cubre densamente el wiki ahora y qué huecos quedan abiertos.
15. Appendeá a `wiki/log.md`: `## [YYYY-MM-DD] ingest | <título>` + 3-5 bullets con páginas tocadas, contradicciones encontradas, situaciones nuevas desbloqueadas.
16. Reportame el resumen: páginas creadas, páginas actualizadas, contradicciones marcadas, preguntas abiertas.

**Recordá:**
- Toda afirmación legal lleva cita.
- Toda página de cara al público lleva el aviso legal obligatorio.
- Verificá teléfonos e instituciones contra la fuente; no inventes.
- **Gate de calidad:** una fuente bien procesada toca **10-20 páginas**. Si solo creás 1-2, marcá `calidad: baja` en el log y avisame.
