import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EMERGENCY_NUMBER } from "../../constants/emergency";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * Las respuestas salen de las reglas reales del producto (CLAUDE.md sección 2,
 * contract.PRIORITY_RUBRIC y la página de Términos): el FAQ no puede prometer
 * nada que el sistema no haga. Si cambia una regla, cambia acá también.
 */
const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Qué es HealthGuide AI y qué hace?",
    answer:
      "Es un asistente que, a partir de los síntomas que describes con tus propias palabras, clasifica la prioridad de atención (baja, media, alta o emergencia) y te sugiere un siguiente paso: seguir monitoreando en casa, agendar una cita o ir a urgencias.",
  },
  {
    question: "¿Me da un diagnóstico?",
    answer:
      "No. Nunca diagnostica una enfermedad ni afirma qué tienes. Puede mencionar categorías generales de posibles causas, siempre como posibilidades, y solo un profesional de la salud puede confirmar qué está pasando.",
  },
  {
    question: "¿Me recomienda medicamentos?",
    answer: "No, ni por nombre ni por tipo. Sí puede sugerir autocuidado general, como hidratarte y descansar.",
  },
  {
    question: "¿Qué pasa si describo una señal de alarma?",
    answer: `Si tu texto menciona algo como dolor de pecho o dificultad para respirar, unas reglas fijas lo detectan antes de que el modelo responda y suben la prioridad a emergencia, sin importar lo que conteste la IA. Ante riesgo vital no esperes la evaluación: llama al ${EMERGENCY_NUMBER}.`,
  },
  {
    question: "¿Qué significa cada prioridad?",
    answer:
      "Baja: puedes monitorear tus síntomas en casa. Media: conviene agendar una cita médica en los próximos días. Alta: busca atención médica en las próximas horas. Emergencia: acude a urgencias de inmediato.",
  },
  {
    question: "¿Puede equivocarse?",
    answer:
      "Sí. Es una orientación, no una decisión: puede equivocarse, y el porcentaje de confianza que ves es una señal interna del modelo, no una medida clínica. La decisión final es tuya y de un profesional de la salud; ante la duda, consulta.",
  },
  {
    question: "¿Necesito una cuenta? ¿Qué pasa con lo que escribo?",
    answer: (
      <>
        No necesitas cuenta. Sin cuenta, el servidor no guarda el texto de tu consulta (solo un registro técnico mínimo con
        fecha y prioridad), pero la conversación se conserva en este navegador para que puedas seguirla; se borra al empezar
        una nueva evaluación. Con cuenta, tus conversaciones quedan en tu historial privado y puedes borrarlas cuando
        quieras. Para generar la orientación, el texto se envía al modelo de NVIDIA; el detalle está en los{" "}
        <Link className="text-primary underline underline-offset-4 hover:text-primary-container" to="/terminos">
          Términos y Privacidad
        </Link>
        .
      </>
    ),
  },
  {
    question: "¿Y si escribo muy poco o algo vago?",
    answer:
      "El sistema te pide más detalles en vez de inventar una clasificación con falsa seguridad. Cuanto más concretes (qué sientes, desde cuándo, qué tan intenso es), más útil será la orientación.",
  },
  {
    question: "¿Puedo seguir la conversación después del primer resultado?",
    answer:
      "Sí. Puedes seguir escribiendo para dar más contexto; cada conversación admite hasta 20 mensajes tuyos, y si una emergencia queda marcada se mantiene en esa conversación. Para empezar de cero usa «Nueva evaluación».",
  },
];

/** Preguntas frecuentes de la portada: acordeón nativo (<details>), accesible sin JavaScript. */
export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-titulo" className="w-full bg-bg-tint scroll-mt-24">
      <div className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase text-secondary">FAQ</span>
            <h2 id="faq-titulo" className="font-headline-lg text-headline-lg text-ink tracking-tight mt-space-xs">
              <span className="text-heading-muted">Preguntas</span> frecuentes
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Lo que conviene saber antes de describir tus síntomas.
            </p>
          </div>
          <div className="flex flex-col gap-space-sm">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group bg-white border border-slate-200 rounded-xl open:shadow-card transition-shadow">
                <summary className="flex items-center justify-between gap-space-md cursor-pointer list-none px-space-md py-space-md font-headline-sm text-headline-sm text-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined flex-shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    expand_more
                  </span>
                </summary>
                <div className="px-space-md pb-space-md font-body-md text-body-md text-on-surface-variant">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
