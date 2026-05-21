import "dotenv/config";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { buildWikiGraph, extractTitle, loadWiki, searchWiki, type WikiPage } from "./wiki.ts";

const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WIKI_DIR = path.join(PROJECT_ROOT, "wiki");
const PORT = Number(process.env.PORT ?? 8787);
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

const ANALYZE_RULES = `Sos el analizador de situaciones del wiki BITAYA Incluye. Una persona vulnerable en Costa Rica te describe su situación en lenguaje propio (no es abogada, no sabe los nombres legales). Tu trabajo es producir una **ruta clara de ayuda institucional** basada exclusivamente en el wiki que te paso.

REGLAS DURAS:
- **Nunca inventes** instituciones, leyes, teléfonos o procedimientos. Si no está en el wiki, no lo digas.
- Castellano de Costa Rica simple. Frases cortas. Segunda persona ("vos") o ustedeo neutro.
- **Nunca des asesoría legal específica.** Es orientación inicial; siempre referí a Defensa Pública / consultorios jurídicos UCR-UNA-ULACIT / Defensoría de los Habitantes para el caso concreto.
- \`humanReviewRequired\` SIEMPRE debe ser \`true\` (somos IA orientativa, no determinamos elegibilidad).
- \`urgencyLevel\`:
  - **"Alta"** → riesgo físico inmediato o curso (violencia activa, abuso a menores, abandono de adulto mayor con riesgo, amenaza con arma).
  - **"Media-alta"** → amenaza no inmediata pero seria (amenazas verbales, despido sin pago, discriminación que cierra acceso a salud/educación).
  - **"Media"** → apoyo social, orientación, trámites con tiempo.
  - **"Baja"** → consulta informativa, sin urgencia.
- \`suggestedInstitutions\`: máximo 4, en orden de prioridad. Usá los nombres exactos del wiki (ej. "INAMU", "PANI", "CONAPAM", "CONAPDIS", "Defensa Pública", "Defensoría de los Habitantes", "Poder Judicial — Juzgado de Violencia Doméstica", "911", "Fuerza Pública", "Ministerio Público").
- \`nextSteps\`: 3-6 pasos accionables y concretos, en orden. Cada paso es UNA acción (no "valorá si..." sino "llamá al 911 si...").
- \`copyReadyMessage\`: mensaje de 2-4 oraciones en primera persona, que la persona pueda **copiar y pegar tal cual** a WhatsApp/correo de la institución sugerida. Tono respetuoso, claro. Sin datos personales inventados.
- \`missingData\`: 2-5 piezas de información que la persona debería preparar antes de hacer el primer contacto (cédula, edad, dirección, fechas, evidencias, testigos).
- \`whyThisRoute\`: 2-4 razones breves de por qué esta es la ruta correcta (citá la lógica del wiki, no el nombre del archivo).
- \`confidence\`: 0.0-1.0. Alta si el caso es claro y el wiki lo cubre bien. Bajá a 0.4-0.6 si el mensaje es ambiguo o el wiki tiene poca cobertura del tema.
- \`responsibleAIWarning\`: una frase de qué NO hace esta IA (no determina elegibilidad, no reemplaza atención humana, no atiende emergencias en vivo).
- \`officialSummary\`: 1-2 oraciones en tono institucional/formal, como lo escribiría una trabajadora social. Útil para que la institución entienda el caso rápido.

FORMATO DE SALIDA (JSON estricto, SIN code fences, SIN texto antes ni después, SIN markdown wrapper):
{
  "caseTitle": "Título breve del caso (3-8 palabras)",
  "detectedSituation": "Una oración describiendo qué le está pasando",
  "vulnerabilityCategory": "Violencia | Persona adulta mayor | Discapacidad | Niñez y adolescencia | Apoyo social | Discriminación | Laboral | Migración | Otra",
  "urgencyLevel": "Alta",
  "suggestedInstitutions": ["INAMU", "Poder Judicial — Juzgado de Violencia Doméstica"],
  "missingData": ["Tu cédula", "Si tenés hijos en común"],
  "nextSteps": ["1. Si estás en peligro ahora, llamá al 911.", "2. ..."],
  "copyReadyMessage": "Buenas tardes, soy una persona que está pasando por...",
  "officialSummary": "Persona reporta...",
  "responsibleAIWarning": "Esta orientación es informativa...",
  "humanReviewRequired": true,
  "confidence": 0.85,
  "whyThisRoute": ["...", "..."]
}`;

interface ParsedResponse {
  answer: string;
  sources: { title: string; url: string }[];
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

function spawnClaude(
  userMessage: string,
  systemPrompt: string = SYSTEM_RULES,
): Promise<{ result: string; durationMs: number; costUsd?: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = [
      "-p",
      "--output-format", "json",
      "--no-session-persistence",
      "--tools", "",
      "--system-prompt", systemPrompt,
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

interface CliReadiness {
  ready: boolean;
  version: string | null;
  error: string | null;
}

async function checkCliReady(): Promise<CliReadiness> {
  try {
    const { stdout } = await execFileP(CLAUDE_CMD, ["--version"], {
      timeout: 5000,
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
  const totalKb = (pages.reduce((n, p) => n + p.content.length, 0) / 1024).toFixed(1);
  console.log(
    `[bitaya] Cargadas ${pages.length} páginas (${totalKb} KB total).`,
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

    const hits = searchWiki(pages, message, 12);
    const relevantPages = hits
      .map((h) => pages.find((p) => p.relPath === h.relPath))
      .filter((p): p is WikiPage => p !== undefined);
    const wikiBlock = formatWikiForPrompt(relevantPages);
    console.log(
      `[bitaya] /api/chat search: ${relevantPages.length} páginas (${(wikiBlock.length / 1024).toFixed(1)} KB)`,
    );

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

    const analyzeHits = searchWiki(pages, message, 12);
    const analyzePages = analyzeHits
      .map((h) => pages.find((p) => p.relPath === h.relPath))
      .filter((p): p is WikiPage => p !== undefined);
    const analyzeBlock = formatWikiForPrompt(analyzePages);
    console.log(
      `[bitaya] /api/analyze search: ${analyzePages.length} páginas (${(analyzeBlock.length / 1024).toFixed(1)} KB)`,
    );

    const userPayload = `=== CONTENIDO DEL WIKI BITAYA INCLUYE ===
${analyzeBlock}

=== SITUACIÓN DESCRITA POR LA PERSONA ===
${message}

Analizá esta situación y devolvé el JSON estructurado como te pedí en el system prompt. Solo el JSON, sin nada más.`;

    try {
      console.log(`[bitaya] /api/analyze ← (${message.length} chars)`);
      const { result, durationMs, costUsd } = await spawnClaude(
        userPayload,
        ANALYZE_RULES,
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
