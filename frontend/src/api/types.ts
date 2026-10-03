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
