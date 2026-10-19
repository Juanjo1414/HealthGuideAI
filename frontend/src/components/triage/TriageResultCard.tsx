import { toast } from "sonner";
import EmergencyPanel from "./EmergencyPanel";
import { getPriorityMeta } from "../../constants/priority";
import { EMERGENCY_NUMBER } from "../../constants/emergency";
import { splitCause, splitRecommendation } from "../../lib/triageText";
import type { AnonymousChatMessageResponse, ChatMessageResponse, TriageResponse } from "../../api/types";

/**
 * Campos que TriageResultCard necesita del resultado — el mismo shape que
 * comparten TriageResponse, ChatMessageResponse y AnonymousChatMessageResponse.
 * No se usa el tipo unión directamente porque cada uno trae campos extra
 * (`request_id`, `conversation_id`, etc.) que esta tarjeta no necesita.
 */
export type TriageResultCardData = Pick<
  TriageResponse | ChatMessageResponse | AnonymousChatMessageResponse,
  "resumen" | "sintomas_detectados" | "prioridad" | "posibles_causas" | "alertas" | "recomendacion" | "requiere_revision" | "confianza"
>;

interface TriageResultCardProps {
  result: TriageResultCardData;
  /** El texto que el usuario escribió para el primer turno de la conversación. */
  symptoms: string;
}

const GENERIC_RED_FLAGS: [string, string][] = [
  ["Dolor u opresión en el pecho", "sobre todo si se irradia al brazo, la mandíbula o la espalda, o viene con sudoración fría."],
  ["Dificultad súbita para respirar", "falta de aire en reposo o incapacidad para decir frases completas."],
  ["Signos neurológicos", "pérdida de fuerza en un lado del cuerpo, cara caída, dificultad para hablar o pérdida de conciencia."],
];

function copy(text: string, ok = "Copiado.") {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(ok))
    .catch(() => toast.error("No se pudo copiar."));
}

/**
 * Tarjeta de resultado de triaje — extraída de ResultPage.tsx (ver
 * triage-conversational-chat) para reutilizarla tanto en el primer turno
 * de HomePage como, potencialmente, en cualquier otro lugar que muestre un
 * resultado de triaje con el mismo diseño visual. Si la prioridad es
 * EMERGENCIA, reemplaza todo el contenido por EmergencyPanel (mismo
 * criterio que tenía ResultPage).
 */
export default function TriageResultCard({ result, symptoms }: TriageResultCardProps) {
  const meta = getPriorityMeta(result.prioridad);
  const isEmergency = result.prioridad === "EMERGENCIA";

  const { steps: selfCare, disclaimer } = splitRecommendation(result.recomendacion);
  const causes = result.posibles_causas.map(splitCause);
  const doctorQuestions = [
    ...causes.slice(0, 2).map(({ name }) => `¿Podría lo que siento estar relacionado con ${name.toLowerCase()}?`),
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

  if (isEmergency) {
    return (
      <EmergencyPanel
        signals={result.alertas.length ? result.alertas : result.sintomas_detectados}
        dispatchSummary={dispatchSummary}
      />
    );
  }

  return (
    <div className="flex flex-col gap-space-lg">
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
                  result.requiere_revision ? "Recomendada" : "No necesaria",
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-space-lg">
        <section aria-labelledby="caso-titulo" className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">psychology</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Tu caso</span>
              <h2 id="caso-titulo" className="font-headline-sm text-headline-sm text-on-surface">Lo que identificamos</h2>
            </div>
          </div>
          <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">Síntomas que reconocimos en tu descripción:</p>
          {result.sintomas_detectados.length ? (
            <ul aria-label="Síntomas detectados" className="mt-space-sm flex flex-wrap gap-space-xs">
              {result.sintomas_detectados.map((sintoma) => (
                <li key={sintoma} className="px-space-sm py-1 bg-surface-container text-on-surface rounded-full font-label-md text-label-md">
                  {sintoma}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-space-sm font-body-sm text-body-sm text-on-surface">No identificamos síntomas específicos.</p>
          )}
          {result.alertas.length > 0 && (
            <div className="mt-space-md p-space-sm bg-error-container/30 rounded-xl">
              <span className="font-label-sm text-label-sm text-error uppercase font-bold">Señales a tener en cuenta</span>
              <ul className="mt-1 space-y-1">
                {result.alertas.map((alerta) => (
                  <li key={alerta} className="font-body-sm text-body-sm text-on-surface">{alerta}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <section aria-labelledby="causas-titulo" className="lg:col-span-3 bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">lightbulb</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-bold">Posibilidades, no diagnóstico</span>
              <h2 id="causas-titulo" className="font-headline-sm text-headline-sm text-on-surface">Qué podría estar pasando</h2>
            </div>
          </div>
          {causes.length ? (
            <ol className="mt-space-md space-y-space-sm">
              {causes.map(({ name, reason }, index) => (
                <li key={`${index}-${name}`} className="p-space-sm bg-surface-container-low rounded-xl">
                  <p className="font-label-md text-label-md text-on-surface first-letter:uppercase">{name}</p>
                  {reason && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 first-letter:uppercase">{reason}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-space-md font-body-sm text-body-sm text-on-surface">
              Con lo que describiste no es posible sugerir causas concretas. Agregar más detalle ayuda a orientarte mejor.
            </p>
          )}
          <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
            Son orientativas: solo un profesional de la salud puede confirmar qué está pasando.
          </p>
        </section>
      </div>

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
          {disclaimer.length > 0 && (
            <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant italic">{disclaimer.join(" ")}</p>
          )}
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
            <a className="w-full h-[48px] bg-error hover:opacity-90 text-on-error font-label-md text-label-md rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs" href={`tel:${EMERGENCY_NUMBER}`}>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">e911_emergency</span>
              Llamar a Urgencias ({EMERGENCY_NUMBER})
            </a>
          </div>
        </div>
      </div>

      <p className="font-label-sm text-label-sm text-on-surface-variant">
        Señal interna del modelo, no calibrada clínicamente: {Math.round(result.confianza * 100)}%. HealthGuide AI puede
        equivocarse; la recomendación final es consultar a un profesional de la salud.
      </p>
    </div>
  );
}
