# 09 — Roadmap

> Qué pasa después del hackatón. Plan a 90 días + visión a 12 meses.

---

## Filosofía

No queremos ganar un hackatón y dormir el código. La asimetría de información que ataca el wiki **no espera**. Roadmap pensado para que cualquier persona (no solo nosotros) pueda continuar.

---

## Fase 0 — Hackatón (HOY)

✅ Patrón LLM Wiki instanciado para CR / poblaciones vulnerables.
✅ Schema, plantillas tipadas, slash commands.
✅ 10 documentos cubriendo pitch, arquitectura, uso, demo, curación, evals, seguridad, roadmap, comparativa.
✅ CI workflow que valida estructura.
✅ Framework de evals con golden questions iniciales.
🔄 **Por hacer antes de presentar:**
- [ ] Ingerir 1-2 leyes reales (recomendado: Ley 8589 y Ley 7586) para demo en vivo.
- [ ] Marcar ≥3 páginas como `status: revisado` (idealmente con revisor legal real).
- [ ] Pasar 5/5 golden questions en la demo.

---

## Fase 1 — Validación con ONG aliada (semana 1-4 post-hackatón)

**Objetivo:** comprobar que el wiki sirve a un caso de uso real, NO publicar todavía.

- **Semana 1:** identificar 1 ONG aliada (idealmente INAMU o una ONG de violencia doméstica que ya tenga línea de atención).
- **Semana 2:** ingerir las **20 fuentes oficiales más usadas** por esa ONG. Sesión de curación con la guía `docs/05-GUIA-CURADOR.md`.
- **Semana 3:** entrenar a 2-3 operadores de la ONG a usar `/query` durante sus consultas reales. Recolectar feedback.
- **Semana 4:** primera ronda de evals reales. Iterar schema y plantillas según gaps.

**Métrica de éxito:** ≥80% de las consultas reales que recibe la ONG en una semana se pueden responder con el wiki, citando ley + institución + pasos.

**Entregable:** `docs/postmortems/2026-XX-fase-1.md` con qué funcionó, qué no, qué cambiar.

---

## Fase 2 — Sitio público estático (mes 2-3)

**Objetivo:** el mismo wiki, accesible al público sin necesidad de Claude Code.

**Stack:** Astro + Starlight, deploy a Vercel/Netlify. El wiki markdown se renderiza directo.

- **Mes 2:** página por situación con SEO en español de CR. Diseño accesible (alto contraste, lectura simple, navegación por teclado).
- **Mes 2.5:** componente "preguntá al wiki" — interfaz de chat sobre el mismo wiki, sin necesidad de instalar nada. (LLM en backend con caché agresivo de queries comunes.)
- **Mes 3:** botón "quick exit" (cierra y redirige a sitio neutro). Mirror sobre Tor para zonas de control extremo.

**Métrica de éxito:** 1000 visitas únicas en el primer mes, ≥30% que llegan completan un "siguiente paso" (click a teléfono, ver dirección, descargar guía).

---

## Fase 3 — Canales offline-friendly (mes 4-6)

**Objetivo:** llegar a quien tiene WhatsApp pero no browser moderno, o quien tiene solo SMS.

- **Bot de WhatsApp** — consultas en lenguaje natural, respuestas con los mismos pasos accionables. Sobre el mismo wiki, sin re-implementar contenido. Stack: Twilio + LLM con RAG sobre el wiki.
- **Bot de SMS** — versión simplificada para feature phones. Respuestas en 3 SMS máximo: situación + teléfono + paso 1.
- **Guías impresas** — generación automática de PDFs por situación, para distribución en EBAIS, escuelas, oficinas del PANI/INAMU.

**Métrica de éxito:** 1 ONG aliada distribuye el bot a sus usuarias, ≥100 conversaciones en el primer mes.

---

## Fase 4 — Adopción institucional (mes 7-9)

**Objetivo:** que una institución oficial (INAMU, PANI, Defensoría, Defensa Pública) lo adopte oficialmente.

- Propuesta formal con métricas de Fase 1-3.
- Convenio de validación legal continua con UCR / Colegio de Abogados.
- Programa de voluntarios curadores (estudiantes de derecho).

**Métrica de éxito:** 1 institución lo enlaza desde su sitio oficial o lo recomienda en sus líneas de atención.

---

## Fase 5 — Réplica regional (mes 10-12)

**Objetivo:** abrir el patrón a otros países de Centroamérica.

- Fork por país (Honduras, Guatemala, Panamá, Nicaragua, El Salvador).
- Cambia: `raw/` (fuentes oficiales del país), idioma de instituciones (algunos términos varían).
- No cambia: schema, plantillas, slash commands, CI.

**Métrica de éxito:** 1 país adicional con wiki funcional y al menos 1 ONG aliada local.

---

## Visión a 12 meses (lo que querríamos ver)

```
┌──────────────────────────────────────────────────────────────────┐
│  BITAYA — diciembre 2026                                         │
├──────────────────────────────────────────────────────────────────┤
│  📚 Wiki CR:      ~300 páginas, 50+ fuentes, 8 poblaciones      │
│  🌐 Sitio:        ~10k visitas/mes, 35% conversión a acción     │
│  💬 WhatsApp bot: 500+ conversaciones/mes                        │
│  🏛️ Adopción:    INAMU + 3 ONGs aliadas                         │
│  🌎 Réplicas:     Honduras, Guatemala (forks activos)            │
│  ✅ Evals:        85+ golden questions, 90%+ pass rate           │
│  🤝 Curadores:    15 voluntarios activos, 5 revisores legales    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Quién hace qué

| Rol | Quién | Qué hace |
|---|---|---|
| **Mantenedor técnico** | [completar] | Schema, slash commands, CI, evals |
| **Curador líder** | [completar] | Coordina sesiones de ingest, valida calidad |
| **Curadores voluntarios** | Estudiantes derecho UCR/UNA | Suben fuentes oficiales según `docs/05-GUIA-CURADOR.md` |
| **Revisor legal** | Abogadas/os colegiados | Validan `draft → revisado` |
| **UX writer** | [completar] | Audita lenguaje claro, accesibilidad |
| **Comunicador** | [completar] | Difunde con ONGs, gobierno, medios |

---

## Cómo pedir ayuda / sumarte

- 💻 **Código / arquitectura:** PR a https://github.com/JoshKerosh/Bitaya_LLM_Wiki
- 📚 **Curación de fuentes:** leer `docs/05-GUIA-CURADOR.md` y arrancar
- ⚖️ **Validación legal:** email a [contacto] — necesitamos revisores
- 🎨 **Diseño / UX:** mirar `docs/09-ROADMAP.md` Fase 2 y proponer
- 🤝 **Aliado institucional:** si trabajás en INAMU/PANI/MTSS/Defensoría, hablemos

---

## Lo que NO está en roadmap (por ahora)

- ❌ App nativa iOS/Android — el costo no se justifica vs sitio web responsive + bot WhatsApp.
- ❌ LLM propio fine-tuneado — la disciplina de citación es del schema, no del modelo. Cambiar de proveedor es una variable de costo, no de calidad.
- ❌ Marketplace de servicios legales — fuera del alcance educativo.
- ❌ Wiki para empresas (B2B legal) — distrae de la misión social.

Si alguien quiere construir esto, fork y adelante. Los principios del patrón aplican.
