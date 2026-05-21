import type { AnalyzeResponse } from "../types/analyze";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const FALLBACK: AnalyzeResponse = {
  caseTitle: "Ruta de ayuda generada en modo respaldo",
  detectedSituation: "Situación vulnerable que requiere orientación inicial.",
  vulnerabilityCategory: "Apoyo social",
  urgencyLevel: "Media",
  suggestedInstitutions: ["IMAS", "Municipalidad", "Centro de salud correspondiente"],
  missingData: ["Cantón", "Edad", "Condición laboral", "Red de apoyo"],
  nextSteps: [
    "Recolectar información básica del caso.",
    "Solicitar orientación en una institución social o municipal.",
    "Validar requisitos directamente con la institución correspondiente.",
  ],
  copyReadyMessage:
    "Buenas, solicito orientación porque estoy pasando por una situación vulnerable y necesito saber qué opciones de apoyo puedo recibir. Puedo brindar más información sobre mi cantón, condición familiar y situación económica.",
  officialSummary:
    "Persona solicita orientación inicial por posible situación de vulnerabilidad. Requiere validación institucional.",
  responsibleAIWarning:
    "Esta orientación es informativa. La IA no determina elegibilidad ni reemplaza la revisión humana o institucional.",
  humanReviewRequired: true,
  confidence: 0.5,
  whyThisRoute: [
    "El mensaje indica posible necesidad de apoyo social.",
    "Faltan datos para orientar con mayor precisión.",
    "Se recomienda revisión humana.",
  ],
};

function parseResponse(value: unknown): AnalyzeResponse {
  if (!value || typeof value !== "object") throw new Error("Formato inválido");
  const r = value as Record<string, unknown>;
  if (typeof r.caseTitle !== "string") throw new Error("Formato inválido");
  return r as unknown as AnalyzeResponse;
}

export async function analyzeMessage(message: string): Promise<AnalyzeResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return parseResponse(await res.json());
  } catch {
    return FALLBACK;
  }
}
