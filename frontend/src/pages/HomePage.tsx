import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import OfflinePanel from "../components/triage/OfflinePanel";
import AssistantMessage from "../components/triage/AssistantMessage";
import type { TriageResultCardData } from "../components/triage/TriageResultCard";
import ChatComposer from "../components/triage/ChatComposer";
import FaqSection from "../components/home/FaqSection";
import { ChatApiError, createConversation, getConversation, sendAnonymousMessage, sendMessage } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";
import { useSpeechDictation } from "../lib/useSpeechDictation";
import { EMERGENCY_NUMBER } from "../constants/emergency";
import type { AnonymousChatTurn, ChatMessageOut } from "../api/types";

const MAX_LENGTH = 600;

/** Clave de localStorage para la conversación anónima en curso (ver diseño triage-conversational-chat). */
const ANONYMOUS_CHAT_STORAGE_KEY = "healthguide_anonymous_chat";

/** Un turno de la conversación mostrada en pantalla, con o sin evaluación estructurada. */
interface TurnRecord {
  role: "user" | "assistant";
  content: string;
  result?: TriageResultCardData;
}

const DURATIONS = ["Hoy", "1 a 3 días", "+1 semana"] as const;
type Duration = (typeof DURATIONS)[number];

const QUICK_FILLS = [
  { label: "Dolor abdominal repentino", text: "Tengo dolor abdominal repentino", urgent: false },
  { label: "Fiebre y dolor de garganta", text: "Tengo fiebre y dolor de garganta", urgent: false },
  { label: "Mareo al cambiar de postura", text: "Siento mareo al cambiar de postura o al levantarme", urgent: false },
  { label: "Presión en el pecho (Prioritario)", text: "Siento presión en el pecho", urgent: true },
  { label: "Molestia lumbar leve", text: "Tengo una molestia lumbar leve", urgent: false },
];

const PILLARS = [
  {
    icon: "rule",
    tone: "secondary",
    title: "Cero Diagnósticos Inventados",
    body: "Identificamos niveles de prioridad asistencial (baja, media, alta, emergencia). Nunca afirmamos una enfermedad específica sin examinación clínica presencial.",
    footIcon: "task_alt",
    foot: "Priorización, no especulación",
  },
  {
    icon: "medication",
    tone: "secondary",
    title: "Sin Medicación Automática",
    body: "Cero fármacos sugeridos, ni por nombre ni por categoría. Solo brindamos pautas seguras de hidratación, reposo y medidas no invasivas de alivio.",
    footIcon: "block",
    foot: "Prevención de automedicación",
  },
  {
    icon: "fmd_bad",
    tone: "error",
    title: "Detección de Alarmas",
    body: "Reglas deterministas revisan tu texto antes del modelo. Si un síntoma refleja riesgo vital, te derivamos a emergencias sin rodeos.",
    footIcon: "warning",
    foot: "Filtro estricto de banderas rojas",
  },
  {
    icon: "enhanced_encryption",
    tone: "secondary",
    title: "Sin Cuenta, Sin Rastro",
    body: "Consulta libre y privada: sin cuenta no guardamos el texto de tus síntomas. Regístrate solo si quieres conservar tu historial.",
    footIcon: "verified",
    foot: "Privacidad por diseño",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Expresión en Lenguaje Natural",
    body: "Describe lo que sientes tal y como se lo contarías a tu médico de cabecera o a un familiar cercano.",
    icon: "mic_none",
    foot: "Texto o dictado por voz",
  },
  {
    n: "02",
    title: "Revisión de Señales de Alarma",
    body: "Reglas clínicas deterministas revisan tu descripción antes del modelo de IA, y un validador de seguridad revisa su respuesta.",
    icon: "checklist",
    foot: "Doble control de seguridad",
  },
  {
    n: "03",
    title: "Recomendación de Nivel Asistencial",
    body: "Obtén una orientación clara: urgencias ahora, atención en horas, cita en días o cuidados en casa.",
    icon: "print",
    foot: "Imprimible para tu médico",
  },
];

export default function HomePage() {
  const location = useLocation();
  const { isAuthenticated, status: authStatus } = useAuth();
  // "Reevaluar" desde el historial llega con el texto ya cargado.
  const [text, setText] = useState(() =>
    ((location.state as { prefill?: string } | null)?.prefill ?? "").slice(0, MAX_LENGTH)
  );
  const [duration, setDuration] = useState<Duration | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "offline" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Foco al resultado cuando llega el primero (lectores de pantalla): sin esto,
  // al ocultarse el formulario el foco se pierde. Los turnos siguientes se
  // anuncian por aria-live sin mover el foco del composer.
  const resultRef = useRef<HTMLDivElement>(null);
  const [focusResultSignal, setFocusResultSignal] = useState(0);
  const dictation = useSpeechDictation((transcript) =>
    setText((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${transcript}`.slice(0, MAX_LENGTH))
  );

  // Turnos de la conversación ya mostrados en pantalla. Vacío = todavía no
  // se envió nada, se muestra el formulario de una sola pregunta de
  // siempre; con contenido, se oculta el formulario y queda la tarjeta de
  // resultado + el hilo de chat debajo (ver diseño triage-conversational-chat).
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  // Solo aplica al flujo autenticado: se crea en el primer envío y se
  // reutiliza para los turnos siguientes de la misma conversación.
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [alreadyEmergency, setAlreadyEmergency] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // Guarda el último texto enviado para poder reintentar tras un error de red
  // sin que el usuario pierda lo que ya escribió.
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoadingExistingConversation, setIsLoadingExistingConversation] = useState(false);

  // Si llega con `?conversationId=xxx` (desde "Mi Historial") y hay sesión,
  // carga esa conversación completa y la muestra en el mismo formato de
  // turnos + composer, permitiendo seguir escribiendo sin perder contexto.
  useEffect(() => {
    const existingId = searchParams.get("conversationId");
    if (!existingId || authStatus === "loading" || !isAuthenticated) return;
    let cancelled = false;
    setIsLoadingExistingConversation(true);
    getConversation(existingId)
      .then((conversation) => {
        if (cancelled) return;
        setConversationId(conversation.id);
        setAlreadyEmergency(conversation.locked_emergency);
        setTurns(
          conversation.messages.map((message: ChatMessageOut) => ({
            role: message.role,
            content: message.content,
            result: message.evaluacion ?? undefined,
          }))
        );
      })
      .catch(() => {
        // Si falla la carga (conversación borrada, 404, etc.) simplemente
        // se queda en el formulario normal, sin bloquear la pantalla.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExistingConversation(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, isAuthenticated]);

  // Restaura la conversación anónima en curso al montar. Se espera a que
  // AuthContext termine de resolver la sesión (status !== "loading") antes
  // de decidir: si el usuario ya tiene sesión, se ignora cualquier resto
  // anónimo viejo y se arranca en blanco.
  useEffect(() => {
    if (authStatus === "loading" || isAuthenticated) return;
    try {
      const raw = localStorage.getItem(ANONYMOUS_CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { turns?: TurnRecord[]; alreadyEmergency?: boolean };
      if (Array.isArray(parsed.turns) && parsed.turns.length > 0) {
        setTurns(parsed.turns);
        setAlreadyEmergency(Boolean(parsed.alreadyEmergency));
      }
    } catch {
      // Clave corrupta: se ignora silenciosamente, el usuario simplemente
      // arranca de cero.
    }
    // Solo se ejecuta cuando authStatus deja de ser "loading" (una vez).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  // Persiste la conversación anónima en curso. Si hay sesión, nunca se
  // escribe a localStorage (no tiene sentido duplicar lo que ya guarda el
  // backend, y evita mezclar datos de dos cuentas distintas en el navegador).
  useEffect(() => {
    if (authStatus === "loading" || isAuthenticated) return;
    if (turns.length === 0) {
      localStorage.removeItem(ANONYMOUS_CHAT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(ANONYMOUS_CHAT_STORAGE_KEY, JSON.stringify({ turns, alreadyEmergency }));
  }, [turns, alreadyEmergency, authStatus, isAuthenticated]);

  useEffect(() => {
    if (focusResultSignal > 0) resultRef.current?.focus();
  }, [focusResultSignal]);

  async function submit(symptomsText: string) {
    const trimmed = symptomsText.trim();
    if (!trimmed || isSending) return;
    // La duración solo tiene sentido en el primer mensaje: ahí es donde
    // existe el selector de "¿Desde cuándo?". En turnos siguientes el
    // texto va tal cual lo escribió el usuario en el composer de chat.
    const payload = turns.length === 0 && duration ? `${trimmed}. Duración: ${duration.toLowerCase()}.` : trimmed;

    setIsSending(true);
    setStatus("loading");
    setErrorMessage("");
    setLastAttempt(payload);
    const userTurn: TurnRecord = { role: "user", content: payload };

    try {
      if (isAuthenticated) {
        let activeConversationId = conversationId;
        if (!activeConversationId) {
          const created = await createConversation();
          activeConversationId = created.id;
          setConversationId(activeConversationId);
        }
        const response = await sendMessage(activeConversationId, payload);
        setTurns((prev) => [...prev, userTurn, { role: "assistant", content: response.respuesta, result: response }]);
        if (response.prioridad === "EMERGENCIA") setAlreadyEmergency(true);
      } else {
        const historyForRequest: AnonymousChatTurn[] = turns.map(({ role, content }) => ({ role, content }));
        const response = await sendAnonymousMessage(payload, historyForRequest, alreadyEmergency);
        setTurns((prev) => [...prev, userTurn, { role: "assistant", content: response.respuesta, result: response }]);
        if (response.prioridad === "EMERGENCIA") setAlreadyEmergency(true);
      }
      setStatus("idle");
      setText("");
      if (turns.length === 0) setFocusResultSignal((n) => n + 1);
    } catch (error) {
      if (error instanceof ChatApiError && error.status === 0) {
        setStatus("offline");
        return;
      }
      if (error instanceof ChatApiError && error.status === 409) {
        setErrorMessage("Esta conversación llegó a su límite de mensajes. Para seguir, inicia una nueva evaluación.");
        setStatus("error");
        return;
      }
      if (error instanceof ChatApiError && error.status === 429) {
        setErrorMessage(error.message || "Demasiadas solicitudes, espera un momento.");
        setStatus("error");
        return;
      }
      // A diferencia del formulario de una sola pregunta de antes, acá NO
      // se navega a /500 ante un error 5xx cuando ya hay turnos previos
      // visibles: hacerlo perdería toda la conversación en curso. Se
      // prefiere mostrar el error en línea y dejar que el usuario reintente.
      setErrorMessage(
        error instanceof ChatApiError ? error.message : "Ocurrió un error inesperado. Intenta de nuevo."
      );
      setStatus("error");
    } finally {
      setIsSending(false);
    }
  }

  /**
   * Sale de la conversación en curso y vuelve al formulario inicial. Una
   * conversación con cuenta sigue en "Mis conversaciones"; la anónima solo
   * vive en este navegador, así que ahí se pide confirmación antes de perderla.
   * La emergencia marcada también se reinicia: es una evaluación nueva.
   */
  function startNewEvaluation() {
    if (!isAuthenticated && !window.confirm("¿Empezar una nueva evaluación? La conversación actual se borrará de este navegador.")) {
      return;
    }
    setTurns([]);
    setConversationId(null);
    setAlreadyEmergency(false);
    setText("");
    setDuration(null);
    setLastAttempt(null);
    setErrorMessage("");
    setStatus("idle");
    if (searchParams.has("conversationId")) setSearchParams({}, { replace: true });
    window.scrollTo(0, 0);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(text);
  }

  function retryLastAttempt() {
    if (lastAttempt) submit(lastAttempt);
  }

  function focusForm() {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const isLoading = status === "loading";
  // Texto del mensaje de usuario que cada turno de asistente responde — lo
  // necesita AssistantMessage para armar la ficha imprimible y las preguntas
  // sugeridas para el médico (TriageResultCard.symptoms).
  const precedingUserContent = (index: number) => {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (turns[i].role === "user") return turns[i].content;
    }
    return "";
  };

  return (
    <PageShell>
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/40 to-surface pb-space-xl">
          <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-secondary-fixed/20 blur-3xl" />
          <div className="pointer-events-none absolute top-72 -left-20 h-80 w-80 rounded-full bg-primary-fixed/25 blur-3xl" />
          <div className="relative mx-auto w-full max-w-[1280px] px-margin md:px-margin-tablet lg:px-margin-desktop pt-space-lg md:pt-space-xl">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-1 bg-surface-container-lowest text-primary shadow-sm rounded-full">
                <span className="inline-flex h-2 w-2 rounded-full bg-secondary animate-ping motion-reduce:animate-none" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Triaje Clínico Activo</span>
                <span className="text-outline-variant">•</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Reglas de seguridad clínicas + IA</span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">verified_user</span>
                <span>{isAuthenticated ? "Sesión iniciada • Se guarda en tu historial privado" : "Sin registro obligatorio • 100% Anónimo"}</span>
              </div>
            </div>

            {/* Con una conversación en curso el h1 de la página es el del resultado. */}
            {(turns.length === 0 || isLoadingExistingConversation) && (
            <div className="max-w-3xl mb-space-lg">
              <h1 className="font-display-lg-mobile text-hero-mobile md:font-display-lg md:text-hero text-ink tracking-tight mb-space-sm">
                ¿Cómo te sientes hoy? Cuéntanos qué <span className="text-highlight">molestias tienes</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
                Respuestas claras y orientación médica responsable para saber si debes descansar en casa, agendar cita o
                acudir de inmediato a urgencias.
              </p>
            </div>
            )}

            {isLoadingExistingConversation ? (
              <div className="flex items-center justify-center py-space-xl" role="status" aria-live="polite">
                <span aria-hidden="true" className="material-symbols-outlined animate-spin text-primary text-headline-md">
                  progress_activity
                </span>
                <span className="ml-space-sm font-body-md text-body-md text-on-surface-variant">
                  Cargando conversación…
                </span>
              </div>
            ) : turns.length === 0 ? (
              <div className="w-full bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg lg:p-space-xl shadow-[0_12px_36px_-6px_rgba(15,60,140,0.08)] relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary-fixed via-primary-container to-secondary rounded-t-3xl" />
                <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between flex-wrap gap-space-xs">
                    <label className="font-label-lg text-label-lg text-primary flex items-center gap-space-xs" htmlFor="symptom-input">
                      <span aria-hidden="true" className="material-symbols-outlined text-secondary">edit_note</span>
                      Describe tus síntomas en tus propias palabras
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant" id="char-counter" aria-live="polite">
                      {text.length} / {MAX_LENGTH} caracteres
                    </span>
                  </div>

                  <div className="relative w-full rounded-2xl bg-surface-container-low transition-all duration-200 focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_3px_rgba(15,60,140,0.18)]">
                    <textarea
                      ref={textareaRef}
                      aria-describedby="char-counter symptom-hint"
                      className="w-full bg-transparent p-space-md md:p-space-lg font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none leading-relaxed"
                      id="symptom-input"
                      maxLength={MAX_LENGTH}
                      placeholder="Ejemplo: Llevo 2 días con dolor de cabeza punzante en el lado derecho, ligero mareo al levantarme y sin fiebre..."
                      rows={4}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center justify-between px-space-md pb-space-sm pt-space-xs text-on-surface-variant">
                      <div className="flex items-center gap-space-xs text-on-surface-variant" id="symptom-hint">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm text-secondary">lock</span>
                        <span className="font-label-sm text-label-sm">
                          {isAuthenticated ? "Se guardará en tu historial privado" : "Sin cuenta, no guardamos tu texto"}
                        </span>
                      </div>
                      {dictation.supported && (
                        <button
                          className={`inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                            dictation.listening
                              ? "bg-error-container text-on-error-container"
                              : "bg-surface-container text-on-surface hover:bg-surface-variant"
                          }`}
                          title="Dictar síntomas por voz"
                          type="button"
                          onClick={dictation.toggle}
                          disabled={isLoading}
                          aria-pressed={dictation.listening}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base text-primary">
                            {dictation.listening ? "stop_circle" : "mic"}
                          </span>
                          <span>{dictation.listening ? "Detener" : "Hablar"}</span>
                        </button>
                      )}
                    </div>
                    {dictation.error && (
                      <p role="alert" className="px-space-md pb-space-sm font-body-sm text-body-sm text-error">
                        {dictation.error}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs sm:gap-space-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1" id="duration-label">
                        <span aria-hidden="true" className="material-symbols-outlined text-base">schedule</span>
                        ¿Desde cuándo?
                      </span>
                      <div className="inline-flex p-1 bg-surface-container-low rounded-full gap-1" role="radiogroup" aria-labelledby="duration-label">
                        {DURATIONS.map((option) => {
                          const selected = duration === option;
                          return (
                            <button
                              key={option}
                              role="radio"
                              aria-checked={selected}
                              type="button"
                              onClick={() => setDuration(selected ? null : option)}
                              className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all ${
                                selected
                                  ? "bg-surface-container-lowest text-primary shadow-sm"
                                  : "text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center justify-center gap-space-sm px-space-xl py-3.5 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:opacity-95 active:scale-[0.99] transition-all flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                      type="submit"
                      disabled={isLoading || !text.trim()}
                    >
                      <span>{isLoading ? "Analizando…" : "Iniciar Evaluación de Síntomas"}</span>
                      <span aria-hidden="true" className={`material-symbols-outlined text-headline-sm ${isLoading ? "animate-spin" : ""}`}>
                        {isLoading ? "progress_activity" : "arrow_forward"}
                      </span>
                    </button>
                  </div>

                  <div className="pt-space-sm">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-space-xs">
                      O selecciona un motivo frecuente para autocompletar:
                    </p>
                    <div className="flex flex-wrap gap-space-xs">
                      {QUICK_FILLS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setText(chip.text);
                            textareaRef.current?.focus();
                          }}
                          className={
                            chip.urgent
                              ? "px-space-md py-space-xs bg-error-container text-on-error-container hover:bg-error hover:text-on-error rounded-full font-label-md text-label-md transition-colors flex items-center gap-1.5"
                              : "px-space-md py-space-xs bg-white border border-slate-200 hover:border-primary hover:text-primary text-on-surface rounded-full font-label-md text-label-md transition-colors flex items-center gap-1.5"
                          }
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${chip.urgent ? "bg-error animate-pulse motion-reduce:animate-none" : "bg-secondary"}`} />
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {isLoading && (
                  <div className="mt-space-md p-space-md bg-secondary-fixed/15 rounded-2xl" role="status" aria-live="polite">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined animate-spin">sync</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-label-lg text-label-lg text-primary">Analizando tus síntomas…</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Revisando señales de alarma y clasificando la prioridad. Puede tardar hasta 35 segundos. Si tus
                          síntomas son graves, no esperes: llama al {EMERGENCY_NUMBER}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div role="alert" className="mt-space-md p-space-md bg-error-container text-on-error-container rounded-2xl flex items-start gap-space-sm">
                    <span aria-hidden="true" className="material-symbols-outlined">error</span>
                    <p className="font-body-md text-body-md">{errorMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div ref={resultRef} tabIndex={-1} aria-live="polite" className="w-full flex flex-col gap-space-lg outline-none">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={startNewEvaluation}
                    disabled={isSending}
                    className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-white border border-primary/40 text-primary font-label-md text-label-md hover:border-primary hover:bg-primary-soft active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
                    Nueva evaluación
                  </button>
                </div>
                {/* Conversación completa en formato chat (triage-conversational-chat): cada
                    turno de usuario es una burbuja a la derecha, y cada turno de asistente
                    una burbuja a la izquierda con la evaluación completa plegada debajo —
                    salvo EMERGENCIA, que nunca queda oculta detrás de un clic (ver
                    AssistantMessage). */}
                <div className="flex flex-col gap-space-md bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-sm">
                  {turns.map((turn, index) =>
                    turn.role === "user" ? (
                      <div
                        key={index}
                        className="max-w-[85%] self-end rounded-2xl px-space-md py-space-sm whitespace-pre-wrap font-body-md text-body-md bg-primary-container text-on-primary"
                      >
                        {turn.content}
                      </div>
                    ) : (
                      <AssistantMessage
                        key={index}
                        content={turn.content}
                        result={turn.result}
                        symptoms={precedingUserContent(index)}
                      />
                    )
                  )}
                </div>

                {alreadyEmergency && (
                  <div
                    role="alert"
                    className="p-space-md bg-error-container text-on-error-container rounded-2xl flex items-center justify-between gap-space-md flex-wrap"
                  >
                    <div className="flex items-start gap-space-sm">
                      <span aria-hidden="true" className="material-symbols-outlined">crisis_alert</span>
                      <p className="font-body-md text-body-md">
                        Esta conversación fue marcada como emergencia. Si tus síntomas son graves, no esperes: busca
                        atención inmediata.
                      </p>
                    </div>
                    <a
                      className="inline-flex items-center justify-center gap-1.5 px-space-md py-2 rounded-full bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                      href={`tel:${EMERGENCY_NUMBER}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">call</span>
                      Llamar al {EMERGENCY_NUMBER}
                    </a>
                  </div>
                )}

                {status === "error" && (
                  <div role="alert" className="p-space-md bg-error-container text-on-error-container rounded-2xl flex items-start gap-space-sm">
                    <span aria-hidden="true" className="material-symbols-outlined">error</span>
                    <p className="font-body-md text-body-md">{errorMessage}</p>
                  </div>
                )}

                {status !== "offline" && (
                  <ChatComposer
                    onSend={submit}
                    disabled={isLoading}
                    isSending={isSending}
                    placeholder="Sigue contándome cómo te sientes…"
                  />
                )}
              </div>
            )}

            {status === "offline" && (
              <div className="mt-space-lg">
                <OfflinePanel onRetry={turns.length === 0 ? () => submit(text) : retryLastAttempt} isRetrying={false} />
              </div>
            )}

            <div className="mt-space-lg rounded-2xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(186,26,26,0.18)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-headline-md">e911_emergency</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-error" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Protocolo Inmediato de Emergencias</h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Si presentas dolor torácico irradiado al brazo, asfixia aguda, pérdida repentina del habla o pérdida de
                    consciencia, no esperes la evaluación digital.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs flex-shrink-0 w-full md:w-auto">
                <a className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-full bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all" href={`tel:${EMERGENCY_NUMBER}`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-base">call</span>
                  Llamar al {EMERGENCY_NUMBER}
                </a>
              </div>
            </div>
          </div>
        </div>

        <FaqSection />

        <div className="w-full bg-white">
        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Marco Clínico Riguroso</span>
            <h2 className="font-headline-lg text-headline-lg text-ink tracking-tight mt-space-xs">
              <span className="text-heading-muted">Compromiso de Orientación Médica </span>Ética y Responsable
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Diseñado para evitar el alarmismo infundado y proteger las decisiones oportunas de salud.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {PILLARS.map((pillar, index) => {
              const tone = pillar.tone === "error" ? "text-error" : "text-secondary";
              return (
                <div key={pillar.title} className="bg-bg-card border border-slate-200 p-space-lg rounded-2xl card-lift flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-space-md ${pillar.tone === "error" ? "text-error" : "text-primary-deep"}`}>
                      <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">{pillar.icon}</span>
                    </div>
                    <span className={`font-label-sm text-label-sm uppercase font-bold ${tone}`}>Pilar 0{index + 1}</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-space-xs">{pillar.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{pillar.body}</p>
                  </div>
                  <div className={`mt-space-md pt-space-xs flex items-center gap-1.5 font-label-sm text-label-sm ${tone}`}>
                    <span aria-hidden="true" className="material-symbols-outlined text-base">{pillar.footIcon}</span>
                    {pillar.foot}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </div>

        <section className="w-full bg-bg-tint py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <div className="inline-flex items-center gap-space-xs text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">psychology</span>
                  <span>Salud Mental y Cibercondría</span>
                </div>
                <blockquote className="font-headline-md text-headline-md text-primary leading-snug tracking-tight">
                  "Buscar síntomas en internet suele provocar pánico innecesario o conclusiones erróneas. HealthGuide AI
                  busca ser un filtro sereno que calma la incertidumbre y te enfoca en el nivel de atención adecuado."
                </blockquote>
                <div className="flex items-center gap-space-md pt-space-xs">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-sm bg-surface-container-lowest flex items-center justify-center">
                    <img alt="" className="w-full h-full object-contain" src="/logo-mark.png" />
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface">Equipo HealthGuide AI</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Makers Fellowship • AI Product Design</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-sm">
                  <div className="p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center gap-1.5 text-error font-label-sm text-label-sm uppercase mb-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                      Búsqueda en Buscadores Abiertos
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sobrecarga de foros, anuncios de tratamientos milagrosos y resultados alarmistas descontextualizados.
                    </p>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm uppercase mb-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base">check</span>
                      Orientación HealthGuide AI
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Triaje escalonado que evalúa duración, intensidad y banderas rojas con empatía.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-lg h-[420px] w-full">
                  <img alt="" className="w-full h-full object-cover" src="/stitch/inicio-persona-sofa.jpg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-space-md bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <div>
                        <p className="font-headline-sm text-headline-sm text-primary">Una sola respuesta clara</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          En vez de decenas de resultados contradictorios, una orientación con el siguiente paso.
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined">trending_down</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full bg-white">
        <section id="como-funciona" className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Flujo Transparente</span>
              <h2 className="font-headline-lg text-headline-lg text-ink tracking-tight mt-1"><span className="text-heading-muted">Tres pasos guiados </span>en menos de 2 minutos</h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Sin cuestionarios infinitos ni términos incomprensibles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-bg-card border border-slate-200 p-space-lg rounded-2xl card-lift flex flex-col justify-between">
                <div>
                  <span className="text-display-lg-mobile font-display-lg text-secondary font-bold">{step.n}</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary mt-space-xs mb-space-xs">{step.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{step.body}</p>
                </div>
                <div className="mt-space-lg flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-secondary">{step.icon}</span>
                  <span>{step.foot}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        </div>

        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24">
          <div className="bg-primary-soft text-ink rounded-3xl p-space-lg md:p-space-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary-fixed-dim/60 blur-3xl" />
            <div className="max-w-2xl relative z-10">
              <span className="px-space-md py-1 bg-white rounded-full font-label-sm text-label-sm uppercase tracking-wider text-primary-deep">
                Atención Gratuita &amp; Confidencial
              </span>
              <h2 className="font-headline-lg text-headline-lg tracking-tight mt-space-md mb-space-xs text-ink">
                No te quedes con la duda ni alimentes la preocupación
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                Toma una decisión informada sobre tu salud en menos de dos minutos. Sin formularios de registro previos.
              </p>
              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  className="inline-flex items-center gap-space-xs px-space-xl py-3 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm active:scale-95 transition-all"
                  type="button"
                  onClick={focusForm}
                >
                  <span>Escribir mis síntomas ahora</span>
                  <span aria-hidden="true" className="material-symbols-outlined">north_east</span>
                </button>
                {!isAuthenticated && (
                  <Link className="font-label-lg text-label-lg text-primary-deep underline underline-offset-4 hover:text-primary" to="/signup">
                    o crea una cuenta para guardar tu historial
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
