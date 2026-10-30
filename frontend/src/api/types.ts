/**
 * Tipos que reflejan el contrato real del backend — backend/app/schemas/
 * auth.py y triage.py. Si el contrato cambia ahí, cambia acá; no se
 * inventan campos que el backend no devuelve.
 */

export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export type Priority = "BAJA" | "MEDIA" | "ALTA" | "EMERGENCIA";

export interface ValidationSummary {
  passed: boolean;
  checks: Record<string, boolean>;
  reasons: string[];
}

export interface TriageResponse {
  /** Respuesta conversacional, lo que el chat le muestra primero a la persona. */
  respuesta: string;
  resumen: string;
  sintomas_detectados: string[];
  prioridad: Priority;
  posibles_causas: string[];
  alertas: string[];
  recomendacion: string;
  requiere_revision: boolean;
  confianza: number;
  validation: ValidationSummary;
  requires_human_review: boolean;
  request_id: string;
}

/**
 * Una fila de GET /triage/history — ver backend/app/schemas/triage.py
 * (HistoryEntry). La mayoría de los campos de contenido son opcionales:
 * solo viajan si el despliegue guarda el detalle sensible de la consulta
 * (EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS=true). `detalle_disponible` le dice
 * a la UI si puede mostrar el detalle completo o si tiene que explicarlo.
 */
export interface HistoryEntry {
  request_id: string;
  timestamp: string;
  prioridad: Priority | null;
  requiere_revision: boolean;
  validation_passed: boolean | null;
  detalle_disponible: boolean;
  sintomas_texto: string | null;
  resumen: string | null;
  sintomas_detectados: string[] | null;
  posibles_causas: string[] | null;
  alertas: string[] | null;
  recomendacion: string | null;
  confianza: number | null;
}

/**
 * Evaluación estructurada de un turno "assistant" — ver
 * backend/app/schemas/chat.py (AssistantEvaluation). Se muestra plegada
 * dentro del mensaje de chat, como TriageResultCard.
 */
export interface AssistantEvaluation {
  resumen: string;
  sintomas_detectados: string[];
  prioridad: Priority;
  posibles_causas: string[];
  alertas: string[];
  recomendacion: string;
  requiere_revision: boolean;
  confianza: number;
}

/**
 * Un mensaje dentro de una conversación — ver backend/app/schemas/chat.py
 * (ChatMessageOut). `prioridad`/`requiere_revision`/`evaluacion` solo vienen
 * presentes en turnos "assistant"; en turnos "user" quedan en null.
 * `evaluacion` puede venir null en turnos "assistant" viejos, de antes de
 * que el backend guardara la evaluación completa.
 */
export interface ChatMessageOut {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  prioridad: Priority | null;
  requiere_revision: boolean | null;
  evaluacion: AssistantEvaluation | null;
}

/**
 * Respuesta de GET /chat/conversations/{id} y POST /chat/conversations —
 * ver backend/app/schemas/chat.py (ConversationDetail). Incluye el
 * historial completo en orden cronológico.
 */
export interface ConversationDetail {
  id: string;
  created_at: string;
  last_activity_at: string;
  locked_emergency: boolean;
  turn_limit_reached: boolean;
  messages: ChatMessageOut[];
}

/**
 * Una fila de GET /chat/conversations — ver backend/app/schemas/chat.py
 * (ConversationSummary). No incluye los mensajes completos, solo un
 * `preview` para mostrar en el listado.
 */
export interface ConversationSummary {
  id: string;
  last_activity_at: string;
  message_count: number;
  locked_emergency: boolean;
  preview: string;
}

/**
 * Respuesta de POST /chat/conversations/{id}/messages — ver
 * backend/app/schemas/chat.py (ChatMessageResponse). Mismo shape que
 * TriageResponse más `conversation_id`/`message_id` (el id del
 * Chat_Message "assistant" recién creado). El contenido persistido para
 * ese turno es `respuesta` (ver routes_chat.py).
 */
export interface ChatMessageResponse {
  respuesta: string;
  resumen: string;
  sintomas_detectados: string[];
  prioridad: Priority;
  posibles_causas: string[];
  alertas: string[];
  recomendacion: string;
  requiere_revision: boolean;
  confianza: number;
  validation: ValidationSummary;
  conversation_id: string;
  message_id: string;
}

/** Un turno dentro del historial que viaja en POST /chat/anonymous/messages. */
export interface AnonymousChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Respuesta de POST /chat/anonymous/messages — ver
 * backend/app/schemas/chat.py (AnonymousChatMessageResponse). Mismo shape
 * que ChatMessageResponse pero sin `conversation_id`/`message_id`: el
 * backend no persiste nada para el chat anónimo, así que el cliente es
 * quien mantiene el historial (ver chatApi.sendAnonymousMessage).
 */
export interface AnonymousChatMessageResponse {
  respuesta: string;
  resumen: string;
  sintomas_detectados: string[];
  prioridad: Priority;
  posibles_causas: string[];
  alertas: string[];
  recomendacion: string;
  requiere_revision: boolean;
  confianza: number;
  validation: ValidationSummary;
}
