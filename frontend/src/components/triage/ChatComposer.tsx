import { useState, type FormEvent } from "react";

const MAX_LENGTH = 4000;

interface ChatComposerProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  isSending: boolean;
  placeholder?: string;
}

/**
 * Composer de chat — extraído de ChatPage.tsx (ver
 * triage-conversational-chat) para reutilizarlo en HomePage, que ahora
 * aloja toda la conversación (primer mensaje + turnos siguientes) en una
 * sola pantalla. Mismo comportamiento: Enter envía, Shift+Enter agrega
 * una línea nueva.
 */
export default function ChatComposer({ onSend, disabled, isSending, placeholder }: ChatComposerProps) {
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending || disabled) return;
    setDraft("");
    await onSend(trimmed);
  }

  return (
    <form className="flex items-end gap-space-sm" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chat-composer-input">
        Escribe tu mensaje
      </label>
      <textarea
        id="chat-composer-input"
        className="flex-1 bg-surface-container-low rounded-2xl px-space-md py-space-sm font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
        rows={2}
        maxLength={MAX_LENGTH}
        value={draft}
        placeholder={placeholder ?? "Escribe cómo te sientes…"}
        disabled={isSending || disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
      />
      <button
        type="submit"
        disabled={isSending || disabled || !draft.trim()}
        className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
      >
        <span>{isSending ? "Enviando…" : "Enviar"}</span>
        <span aria-hidden="true" className={`material-symbols-outlined text-base ${isSending ? "animate-spin" : ""}`}>
          {isSending ? "progress_activity" : "send"}
        </span>
      </button>
    </form>
  );
}
