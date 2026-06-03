// Parseo de la respuesta JSON del modelo, compartido entre el server (index.ts)
// y el eval runner (evals/run-evals.ts).
//
// Los LLM a veces emiten comillas dobles sin escapar dentro de "answer", lo que
// invalida el JSON. Sin reparación, el usuario vería el JSON crudo (bug detectado
// por los evals el 2026-06-03, pregunta disc-001). El repair pass extrae "answer"
// por anclas estructurales ("answer": "..." , "sources") en vez de confiar en
// JSON.parse.

import { extractTitle, type WikiPage } from "./wiki.ts";

export interface RawParsed {
  answer: string;
  rawUrls: string[];
}

export interface ParsedResponse {
  answer: string;
  sources: { title: string; url: string }[];
}

export function normalizeUrl(url: string): string {
  return url.replace(/^\.\//, "").replace(/^\/+/, "");
}

export function parseAnswerRaw(text: string): RawParsed {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    const region = text.slice(jsonStart, jsonEnd + 1);
    try {
      const parsed = JSON.parse(region);
      if (typeof parsed.answer === "string") {
        const rawUrls = Array.isArray(parsed.sources)
          ? parsed.sources
              .map((s: { url?: string }) => (typeof s?.url === "string" ? s.url : ""))
              .filter(Boolean)
          : [];
        return { answer: parsed.answer, rawUrls };
      }
    } catch {
      // repair pass abajo
    }
    // Reparación: extraer "answer" entre su apertura y el ancla `", "sources"`.
    const m = region.match(/"answer"\s*:\s*"([\s\S]*?)"\s*,\s*"sources"/);
    if (m) {
      const answer = m[1]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      const rawUrls = [...region.matchAll(/"url"\s*:\s*"([^"]+)"/g)].map((x) => x[1]);
      return { answer, rawUrls };
    }
  }
  return { answer: text.trim(), rawUrls: [] };
}

export function parseAnswerJson(text: string, pages: WikiPage[]): ParsedResponse {
  const { answer, rawUrls } = parseAnswerRaw(text);
  const validPaths = new Set(pages.map((p) => p.relPath));
  const sources = rawUrls
    .map((url) => {
      const normalized = normalizeUrl(url);
      const page = pages.find((p) => p.relPath === normalized);
      const title = page ? extractTitle(page.content, page.relPath) : normalized;
      return { title, url: normalized };
    })
    .filter((s) => validPaths.has(s.url));
  return { answer, sources };
}
