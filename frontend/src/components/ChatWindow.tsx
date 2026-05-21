import ChatMessage from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../types/chat";

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string;
}

export default function ChatWindow({
  messages,
  isLoading,
  error,
}: ChatWindowProps) {
  if (!messages.length && !isLoading && !error) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-2 pb-6 pt-4"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading ? (
        <div className="flex justify-start">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Consultando informacion disponible...
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
