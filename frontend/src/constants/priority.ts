import type { Priority } from "../api/types";

/**
 * Presentación por nivel de prioridad. Los textos de "ventana" y "acción"
 * salen de la rúbrica real del backend (contract.PRIORITY_RUBRIC), no del
 * copy de ejemplo de Stitch — la UI no puede prometer tiempos que el
 * sistema no usa para clasificar.
 */
export interface PriorityMeta {
  level: 1 | 2 | 3 | 4;
  label: string;
  headline: string;
  description: string;
  window: string;
  vitalRisk: string;
  suggestion: string;
  icon: string;
  /** Clases del badge compacto (historial, listas). */
  badgeClass: string;
  /** Franja superior de la tarjeta de resultado (estilo Stitch). */
  stripClass: string;
  /** Pill "Prioridad recomendada" de la tarjeta de resultado. */
  pillClass: string;
  gaugeClass: string;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  BAJA: {
    level: 1,
    label: "Prioridad baja",
    headline: "Puedes monitorear tus síntomas en casa",
    description: "Síntomas leves y estables, manejables con autocuidado general. Consulta si no mejoran o si aparece algo nuevo.",
    window: "Monitorear en casa",
    vitalRisk: "Bajo / No inmediato",
    suggestion: "Autocuidado y vigilancia",
    icon: "check_circle",
    badgeClass: "bg-priority-baja-bg text-priority-baja-text border-priority-baja-border",
    stripClass: "from-secondary-fixed via-secondary-fixed-dim to-secondary",
    pillClass: "bg-priority-baja-bg text-priority-baja-text",
    gaugeClass: "text-secondary",
  },
  MEDIA: {
    level: 2,
    label: "Prioridad media",
    headline: "Te recomendamos agendar una cita médica",
    description: "Síntomas que ameritan consulta médica pero pueden esperar días sin peligro evidente. Monitorea su evolución.",
    window: "Cita en los próximos días",
    vitalRisk: "Bajo / No inmediato",
    suggestion: "Consulta general",
    icon: "schedule",
    badgeClass: "bg-priority-media-bg text-priority-media-text border-priority-media-border",
    stripClass: "from-tertiary-fixed-dim via-on-tertiary-container to-tertiary",
    pillClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    gaugeClass: "text-on-tertiary-container",
  },
  ALTA: {
    level: 3,
    label: "Prioridad alta",
    headline: "Busca atención médica en las próximas horas",
    description: "Síntomas significativos que necesitan evaluación médica pronto. No esperes días.",
    window: "Atención en las próximas horas",
    vitalRisk: "Moderado / Vigilar",
    suggestion: "Atención médica hoy",
    icon: "warning",
    badgeClass: "bg-priority-alta-bg text-priority-alta-text border-priority-alta-border",
    stripClass: "from-on-tertiary-container via-error to-on-error-container",
    pillClass: "bg-priority-alta-bg text-priority-alta-text",
    gaugeClass: "text-error",
  },
  EMERGENCIA: {
    level: 4,
    label: "Emergencia",
    headline: "Acude a urgencias de inmediato",
    description: "Señal de peligro inmediato para la vida o una función vital. Llama a emergencias ahora mismo.",
    window: "Ahora mismo",
    vitalRisk: "Alto / Inmediato",
    suggestion: "Urgencias ya",
    icon: "crisis_alert",
    badgeClass: "bg-priority-emergencia-bg text-priority-emergencia-text border-priority-emergencia-border",
    stripClass: "from-error via-on-error-container to-error",
    pillClass: "bg-priority-emergencia-bg text-priority-emergencia-text",
    gaugeClass: "text-error",
  },
};

export function getPriorityMeta(priority: Priority | null | undefined): PriorityMeta {
  return (priority && PRIORITY_META[priority]) || PRIORITY_META.MEDIA;
}
