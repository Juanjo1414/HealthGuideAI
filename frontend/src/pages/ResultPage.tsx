import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "../components/layout/PageShell";
import EmergencyPanel from "../components/triage/EmergencyPanel";
import VagueInputPanel from "../components/triage/VagueInputPanel";
import { requestTriage, TriageApiError } from "../api/triageApi";
import { getPriorityMeta } from "../constants/priority";
import { useAuth } from "../context/AuthContext";
import type { TriageResponse } from "../api/types";
import GoogleIcon from "../components/GoogleIcon";

export interface ResultState {
  result: TriageResponse;
  symptoms: string;
  duration: string | null;
  submittedAt: number;
}

/** Mismo umbral que la regla "input incompleto" del validador (evals/triage_rules.py). */
const MIN_WORDS = 8;

const GENERIC_RED_FLAGS: [string, string][] = [
  ["Dolor u opresión en el pecho", "sobre todo si se irradia al brazo, la mandíbula o la espalda, o viene con sudoración fría."],
  ["Dificultad súbita para respirar", "falta de aire en reposo o incapacidad para decir frases completas."],
  ["Signos neurológicos", "pérdida de fuerza en un lado del cuerpo, cara caída, dificultad para hablar o pérdida de conciencia."],
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function copy(text: string, ok = "Copiado.") {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(ok))
    .catch(() => toast.error("No se pudo copiar."));
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const state = location.state as ResultState | null;
  const [reevaluating, setReevaluating] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.focus();
  }, [state?.submittedAt]);

  // Sin estado (recarga o acceso directo): no hay nada que mostrar. A
  // propósito no se persiste el resultado en storage — son datos de salud.
  if (!state?.result) return <Navigate to="/" replace />;

  const { result, symptoms, duration, submittedAt } = state;
  const meta = getPriorityMeta(result.prioridad);
  const isEmergency = result.prioridad === "EMERGENCIA";
  const wordCount = symptoms.trim().split(/\s+/).length;
  const needsMoreInfo = wordCount < MIN_WORDS && (result.prioridad === "BAJA" || result.prioridad === "MEDIA");
  const folio = result.request_id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(submittedAt);

  const selfCare = splitSentences(result.recomendacion);
  const doctorQuestions = [
    ...result.posibles_causas.slice(0, 2).map((cause) => `¿Podría lo que siento estar relacionado con ${cause.toLowerCase()}?`),
    "¿Qué signos de evolución desfavorable deberían motivar una reevaluación o ir a urgencias?",
    "¿Necesito algún estudio o control adicional según cómo evolucionen mis síntomas?",
  ];
  const dispatchSummary = [
    `Síntomas: ${symptoms}`,
    result.sintomas_detectados.length ? `Detectados: ${result.sintomas_detectados.join(", ")}` : "",
    `Orientación HealthGuide AI: ${meta.label}`,
  ]
    .filter(Boolean)
    .join(". ");

  async function reevaluate(text: string) {
    setReevaluating(true);
    try {
      const next = await requestTriage(text);
      navigate("/resultado", { replace: true, state: { result: next, symptoms: text, duration, submittedAt: Date.now() } });
    } catch (error) {
      if (error instanceof TriageApiError && error.status >= 500) {
        navigate("/500");
        return;
      }
      toast.error(error instanceof TriageApiError ? error.message : "No se pudo reevaluar.");
    } finally {
      setReevaluating(false);
    }
  }

  return (
    <PageShell>
      <div
        ref={topRef}
        tabIndex={-1}
        aria-live="polite"
        className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg space-y-space-xl outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-full shadow-sm print:shadow-none">
          <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span aria-hidden="true" className="material-symbols-outlined icon-filled text-primary text-headline-sm">check_circle</span>
            <span>Evaluación de Triaje Finalizada</span>
            <span className="mx-space-xs text-outline-variant">•</span>
            <span className="text-on-surface font-normal">
              Folio: <span className="font-mono text-label-sm font-bold text-primary">#HG-{folio}</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Generado a las {time}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors print:hidden"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">print</span> Imprimir ficha
            </button>
          </div>
        </div>

        {isEmergency ? (
          <EmergencyPanel
            signals={result.alertas.length ? result.alertas : result.sintomas_detectados}
            dispatchSummary={dispatchSummary}
          />
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl">
            <div className={`w-full h-3 bg-gradient-to-r ${meta.stripClass}`} />
            <div className="p-space-md md:p-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              <div className="lg:col-span-8 flex flex-col gap-space-sm">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <span className={`inline-flex items-center gap-space-xs px-space-md py-1 font-label-md text-label-md rounded-full shadow-sm ${meta.pillClass}`}>
                    <span aria-hidden="true" className="material-symbols-outlined icon-filled text-[18px]">{meta.icon}</span>
                    Prioridad recomendada: {meta.label}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide bg-surface-container px-space-sm py-1 rounded-full">
                    {meta.window}
                  </span>
                </div>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface tracking-tight mt-space-xs">
                  {meta.headline}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{result.resumen}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm pt-space-xs">
                  {[
                    ["monitor_heart", "Riesgo vital", meta.vitalRisk, "text-primary"],
                    ["calendar_today", "Sugerencia", meta.suggestion, "text-tertiary"],
                    [
                      "person_search",
                      "Revisión humana",
                      result.requires_human_review ? "Recomendada" : "No necesaria",
                      "text-primary-container",
                    ],
                  ].map(([icon, label, value, tone], index) => (
                    <div
                      key={label}
                      className={`p-space-sm bg-surface-container-low rounded-xl flex items-center gap-space-sm ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 ${tone}`}>
                        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
                        <span className="font-label-md text-label-md text-on-surface">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 bg-gradient-to-br from-surface-container-low to-surface-container p-space-md rounded-2xl flex flex-col items-center text-center shadow-inner relative overflow-hidden">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                    <circle className="text-surface-variant" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeWidth="10" />
                    <circle
                      className={meta.gaugeClass}
                      cx="60"
                      cy="60"
                      fill="transparent"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.159"
                      strokeDashoffset={314.159 * (1 - meta.level / 4)}
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-headline-lg text-on-surface font-bold">{meta.level} / 4</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Prioridad</span>
                  </div>
                </div>
                <div className="mt-space-sm">
                  <p className="font-label-md text-label-md text-on-surface">Nivel de prioridad {meta.level} de 4</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{meta.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {needsMoreInfo && <VagueInputPanel originalText={symptoms} onResubmit={reevaluate} isLoading={reevaluating} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="flex flex-col justify-between bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">spa</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">Paso 01</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Qué hacer mientras tanto</h2>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Recomendación generada para tu caso:</p>
              <ul className="space-y-space-sm">
                {selfCare.map((sentence) => (
                  <li key={sentence} className="flex items-start gap-space-xs text-on-surface font-body-sm text-body-sm">
                    <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>{sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-space-md p-space-sm bg-surface-container rounded-xl flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-tertiary text-[18px]">info</span>
              <span>Aviso: no te automediques. Ningún medicamento debe tomarse sin indicación médica.</span>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">assignment</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Paso 02</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Preguntas para tu médico</h2>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lleva estas dudas a tu consulta presencial. Las causas mencionadas son generales, no un diagnóstico.
              </p>
              <div className="space-y-space-xs">
                {doctorQuestions.map((question) => (
                  <div key={question} className="p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-body-sm text-body-sm text-on-surface pr-6">"{question}"</p>
                      <button
                        type="button"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="Copiar pregunta"
                        aria-label="Copiar pregunta"
                        onClick={() => copy(question, "Pregunta copiada.")}
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copy(doctorQuestions.join("\n"), "Preguntas copiadas.")}
              className="mt-space-md w-full py-space-xs px-space-sm bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md rounded-xl transition-all flex items-center justify-center gap-space-xs"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">copy_all</span>
              Copiar todas las preguntas
            </button>
          </div>

          <div className="flex flex-col justify-between bg-error-container/20 rounded-2xl p-space-md md:p-space-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-error text-on-error flex items-center justify-center flex-shrink-0 shadow-md">
                  <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">warning</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">Vigilancia Crítica</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Cuándo ir a Urgencias</h2>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Si presentas cualquiera de estas <strong>señales de alarma</strong>, no esperes: acude a urgencias de
                inmediato o llama a emergencias.
              </p>
              <ul className="space-y-space-sm">
                {result.alertas.map((alerta) => (
                  <li key={alerta} className="flex items-start gap-space-xs text-on-surface font-body-sm text-body-sm">
                    <span aria-hidden="true" className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">crisis_alert</span>
                    <span><strong>{alerta}</strong></span>
                  </li>
                ))}
                {GENERIC_RED_FLAGS.map(([title, body]) => (
                  <li key={title} className="flex items-start gap-space-xs text-on-surface font-body-sm text-body-sm">
                    <span aria-hidden="true" className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">crisis_alert</span>
                    <span><strong>{title}:</strong> {body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-space-md pt-space-xs">
              <a className="w-full h-[48px] bg-error hover:opacity-90 text-on-error font-label-md text-label-md rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs" href="tel:112">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">e911_emergency</span>
                Llamar a Urgencias (112 / 911)
              </a>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-primary to-primary-container text-on-primary p-space-md md:p-space-xl shadow-2xl print:hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-1 bg-surface-container-lowest/15 backdrop-blur-sm rounded-full font-label-sm text-label-sm text-primary-fixed">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">bookmark</span>
                {isAuthenticated ? "Guardado en tu historial" : "Guarda tu evolución sin costo"}
              </div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold text-on-primary leading-tight">
                {isAuthenticated
                  ? "Esta consulta ya quedó en tu historial privado"
                  : "¿Deseas guardar tus consultas para tu médico o para seguir tu evolución?"}
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container leading-relaxed">
                {isAuthenticated
                  ? "Puedes revisarla cuando quieras desde Mi Historial, junto con tus consultas anteriores, e imprimir la ficha para tu profesional de cabecera."
                  : "Crea una cuenta gratis y tus próximas consultas quedarán guardadas en tu historial. Esta consulta anónima no se guardó: puedes imprimirla ahora para llevarla a tu médico."}
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs text-primary-fixed font-label-sm text-label-sm">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">lock</span> Historial privado
                </span>
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">block</span> Sin publicidad
                </span>
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">no_accounts</span> Consulta anónima siempre disponible
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 bg-surface-container-lowest text-on-surface p-space-md md:p-space-lg rounded-2xl shadow-xl flex flex-col gap-space-sm">
              {isAuthenticated ? (
                <>
                  <div className="text-center mb-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Tu expediente</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Todas tus consultas en un solo lugar</p>
                  </div>
                  <Link
                    to="/historial"
                    className="w-full h-[50px] bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded-xl transition-all flex items-center justify-center gap-space-sm shadow-md"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">history</span>
                    Ver mi historial
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-center mb-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Guardar en 1 clic</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Sin contraseñas complicadas ni publicidad</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("El acceso con Google llega en una próxima versión. Por ahora, usa tu correo.")}
                    className="w-full h-[50px] bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-xl transition-all flex items-center justify-center gap-space-sm shadow-sm"
                  >
                    <GoogleIcon />
                    <span>Guardar con Google</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">(próximamente)</span>
                  </button>
                  <Link
                    to="/signup"
                    className="w-full h-[50px] bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded-xl transition-all flex items-center justify-center gap-space-sm shadow-md"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">mail</span>
                    <span>Continuar con correo</span>
                  </Link>
                </>
              )}
              <div className="relative flex py-space-xs items-center">
                <div className="flex-grow border-t border-surface-container-high" />
                <span className="flex-shrink mx-space-sm text-on-surface-variant font-label-sm text-label-sm uppercase">o también</span>
                <div className="flex-grow border-t border-surface-container-high" />
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-space-xs text-center text-primary hover:text-primary-container font-label-md text-label-md transition-colors flex items-center justify-center gap-1"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">download</span>
                {isAuthenticated ? "Imprimir o guardar como PDF" : "Continuar sin registrarme (imprimir / PDF)"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Ficha para el profesional</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">Resumen para tu médico</h3>
            </div>
            <span className="px-space-sm py-1 bg-surface-container-low text-on-surface-variant rounded-full font-label-sm text-label-sm">
              Orientación automática, no diagnóstica
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-sm bg-surface-container-low rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Motivo principal</span>
              <p className="font-body-md text-body-md text-on-surface font-semibold mt-1 line-clamp-3">{symptoms}</p>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 block">Duración: {duration ?? "no indicada"}</span>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Prioridad orientativa</span>
              <p className="font-body-md text-body-md text-on-surface font-semibold mt-1">{meta.label}</p>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 block">{meta.window}</span>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Síntomas detectados</span>
              <p className="font-body-md text-body-md text-on-surface font-semibold mt-1">
                {result.sintomas_detectados.length ? result.sintomas_detectados.join(", ") : "Sin síntomas específicos"}
              </p>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Señales de alarma</span>
              <p className={`font-body-md text-body-md font-semibold mt-1 ${result.alertas.length ? "text-error" : "text-secondary"}`}>
                {result.alertas.length ? `${result.alertas.length} registrada(s)` : "Ninguna registrada"}
              </p>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 block">
                {result.alertas.length ? result.alertas.join("; ") : "Según la descripción entregada"}
              </span>
            </div>
          </div>
          <p className="mt-space-md font-label-sm text-label-sm text-on-surface-variant">
            Señal interna del modelo, no calibrada clínicamente: {Math.round(result.confianza * 100)}%. HealthGuide AI puede
            equivocarse; la recomendación final es consultar a un profesional de la salud.
          </p>
        </div>

        <div className="bg-surface-container-low p-space-md md:p-space-lg rounded-2xl flex flex-col md:flex-row items-center justify-between gap-space-md print:hidden">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">local_hospital</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">¿Necesitas ubicar un centro médico cercano?</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Abre el mapa para ver centros de salud cerca de tu ubicación.</p>
            </div>
          </div>
          <a
            className="inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md rounded-full shadow-sm transition-all flex-shrink-0"
            href="https://www.google.com/maps/search/centros+de+salud+cerca+de+mi"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">near_me</span>
            Explorar centros médicos
          </a>
        </div>

        <div className="flex justify-center print:hidden">
          <Link to="/" className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary hover:underline underline-offset-4">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
            Nueva evaluación
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
