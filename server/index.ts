import "dotenv/config";
import { execFile, spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { buildWikiGraph, loadWiki, type WikiPage } from "./wiki.ts";
import { ANALYZE_RULES, SYSTEM_RULES } from "./prompts.ts";
import { parseAnswerJson } from "./parse.ts";

const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WIKI_DIR = path.join(PROJECT_ROOT, "wiki");
const PORT = Number(process.env.PORT ?? 8001);
const MODEL = process.env.BITAYA_MODEL ?? "sonnet";
const CLAUDE_CMD = process.env.BITAYA_CLAUDE_CMD ?? "claude";
const TIMEOUT_MS = Number(process.env.BITAYA_TIMEOUT_MS ?? 120000);

function formatWikiForPrompt(pages: WikiPage[]): string {
  return pages
    .map((p) => `\n\n===== FILE: ${p.relPath} =====\n${p.content}`)
    .join("");
}


type UrgencyLevel = "Alta" | "Media-alta" | "Media" | "Baja";

interface AnalyzeResponse {
  caseTitle: string;
  detectedSituation: string;
  vulnerabilityCategory: string;
  urgencyLevel: UrgencyLevel;
  suggestedInstitutions: string[];
  missingData: string[];
  nextSteps: string[];
  copyReadyMessage: string;
  officialSummary: string;
  responsibleAIWarning: string;
  humanReviewRequired: boolean;
  confidence: number;
  whyThisRoute: string[];
}

const VALID_URGENCY: UrgencyLevel[] = ["Alta", "Media-alta", "Media", "Baja"];

function strArray(v: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(v)) return fallback;
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function parseAnalyzeJson(text: string): AnalyzeResponse | null {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    const r = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>;
    const urgencyRaw = typeof r.urgencyLevel === "string" ? r.urgencyLevel : "Media";
    const urgencyLevel = (VALID_URGENCY as readonly string[]).includes(urgencyRaw)
      ? (urgencyRaw as UrgencyLevel)
      : "Media";
    return {
      caseTitle: typeof r.caseTitle === "string" ? r.caseTitle : "Situación a orientar",
      detectedSituation:
        typeof r.detectedSituation === "string"
          ? r.detectedSituation
          : "Situación vulnerable que requiere orientación.",
      vulnerabilityCategory:
        typeof r.vulnerabilityCategory === "string"
          ? r.vulnerabilityCategory
          : "Apoyo social",
      urgencyLevel,
      suggestedInstitutions: strArray(r.suggestedInstitutions, ["Defensoría de los Habitantes"]),
      missingData: strArray(r.missingData, []),
      nextSteps: strArray(r.nextSteps, []),
      copyReadyMessage:
        typeof r.copyReadyMessage === "string"
          ? r.copyReadyMessage
          : "Buenas, necesito orientación sobre mi situación.",
      officialSummary:
        typeof r.officialSummary === "string"
          ? r.officialSummary
          : "Persona solicita orientación.",
      responsibleAIWarning:
        typeof r.responsibleAIWarning === "string"
          ? r.responsibleAIWarning
          : "Esta orientación es informativa. La IA no determina elegibilidad ni reemplaza la atención humana.",
      humanReviewRequired: true,
      confidence:
        typeof r.confidence === "number" && r.confidence >= 0 && r.confidence <= 1
          ? r.confidence
          : 0.7,
      whyThisRoute: strArray(r.whyThisRoute, []),
    };
  } catch {
    return null;
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

// Temp dir for system prompt files — avoids Windows shell quoting issues with --system-prompt
const PROMPT_TMPDIR = mkdtempSync(path.join(tmpdir(), "bitaya-"));

function writePromptFile(name: string, content: string): string {
  const filePath = path.join(PROMPT_TMPDIR, name);
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

const SYSTEM_RULES_FILE = writePromptFile("chat-system.txt", SYSTEM_RULES);
const ANALYZE_RULES_FILE = writePromptFile("analyze-system.txt", ANALYZE_RULES);

function spawnClaude(
  userMessage: string,
  systemPromptFile: string = SYSTEM_RULES_FILE,
): Promise<{ result: string; durationMs: number; costUsd?: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = [
      "-p",
      "--output-format", "json",
      "--no-session-persistence",
      "--system-prompt-file", systemPromptFile,
      "--model", MODEL,
      "--permission-mode", "bypassPermissions",
    ];
    const child = spawn(CLAUDE_CMD, args, {
      cwd: PROMPT_TMPDIR,
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
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

interface CliReadiness {
  ready: boolean;
  version: string | null;
  error: string | null;
}

async function checkCliReady(): Promise<CliReadiness> {
  try {
    const { stdout } = await execFileP(CLAUDE_CMD, ["--version"], {
      timeout: 5000,
      shell: process.platform === "win32",
    });
    const version = stdout.split(/\r?\n/).find((l) => l.trim())?.trim() ?? null;
    return { ready: true, version, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isMissing = msg.includes("ENOENT");
    return {
      ready: false,
      version: null,
      error: isMissing
        ? `CLI '${CLAUDE_CMD}' no encontrado. Instalá: npm install -g @anthropic-ai/claude-code`
        : msg,
    };
  }
}

async function main() {
  console.log(`[bitaya] Cargando wiki desde ${WIKI_DIR}...`);
  const pages = await loadWiki(WIKI_DIR, PROJECT_ROOT);
  const wikiBlock = formatWikiForPrompt(pages);
  console.log(
    `[bitaya] Cargadas ${pages.length} páginas (${(wikiBlock.length / 1024).toFixed(1)} KB).`,
  );
  console.log(`[bitaya] CLI: ${CLAUDE_CMD}  model: ${MODEL}`);
  const initialCli = await checkCliReady();
  if (initialCli.ready) {
    console.log(`[bitaya] Claude CLI listo: ${initialCli.version}`);
  } else {
    console.warn(`[bitaya] ⚠️ Claude CLI no listo: ${initialCli.error}`);
  }

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", async (_req, res) => {
    const cli = await checkCliReady();
    res.json({
      ok: true,
      pages: pages.length,
      cli: CLAUDE_CMD,
      model: MODEL,
      cliReady: cli.ready,
      cliVersion: cli.version,
      cliError: cli.error,
    });
  });

  app.get("/api/graph", (_req, res) => {
    res.json(buildWikiGraph(pages));
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

  app.post("/api/analyze", async (req, res) => {
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      res.status(400).json({ error: "Falta el campo 'message'." });
      return;
    }

    const userPayload = `=== CONTENIDO DEL WIKI BITAYA INCLUYE ===
${wikiBlock}

=== SITUACIÓN DESCRITA POR LA PERSONA ===
${message}

Analizá esta situación y devolvé el JSON estructurado como te pedí en el system prompt. Solo el JSON, sin nada más.`;

    try {
      console.log(`[bitaya] /api/analyze ← (${message.length} chars)`);
      const { result, durationMs, costUsd } = await spawnClaude(
        userPayload,
        ANALYZE_RULES_FILE,
      );
      const parsed = parseAnalyzeJson(result);
      if (!parsed) {
        console.error("[bitaya] /api/analyze → JSON inválido:", result.slice(0, 500));
        res.status(502).json({ error: "Respuesta del modelo inválida." });
        return;
      }
      console.log(
        `[bitaya] /api/analyze → ${parsed.urgencyLevel} · ${parsed.suggestedInstitutions.length} insts · ${durationMs}ms${
          costUsd !== undefined ? `, $${costUsd.toFixed(4)}` : ""
        }`,
      );
      res.json(parsed);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[bitaya] Error /api/analyze:", detail);
      res.status(500).json({ error: "No pudimos analizar tu situación.", detail });
    }
  });

  const httpServer = app.listen(PORT, () => {
    console.log(`[bitaya] Listo en http://localhost:${PORT}`);
  });

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[bitaya] El puerto ${PORT} ya está ocupado. Cerrá ese proceso o cambiá PORT en .env.`,
      );
    } else {
      console.error("[bitaya] No se pudo levantar el servidor:", err);
    }
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[bitaya] Fatal:", err);
  process.exit(1);
});
