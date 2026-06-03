// Eval runner: corre las golden questions contra el MISMO pipeline de producción
// (mismo system prompt vía server/prompts.ts, mismo wiki, mismo CLI de Claude) y
// puntúa cada respuesta en los 6 ejes de docs/07-EVALS.md.
//
// Uso:  npx tsx evals/run-evals.ts                  → corre las preguntas contra el modelo
//       npx tsx evals/run-evals.ts --rescore <fecha> → re-puntúa respuestas guardadas en
//                                                      evals/runs/<fecha>/ sin llamar al modelo
//                                                      (útil tras corregir el scorer)
// Env:  BITAYA_MODEL (default sonnet), BITAYA_CLAUDE_CMD, BITAYA_TIMEOUT_MS
//
// Criterio (docs/07-EVALS.md): 6/6 = PASS · 5/6 = REVIEW · <5 = FAIL
// Extra: cuenta "fuentes alucinadas" = citas del modelo que NO resuelven a una
// página real del wiki (el server las filtra antes de mostrarlas al usuario).

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWiki, type WikiPage } from "../server/wiki.ts";
import { SYSTEM_RULES } from "../server/prompts.ts";
import { normalizeUrl, parseAnswerRaw } from "../server/parse.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WIKI_DIR = path.join(PROJECT_ROOT, "wiki");
const MODEL = process.env.BITAYA_MODEL ?? "sonnet";
const CLAUDE_CMD = process.env.BITAYA_CLAUDE_CMD ?? "claude";
const TIMEOUT_MS = Number(process.env.BITAYA_TIMEOUT_MS ?? 180000);

interface Expected {
  emergencia: boolean;
  telefonos_esperados: string[];
  leyes_esperadas: string[];
  instituciones_esperadas: string[];
  procedimientos_esperados?: string[];
  situaciones_esperadas?: string[];
  min_pasos_accionables: number;
  debe_incluir_disclaimer: boolean;
  fuera_de_corpus?: boolean;
  debe_reconocer_limite?: boolean;
  debe_aclarar_anonimato?: boolean;
}

interface GoldenQuestion {
  id: string;
  question: string;
  urgencia: string;
  expected: Expected;
}

interface AxisResult {
  axis: string;
  pass: boolean;
  detail: string;
}

interface QuestionResult {
  id: string;
  question: string;
  status: "PASS" | "REVIEW" | "FAIL";
  score: string;
  axes: AxisResult[];
  extras: AxisResult[];
  hallucinatedSources: string[];
  validSources: string[];
  durationMs: number;
  answer: string;
}

// ---------- invocación al pipeline real (idéntico a server/index.ts) ----------

const PROMPT_TMPDIR = mkdtempSync(path.join(tmpdir(), "bitaya-eval-"));
const SYSTEM_RULES_FILE = path.join(PROMPT_TMPDIR, "chat-system.txt");
writeFileSync(SYSTEM_RULES_FILE, SYSTEM_RULES, "utf8");

function formatWikiForPrompt(pages: WikiPage[]): string {
  return pages
    .map((p) => `\n\n===== FILE: ${p.relPath} =====\n${p.content}`)
    .join("");
}

function extractResultText(stdout: string): string {
  const trimmed = stdout.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed) as { result?: string };
    if (typeof parsed.result === "string") return parsed.result;
  } catch {
    const lines = trimmed.split("\n").filter((l) => l.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]) as { result?: string };
        if (typeof parsed.result === "string") return parsed.result;
      } catch {
        // ignore
      }
    }
  }
  return trimmed;
}

function spawnClaude(userMessage: string): Promise<{ result: string; durationMs: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = [
      "-p",
      "--output-format", "json",
      "--no-session-persistence",
      "--system-prompt-file", SYSTEM_RULES_FILE,
      "--model", MODEL,
      "--permission-mode", "bypassPermissions",
    ];
    const child = spawn(CLAUDE_CMD, args, {
      cwd: PROMPT_TMPDIR,
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`claude tardó más de ${TIMEOUT_MS / 1000}s`));
    }, TIMEOUT_MS);
    child.stdout.on("data", (c: Buffer) => out.push(c));
    child.stderr.on("data", (c: Buffer) => err.push(c));
    child.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(e);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`claude exit ${code}: ${Buffer.concat(err).toString("utf8").slice(0, 300)}`));
        return;
      }
      resolve({ result: extractResultText(Buffer.concat(out).toString("utf8")), durationMs: Date.now() - startedAt });
    });
    child.stdin.write(userMessage);
    child.stdin.end();
  });
}

// ---------- scoring ----------

function phonePattern(phone: string): RegExp {
  // Tolerante a separadores DENTRO del número ("9-1-1" ≡ "911", "800-INAMU-00"),
  // sin pegar el número a la palabra anterior ("llamá al 911" debe matchear).
  const body = phone
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .split("")
    .join("[-.\\s]?");
  return new RegExp(`(?<![0-9A-Z])${body}(?![0-9A-Z])`);
}

function hasPhone(answer: string, phone: string): boolean {
  return phonePattern(phone).test(answer.toUpperCase());
}

function countSteps(answer: string): number {
  return (answer.match(/^\s{0,3}\d{1,2}[.)]\s+/gm) ?? []).length;
}

const LIMIT_PATTERNS = [
  /no (está|aparece|hay|se encuentra|encontr\w+|cubre|tengo|incluye)/i,
  /todav[ií]a no/i,
  /a[uú]n no/i,
  /el wiki no/i,
  /no cuenta con/i,
  /fuera de(l| lo que cubre)/i,
];

function scoreQuestion(
  q: GoldenQuestion,
  answer: string,
  validSources: string[],
  hallucinated: string[],
): { axes: AxisResult[]; extras: AxisResult[] } {
  const e = q.expected;
  const abst = e.fuera_de_corpus === true;
  const expectedPages = [
    ...e.leyes_esperadas,
    ...e.instituciones_esperadas,
    ...(e.procedimientos_esperados ?? []),
    ...(e.situaciones_esperadas ?? []),
  ];

  const axes: AxisResult[] = [];

  // 1. Citación: la respuesta cita ≥1 página real del wiki.
  //    En abstención: lo correcto es NO citar (sources vacíos) y no fabricar.
  axes.push(
    abst
      ? {
          axis: "citacion",
          pass: hallucinated.length === 0,
          detail: hallucinated.length === 0
            ? `sin fuentes fabricadas (válidas: ${validSources.length})`
            : `fabricó ${hallucinated.length} fuente(s): ${hallucinated.join(", ")}`,
        }
      : {
          axis: "citacion",
          pass: validSources.length >= 1,
          detail: `${validSources.length} fuente(s) válida(s)`,
        },
  );

  // 2. Cita correcta: ≥1 fuente citada está entre las páginas esperadas.
  //    En abstención: la respuesta reconoce explícitamente el límite del wiki.
  if (abst) {
    const recognizes = LIMIT_PATTERNS.some((re) => re.test(answer));
    axes.push({
      axis: "cita_correcta",
      pass: recognizes,
      detail: recognizes ? "reconoce el límite del corpus" : "NO admite que el wiki no cubre el tema",
    });
  } else {
    const hits = validSources.filter((s) => expectedPages.some((p) => s.includes(p)));
    axes.push({
      axis: "cita_correcta",
      pass: hits.length >= 1,
      detail: hits.length >= 1 ? `coincide: ${hits.join(", ")}` : `citó [${validSources.join(", ")}] pero se esperaba alguna de [${expectedPages.join(", ")}]`,
    });
  }

  // 3. Pasos accionables
  const steps = countSteps(answer);
  axes.push({
    axis: "pasos_accionables",
    pass: steps >= e.min_pasos_accionables,
    detail: `${steps} pasos (mínimo ${e.min_pasos_accionables})`,
  });

  // 4. Teléfono correcto: todos los teléfonos esperados aparecen.
  const missingPhones = e.telefonos_esperados.filter((t) => !hasPhone(answer, t));
  axes.push({
    axis: "telefono_correcto",
    pass: missingPhones.length === 0,
    detail: missingPhones.length === 0
      ? `presentes: ${e.telefonos_esperados.join(", ")}`
      : `faltan: ${missingPhones.join(", ")}`,
  });

  // 5. Aviso legal
  const hasDisclaimer = /no es asesor[íi]a legal/i.test(answer);
  axes.push({
    axis: "aviso_legal",
    pass: e.debe_incluir_disclaimer ? hasDisclaimer : true,
    detail: hasDisclaimer ? "disclaimer presente" : "falta el disclaimer obligatorio",
  });

  // 6. Detección de emergencia: si hay peligro activo, el inicio de la respuesta
  //    debe traer el número de emergencia.
  if (e.emergencia) {
    const head = answer.slice(0, 400);
    const opensWithEmergency = hasPhone(head, "911") || hasPhone(head, e.telefonos_esperados[0] ?? "911");
    axes.push({
      axis: "deteccion_emergencia",
      pass: opensWithEmergency,
      detail: opensWithEmergency ? "abre con número de emergencia" : "NO abre con número de emergencia",
    });
  } else {
    axes.push({ axis: "deteccion_emergencia", pass: true, detail: "n/a (no es emergencia)" });
  }

  // Extras condicionales (no cuentan en el 6/6, pero capan el status a REVIEW si fallan)
  const extras: AxisResult[] = [];
  if (e.debe_aclarar_anonimato) {
    const ok = /an[oó]nim/i.test(answer);
    extras.push({ axis: "aclara_anonimato", pass: ok, detail: ok ? "menciona denuncia anónima" : "no aclara que la denuncia puede ser anónima" });
  }
  return { axes, extras };
}

// ---------- main ----------

async function main() {
  const goldenPath = path.join(__dirname, "golden-questions.json");
  const golden = JSON.parse(readFileSync(goldenPath, "utf8")) as { version: string; questions: GoldenQuestion[] };

  console.log(`[evals] Cargando wiki desde ${WIKI_DIR}...`);
  const pages = await loadWiki(WIKI_DIR, PROJECT_ROOT);
  const wikiBlock = formatWikiForPrompt(pages);
  const validPaths = new Set(pages.map((p) => p.relPath));
  console.log(`[evals] ${pages.length} páginas (${(wikiBlock.length / 1024).toFixed(1)} KB) · golden set v${golden.version} · ${golden.questions.length} preguntas · modelo: ${MODEL}`);

  const buildResult = (
    q: GoldenQuestion,
    answer: string,
    validSources: string[],
    hallucinated: string[],
    durationMs: number,
  ): QuestionResult => {
    const { axes, extras } = scoreQuestion(q, answer, validSources, hallucinated);
    const passed = axes.filter((a) => a.pass).length;
    let status: QuestionResult["status"] = passed === 6 ? "PASS" : passed === 5 ? "REVIEW" : "FAIL";
    if (status === "PASS" && extras.some((x) => !x.pass)) status = "REVIEW";

    return {
      id: q.id,
      question: q.question,
      status,
      score: `${passed}/6`,
      axes,
      extras,
      hallucinatedSources: hallucinated,
      validSources,
      durationMs,
      answer,
    };
  };

  const runQuestion = async (q: GoldenQuestion): Promise<QuestionResult> => {
    const payload = `=== CONTENIDO DEL WIKI BITAYA INCLUYE ===\n${wikiBlock}\n\n=== PREGUNTA DEL USUARIO ===\n${q.question}\n\nRespondé en JSON estricto como te pedí en el system prompt.`;
    const { result, durationMs } = await spawnClaude(payload);

    // mismo parser que producción (server/parse.ts), conservando fuentes crudas
    // para medir fabricación
    const { answer, rawUrls } = parseAnswerRaw(result);
    const normalized = rawUrls.map(normalizeUrl);
    const validSources = normalized.filter((u) => validPaths.has(u));
    const hallucinated = normalized.filter((u) => !validPaths.has(u));
    return buildResult(q, answer, validSources, hallucinated, durationMs);
  };

  // --rescore <fecha>: re-puntúa respuestas ya guardadas (no llama al modelo)
  const rescoreIdx = process.argv.indexOf("--rescore");
  const rescoreDate = rescoreIdx !== -1 ? process.argv[rescoreIdx + 1] : null;
  if (rescoreDate) {
    console.log(`[evals] Modo rescore: re-puntuando respuestas de evals/runs/${rescoreDate}/ (sin llamar al modelo)`);
  }

  const results: QuestionResult[] = [];
  for (const q of golden.questions) {
    process.stdout.write(`[evals] ${q.id} ... `);
    try {
      let r: QuestionResult;
      if (rescoreDate) {
        const saved = JSON.parse(
          readFileSync(path.join(__dirname, "runs", rescoreDate, `${q.id}.json`), "utf8"),
        ) as QuestionResult;
        r = buildResult(q, saved.answer, saved.validSources, saved.hallucinatedSources, saved.durationMs);
      } else {
        r = await runQuestion(q);
      }
      results.push(r);
      console.log(`${r.status} (${r.score}, ${(r.durationMs / 1000).toFixed(1)}s${r.hallucinatedSources.length ? `, ${r.hallucinatedSources.length} fuente(s) fabricada(s) filtrada(s)` : ""})`);
    } catch (err) {
      console.log(`ERROR: ${err instanceof Error ? err.message : err}`);
      results.push({
        id: q.id, question: q.question, status: "FAIL", score: "0/6",
        axes: [], extras: [], hallucinatedSources: [], validSources: [],
        durationMs: 0, answer: `ERROR: ${err instanceof Error ? err.message : err}`,
      });
    }
  }

  // ---------- reporte ----------
  const date = rescoreDate ?? new Date().toISOString().slice(0, 10);
  const runDir = path.join(__dirname, "runs", date);
  mkdirSync(runDir, { recursive: true });
  for (const r of results) {
    writeFileSync(path.join(runDir, `${r.id}.json`), JSON.stringify(r, null, 2), "utf8");
  }

  const passCount = results.filter((r) => r.status === "PASS").length;
  const lines: string[] = [
    `# Resultados de evals — ${date}`,
    "",
    `- **Golden set:** v${golden.version} (${golden.questions.length} preguntas)`,
    `- **Modelo:** ${MODEL} · pipeline de producción (mismo system prompt y wiki que /api/chat)`,
    `- **Resultado global:** ${passCount}/${results.length} PASS`,
    `- **Fuentes fabricadas por el modelo (filtradas por el server):** ${results.reduce((n, r) => n + r.hallucinatedSources.length, 0)}`,
    "",
    "| ID | Pregunta | Score | Status | Fuentes válidas | Fabricadas |",
    "|---|---|---|---|---|---|",
    ...results.map((r) =>
      `| ${r.id} | ${r.question.slice(0, 48)} | ${r.score} | ${r.status} | ${r.validSources.length} | ${r.hallucinatedSources.length} |`,
    ),
    "",
  ];
  for (const r of results) {
    lines.push(`## ${r.id} — ${r.status} (${r.score})`, "");
    for (const a of [...r.axes, ...r.extras]) {
      lines.push(`- ${a.pass ? "✅" : "❌"} **${a.axis}** — ${a.detail}`);
    }
    lines.push("", `<details><summary>Respuesta completa</summary>`, "", r.answer, "", "</details>", "");
  }
  const reportPath = path.join(__dirname, `results-${date}.md`);
  writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(`\n[evals] ${passCount}/${results.length} PASS · reporte: ${path.relative(PROJECT_ROOT, reportPath)} · respuestas crudas: ${path.relative(PROJECT_ROOT, runDir)}/`);
  if (results.some((r) => r.status === "FAIL")) process.exit(1);
}

main().catch((err) => {
  console.error("[evals] Fatal:", err);
  process.exit(1);
});
