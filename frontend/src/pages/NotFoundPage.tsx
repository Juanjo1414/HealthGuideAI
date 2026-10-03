import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell";

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="relative w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="absolute -top-12 right-1/4 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-surface-container-high/60 blur-2xl pointer-events-none -z-10" />
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="inline-flex items-center gap-space-xs self-start px-space-md py-space-xs rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>Orientación y navegación segura</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-secondary font-bold tracking-tight">Estado 404</span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface font-bold tracking-tight leading-tight">
                No encontramos la página que buscas
              </h1>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              Es posible que el enlace haya cambiado o ya no exista. No te preocupes: tu cuenta y tu historial siguen
              intactos.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md pt-space-xs">
              <Link className="inline-flex items-center justify-center gap-space-sm h-[52px] px-space-lg rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]" to="/">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">clinical_notes</span>
                <span>Volver al inicio / Nuevo triaje</span>
              </Link>
              <Link className="inline-flex items-center justify-center gap-space-sm h-[52px] px-space-lg rounded-full bg-surface-container-low text-primary font-label-lg text-label-lg hover:bg-surface-container transition-colors" to="/historial">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">history</span>
                <span>Mi historial de consultas</span>
              </Link>
            </div>
            <div className="pt-space-xs">
              <a className="group inline-flex items-center gap-space-xs text-secondary hover:text-primary font-label-md text-label-md transition-colors" href="/#como-funciona">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                <span>Conoce cómo funciona la clasificación de prioridad</span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex items-center justify-center mt-space-lg lg:mt-0">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-surface-container-lowest p-space-lg shadow-xl flex flex-col items-center justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/40 to-transparent pointer-events-none" />
              <div className="w-full flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider relative z-10">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">explore</span>
                  <span>Reorientación</span>
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sesión segura</span>
              </div>
              <div className="relative w-56 h-56 flex items-center justify-center my-space-md z-10" aria-hidden="true">
                <svg className="absolute inset-0 w-full h-full text-surface-container-highest animate-[spin_60s_linear_infinite] motion-reduce:animate-none" fill="none" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="92" stroke="currentColor" strokeDasharray="4 6" strokeWidth="2" />
                  <circle cx="100" cy="100" r="76" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
                </svg>
                <svg className="absolute w-44 h-44 text-secondary-fixed-dim" fill="none" viewBox="0 0 100 100">
                  <path d="M 12 78 C 30 75, 45 45, 88 22" stroke="currentColor" strokeDasharray="2 4" strokeLinecap="round" strokeWidth="3" />
                </svg>
                <div className="relative w-28 h-28 rounded-full bg-surface-container-low flex flex-col items-center justify-center shadow-md">
                  <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-headline-lg">health_metrics</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-bold mt-1 tracking-tight">HealthGuide</span>
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="material-symbols-outlined text-secondary text-headline-sm">north</span>
                  <span className="font-label-sm text-on-surface-variant text-[10px]">SALUD</span>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <span className="font-label-sm text-on-surface-variant text-[10px]">PREVENCIÓN</span>
                </div>
              </div>
              <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-center gap-space-sm relative z-10">
                <span aria-hidden="true" className="material-symbols-outlined text-secondary text-headline-sm flex-shrink-0">verified_user</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  Protocolo ético activo: nunca diagnostica, nunca receta, siempre te recuerda consultar a un profesional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-space-xl grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Link className="group p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between" to="/">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">stethoscope</span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Triaje directo</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Describe tus síntomas y recibe una orientación de prioridad, sin necesidad de cuenta.</p>
            </div>
          </Link>
          <Link className="group p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between" to="/protocolo">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">neurology</span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Protocolo de urgencias</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Cómo responde el sistema ante señales de alarma, datos insuficientes o fallas.</p>
            </div>
          </Link>
          <Link className="group p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between" to="/terminos">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">lock_reset</span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Privacidad</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Qué guardamos, qué no, y cómo borrar tu historial cuando quieras.</p>
            </div>
          </Link>
        </div>

        <EmergencyStrip />
      </div>
    </PageShell>
  );
}

function EmergencyStrip() {
  return (
    <div className="w-full mt-space-xl p-space-lg rounded-2xl bg-error-container text-on-error-container shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md text-left">
          <div className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center flex-shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-headline-md">emergency</span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm font-bold">¿Tienes una urgencia de salud en este momento?</h2>
            <p className="font-body-md text-body-md opacity-95">
              Si sientes dolor opresivo en el pecho, dificultad severa para respirar o pérdida súbita de fuerza, solicita
              auxilio médico sin demora.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-sm flex-shrink-0 w-full md:w-auto">
          <a className="flex-1 md:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-error text-on-error font-label-lg text-label-lg shadow-sm hover:opacity-90 active:scale-95 transition-all" href="tel:112">
            <span aria-hidden="true" className="material-symbols-outlined text-body-lg">call</span>
            <span>Llamar al 112</span>
          </a>
          <a className="flex-1 md:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-on-error-container text-surface font-label-lg text-label-lg shadow-sm hover:opacity-90 active:scale-95 transition-all" href="tel:911">
            <span aria-hidden="true" className="material-symbols-outlined text-body-lg">call</span>
            <span>Llamar al 911</span>
          </a>
        </div>
      </div>
    </div>
  );
}
