import { Link } from "react-router-dom";

/** Footer de Stitch: aviso médico legal permanente + llamadas reales (CLAUDE.md sección 2). */
export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-xl pb-16 md:pb-0">
      <div className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg">
        <div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-[0_4px_20px_-2px_rgba(15,81,68,0.04)] flex flex-col md:flex-row items-center md:items-start gap-space-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">health_and_safety</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-label-lg text-label-lg text-on-surface mb-space-xs">Aviso Médico Legal y Ético Permanente</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              HealthGuide AI orienta y clasifica la prioridad de atención médica. Puede equivocarse y nunca
              reemplaza el diagnóstico o criterio de un profesional de la salud. En caso de riesgo vital,
              contacta a urgencias de inmediato marcando al 112 o 911.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-space-sm">
            <a
              className="inline-flex items-center justify-center px-space-md py-space-xs bg-error text-on-error font-label-md text-label-md rounded-full shadow-[0_2px_8px_rgba(186,26,26,0.2)] hover:opacity-90 transition-opacity"
              href="tel:911"
            >
              Llamar 911
            </a>
            <a
              className="inline-flex items-center justify-center px-space-md py-space-xs bg-error-container text-on-error-container font-label-md text-label-md rounded-full hover:bg-error hover:text-on-error transition-colors"
              href="tel:112"
            >
              Llamar 112
            </a>
          </div>
        </div>
        <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-body-sm text-body-sm gap-space-sm">
          <p>© 2026 HealthGuide AI · Makers Fellowship, AI Product Design.</p>
          <div className="flex items-center gap-space-md">
            <Link className="hover:text-primary transition-colors" to="/terminos">
              Términos y Privacidad de Datos de Salud
            </Link>
            <Link className="hover:text-primary transition-colors" to="/protocolo">
              Protocolo de Urgencias
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
