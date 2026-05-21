import "dotenv/config";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { extractTitle, loadWiki, type WikiPage } from "./wiki.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WIKI_DIR = path.join(PROJECT_ROOT, "wiki");
const PORT = Number(process.env.PORT ?? 8000);
const MODEL = process.env.BITAYA_MODEL ?? "sonnet";
const CLAUDE_CMD = process.env.BITAYA_CLAUDE_CMD ?? "claude";
const TIMEOUT_MS = Number(process.env.BITAYA_TIMEOUT_MS ?? 120000);

function formatWikiForPrompt(pages: WikiPage[]): string {
  return pages
    .map((p) => `\n\n===== FILE: ${p.relPath} =====\n${p.content}`)
    .join("");
}

const SYSTEM_RULES = `Sos el asistente público del wiki BITAYA Incluye. Tu audiencia son personas vulnerables en Costa Rica: víctimas de violencia, niñez, adultos mayores, personas con discapacidad, migrantes, LGBTIQ+, trabajadoras del hogar. **No son abogados.**

REGLAS DURAS:
- Castellano de Costa Rica simple. Frases cortas. Segunda persona ("vos") o ustedeo neutro.
- Empezá por lo accionable, no por teoría.
- **Nunca des asesoría legal específica de un caso.** Referí siempre a Defensa Pública (800-800-3000), consultorios jurídicos gratuitos UCR/UNA/ULACIT, o Defensoría de los Habitantes (800-258-7474).
- **Nunca inventes una ley, artículo, teléfono o sentencia.** Si no está en el wiki que te paso, decílo y pedí que se ingiera la fuente.
- **Toda afirmación legal load-bearing necesita cita** del wiki (formato \`wiki/ruta/pagina.md\`).
- Si una página tiene \`ultima_verificacion\` viejo (>6m instituciones/procedimientos, >18m leyes), avisá: "Verificado por última vez el YYYY-MM-DD — puede haber cambiado."
- Si encontrás un callout \`> [!contradiccion]\` no resuelto sobre algo relevante, avisalo antes de responder.

ESTRUCTURA DE RESPUESTA (cuando aplique):
1. ¿Esto está mal? (sí/no + qué derecho se está violando)
2. Qué te protege (ley + artículo + cita)
3. Qué hacer HOY (pasos numerados accionables)
4. A quién llamar / dónde ir (institución + teléfono + horario + si es gratis)
5. Qué llevar (cédula, pruebas, testigos)
6. Si no te hacen caso (escalamiento)

CIERRE OBLIGATORIO al final de toda respuesta sustantiva (incluilo en answer):
"---
**Esto no es asesoría legal.** Es información para que sepás qué leyes te protegen y a quién acudir. Para tu caso, buscá ayuda gratuita en la **Defensa Pública (800-800-3000)**, los consultorios jurídicos gratuitos de UCR/UNA/ULACIT, o la **Defensoría de los Habitantes (800-258-7474)**."

FORMATO DE SALIDA: respondé SIEMPRE en JSON estricto (sin code fences, sin texto antes ni después), así:
{
  "answer": "<la respuesta completa en markdown, incluyendo el aviso legal>",
  "sources": [
    { "title": "<título humano de la página>", "url": "wiki/situaciones/me-pega-mi-pareja.md" }
  ]
}

\`sources\` lista solo las páginas del wiki que efectivamente usaste para responder, con la ruta relativa completa. Si la pregunta no tiene respuesta en el wiki, devolvé \`answer\` explicando con humildad qué falta y \`sources: []\`.`;

interface ParsedResponse {
  answer: string;
  sources: { title: string; url: string }[];
}

function parseAnswerJson(text: string, pages: WikiPage[]): ParsedResponse {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    return { answer: text.trim(), sources: [] };
  }
  try {
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const answer = typeof parsed.answer === "string" ? parsed.answer : text;
    const rawSources = Array.isArray(parsed.sources) ? parsed.sources : [];
    const validPaths = new Set(pages.map((p) => p.relPath));
    const sources = rawSources
      .filter(
        (s: unknown): s is { title?: string; url?: string } =>
          !!s && typeof s === "object",
      )
      .map((s: { title?: string; url?: string }) => {
        const url = typeof s.url === "string" ? s.url : "";
        const normalized = url.replace(/^\.\//, "").replace(/^\/+/, "");
        const page = pages.find((p) => p.relPath === normalized);
        const title =
          typeof s.title === "string" && s.title.trim()
            ? s.title.trim()
            : page
              ? extractTitle(page.content, page.relPath)
              : normalized;
        return { title, url: normalized };
      })
      .filter((s: { url: string }) => validPaths.has(s.url));
    return { answer, sources };
  } catch {
    return { answer: text.trim(), sources: [] };
  }
}

interface ClaudeCliJson {
  type?: string;
  subtype?: string;
  result?: string;
  is_error?: boolean;
  total_cost_usd?: number;
  duration_ms?: number;
}

function extractResultText(stdout: string): string {
  const trimmed = stdout.trim();
  if (!trimmed) return "";
  // claude -p --output-format json returns one JSON object on stdout
  try {
    const parsed = JSON.parse(trimmed) as ClaudeCliJson;
    if (typeof parsed.result === "string") return parsed.result;
  } catch {
    // Some versions stream NDJSON; take last line that parses with .result
    const lines = trimmed.split("\n").filter((l) => l.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]) as ClaudeCliJson;
        if (typeof parsed.result === "string") return parsed.result;
      } catch {
        // ignore
      }
    }
  }
  return trimmed;
}

function spawnClaude(userMessage: string): Promise<{ result: string; durationMs: number; costUsd?: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = [
      "-p",
      "--output-format", "json",
      "--no-session-persistence",
      "--tools", "",
      "--system-prompt", SYSTEM_RULES,
      "--model", MODEL,
      "--permission-mode", "bypassPermissions",
    ];
    const child = spawn(CLAUDE_CMD, args, {
      cwd: PROJECT_ROOT,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`claude tardó más de ${TIMEOUT_MS / 1000}s`));
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if ("code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            `No encontré el CLI '${CLAUDE_CMD}' en PATH. Instalá Claude Code o seteá BITAYA_CLAUDE_CMD.`,
          ),
        );
        return;
      }
      reject(err);
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8").trim();
      if (code !== 0) {
        reject(
          new Error(
            `claude exit ${code}${stderr ? `\nstderr: ${stderr.slice(0, 500)}` : ""}`,
          ),
        );
        return;
      }

      // Try to extract cost/duration from the top-level JSON envelope
      let costUsd: number | undefined;
      try {
        const env = JSON.parse(stdout.trim()) as ClaudeCliJson;
        if (typeof env.total_cost_usd === "number") costUsd = env.total_cost_usd;
      } catch {
        // ignore
      }

      const result = extractResultText(stdout);
      resolve({ result, durationMs: Date.now() - startedAt, costUsd });
    });

    child.stdin.write(userMessage);
    child.stdin.end();
  });
}

async function main() {
  console.log(`[bitaya] Cargando wiki desde ${WIKI_DIR}...`);
  const pages = await loadWiki(WIKI_DIR, PROJECT_ROOT);
  const wikiBlock = formatWikiForPrompt(pages);
  console.log(
    `[bitaya] Cargadas ${pages.length} páginas (${(wikiBlock.length / 1024).toFixed(1)} KB).`,
  );
  console.log(`[bitaya] CLI: ${CLAUDE_CMD}  model: ${MODEL}`);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, pages: pages.length, cli: CLAUDE_CMD, model: MODEL });
  });

  app.post("/api/chat", async (req, res) => {
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      res.status(400).json({ error: "Falta el campo 'message'." });
      return;
    }

    const userPayload = `=== CONTENIDO DEL WIKI BITAYA INCLUYE ===
${wikiBlock}

=== PREGUNTA DEL USUARIO ===
${message}

Respondé en JSON estricto como te pedí en el system prompt.`;

    try {
      console.log(`[bitaya] /api/chat ← "${message.slice(0, 80)}"`);
      const { result, durationMs, costUsd } = await spawnClaude(userPayload);
      const parsed = parseAnswerJson(result, pages);
      console.log(
        `[bitaya] /api/chat → ${parsed.sources.length} sources, ${durationMs}ms${
          costUsd !== undefined ? `, $${costUsd.toFixed(4)}` : ""
        }`,
      );
      res.json(parsed);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[bitaya] Error:", detail);
      res.status(500).json({ error: "No pudimos obtener una respuesta.", detail });
    }
  });

  app.listen(PORT, () => {
    console.log(`[bitaya] Listo en http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[bitaya] Fatal:", err);
  process.exit(1);
});
