/**
 * Tipos que reflejan el contrato real del backend — backend/app/schemas/
 * auth.py y triage.py. Si el contrato cambia ahí, cambia acá; no se
 * inventan campos que el backend no devuelve.
 */

export interface User {
  id: number;
  email: string;
  role: string;
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
