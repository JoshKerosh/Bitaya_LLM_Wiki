import type { FormEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ChatInput({
  value,
  isLoading,
  onChange,
  onSubmit,
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !isLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSend) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        onSubmit();
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-200 bg-white/95 p-2 shadow-glow backdrop-blur"
    >
      <label htmlFor="chat-message" className="sr-only">
        Mensaje
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="chat-message"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribi tu consulta..."
          disabled={isLoading}
          className="max-h-40 min-h-12 flex-1 resize-none rounded-3xl border-0 bg-transparent px-4 py-3 text-base leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="mb-1 inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Enviar mensaje"
        >
          {isLoading ? "..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
