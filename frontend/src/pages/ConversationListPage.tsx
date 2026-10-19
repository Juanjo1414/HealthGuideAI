import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import { ChatApiError, deleteConversation, listConversations } from "../api/chatApi";
import type { ConversationSummary } from "../api/types";
import { EMERGENCY_NUMBER } from "../constants/emergency";

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const dateShort = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Mismo helper de formato relativo que HistoryPage.tsx (whenLabel). */
function whenLabel(iso: string): string {
  const date = new Date(iso);
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const abs = Math.abs(diffMinutes);
  const rel =
    abs < 60
      ? relative.format(diffMinutes, "minute")
      : abs < 60 * 24
        ? relative.format(Math.round(diffMinutes / 60), "hour")
        : relative.format(Math.round(diffMinutes / (60 * 24)), "day");
  return `${rel.charAt(0).toUpperCase()}${rel.slice(1)} (${dateShort.format(date)})`;
}

/**
 * Lista de conversaciones del usuario autenticado, ordenadas por actividad
 * reciente (el orden ya viene así desde el backend — no se re-ordena en el
 * cliente). Ya no existe una pantalla de chat separada (`/chat/{id}`): el
 * chat vive en "/" (ver triage-conversational-chat), así que cada tarjeta
 * navega a `/?conversationId={id}`, donde HomePage carga esa conversación
 * y permite seguir escribiendo sin perder contexto. El botón "Nueva
 * conversación" navega a `/` sin parámetro (el formulario normal).
 */
export default function ConversationListPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    listConversations()
      .then((data) => {
        setConversations(data);
        setState("ready");
      })
      .catch((error) => {
        if (error instanceof ChatApiError && error.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setErrorMessage(
          error instanceof ChatApiError ? error.message : "No se pudo cargar la lista de conversaciones."
        );
        setState("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (deletingId) return;
    const confirmed = window.confirm("¿Seguro que quieres borrar esta conversación? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      if (error instanceof ChatApiError && error.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setDeleteError({
        id,
        message: error instanceof ChatApiError ? error.message : "No se pudo borrar la conversación.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell>
      <div className="relative w-full max-w-[960px] mx-auto px-margin md:px-margin-tablet py-space-md">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider mb-space-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Expediente personal • Solo tú lo ves</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold">
              Mis conversaciones
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Continúa una conversación anterior o inicia una nueva evaluación de tus síntomas.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-primary-container text-on-primary font-label-md text-label-md rounded-full shadow-md hover:bg-primary transition-all duration-200 active:scale-95"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Nueva conversación</span>
            </Link>
          </div>
        </div>

        {state === "loading" && (
          <div className="flex flex-col gap-space-md" role="status" aria-busy="true" aria-label="Cargando conversaciones">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        )}

        {state === "error" && (
          <div role="alert" className="p-space-md rounded-2xl bg-error-container text-on-error-container flex items-start gap-space-sm">
            <span aria-hidden="true" className="material-symbols-outlined">error</span>
            {errorMessage}
          </div>
        )}

        {state === "ready" && conversations.length === 0 && (
          <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col items-center text-center gap-space-sm">
            <div className="w-14 h-14 rounded-2xl bg-surface-container text-primary flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px]">forum</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Todavía no tienes conversaciones</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Cuando inicies una evaluación de síntomas con tu sesión iniciada, aparecerá aquí.
            </p>
            <Link
              to="/"
              className="mt-space-xs inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-primary-container text-on-primary font-label-md text-label-md rounded-full"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
              Iniciar una conversación
            </Link>
          </div>
        )}

        {state === "ready" && conversations.length > 0 && (
          <div className="flex flex-col gap-space-md">
            {conversations.map((conversation) => {
              const isDeleting = deletingId === conversation.id;
              const hasDeleteError = deleteError?.id === conversation.id;
              return (
                <article
                  key={conversation.id}
                  className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  {conversation.locked_emergency && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-error" />
                  )}
                  <div className="flex items-start justify-between gap-space-md">
                    <Link to={`/?conversationId=${conversation.id}`} className="flex-1 min-w-0 group">
                      <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                        {conversation.locked_emergency && (
                          <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">emergency</span>
                            Emergencia
                          </span>
                        )}
                        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">event</span>
                          {whenLabel(conversation.last_activity_at)}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {conversation.preview || "Conversación sin mensajes todavía"}
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs inline-flex items-center gap-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chat</span>
                        {conversation.message_count} mensaje{conversation.message_count === 1 ? "" : "s"}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(conversation.id)}
                      disabled={isDeleting}
                      aria-label="Borrar conversación"
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all disabled:opacity-50"
                    >
                      <span aria-hidden="true" className={`material-symbols-outlined text-[20px] ${isDeleting ? "animate-spin" : ""}`}>
                        {isDeleting ? "progress_activity" : "delete"}
                      </span>
                    </button>
                  </div>
                  {hasDeleteError && (
                    <p role="alert" className="mt-space-sm font-body-sm text-body-sm text-error">
                      {deleteError!.message}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-space-xl p-space-lg rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-[26px]">fmd_bad</span>
            </div>
            <div>
              <h4 className="font-label-lg text-label-lg text-on-surface font-bold">¿Empeoraron tus síntomas?</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No esperes a continuar la conversación. Busca atención inmediata.
              </p>
            </div>
          </div>
          <a
            className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm bg-error text-on-error font-label-md text-label-md rounded-full shadow-md hover:opacity-95 transition-all flex-shrink-0"
            href={`tel:${EMERGENCY_NUMBER}`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">phone_in_talk</span>
            <span>Llamar al {EMERGENCY_NUMBER}</span>
          </a>
        </div>
      </div>
    </PageShell>
  );
}
