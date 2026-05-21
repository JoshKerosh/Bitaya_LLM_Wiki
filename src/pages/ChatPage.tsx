import { useRef, useState } from "react";
import { analyzeMessage } from "../api/analyzeApi";
import StatusBadge from "../components/StatusBadge";
import type { AnalyzeResponse } from "../types/analyze";

type Tab = "ciudadano" | "dashboard";

const EXAMPLES = [
  {
    icon: "🤰",
    label: "Embarazo sin ingresos",
    text: "Estoy embarazada, tengo 19 años, no tengo trabajo y no sé dónde pedir ayuda. Vivo con mi mamá y me preocupa no poder comprar cosas básicas.",
  },
  {
    icon: "👴",
    label: "Adulto mayor solo",
    text: "Mi abuelo vive solo, casi no puede caminar y no sabemos dónde pedir ayuda para que alguien nos oriente.",
  },
  {
    icon: "🚨",
    label: "Miedo a mi pareja",
    text: "Tengo miedo de mi pareja porque me amenaza y no sé qué hacer. Tengo un hijo pequeño.",
  },
  {
    icon: "♿",
    label: "Hermano con discapacidad",
    text: "Mi hermano tiene una discapacidad y no sabemos cómo pedir orientación para transporte, trabajo o certificación.",
  },
];

const URGENCY_STYLES: Record<string, string> = {
  Alta: "bg-[#FF2D8D] text-white border border-[#FF2D8D]",
  "Media-alta": "bg-[#FF2D8D]/15 text-[#FF2D8D] border border-[#FF2D8D]/30",
  Media: "bg-black/10 text-black border border-black/20",
  Baja: "bg-[#7CFF6B]/30 text-black border border-[#7CFF6B]",
};

const DASHBOARD_ROWS = [
  { caso: "Embarazada sin ingresos", cat: "Salud y apoyo social", urg: "Media-alta", estado: "Requiere orientación" },
  { caso: "Adulto mayor solo", cat: "Persona adulta mayor", urg: "Alta", estado: "Prioritario" },
  { caso: "Mujer con miedo a su pareja", cat: "Violencia", urg: "Alta", estado: "Seguridad primero" },
  { caso: "Persona con discapacidad", cat: "Discapacidad", urg: "Media", estado: "Orientación inicial" },
];

export default function ChatPage() {
  const [tab, setTab] = useState<Tab>("ciudadano");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze() {
    const msg = input.trim();
    if (!msg || isLoading) return;

    setIsLoading(true);
    setResult(null);

    const data = await analyzeMessage(msg);
    setResult(data);
    setIsLoading(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.copyReadyMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">

      {/* HEADER */}
      <header className="bg-black">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">
          <img
            src="/logo.jpeg"
            alt="Bitaya logo"
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold"><span className="text-[#FF2D8D]">BITAYA</span><span className="text-white"> Incluye</span></h1>
            <p className="text-sm text-white/60">
              IA responsable para convertir una situación vulnerable en una ruta clara de ayuda
            </p>
          </div>
          <StatusBadge />
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="bg-black border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex">
            {(["ciudadano", "dashboard"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-[3px] px-7 py-3 text-sm font-medium transition-all ${
                  tab === t
                    ? "border-[#FF2D8D] text-white"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                {t === "ciudadano" ? "Orientación ciudadana" : "Dashboard institucional"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-8">

        {/* ── TAB: CIUDADANO ── */}
        {tab === "ciudadano" && (
          <div className="space-y-5">

            {/* Responsible AI callout */}
            <div
              className="rounded-xl bg-white px-5 py-4 text-sm text-black/70"
              style={{ borderLeft: "4px solid #FF2D8D", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <strong className="text-black">IA responsable:</strong> BITAYA Incluye no determina elegibilidad, no reemplaza
              instituciones públicas y no atiende emergencias. Su función es orientar y ayudar a preparar
              el primer contacto. <strong className="text-black">Toda ruta requiere revisión humana.</strong>
            </div>

            {/* Form card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-1 text-xl font-semibold text-black">¿No sabés dónde pedir ayuda?</h2>
              <p className="mb-5 text-sm text-black/50">
                Contanos tu situación con tus propias palabras. BITAYA Incluye usa IA responsable para
                ayudarte a encontrar una ruta inicial de orientación.
              </p>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu situación aquí. Por ejemplo: Estoy embarazada, no tengo trabajo y no sé a dónde acudir..."
                rows={4}
                disabled={isLoading}
                className="w-full resize-y rounded-xl border-2 border-black/15 px-4 py-3 text-sm text-black bg-[#F4F4F4] outline-none transition placeholder:text-black/35 focus:border-[#FF2D8D] disabled:cursor-not-allowed disabled:text-black/30"
              />

              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-black/35">
                Ejemplos — hacé clic para cargar
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setInput(ex.text)}
                    className="rounded-full border border-[#FF2D8D] bg-transparent px-4 py-1.5 text-xs font-medium text-[#FF2D8D] transition hover:bg-[#FF2D8D] hover:text-white"
                  >
                    {ex.icon} {ex.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!input.trim() || isLoading}
                className="w-full rounded-xl bg-[#FF2D8D] py-3.5 text-sm font-semibold text-white transition hover:bg-[#d4006e] disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/40"
              >
                {isLoading ? "Analizando..." : "Crear ruta de ayuda"}
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#FF2D8D]" />
                <p className="text-sm text-black/50">Analizando tu situación...</p>
              </div>
            )}

            {/* Results */}
            {result && !isLoading && (
              <div ref={resultsRef} className="space-y-4">

                {/* Header */}
                <div className="rounded-2xl bg-black p-6 text-white">
                  <h3 className="mb-1 text-xl font-bold">{result.caseTitle}</h3>
                  <p className="text-sm text-white/70">{result.detectedSituation}</p>
                </div>

                {/* Cards grid */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <Card label="Categoría">
                    <p className="text-sm text-black/80">{result.vulnerabilityCategory}</p>
                  </Card>

                  <Card label="Nivel de urgencia">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        URGENCY_STYLES[result.urgencyLevel] ?? URGENCY_STYLES["Media"]
                      }`}
                    >
                      {result.urgencyLevel}
                    </span>
                  </Card>

                  <Card label="Instituciones sugeridas" full>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedInstitutions.map((inst) => (
                        <span key={inst} className="rounded-lg bg-[#F4F4F4] px-3 py-1 text-xs font-medium text-black">
                          {inst}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card label="Datos faltantes">
                    <ul className="list-inside list-disc space-y-1 text-sm text-black/70">
                      {result.missingData.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                  </Card>

                  <Card label="Por qué esta ruta">
                    <ul className="list-inside list-disc space-y-1 text-sm text-black/70">
                      {result.whyThisRoute.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </Card>

                  <Card label="Próximos pasos" full>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-black/70">
                      {result.nextSteps.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                  </Card>

                  <Card label="Mensaje listo para pedir ayuda" full>
                    <div className="rounded-xl bg-[#F4F4F4] p-4 text-sm whitespace-pre-wrap text-black/70">
                      {result.copyReadyMessage}
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`mt-3 rounded-lg px-5 py-2 text-sm font-semibold transition ${
                        copied
                          ? "bg-[#7CFF6B] text-black"
                          : "bg-black text-white hover:bg-black/80"
                      }`}
                    >
                      {copied ? "✓ Copiado" : "Copiar mensaje"}
                    </button>
                  </Card>

                  <Card label="Confianza del análisis" full>
                    <div className="h-2 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#7CFF6B] transition-all duration-500"
                        style={{ width: `${Math.round(result.confidence * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-black/40">
                      Confianza: {Math.round(result.confidence * 100)}%
                    </p>
                  </Card>

                  <Card label="Resumen institucional" full>
                    <p className="text-sm text-black/70">{result.officialSummary}</p>
                  </Card>

                </div>

                {/* AI warning */}
                <div
                  className="rounded-xl bg-white px-5 py-4 text-sm text-black/70"
                  style={{ borderLeft: "4px solid #FF2D8D", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <strong className="text-black">⚠️ Advertencia:</strong> {result.responsibleAIWarning}
                </div>

                {/* Human review required */}
                {result.humanReviewRequired && (
                  <div className="rounded-xl bg-[#FF2D8D] px-5 py-4 text-sm font-semibold text-white">
                    ✋ Revisión humana requerida — Esta orientación debe ser validada por una persona o institución competente.
                  </div>
                )}

                {/* Legal notice */}
                <div
                  className="rounded-2xl bg-white p-5 text-sm text-black/60"
                  style={{ borderTop: "3px solid #FF2D8D", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <strong className="text-black">Esto no es asesoría legal.</strong> Es información
                  para que sepás qué leyes te protegen y a quién acudir. Para tu caso específico, buscá
                  ayuda gratuita en la <strong className="text-black">Defensa Pública (800-800-3000)</strong>, los{" "}
                  <strong className="text-black">consultorios jurídicos gratuitos de la UCR/UNA/ULACIT</strong>, o la{" "}
                  <strong className="text-black">Defensoría de los Habitantes (800-258-7474)</strong>.
                </div>

              </div>
            )}

          </div>
        )}

        {/* ── TAB: DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { num: "4", label: "Casos orientados" },
                { num: "4", label: "Requieren revisión humana" },
                { num: "2", label: "Alta prioridad", pink: true },
                { num: "4", label: "Mensajes generados" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl bg-white p-5 text-center shadow-sm">
                  <div className={`text-3xl font-extrabold ${m.pink ? "text-[#FF2D8D]" : "text-black"}`}>
                    {m.num}
                  </div>
                  <div className="mt-1 text-xs text-black/40">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-black">Casos orientados (demo)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {["Caso", "Categoría", "Urgencia", "Estado"].map((h) => (
                      <th
                        key={h}
                        className="bg-[#F4F4F4] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-black/40"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DASHBOARD_ROWS.map((row) => (
                    <tr key={row.caso} className="border-t border-black/5">
                      <td className="px-4 py-3 text-black">{row.caso}</td>
                      <td className="px-4 py-3 text-black/60">{row.cat}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            URGENCY_STYLES[row.urg] ?? URGENCY_STYLES["Media"]
                          }`}
                        >
                          {row.urg}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-black/60">{row.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      <footer className="py-6 text-center text-xs text-black/35">
        BITAYA Incluye — Hackathon IA Generativa · AI Day by FAIR / Costa Rica Tech Week 2026 · Equipo BITAYA
      </footer>

    </div>
  );
}

function Card({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ${full ? "sm:col-span-2" : ""}`}>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-black/35">{label}</p>
      {children}
    </div>
  );
}
