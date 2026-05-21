import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface WikiPage {
  relPath: string;
  content: string;
}

export async function listMarkdown(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listMarkdown(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

export async function loadWiki(
  wikiDir: string,
  projectRoot: string,
): Promise<WikiPage[]> {
  const files = await listMarkdown(wikiDir);
  files.sort();
  const pages: WikiPage[] = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    pages.push({
      relPath: path.relative(projectRoot, file),
      content,
    });
  }
  return pages;
}

export function extractTitle(content: string, relPath: string): string {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (titleMatch) return titleMatch[1].trim().replace(/^["']|["']$/g, "");
  }
  return path.basename(relPath, ".md");
}

export function extractFrontmatter(content: string): Record<string, string> {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const out: Record<string, string> = {};
  for (const line of fmMatch[1].split("\n")) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

export function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

export interface SearchHit {
  relPath: string;
  title: string;
  score: number;
  snippet: string;
}

// Palabras vacías en español + inglés que no aportan retrieval.
const STOPWORDS = new Set([
  "que", "los", "las", "del", "por", "para", "con", "una", "uno", "como",
  "pero", "más", "mas", "esta", "este", "esto", "estos", "estas", "soy",
  "ser", "fue", "han", "ha", "hay", "hace", "hacer", "haga", "hago", "haces",
  "the", "and", "for", "you", "are", "what", "how", "this", "that",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

// Prefijo morfológico: para términos de >=5 letras, quita la última vocal/s
// para captar variantes (pego/pega/pegó, novio/novia, hijos/hija).
function stem(term: string): string {
  if (term.length <= 4) return term;
  return term.replace(/(os|as|es|s|o|a|e)$/, "");
}

const SECTION_BOOST: Record<string, number> = {
  situaciones: 8,
  derechos: 3,
  procedimientos: 3,
  leyes: 1,
  instituciones: 1,
  glosario: 1,
};

export function searchWiki(
  pages: WikiPage[],
  query: string,
  limit = 10,
): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const stems = terms.map(stem).filter((s) => s.length >= 3);

  const hits: SearchHit[] = [];
  for (const page of pages) {
    const body = stripFrontmatter(page.content);
    const title = extractTitle(page.content, page.relPath);
    const haystack = `${title}\n${body}`;
    const haystackNorm = normalize(haystack);
    const titleNorm = normalize(title);
    const pathNorm = normalize(page.relPath);

    let score = 0;
    let matchedTerms = 0;

    for (const s of stems) {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "g");
      const matches = haystackNorm.match(re);
      if (matches) {
        score += matches.length;
        matchedTerms += 1;
      }
      if (titleNorm.includes(s)) score += 6;
      if (pathNorm.includes(s)) score += 4;
    }

    if (matchedTerms === 0) continue;

    // Penaliza páginas que solo matchearon 1 término genérico cuando hay varios
    if (stems.length >= 2 && matchedTerms === 1) score = Math.floor(score / 2);

    // Boost por sección (situaciones es la puerta de entrada)
    const section = page.relPath.split("/")[1];
    if (section && SECTION_BOOST[section]) score += SECTION_BOOST[section];

    // Penaliza _index.md (son catálogos, no respuestas)
    if (page.relPath.endsWith("/_index.md")) score = Math.floor(score / 3);

    // Encontrar el primer match para el snippet
    let snippetIdx = -1;
    for (const s of stems) {
      const idx = haystackNorm.indexOf(s);
      if (idx !== -1) {
        snippetIdx = idx;
        break;
      }
    }
    const start = Math.max(0, snippetIdx - 80);
    const end = Math.min(haystack.length, (snippetIdx === -1 ? 0 : snippetIdx) + 200);
    const snippet = haystack
      .slice(start, end)
      .replace(/\s+/g, " ")
      .trim();

    hits.push({
      relPath: page.relPath,
      title,
      score,
      snippet:
        (start > 0 ? "…" : "") + snippet + (end < haystack.length ? "…" : ""),
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
