import type { ChatRequest, ChatResponse, ChatSource } from "../types/chat";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

function isSource(value: unknown): value is ChatSource {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as Record<string, unknown>;
  return typeof source.title === "string" && typeof source.url === "string";
}

function parseChatResponse(value: unknown): ChatResponse {
  if (!value || typeof value !== "object") {
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  }

  const payload = value as Record<string, unknown>;

  if (typeof payload.answer !== "string") {
    throw new Error("La respuesta del servidor no incluye una respuesta valida.");
  }

  return {
    answer: payload.answer,
    sources: Array.isArray(payload.sources)
      ? payload.sources.filter(isSource)
      : undefined,
  };
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const request: ChatRequest = { message };

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("No pudimos obtener una respuesta en este momento.");
  }

  return parseChatResponse(await response.json());
}
