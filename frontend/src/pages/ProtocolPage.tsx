import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import EmergencyPanel from "../components/triage/EmergencyPanel";
import VagueInputPanel from "../components/triage/VagueInputPanel";
import OfflinePanel from "../components/triage/OfflinePanel";

type View = "critical" | "vague" | "offline";

const TABS: { id: View; icon: string; label: string; active: string }[] = [
  { id: "critical", icon: "emergency", label: "Alerta Roja (Emergencia)", active: "bg-error text-on-error" },
  { id: "vague", icon: "help_outline", label: "Entrada Insuficiente", active: "bg-primary-container text-on-primary" },
  { id: "offline", icon: "wifi_off", label: "Modo Offline / Falla", active: "bg-inverse-surface text-inverse-on-surface" },
];

const DEMO_VAGUE = "Hola, la verdad es que me siento muy mal y tengo algo raro desde ayer...";

/**
 * Explicador público de cómo responde el sistema en los tres casos límite
 * (Stitch: "protocolo de urgencias y manejo de errores"). Usa los mismos
 * paneles que aparecen de verdad en el flujo de triaje, con datos de ejemplo.
 */
export default function ProtocolPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("critical");

  return (
    <PageShell>
      <div className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-space-xs">
            <span className="inline-flex w-fit items-center justify-center px-space-sm py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
              MODO VIGILANCIA CLÍNICA
            </span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
              Protocolo Crítico y Manejo Ético de Fallos
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Demostración de las salvaguardas del sistema: cómo responde ante una señal de alarma vital, ante una
              descripción ambigua y ante una desconexión. Los datos de esta página son de ejemplo.
            </p>
          </div>
          <div className="inline-flex flex-wrap p-space-xs bg-surface-container rounded-3xl sm:rounded-full shadow-sm" role="tablist" aria-label="Escenarios del protocolo">
            {TABS.map((tab) => {
              const active = tab.id === view;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="protocol-panel"
                  onClick={() => setView(tab.id)}
                  className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-xs ${
                    active ? `${tab.active} shadow-sm` : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div id="protocol-panel" role="tabpanel">
          {view === "critical" && (
            <EmergencyPanel
              signals={["dolor torácico opresivo", "posible dificultad respiratoria severa"]}
              dispatchSummary="Ejemplo: dolor opresivo en el pecho desde hace 10 minutos con falta de aire."
            />
          )}
          {view === "vague" && (
            <VagueInputPanel originalText={DEMO_VAGUE} onResubmit={(text) => navigate("/", { state: { prefill: text } })} />
          )}
          {view === "offline" && <OfflinePanel />}
        </div>

        <div className="mt-space-xl p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-label-lg text-label-lg text-on-surface">Compromiso de no-riesgo para el usuario</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                El sistema prioriza tu seguridad sobre la retención en la app. Ante la menor duda clínica, te deriva al
                contacto humano presencial.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setView(tab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-space-md py-space-xs rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
              >
                Demo: {tab.id === "critical" ? "Alerta roja" : tab.id === "vague" ? "Vaga" : "Offline"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
