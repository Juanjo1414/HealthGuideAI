import { toast } from "sonner";

interface EmergencyPanelProps {
  /** Señales concretas a nombrar (alertas del modelo o síntomas detectados). */
  signals: string[];
  /** Texto para copiar y dictarle al operador de emergencias. */
  dispatchSummary: string;
}

const IMMEDIATE_ACTIONS = [
  ["Reposo inmediato", "Siéntate en posición semisentada (45°). Evita acostarte completamente plano."],
  ["Cero esfuerzo", "No intentes caminar, bajar escaleras ni conducir hacia el hospital."],
  ["Aflojar prendas", "Desabotona cuellos, cinturones y ropa ajustada en el tórax."],
  ["Alerta a terceros", "Si estás solo, deja la puerta sin cerrojo o avisa a un vecino o familiar."],
];

/**
 * Vista "Alerta Roja" del protocolo de Stitch. Respecto al original se
 * quitaron dos cosas que el producto no hace: transmitir coordenadas GPS y
 * listar hospitales con distancias (eran datos inventados). En su lugar:
 * copiar un resumen real para el operador y buscar urgencias en el mapa.
 */
export default function EmergencyPanel({ signals, dispatchSummary }: EmergencyPanelProps) {
  const named = signals.slice(0, 3).join(", ");

  function copySummary() {
    navigator.clipboard
      .writeText(dispatchSummary)
      .then(() => toast.success("Resumen copiado. Puedes leérselo al operador."))
      .catch(() => toast.error("No se pudo copiar."));
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div role="alert" className="relative overflow-hidden rounded-2xl bg-error-container p-space-md md:p-space-xl shadow-lg">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-error/10 pointer-events-none blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-error text-on-error flex items-center justify-center flex-shrink-0 shadow-md animate-pulse motion-reduce:animate-none">
              <span aria-hidden="true" className="material-symbols-outlined text-[32px]">crisis_alert</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-bold">
                  Código Rojo • Prioridad Emergencia
                </span>
                <span className="px-space-xs py-0.5 rounded bg-error text-on-error font-label-sm text-label-sm font-mono">
                  revisión humana requerida
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-error-container mb-space-xs">
                Señal de alarma detectada en tu consulta
              </h2>
              <p className="font-body-md text-body-md text-on-error-container/90 max-w-3xl">
                {named ? (
                  <>
                    Tu descripción contiene indicadores de <strong className="text-error font-semibold">{named}</strong>.{" "}
                  </>
                ) : null}
                Para proteger tu vida, el sistema no intenta tranquilizarte: escala la prioridad a emergencia y te
                dirige a asistencia urgente inmediata.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm text-center">
            <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase">Tiempo de respuesta</span>
            <span className="block font-headline-sm text-headline-sm text-error font-bold tracking-tight">INMEDIATO</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-error">phone_in_talk</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Llama a emergencias ahora</h3>
              </div>
              <span className="w-3 h-3 rounded-full bg-error animate-ping motion-reduce:animate-none" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              No esperes a que los síntomas cedan. El operador del servicio de emergencias puede orientarte y enviar una
              unidad de atención.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <a className="group flex items-center justify-between p-space-md rounded-xl bg-error text-on-error shadow-md hover:bg-on-error-container transition-all" href="tel:123">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-error/80 uppercase">Colombia</span>
                  <span className="font-headline-md text-headline-md font-bold">Llamar 123</span>
                </div>
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">call</span>
              </a>
              <a className="group flex items-center justify-between p-space-md rounded-xl bg-error text-on-error shadow-md hover:bg-on-error-container transition-all" href="tel:112">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-error/80 uppercase">Europa / Internacional</span>
                  <span className="font-headline-md text-headline-md font-bold">Llamar 112</span>
                </div>
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">call</span>
              </a>
              <a className="group flex items-center justify-between p-space-md rounded-xl bg-primary text-on-primary shadow-md hover:bg-primary-container transition-all" href="tel:911">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-primary/80 uppercase">América</span>
                  <span className="font-headline-md text-headline-md font-bold">Llamar 911</span>
                </div>
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">emergency_home</span>
              </a>
            </div>
            <div className="p-space-sm bg-surface-container rounded-xl flex items-center gap-space-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px]">content_paste</span>
              <span className="font-body-sm text-body-sm text-on-surface flex-1">
                <strong className="font-semibold">Resumen de tus síntomas</strong> listo para leérselo al operador.
              </span>
              <button
                type="button"
                onClick={copySummary}
                className="px-space-sm py-1 bg-surface-container-lowest text-primary font-label-sm text-label-sm rounded shadow-sm hover:bg-primary hover:text-on-primary transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary">health_and_safety</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Acciones inmediatas mientras llega la asistencia</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {IMMEDIATE_ACTIONS.map(([title, body], index) => (
                <div key={title} className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg text-on-surface">{title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span aria-hidden="true" className="material-symbols-outlined text-primary">local_hospital</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Urgencias más cercanas</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Abre el mapa para ver los servicios de urgencias cerca de tu ubicación actual.
            </p>
            <div
              className="w-full h-48 bg-cover bg-center rounded-xl shadow-inner relative overflow-hidden"
              style={{ backgroundImage: 'url("/stitch/protocolo-fondo.png")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              <a
                className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1 rounded-xl bg-surface-container-lowest/95 py-2 text-primary font-label-md text-label-md hover:bg-surface-container-lowest"
                href="https://www.google.com/maps/search/urgencias+cerca+de+mi"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">navigation</span>
                Buscar urgencias cerca de mí
              </a>
            </div>
          </div>
          <div className="bg-surface-container p-space-md rounded-2xl flex items-start gap-space-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[24px]">gavel</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">Detención preventiva de la IA</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ante una señal de alarma, reglas deterministas fuerzan la prioridad a emergencia antes de que el modelo
                tenga la última palabra. Esta orientación puede equivocarse: ante la duda, llama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
