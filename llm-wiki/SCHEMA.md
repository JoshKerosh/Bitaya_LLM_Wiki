# BITAYA Incluye — LLM Wiki Schema

## Purpose

This wiki compiles Costa Rica laws and institutional information into structured, cross-referenced pages for use in the BITAYA Incluye social orientation assistant.

## Compilation Rules

When compiling raw/ into wiki pages, the LLM must:

1. **One page per topic** — institution, law, vulnerability category, or service type.
2. **Cross-link** — use `[[page-name]]` to link related pages.
3. **Extract actionable info** — what a vulnerable person actually needs to know.
4. **Plain Spanish** — no institutional jargon. Assume reader has basic literacy.
5. **Never invent** — only use content found in raw/ sources. Cite source file.
6. **Flag contradictions** — if two sources conflict, note both and flag for human review.
7. **Update, don't duplicate** — if a wiki page exists, update it rather than create a new one.

## Wiki Page Structure

```markdown
---
title: <Topic>
category: <institution | law | service | vulnerability>
related: [<page-name>, ...]
sources: [<raw/filename>, ...]
last_compiled: <date>
---

## Qué es

<One paragraph: what this is in plain language>

## A quién ayuda

<Bullet list: populations this serves>

## Qué ofrece / Qué dice la ley

<Bullet list: concrete services, rights, protections>

## Cómo acceder

<Step-by-step: what a person must do to get help>

## Datos que piden

<Bullet list: documents/info commonly required>

## Contacto

<Phone, website, address if available>

## Advertencia

<Any limitations, what this does NOT cover>

## Ver también

<[[related-page]] links>
```

## Folder Structure

```
llm-wiki/
├── SCHEMA.md          ← this file
├── raw/               ← immutable source documents
│   ├── laws/          ← SINALEVI laws + Asamblea
│   ├── institutions/  ← IMAS, INAMU, PANI, etc.
│   └── programs/      ← specific programs and services
└── wiki/              ← compiled output (LLM writes here)
    ├── index.md       ← master index of all pages
    ├── institutions/
    ├── laws/
    ├── services/
    └── vulnerability-categories/
```

## Index Format (wiki/index.md)

```markdown
# BITAYA Incluye — Knowledge Index

## Institutions
- [[imas]] — apoyo social y superación de pobreza
- [[inamu]] — derechos y protección de mujeres
...

## Laws
- [[ley-7600]] — igualdad de oportunidades, discapacidad
...

## Vulnerability Categories
- [[embarazo-vulnerable]]
- [[violencia-domestica]]
...
```

## Compile Prompt (for Claude Code / LLM)

```
Read all files in llm-wiki/raw/.
For each source file, update or create the corresponding wiki page in llm-wiki/wiki/.
Follow SCHEMA.md structure exactly.
Use plain Spanish. No jargon.
Cross-link related pages with [[page-name]].
Update wiki/index.md with any new pages.
Never invent information not present in raw/ sources.
Flag contradictions with: > ⚠️ CONFLICTO: ...
```
