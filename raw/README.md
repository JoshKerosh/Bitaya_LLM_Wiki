# `raw/` — Fuentes oficiales

> **Acá adentro solo entra material oficial y sin modificar.** Esta carpeta es la fuente de verdad del wiki. Si algo está mal acá, todo el wiki queda comprometido.

📖 **Guía completa:** [`../docs/05-GUIA-CURADOR.md`](../docs/05-GUIA-CURADOR.md) ← leer antes de subir tu primera fuente

---

## Reglas rápidas

1. **Solo fuentes oficiales.** Dominio `.go.cr`, SCIJ, Sala Constitucional, Poder Judicial, tratados internacionales bajados de sitios oficiales. No blogs, no noticias, no Wikipedia, no output de IA.

2. **Nombre obligatorio:** `YYYY-MM-DD-slug-kebab-case.ext`
   - `YYYY-MM-DD` = fecha en que vos bajaste el archivo.
   - `slug` = título oficial en kebab-case, sin tildes ni mayúsculas.
   - `ext` = `pdf`, `md`, `html`, `txt`.
   - Ejemplo: `2026-05-21-ley-8589-penalizacion-violencia-mujeres.pdf`

3. **Todo plano.** No crear subcarpetas por tema. La única subcarpeta válida es `assets/` para imágenes/infografías.

4. **Nunca modificar.** Subí el archivo **exactamente como salió** de la fuente oficial. Si lo editás, el agente cita una versión que no existe.

5. **Nunca subir casos personales** (cédulas, contratos privados, documentos identificables de personas). El wiki es educativo, no contiene casos.

---

## Después de subir un archivo

```bash
# en Claude Code dentro del repo:
> /ingest raw/2026-05-21-tu-archivo.pdf
```

El agente lo lee, te resume, pide confirmación, y crea/actualiza páginas en `wiki/`. **Vos NO escribís ni editás nada en `wiki/`.** Si algo está mal, le pedís al agente que lo corrija.

---

## Si dudás si una fuente entra

Regla de oro: **"¿Le puedo mandar el link oficial a un juez si me pregunta?"** Si la respuesta es no, no entra acá.
