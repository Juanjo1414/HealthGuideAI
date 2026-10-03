interface OfflinePanelProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Vista "Modo offline / falla" del protocolo de Stitch. Los números de la
 * versión original eran de España (061, toxicología de Madrid); acá van
 * líneas reales y sin inventar teléfonos que no verificamos.
 */
export default function OfflinePanel({ onRetry, isRetrying }: OfflinePanelProps) {
  return (
    <div className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-2xl shadow-sm flex flex-col gap-space-lg" role="alert">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-highest text-on-surface-variant flex items-center justify-center flex-shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-[32px]">cloud_off</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-mono">Modo de resiliencia / Sin red</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Servidor inaccesible o sin conexión</h2>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="px-space-md py-space-xs rounded-full bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-space-xs disabled:opacity-60"
          >
            <span aria-hidden="true" className={`material-symbols-outlined text-[18px] ${isRetrying ? "animate-spin" : ""}`}>sync</span>
            {isRetrying ? "Reintentando…" : "Reintentar conexión"}
          </button>
        )}
      </div>
      <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-md">
        <span aria-hidden="true" className="material-symbols-outlined text-error text-[28px]">info</span>
        <div>
          <h3 className="font-label-lg text-label-lg text-on-surface">La salud no puede depender de tu conexión a internet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            No pudimos completar la evaluación. Si tus síntomas son intensos o empeoran, no esperes a que el sistema
            vuelva: las líneas telefónicas funcionan sin internet.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-error uppercase font-bold">Riesgo vital inmediato</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Emergencias sanitarias</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Dolor en el pecho, dificultad para respirar, desmayo o accidentes graves.</p>
          </div>
          <a className="w-full py-space-sm rounded-xl bg-error text-on-error font-label-md text-label-md text-center hover:opacity-90 transition-opacity" href="tel:112">
            Llamar 112 / 911
          </a>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">Colombia</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Línea única de emergencias</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Número único nacional de seguridad y emergencias.</p>
          </div>
          <a className="w-full py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md text-center hover:bg-primary-container transition-colors" href="tel:123">
            Llamar 123
          </a>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold">Sin urgencia vital</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Tu EPS o aseguradora</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Usa la línea de orientación médica que figura en tu carné o en la web de tu aseguradora.</p>
          </div>
          <p className="w-full py-space-sm text-on-surface-variant font-label-md text-label-md text-center">
            El número está en tu carné de salud
          </p>
        </div>
      </div>
    </div>
  );
}
