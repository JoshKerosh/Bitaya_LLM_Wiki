import { useMemo, useState } from "react";
import { sendChatMessage } from "../api/chatApi";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import type { ChatMessage } from "../types/chat";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const hasConversation = messages.length > 0;

  const greeting = useMemo(
    () => (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
          BITAYA Incluye
        </p>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
          ¿En qué te puedo ayudar?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Consulta información pública y servicios disponibles de forma sencilla.
        </p>
      </div>
    ),
    [],
  );

  async function handleSubmit() {
    const cleanInput = input.trim();

    if (!cleanInput || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: cleanInput,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(cleanInput);
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError(
        "No pudimos obtener una respuesta en este momento. Intentá de nuevo en unos segundos.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-4 py-5 sm:px-6">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">
          BITAYA Incluye
        </div>
        <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
          Demo IA
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden pt-4">
        {hasConversation ? (
          <ChatWindow messages={messages} isLoading={isLoading} error={error} />
        ) : (
          <>
            {greeting}
            <div className="mx-auto w-full max-w-3xl pb-3">
              {error ? (
                <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </>
        )}

        <div className="mx-auto w-full max-w-3xl pb-2">
          <ChatInput
            value={input}
            isLoading={isLoading}
            onChange={setInput}
            onSubmit={handleSubmit}
          />
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            La respuesta es una orientación inicial y puede requerir verificación institucional.
          </p>
        </div>
      </div>
    </main>
  );
}
