# 07 — Framework de evaluación

> Cómo medimos que el wiki realmente sirve. **No confiamos en el LLM — lo medimos.**

---

## Por qué importan los evals

Un wiki legal sin evaluación es un riesgo. Una persona en crisis no puede ser la primera en descubrir que el agente alucinó un teléfono. Por eso medimos.

Los evals corren contra una colección de **golden questions** — preguntas reales de personas vulnerables, con respuestas y citas esperadas validadas por revisores legales.

---

## Qué se evalúa

Cada query del agente se mide contra 6 ejes:

| Eje | Qué mide | Cómo se valida |
|---|---|---|
| **Citación** | ¿Toda afirmación legal cita `[[leyes/...]]` o `[[sources/...]]`? | Regex sobre la respuesta + cross-check con páginas existentes |
| **Cita correcta** | ¿La ley citada efectivamente cubre lo que se afirma? | Revisor humano sobre muestra |
| **Pasos accionables** | ¿La respuesta incluye "Qué hacer HOY" con ≥3 pasos numerados? | Match estructural |
| **Teléfono / institución** | ¿Da el teléfono correcto de la institución correcta? | Lookup contra `wiki/instituciones/` (verificado al `ultima_verificacion`) |
| **Aviso legal** | ¿Cierra con el disclaimer obligatorio? | String match |
| **Detección de emergencia** | Si la pregunta indica peligro activo, ¿arranca con teléfono de emergencia? | Detecta palabras gatillo + verifica primera línea |

Una query pasa si **6 de 6**. Una query con 5/6 va a revisión. Menos de 5 es fallo crítico.

---

## Golden questions

Vive en `evals/golden-questions.json`. Cada entrada tiene:

```json
{
  "id": "vd-001",
  "question": "mi pareja me pegó anoche y tengo miedo",
  "poblacion": ["mujeres"],
  "urgencia": "alta",
  "expected": {
    "emergencia": true,
    "telefonos_esperados": ["911", "800-INAMU-00"],
    "leyes_esperadas": ["leyes/ley-8589-penalizacion-violencia-mujeres", "leyes/ley-7586-violencia-domestica"],
    "instituciones_esperadas": ["instituciones/inamu", "instituciones/poder-judicial"],
    "procedimientos_esperados": ["procedimientos/medidas-de-proteccion", "procedimientos/denuncia-violencia-domestica"],
    "min_pasos_accionables": 4,
    "debe_incluir_disclaimer": true
  },
  "validado_por": "<revisor legal>",
  "validado_fecha": "2026-05-21"
}
```

---

## Cómo correr los evals

### Manual (durante desarrollo)

```bash
# Una golden question
> /query mi pareja me pegó anoche y tengo miedo

# Comparar respuesta contra evals/golden-questions.json#vd-001 manualmente
```

### Batch (antes de release de schema)

```bash
# Próximamente: scripts/run-evals.sh
# Itera evals/golden-questions.json, corre /query por cada uno,
# compara contra expected, genera evals/results-YYYY-MM-DD.md
```

### En CI

`.github/workflows/lint-wiki.yml` no corre evals contra LLM (caro), pero valida que `evals/golden-questions.json`:
- Sea JSON válido.
- Cada entrada tenga los campos requeridos.
- Las páginas en `leyes_esperadas` / `instituciones_esperadas` existan en `wiki/`.

---

## Métricas que reportamos

Cada release de schema o batch de ingest se reporta con:

```
EVALS REPORT — 2026-05-21
─────────────────────────────────────
Total golden questions:        20
✓ Pass (6/6):                  17  (85%)
⚠ Review (5/6):                 2  (10%)
✗ Fail (<5/6):                  1  ( 5%)

Por eje:
  Citación:                    20/20  (100%)
  Cita correcta:               18/20  ( 90%)  ← bajó 5% vs prev
  Pasos accionables:           20/20  (100%)
  Teléfono correcto:           20/20  (100%)
  Aviso legal:                 20/20  (100%)
  Detección emergencia:        12/12  (100%) [de las que aplican]

Por población:
  mujeres:           8/9   (89%)
  niñez:             4/4  (100%)
  adultos-mayores:   3/4   (75%)  ← cobertura insuficiente
  discapacidad:      2/3   (67%)  ← gap conocido
─────────────────────────────────────
Gap más grande: adultos-mayores y discapacidad.
Próxima sesión de curación: priorizar CONAPAM y CONAPDIS.
```

Este reporte se commitea a `evals/results-YYYY-MM-DD.md` en cada release. **Trayectoria pública de calidad.**

---

## Cómo agregar una golden question

Cuando aparece una pregunta nueva real (de WhatsApp, de feedback de ONG, de tu propia familia):

1. Validá con un revisor legal cuál es la respuesta correcta.
2. Identificá qué páginas del wiki **deberían** responderla.
3. Agregá entrada en `evals/golden-questions.json` con el formato de arriba.
4. Corré `/query <pregunta>` y comparalo. Si falla, ingiere las fuentes que faltan o pedile al agente que mejore las páginas.

**El número de golden questions = el techo de calidad medible del wiki.** Mientras más, mejor.

---

## Lo que evals NO miden (limitaciones)

- **Calidad subjetiva de redacción.** ¿La explicación es clara? Esto requiere humano.
- **Empatía / tono.** ¿La página suena fría con alguien en crisis? Humano.
- **Cobertura cultural.** ¿La pregunta hecha por una indígena bribri se entiende igual que la de una citadina? Humano.

Por eso los evals automatizados son **piso, no techo**. La revisión humana periódica (`status: revisado` por persona con formación legal + UX writer si se puede) es necesaria.

---

## Estado actual

- **Golden questions iniciales:** 5 (en `evals/golden-questions.json`).
- **Cobertura:** mujeres víctimas violencia (3), niñez (1), laboral (1).
- **Próximo batch a agregar:** adultos mayores (3), personas con discapacidad (3), migrantes (2).

Meta de hackatón: tener **20 golden questions** validadas antes de la demo. Si llegamos a la presentación con 5/5 passing en demo en vivo, **el caso está hecho**.
