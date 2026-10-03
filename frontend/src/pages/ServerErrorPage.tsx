import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import { checkReady, type ReadyStatus } from "../api/healthApi";

/**
 * Pantalla de contingencia (Stitch: "error_de_servidor_500"). Sin el folio
 * de incidente ni el "equipo de guardia 24h" del original — no existen. El
 * estado del sistema que muestra es real (/ready del backend).
 */
export default function ServerErrorPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<ReadyStatus | null | undefined>(undefined);

  async function check() {
    setChecking(true);
    const result = await checkReady();
    setStatus(result);
    setChecking(false);
    return result;
  }

  async function retry() {
    const result = await check();
    if (result?.status === "ok") navigate("/");
  }

  const statusRows: [string, boolean | undefined][] = status
    ? [
        ["Modelo de IA configurado", status.checks.nvidia_configured],
        ["Base de datos", status.checks.postgres],
        ["Control de tasa (Redis)", status.checks.redis],
      ]
    : [];

  return (
    <PageShell>
      <div className="relative w-full overflow-hidden py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-96 right-10 w-96 h-96 bg-surface-container-high/40 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="max-w-[1120px] mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-space-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse motion-reduce:animate-none" />
            <span>Protocolo de salvaguarda clínica activo</span>
          </div>
          <div className="relative flex items-center justify-center mb-space-lg" aria-hidden="true">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-primary-fixed/30 animate-ping motion-reduce:animate-none opacity-30 pointer-events-none" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface-container-low flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined icon-filled text-4xl sm:text-5xl">cloud_sync</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </div>
            </div>
          </div>
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <p className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-widest mb-space-xs">Error del servidor • Código 500</p>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary font-bold tracking-tight mb-space-md">
              Interrupción temporal del asistente
            </h1>
            <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg text-on-surface-variant leading-relaxed">
              El servicio no pudo completar tu evaluación. Si tienes cuenta, tu historial guardado{" "}
              <strong className="text-on-surface font-semibold">sigue intacto</strong>. Puedes reintentar en unos instantes.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl items-start">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="w-full h-1.5 bg-error absolute top-0 left-0" />
              <div>
                <div className="flex items-center gap-space-sm mb-space-sm">
                  <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                    <span aria-hidden="true" className="material-symbols-outlined icon-filled text-headline-sm">emergency</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-bold">Protocolo inmediato de seguridad vital</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">¿Tienes síntomas de gravedad o urgencia?</h2>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                  Si estás experimentando síntomas severos (como{" "}
                  <strong>dolor u opresión en el pecho, dificultad repentina para respirar, debilidad facial o en extremidades, o pérdida del conocimiento</strong>),{" "}
                  <span className="text-error font-semibold">NO esperes a que el sistema se restablezca</span>.
                </p>
                <div className="p-space-sm rounded-xl bg-surface-container-low mb-space-md flex items-start gap-space-sm">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary-container mt-0.5">local_hospital</span>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Comunícate de inmediato con las líneas de emergencia o acude al servicio de urgencias más cercano.
                  </p>
                </div>
              </div>
              <div className="pt-space-xs flex flex-wrap gap-space-sm items-center">
                <a className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-xl bg-error text-on-error font-label-lg text-label-lg shadow-sm hover:opacity-90 active:scale-95 transition-all" href="tel:112">
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">phone_in_talk</span>
                  <span>Llamar al 112 (Europa)</span>
                </a>
                <a className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg shadow-sm hover:bg-error hover:text-on-error active:scale-95 transition-all" href="tel:911">
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">phone_in_talk</span>
                  <span>Llamar al 911 (América)</span>
                </a>
                <a className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg shadow-sm hover:bg-error hover:text-on-error active:scale-95 transition-all" href="tel:123">
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">phone_in_talk</span>
                  <span>Llamar al 123 (Colombia)</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-md flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">Reanudar consulta</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Reintenta en unos instantes. Si el servicio ya respondió, te llevamos de vuelta al inicio.
                </p>
                <div className="flex flex-col gap-space-sm">
                  <button
                    type="button"
                    onClick={retry}
                    disabled={checking}
                    className="w-full inline-flex items-center justify-center gap-space-xs h-[52px] rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary active:scale-95 transition-all group disabled:opacity-60"
                  >
                    <span aria-hidden="true" className={`material-symbols-outlined text-xl transition-transform ${checking ? "animate-spin" : "group-hover:rotate-180"}`}>refresh</span>
                    <span>{checking ? "Comprobando…" : "Reintentar conexión ahora"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={check}
                    disabled={checking}
                    className="w-full inline-flex items-center justify-center gap-space-xs h-[48px] rounded-xl bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-label-md transition-colors disabled:opacity-60"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">monitor_heart</span>
                    <span>Comprobar estado del sistema</span>
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm" aria-live="polite">
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Estado del sistema</span>
                  {status !== undefined && (
                    <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold ${status?.status === "ok" ? "text-secondary" : "text-error"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status?.status === "ok" ? "bg-secondary" : "bg-error"}`} />
                      {status?.status === "ok" ? "Disponible" : "Con problemas"}
                    </span>
                  )}
                </div>
                {status === undefined && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Pulsa “Comprobar estado del sistema” para consultar el servidor.</p>
                )}
                {status === null && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No hubo respuesta del servidor. Revisa tu conexión o intenta más tarde.</p>
                )}
                {status && (
                  <ul className="flex flex-col gap-1 bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-inner">
                    {statusRows.map(([label, ok]) => (
                      <li key={label} className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface">{label}</span>
                        <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm ${ok ? "text-secondary" : "text-error"}`}>
                          <span aria-hidden="true" className="material-symbols-outlined text-base">{ok ? "check_circle" : "error"}</span>
                          {ok ? "OK" : "Falla"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row items-center gap-space-lg justify-between">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center flex-shrink-0">
                <span aria-hidden="true" className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Mientras tanto</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Revisa cómo actúa el sistema ante emergencias o qué hacemos con tus datos.</p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm w-full md:w-auto flex-shrink-0">
              <Link className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-xs bg-surface-container-low text-primary hover:bg-surface-container rounded-full font-label-md text-label-md transition-colors" to="/protocolo">
                <span aria-hidden="true" className="material-symbols-outlined text-lg">emergency</span>
                <span>Protocolo de urgencias</span>
              </Link>
              <Link className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-xs bg-primary text-on-primary hover:bg-primary-container rounded-full font-label-md text-label-md transition-colors" to="/terminos">
                <span aria-hidden="true" className="material-symbols-outlined text-lg">help_center</span>
                <span>Términos y privacidad</span>
              </Link>
            </div>
          </div>

          <div className="w-full mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md text-center md:text-left">
            {[
              ["lock", "Privacidad intacta", "El fallo no expone tus datos ni tu cuenta."],
              ["published_with_changes", "Historial a salvo", "Las consultas guardadas siguen en tu cuenta cuando el servicio vuelva."],
              ["health_and_safety", "Criterio ético", "Ante cualquier falla del software, priorizamos que llames a emergencias."],
            ].map(([icon, title, body]) => (
              <div key={title} className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-low/60">
                <span aria-hidden="true" className="material-symbols-outlined text-secondary mt-0.5">{icon}</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">{title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
