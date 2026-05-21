#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  extractTitle,
  loadWiki,
  searchWiki,
  type WikiPage,
} from "./wiki.ts";

// IMPORTANT: stdio MCP servers MUST NOT write to stdout — only to stderr.
const log = (msg: string) => process.stderr.write(`[bitaya-mcp] ${msg}\n`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.WIKI_ROOT
  ? path.resolve(process.env.WIKI_ROOT)
  : path.resolve(__dirname, "..");
const WIKI_DIR = path.join(PROJECT_ROOT, "wiki");

function asJson(value: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(value, null, 2) },
    ],
  };
}

function asText(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function pageByPath(pages: WikiPage[], requested: string): WikiPage | undefined {
  const normalized = requested
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");
  // Try exact match first
  const exact = pages.find((p) => p.relPath === normalized);
  if (exact) return exact;
  // Try with wiki/ prefix
  const withPrefix = normalized.startsWith("wiki/")
    ? normalized
    : `wiki/${normalized}`;
  const prefixed = pages.find((p) => p.relPath === withPrefix);
  if (prefixed) return prefixed;
  // Try suffix match (filename only)
  const base = normalized.endsWith(".md") ? normalized : `${normalized}.md`;
  return pages.find(
    (p) => p.relPath.endsWith(`/${base}`) || p.relPath === base,
  );
}

async function main() {
  log(`Cargando wiki desde ${WIKI_DIR}...`);
  let pages = await loadWiki(WIKI_DIR, PROJECT_ROOT);
  log(`Cargadas ${pages.length} páginas.`);

  const mcp = new McpServer(
    { name: "bitaya-wiki", version: "0.1.0" },
    {
      capabilities: {
        tools: { listChanged: false },
      },
    },
  );

  mcp.registerTool(
    "search_wiki",
    {
      title: "Buscar en el wiki",
      description:
        "Búsqueda por palabras clave sobre el wiki BITAYA Incluye (derechos, leyes, situaciones, instituciones en Costa Rica). Devuelve páginas rankeadas con título, ruta, score y snippet.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            "Consulta en lenguaje natural o palabras clave. Ej: 'me pega mi pareja', 'ley 7600', 'PANI niñez'.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe("Máximo de resultados (default 10)."),
      },
    },
    async ({ query, limit }) => {
      const hits = searchWiki(pages, query, limit ?? 10);
      return asJson({
        query,
        total: hits.length,
        results: hits,
      });
    },
  );

  mcp.registerTool(
    "get_page",
    {
      title: "Leer página del wiki",
      description:
        "Devuelve el markdown completo de una página del wiki. Acepta ruta relativa (ej. 'wiki/situaciones/me-pega-mi-pareja.md') o solo el nombre del archivo.",
      inputSchema: {
        path: z
          .string()
          .min(1)
          .describe("Ruta de la página, ej. 'wiki/leyes/ley-7586-violencia-domestica.md' o 'me-pega-mi-pareja'."),
      },
    },
    async ({ path: requested }) => {
      const page = pageByPath(pages, requested);
      if (!page) {
        return asText(
          `No encontré una página que coincida con "${requested}". Usá search_wiki primero o list_section para ver qué existe.`,
        );
      }
      return asJson({
        path: page.relPath,
        title: extractTitle(page.content, page.relPath),
        content: page.content,
      });
    },
  );

  mcp.registerTool(
    "list_section",
    {
      title: "Listar páginas de una sección",
      description:
        "Lista páginas de una sección del wiki (situaciones, derechos, leyes, instituciones, procedimientos, glosario, sources, synthesis). Sin argumento devuelve el listado de secciones.",
      inputSchema: {
        section: z
          .string()
          .optional()
          .describe(
            "Sección: situaciones | derechos | leyes | instituciones | procedimientos | glosario | sources | synthesis. Omití para listar todas las secciones.",
          ),
      },
    },
    async ({ section }) => {
      if (!section) {
        const sections = new Map<string, number>();
        for (const p of pages) {
          const parts = p.relPath.split("/");
          if (parts[0] === "wiki" && parts.length >= 3) {
            sections.set(parts[1], (sections.get(parts[1]) ?? 0) + 1);
          }
        }
        return asJson({
          sections: [...sections.entries()].map(([name, count]) => ({
            name,
            pages: count,
          })),
        });
      }
      const prefix = `wiki/${section}/`;
      const inSection = pages
        .filter((p) => p.relPath.startsWith(prefix) && !p.relPath.endsWith("/_index.md"))
        .map((p) => ({
          path: p.relPath,
          title: extractTitle(p.content, p.relPath),
        }));
      return asJson({ section, pages: inSection });
    },
  );

  mcp.registerTool(
    "reload_wiki",
    {
      title: "Recargar wiki desde disco",
      description:
        "Re-lee todos los archivos de wiki/ desde disco. Útil después de un /ingest o de editar páginas manualmente.",
      inputSchema: {},
    },
    async () => {
      pages = await loadWiki(WIKI_DIR, PROJECT_ROOT);
      log(`Recargadas ${pages.length} páginas.`);
      return asText(`Recargadas ${pages.length} páginas.`);
    },
  );

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  log("MCP server listo sobre stdio.");
}

main().catch((err) => {
  log(`Fatal: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
  process.exit(1);
});
