import { useId, useState } from "react";
import TriageResultCard, { type TriageResultCardData } from "./TriageResultCard";

interface AssistantMessageProps {
  /** Texto conversacional (`respuesta`) — lo primero que lee la persona. */
  content: string;
  /** Evaluación estructurada de este turno, si el backend la mandó. */
  result?: TriageResultCardData;
  /** Lo que escribió la persona en el mensaje al que este turno responde. */
  symptoms: string;
}

/**
 * Un mensaje del asistente dentro de la conversación (feature
 * triage-conversational-chat). Dos formas, según la prioridad:
 *
 * - EMERGENCIA: se muestra TriageResultCard completo (con EmergencyPanel),
 *   nunca plegado — una urgencia no puede quedar escondida detrás de un clic.
 * - Cualquier otra prioridad: burbuja de chat con la respuesta conversacional,
 *   y la evaluación completa (causas, pasos, preguntas para el médico)
 *   plegada debajo, para no repetir en cada turno el mismo bloque largo que
 *   ya se vio al desplegarlo una vez.
 *
 * Sin `result` (mensajes de chat viejos, de antes de que el backend guardara
 * la evaluación completa — ver AssistantEvaluation), se muestra solo la
 * burbuja, sin el desplegable.
 */
export default function AssistantMessage({ content, result, symptoms }: AssistantMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  if (result?.prioridad === "EMERGENCIA") {
    return <TriageResultCard result={result} symptoms={symptoms} />;
  }

  return (
    <div className="self-start flex flex-col items-start gap-space-xs max-w-[85%]">
      <div className="rounded-2xl px-space-md py-space-sm whitespace-pre-wrap font-body-md text-body-md bg-surface-container-low text-on-surface">
        {content}
      </div>
      {result && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              {expanded ? "expand_less" : "fact_check"}
            </span>
            {expanded ? "Ocultar evaluación completa" : "Ver evaluación completa"}
          </button>
          {expanded && (
            <div id={panelId} className="w-full">
              <TriageResultCard result={result} symptoms={symptoms} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
