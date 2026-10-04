import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import { getTriageHistory, TriageApiError } from "../api/triageApi";
import { getPriorityMeta } from "../constants/priority";
import type { HistoryEntry, Priority } from "../api/types";
import { splitCause } from "../lib/triageText";

type Filter = "all" | "low" | "high" | "emergency";

const FILTERS: { id: Filter; label: string; match: (p: Priority | null) => boolean }[] = [
  { id: "all", label: "Todos", match: () => true },
  { id: "low", label: "Baja y media", match: (p) => p === "BAJA" || p === "MEDIA" },
  { id: "high", label: "Alta", match: (p) => p === "ALTA" },
  { id: "emergency", label: "Emergencias", match: (p) => p === "EMERGENCIA" },
];

const STRIP: Record<Priority, string> = {
  BAJA: "bg-secondary-container",
  MEDIA: "bg-tertiary-fixed-dim",
  ALTA: "bg-on-tertiary-container",
  EMERGENCIA: "bg-error",
};

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const dateShort = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function whenLabel(iso: string): string {
  const date = new Date(iso);
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const abs = Math.abs(diffMinutes);
  const rel =
    abs < 60
      ? relative.format(diffMinutes, "minute")
      : abs < 60 * 24
        ? relative.format(Math.round(diffMinutes / 60), "hour")
        : relative.format(Math.round(diffMinutes / (60 * 24)), "day");
  return `${rel.charAt(0).toUpperCase()}${rel.slice(1)} (${dateShort.format(date)})`;
}

function titleFor(entry: HistoryEntry): string {
  if (entry.sintomas_detectados?.length) {
    const joined = entry.sintomas_detectados.slice(0, 3).join(", ");
    return joined.charAt(0).toUpperCase() + joined.slice(1);
  }
  if (entry.sintomas_texto) return entry.sintomas_texto.length > 80 ? `${entry.sintomas_texto.slice(0, 80)}…` : entry.sintomas_texto;
  return "Consulta de triaje";
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getTriageHistory()
      .then((data) => {
        setEntries(data);
        setState("ready");
      })
      .catch((error) => {
        setErrorMessage(error instanceof TriageApiError ? error.message : "No se pudo cargar el historial.");
        setState("error");
      });
  }, []);

  const counts = useMemo(
    () => ({
      total: entries.length,
      review: entries.filter((e) => e.requiere_revision).length,
      low: entries.filter((e) => e.prioridad === "BAJA" || e.prioridad === "MEDIA").length,
      emergency: entries.filter((e) => e.prioridad === "EMERGENCIA").length,
    }),
    [entries]
  );

  const activeFilter = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const visible = entries.filter((e) => activeFilter.match(e.prioridad));
  // Las últimas 7, de la más antigua a la más reciente (entries viene al revés).
  const chart = entries.slice(0, 7).map((_, i, recent) => recent[recent.length - 1 - i]);

  return (
    <PageShell>
      <div className="relative w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider mb-space-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Expediente personal • Solo tú lo ves</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold">
              Mi Historial Clínico y Evolución de Síntomas
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Consulta la trazabilidad de tus evaluaciones de triaje y llévala impresa a tu médico de cabecera.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm flex-shrink-0 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!entries.length}
              className="inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-full shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Exportar Informe PDF</span>
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-primary-container text-on-primary font-label-md text-label-md rounded-full shadow-md hover:bg-primary transition-all duration-200 active:scale-95"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Nuevo Triaje Rápido</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
          {[
            ["folder_shared", "Consultas totales", counts.total, "bg-surface-container-low text-primary", "text-primary"],
            ["person_search", "Con revisión humana", counts.review, "bg-tertiary-fixed text-on-tertiary-fixed", "text-tertiary"],
            ["check_circle", "Baja y media", counts.low, "bg-secondary-container text-on-secondary-container", "text-secondary"],
            ["emergency", "Emergencias", counts.emergency, "bg-error-container text-on-error-container", "text-error"],
          ].map(([icon, label, value, iconClass, valueClass]) => (
            <div key={label as string} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">{icon}</span>
              </div>
              <div className="min-w-0">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">{label}</div>
                <div className={`font-headline-sm text-headline-sm font-bold ${valueClass}`}>{state === "ready" ? value : "—"}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between gap-space-sm bg-surface-container-low p-space-xs rounded-full overflow-x-auto shadow-sm print:hidden" role="tablist" aria-label="Filtrar consultas">
              <div className="flex items-center gap-space-xs w-full">
                {FILTERS.map((f) => {
                  const n = entries.filter((e) => f.match(e.prioridad)).length;
                  const active = f.id === filter;
                  return (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`px-space-md py-space-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all duration-150 ${
                        active ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {f.label} ({n})
                    </button>
                  );
                })}
              </div>
            </div>

            {state === "loading" && (
              <div className="flex flex-col gap-space-md" role="status" aria-busy="true" aria-label="Cargando historial">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-surface-container-low animate-pulse" />
                ))}
              </div>
            )}

            {state === "error" && (
              <div role="alert" className="p-space-md rounded-2xl bg-error-container text-on-error-container flex items-start gap-space-sm">
                <span aria-hidden="true" className="material-symbols-outlined">error</span>
                {errorMessage}
              </div>
            )}

            {state === "ready" && visible.length === 0 && (
              <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col items-center text-center gap-space-sm">
                <div className="w-14 h-14 rounded-2xl bg-surface-container text-primary flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-[28px]">folder_open</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  {entries.length ? "No hay consultas en este filtro" : "Todavía no tienes consultas guardadas"}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  Cada evaluación que hagas con tu sesión iniciada aparecerá aquí automáticamente.
                </p>
                <Link to="/" className="mt-space-xs inline-flex items-center gap-space-xs px-space-lg py-space-sm bg-primary-container text-on-primary font-label-md text-label-md rounded-full">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
                  Evaluar mis síntomas
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-space-md">
              {visible.map((entry) => {
                const meta = getPriorityMeta(entry.prioridad);
                const open = openId === entry.request_id;
                const strip = entry.prioridad ? STRIP[entry.prioridad] : "bg-surface-variant";
                return (
                  <article key={entry.request_id} className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${strip}`} />
                    <div className="flex flex-wrap items-start justify-between gap-space-sm mb-space-md">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        {entry.requiere_revision ? (
                          <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">person_search</span>
                            Revisión humana recomendada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">check</span>
                            Orientación completada
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full border font-label-sm text-label-sm ${meta.badgeClass}`}>
                          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                          {meta.label} • {meta.window}
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">event</span>
                        {whenLabel(entry.timestamp)}
                      </span>
                    </div>
                    <div className="mb-space-md">
                      <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">{titleFor(entry)}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        {entry.detalle_disponible
                          ? entry.resumen
                          : "Esta consulta es anterior al guardado de contenido: solo se conserva su fecha y prioridad."}
                      </p>
                    </div>

                    {open && entry.detalle_disponible && (
                      <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md flex flex-col gap-space-sm" id={`detail-${entry.request_id}`}>
                        {entry.sintomas_texto && (
                          <div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Lo que describiste</span>
                            <p className="font-body-sm text-body-sm text-on-surface italic">“{entry.sintomas_texto}”</p>
                          </div>
                        )}
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Recomendación</span>
                          <p className="font-body-sm text-body-sm text-on-surface">{entry.recomendacion}</p>
                        </div>
                        {!!entry.posibles_causas?.length && (
                          <div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Posibles causas generales (no es diagnóstico)</span>
                            <ul className="font-body-sm text-body-sm text-on-surface list-disc pl-5">
                              {entry.posibles_causas.map((cause, index) => {
                                const { name, reason } = splitCause(cause);
                                return (
                                  <li key={`${index}-${cause}`}>
                                    <span className="font-semibold inline-block first-letter:uppercase">{name}</span>
                                    {reason && <span className="text-on-surface-variant">: {reason}</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        {!!entry.alertas?.length && (
                          <div>
                            <span className="font-label-sm text-label-sm text-error uppercase">Alertas</span>
                            <p className="font-body-sm text-body-sm text-on-surface">{entry.alertas.join("; ")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs print:hidden">
                      {entry.sintomas_texto ? (
                        <button
                          type="button"
                          onClick={() => navigate("/", { state: { prefill: entry.sintomas_texto } })}
                          className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-secondary hover:text-primary font-medium"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">refresh</span>
                          Reevaluar con este texto
                        </button>
                      ) : (
                        <span />
                      )}
                      {entry.detalle_disponible && (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`detail-${entry.request_id}`}
                          onClick={() => setOpenId(open ? null : entry.request_id)}
                          className="text-primary hover:text-secondary font-label-md text-label-md flex items-center gap-1 transition-colors"
                        >
                          <span>{open ? "Ocultar detalle" : "Ver hoja de resumen"}</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{open ? "expand_less" : "arrow_forward"}</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Trazabilidad</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Evolución de prioridad</h3>
                </div>
                <span className="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-full">Nivel 1–4</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Prioridad orientativa de tus últimas {chart.length || ""} consultas, de la más antigua a la más reciente.
              </p>
              <PriorityChart entries={chart} />
            </div>

            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-space-lg rounded-2xl shadow-md relative overflow-hidden">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">print</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Informe para tu médico</h4>
                  <span className="font-label-sm text-label-sm text-secondary">Imprímelo o guárdalo como PDF</span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Lleva tu historial a la consulta presencial: fechas, prioridades y recomendaciones en un formato limpio.
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!entries.length}
                className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary font-label-md text-label-md rounded-full transition-all disabled:opacity-50"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                Imprimir historial
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex items-center gap-space-md p-space-md">
              <img className="w-20 h-20 rounded-xl object-cover flex-shrink-0" alt="" src="/stitch/historial-consulta.jpg" />
              <div className="min-w-0">
                <h5 className="font-label-lg text-label-lg text-primary font-bold truncate">¿Próxima consulta presencial?</h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                  Lleva impreso tu historial o la ficha de tu última evaluación.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-space-xl p-space-lg rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
              <span aria-hidden="true" className="material-symbols-outlined text-[26px]">fmd_bad</span>
            </div>
            <div>
              <h4 className="font-label-lg text-label-lg text-on-surface font-bold">¿Empeoraron tus síntomas o sientes falta de aire o dolor en el pecho?</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No esperes. Las consultas guardadas no monitorean emergencias en tiempo real.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0 w-full md:w-auto">
            <a className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm bg-error text-on-error font-label-md text-label-md rounded-full shadow-md hover:opacity-95 transition-all" href="tel:112">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">phone_in_talk</span>
              <span>Llamar al 112</span>
            </a>
            <a className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm bg-error-container text-on-error-container font-label-md text-label-md rounded-full hover:bg-error hover:text-on-error transition-all" href="tel:911">
              <span>911</span>
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const chartY = (level: number) => 110 - (level - 1) * 30;

/** Misma gráfica SVG de Stitch, alimentada con la prioridad real de cada consulta. */
function PriorityChart({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="w-full bg-surface-container-low p-space-md rounded-xl font-body-sm text-body-sm text-on-surface-variant">
        La gráfica aparece cuando tengas al menos dos consultas guardadas.
      </div>
    );
  }
  const width = 360;
  const left = 20;
  const right = 340;
  const step = (right - left) / (entries.length - 1);
  const points = entries.map((e, i) => ({ x: left + i * step, y: chartY(getPriorityMeta(e.prioridad).level), entry: e }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y}`).join(" ");
  const area = `${line} L ${right} 120 L ${left} 120 Z`;
  const last = getPriorityMeta(entries[entries.length - 1].prioridad);
  const max = Math.max(...entries.map((e) => getPriorityMeta(e.prioridad).level));
  const dayFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });

  return (
    <div className="w-full bg-surface-container-low p-space-md rounded-xl">
      <div className="flex justify-between items-center mb-2 font-label-sm text-label-sm text-on-surface-variant">
        <span>Máxima: nivel {max}</span>
        <span className="text-secondary font-bold">Última: {last.label}</span>
      </div>
      <svg className="w-full h-40 text-primary overflow-visible" fill="none" viewBox={`0 0 ${width} 120`} role="img" aria-label={`Evolución de prioridad: ${entries.map((e) => getPriorityMeta(e.prioridad).label).join(", ")}`}>
        {[20, 50, 80, 110].map((y) => (
          <line key={y} stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.08" x1="0" x2={width} y1={y} y2={y} />
        ))}
        <defs>
          <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#006c49" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#006c49" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chartGlow)" />
        <path d={line} stroke="#006c49" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((p) => {
          const level = getPriorityMeta(p.entry.prioridad).level;
          return level >= 3 ? (
            <circle key={p.entry.request_id} cx={p.x} cy={p.y} fill="#ba1a1a" r="5" />
          ) : (
            <circle key={p.entry.request_id} cx={p.x} cy={p.y} fill="#ffffff" r="4" stroke="#006c49" strokeWidth="2" />
          );
        })}
      </svg>
      <div className="flex justify-between items-center text-[11px] font-label-sm text-on-surface-variant mt-2 px-1">
        {entries.map((e, i) => (
          <span key={e.request_id} className={i === entries.length - 1 ? "font-bold text-primary" : ""}>
            {dayFormat.format(new Date(e.timestamp))}
          </span>
        ))}
      </div>
    </div>
  );
}
