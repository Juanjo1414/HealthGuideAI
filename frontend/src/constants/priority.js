/**
 * Metadatos de presentacion por nivel de prioridad. Vive separado de los
 * componentes para que agregar o ajustar un nivel no implique tocar JSX.
 */
export const PRIORITY_META = {
  BAJA: {
    label: "Prioridad baja",
    description: "Puedes monitorear tus síntomas en casa.",
    className: "priority-baja",
  },
  MEDIA: {
    label: "Prioridad media",
    description: "Se recomienda agendar una cita médica.",
    className: "priority-media",
  },
  ALTA: {
    label: "Prioridad alta",
    description: "Busca atención médica pronto.",
    className: "priority-alta",
  },
  EMERGENCIA: {
    label: "Emergencia",
    description: "Acude de inmediato a urgencias o llama a tu línea de emergencia.",
    className: "priority-emergencia",
  },
};

export function getPriorityMeta(priority) {
  return PRIORITY_META[priority] ?? PRIORITY_META.MEDIA;
}
