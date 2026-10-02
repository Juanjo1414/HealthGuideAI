import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "../components/layout/PageShell";
import { useAuth } from "../context/AuthContext";
import { deleteTriageHistory, getTriageHistory, TriageApiError } from "../api/triageApi";
import {
  applyPreferences,
  loadAlias,
  loadCountry,
  loadFontScale,
  loadReduceMotion,
  saveAlias,
  saveCountry,
  saveFontScale,
  saveReduceMotion,
  type FontScale,
} from "../lib/preferences";

type Tab = "perfil" | "privacidad" | "notificaciones" | "accesibilidad";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "perfil", icon: "badge", label: "Perfil y Datos Básicos" },
  { id: "privacidad", icon: "enhanced_encryption", label: "Privacidad y Datos" },
  { id: "notificaciones", icon: "notifications_active", label: "Notificaciones y Seguimiento" },
  { id: "accesibilidad", icon: "accessibility_new", label: "Accesibilidad Visual" },
];

const COUNTRIES = [
  { code: "CO", label: "Colombia (Número Único de Seguridad y Emergencias: 123)", number: "123" },
  { code: "ES", label: "España (Emergencias: 112)", number: "112" },
  { code: "MX", label: "México (Emergencias: 911)", number: "911" },
  { code: "US", label: "Estados Unidos / PR (Emergency: 911)", number: "911" },
  { code: "AR", label: "Argentina (Emergencias médicas: 107 / 911)", number: "107" },
  { code: "CL", label: "Chile (SAMU: 131)", number: "131" },
];

const FONT_STEPS: FontScale[] = ["16", "18", "20"];
const FONT_LABELS: Record<FontScale, string> = { "16": "100% (Estándar)", "18": "112% (Amplio)", "20": "125% (Máxima)" };

const INPUT =
  "w-full h-[52px] px-space-md bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_3px_rgba(15,81,68,0.2)] transition-all";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("perfil");
  const [alias, setAlias] = useState(loadAlias() ?? "");
  const [country, setCountry] = useState(loadCountry());
  const [fontScale, setFontScale] = useState<FontScale>(loadFontScale());
  const [reduceMotion, setReduceMotion] = useState(loadReduceMotion());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const displayName = alias.trim() || user?.email || "";
  const memberSince = user ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(user.created_at)) : "";
  const countryInfo = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  function saveProfile() {
    saveAlias(alias.trim() || null);
    saveCountry(country);
    toast.success("Datos básicos guardados en este navegador.");
  }

  function saveAccessibility() {
    saveFontScale(fontScale);
    saveReduceMotion(reduceMotion);
    applyPreferences();
    toast.success("Preferencias de accesibilidad aplicadas.");
  }

  async function exportJson() {
    setBusy(true);
    try {
      const history = await getTriageHistory();
      const blob = new Blob([JSON.stringify({ usuario: user?.email, exportado: new Date().toISOString(), consultas: history }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `healthguide-historial-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof TriageApiError ? error.message : "No se pudo exportar.");
    } finally {
      setBusy(false);
    }
  }

  async function purgeHistory() {
    setBusy(true);
    try {
      await deleteTriageHistory();
      toast.success("Tu historial de consultas fue borrado de forma definitiva.");
      setConfirmDelete(false);
    } catch (error) {
      toast.error(error instanceof TriageApiError ? error.message : "No se pudo borrar el historial.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="relative w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg md:py-space-xl">
        <div className="absolute -top-12 right-10 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">04</span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Configuración del expediente personal</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight">Centro de Privacidad &amp; Perfil</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Controla tus datos, exporta o borra tu historial y ajusta la lectura a lo que necesites.
            </p>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm self-start md:self-auto">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined icon-filled text-[20px]">verified_user</span>
            </div>
            <div className="pr-space-xs">
              <p className="font-label-sm text-label-sm text-primary font-bold">Sesión protegida</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">Cookie HttpOnly activa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-space-md">
                <img alt="" className="w-16 h-16 rounded-full object-cover shadow-inner flex-shrink-0" src="/stitch/perfil-retrato.jpg" />
                <div className="min-w-0 flex-1">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">{alias.trim() ? "Alias" : "Cuenta"}</span>
                  <p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">{displayName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">ID: #HG-{String(user?.id ?? 0).padStart(4, "0")}</p>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between text-on-surface-variant">
                <div className="flex items-center gap-space-xs">
                  <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
                  <span className="font-label-md text-label-md">Desde {memberSince}</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold bg-primary-fixed px-space-xs py-0.5 rounded-full">Protegido</span>
              </div>
            </div>

            <nav aria-label="Secciones de configuración" className="bg-surface-container-lowest p-space-xs rounded-xl shadow-sm flex flex-col gap-1">
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-left transition-all font-label-md text-label-md ${
                      active ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{t.icon}</span>
                    <span className="flex-1">{t.label}</span>
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px] opacity-75">chevron_right</span>
                  </button>
                );
              })}
            </nav>

            <div className="relative bg-surface-container-low rounded-xl p-space-md overflow-hidden flex flex-col justify-between h-44 shadow-sm">
              <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url("/stitch/perfil-fondo.jpg")' }} />
              <div className="relative z-10">
                <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">Compromiso ético</span>
                <p className="font-body-sm text-body-sm text-on-surface font-semibold mt-1">
                  Nunca comercializamos tus síntomas con aseguradoras ni terceros publicitarios.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-bold">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">lock</span> Compromiso del equipo
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {tab === "perfil" && (
              <Module number="01" title="Perfil y datos básicos" description="El alias y el país se guardan solo en este navegador; no cambian cómo el sistema clasifica tus síntomas.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="alias-input">Alias o nombre preferido</label>
                    <div className="relative">
                      <input className={INPUT} id="alias-input" placeholder="Ej. Elena" type="text" maxLength={40} value={alias} onChange={(e) => setAlias(e.target.value)} />
                      <span aria-hidden="true" className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">person</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">No necesitas introducir tu nombre legal.</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email-ro">Correo de la cuenta</label>
                    <div className="relative">
                      <input className={`${INPUT} opacity-80`} id="email-ro" type="email" value={user?.email ?? ""} readOnly />
                      <span aria-hidden="true" className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">mail</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">El cambio de correo llega en una próxima versión.</span>
                  </div>
                  <div className="flex flex-col gap-space-xs md:col-span-2">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="region-select">País y número de emergencias</label>
                    <div className="relative">
                      <select className={`${INPUT} pr-10 appearance-none`} id="region-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <span aria-hidden="true" className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
                <div className="mt-space-md bg-secondary-container/30 p-space-md rounded-lg flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">call</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Número de emergencias de tu país</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Marcado rápido: <strong>{countryInfo.number}</strong></p>
                    </div>
                  </div>
                  <a className="font-label-sm text-label-sm text-on-error bg-error px-space-sm py-1 rounded-full font-bold" href={`tel:${countryInfo.number}`}>
                    Llamar {countryInfo.number}
                  </a>
                </div>
                <div className="mt-space-lg flex flex-wrap justify-between gap-space-sm">
                  <button type="button" onClick={() => logout()} className="h-[48px] px-space-lg bg-surface-container text-on-surface rounded-full font-label-md text-label-md hover:bg-surface-container-high inline-flex items-center gap-space-xs">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                  <SaveButton onClick={saveProfile}>Guardar datos básicos</SaveButton>
                </div>
              </Module>
            )}

            {tab === "privacidad" && (
              <Module number="02" title="Tus datos, bajo tu control" description="Qué guardamos, cómo llevártelo y cómo borrarlo.">
                <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-md mb-space-md">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span aria-hidden="true" className="material-symbols-outlined text-[22px]">key</span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold">Qué guardamos de tu cuenta</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Tu correo, tu contraseña con hash bcrypt (nunca en texto plano) y, por cada consulta hecha con sesión
                      iniciada, el texto que describiste y la orientación que recibiste, para mostrártela en tu historial.
                      Las consultas sin sesión no guardan el texto.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-sm">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between ring-1 ring-outline-variant/30">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center mb-space-xs">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">download_for_offline</span>
                      </div>
                      <h4 className="font-label-lg text-label-lg text-on-surface font-bold">Portabilidad (JSON / PDF)</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Descarga todas tus consultas con fechas, prioridades y recomendaciones para compartirlas con tu médico.
                      </p>
                    </div>
                    <div className="mt-space-md flex gap-space-xs">
                      <button type="button" disabled={busy} onClick={exportJson} className="flex-1 h-[44px] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-space-xs disabled:opacity-50">
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">data_object</span> Formato JSON
                      </button>
                      <Link to="/historial" className="flex-1 h-[44px] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-space-xs">
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">picture_as_pdf</span> Informe PDF
                      </Link>
                    </div>
                  </div>
                  <div className="bg-error-container/40 p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center mb-space-xs">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">delete_forever</span>
                      </div>
                      <h4 className="font-label-lg text-label-lg text-error font-bold">Borrado inmediato y permanente</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Elimina del servidor todas tus consultas guardadas. No se puede deshacer.
                      </p>
                    </div>
                    {confirmDelete ? (
                      <div className="mt-space-md flex gap-space-xs" role="group" aria-label="Confirmar borrado">
                        <button type="button" disabled={busy} onClick={purgeHistory} className="flex-1 h-[44px] bg-error text-on-error hover:bg-on-error-container font-label-md text-label-md rounded-lg disabled:opacity-50">
                          {busy ? "Borrando…" : "Sí, borrar todo"}
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 h-[44px] bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-lg">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(true)} className="mt-space-md w-full h-[44px] bg-error text-on-error hover:bg-on-error-container font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-space-xs shadow-sm">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">auto_delete</span>
                        Purgar historial completo
                      </button>
                    )}
                  </div>
                </div>
              </Module>
            )}

            {tab === "notificaciones" && (
              <Module number="03" title="Protocolos de reevaluación" description="Recordatorios para volver a evaluar tus síntomas tras un triaje leve o moderado.">
                <ComingSoon />
                <div className="space-y-space-md opacity-60" aria-disabled="true">
                  <div className="bg-surface-container-low p-space-md rounded-xl">
                    <p className="font-label-lg text-label-lg text-on-surface font-bold mb-1">Ventanas automáticas de comprobación</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-sm">
                      {[["Control a las 24 horas", "Para fiebre o dolor en evolución"], ["Control a las 48 horas", "Evaluación de respuesta a cuidados"]].map(([t, d]) => (
                        <label key={t} className="flex items-center gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg">
                          <input disabled className="w-5 h-5 accent-primary rounded" type="checkbox" />
                          <span className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface font-bold">{t}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">{d}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-space-md rounded-xl">
                    <p className="font-label-lg text-label-lg text-on-surface font-bold mb-1">Canal de recepción preferido</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mt-space-sm">
                      {[["notifications", "Notificación", "En el navegador"], ["mail", "Correo", "A tu correo de la cuenta"], ["sms", "SMS", "Solo alertas críticas"]].map(([icon, t, d]) => (
                        <label key={t} className="flex flex-col p-space-sm bg-surface-container-lowest rounded-lg">
                          <span className="flex items-center justify-between mb-space-xs">
                            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                            <input disabled className="accent-primary" name="channel-opt" type="radio" />
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-bold">{t}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Module>
            )}

            {tab === "accesibilidad" && (
              <Module number="04" title="Accesibilidad e inclusión sensorial" description="Pensado para momentos de estrés visual, fatiga o uso con tecnología asistiva. Se guarda en este navegador.">
                <div className="bg-surface-container-low p-space-md rounded-xl mb-space-md">
                  <div className="flex items-center justify-between mb-space-sm gap-space-sm">
                    <div>
                      <h3 className="font-label-lg text-label-lg text-on-surface font-bold" id="font-scale-label">Escala tipográfica</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Agranda el texto de toda la aplicación.</p>
                    </div>
                    <span className="font-label-md text-label-md text-primary bg-primary-fixed px-space-sm py-1 rounded-full font-bold whitespace-nowrap">{FONT_LABELS[fontScale]}</span>
                  </div>
                  <div className="flex items-center gap-space-md pt-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold" aria-hidden="true">A</span>
                    <input
                      className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                      aria-labelledby="font-scale-label"
                      aria-valuetext={FONT_LABELS[fontScale]}
                      max="2"
                      min="0"
                      step="1"
                      type="range"
                      value={FONT_STEPS.indexOf(fontScale)}
                      onChange={(e) => setFontScale(FONT_STEPS[Number(e.target.value)])}
                    />
                    <span className="font-headline-sm text-headline-sm text-on-surface-variant font-bold" aria-hidden="true">A</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-2">
                    <span>Estándar (16px)</span>
                    <span>Amplio (18px)</span>
                    <span>Máxima (20px)</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <ToggleCard icon="motion_photos_off" title="Reducción de movimiento y pulsos" description="Desactiva pulsos de alertas y transiciones para prevenir mareos." checked={reduceMotion} onChange={setReduceMotion} className="md:col-span-2" />
                  <ToggleCard icon="contrast" title="Alto contraste" description="Contrastes 7:1 (WCAG AAA) en tarjetas y botones." disabled />
                  <ToggleCard icon="record_voice_over" title="Verbosidad para lector de pantalla" description="Descripciones extendidas en cada nivel de triaje." disabled />
                </div>
                <div className="mt-space-md p-space-md bg-surface-container rounded-xl flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Contraste mínimo del sistema</span>
                  <span className="font-label-sm text-label-sm text-primary font-bold">Objetivo: WCAG 2.2 nivel AA (≥ 4.5:1)</span>
                </div>
                <div className="mt-space-lg flex justify-end">
                  <SaveButton onClick={saveAccessibility}>Guardar accesibilidad</SaveButton>
                </div>
              </Module>
            )}
          </div>
        </div>

        <div className="mt-space-xl bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-label-lg text-label-lg text-primary font-bold">Custodia y neutralidad médica</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Ajustar estas preferencias no limita tu acceso libre y sin registro al triaje. Tu cuenta solo sirve para
              guardar tu historial.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-fixed/50 px-space-sm py-1 rounded-full font-bold flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Triaje sin registro siempre disponible
          </span>
        </div>
      </div>
    </PageShell>
  );
}

function Module({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm">
      <div className="pb-space-sm mb-space-md">
        <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Módulo {number}</span>
        <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SaveButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="h-[48px] px-space-lg bg-primary-container text-on-primary rounded-full font-label-md text-label-md hover:bg-primary transition-transform active:scale-95 shadow-sm inline-flex items-center gap-space-xs">
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">check</span>
      {children}
    </button>
  );
}

function ComingSoon() {
  return (
    <div role="note" className="mb-space-md p-space-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center gap-space-xs font-label-md text-label-md">
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">construction</span>
      Próximamente: esta función todavía no está disponible.
    </div>
  );
}

function ToggleCard({
  icon,
  title,
  description,
  checked = false,
  onChange,
  disabled,
  className = "",
}: {
  icon: string;
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`bg-surface-container-low p-space-md rounded-xl flex items-start justify-between gap-space-sm ${disabled ? "opacity-60" : "cursor-pointer"} ${className}`}>
      <span className="flex items-start gap-space-sm">
        <span className="w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0 mt-0.5">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <span>
          <span className="block font-label-md text-label-md text-on-surface font-bold">
            {title}
            {disabled && <span className="ml-1 font-label-sm text-label-sm text-tertiary">(próximamente)</span>}
          </span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">{description}</span>
        </span>
      </span>
      <span className="relative inline-flex items-center flex-shrink-0">
        <input
          className="sr-only peer"
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="w-11 h-6 bg-surface-variant rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </span>
    </label>
  );
}
