import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import OfflinePanel from "../components/triage/OfflinePanel";
import { requestTriage, TriageApiError } from "../api/triageApi";
import { useAuth } from "../context/AuthContext";
import { useSpeechDictation } from "../lib/useSpeechDictation";

const MAX_LENGTH = 600;

const DURATIONS = ["Hoy", "1 a 3 días", "+1 semana"] as const;
type Duration = (typeof DURATIONS)[number];

const QUICK_FILLS = [
  { label: "Dolor abdominal repentino", text: "Tengo dolor abdominal repentino", urgent: false },
  { label: "Fiebre y dolor de garganta", text: "Tengo fiebre y dolor de garganta", urgent: false },
  { label: "Mareo al cambiar de postura", text: "Siento mareo al cambiar de postura o al levantarme", urgent: false },
  { label: "Presión en el pecho (Prioritario)", text: "Siento presión en el pecho", urgent: true },
  { label: "Molestia lumbar leve", text: "Tengo una molestia lumbar leve", urgent: false },
];

const PILLARS = [
  {
    icon: "rule",
    tone: "secondary",
    title: "Cero Diagnósticos Inventados",
    body: "Identificamos niveles de prioridad asistencial (baja, media, alta, emergencia). Nunca afirmamos una enfermedad específica sin examinación clínica presencial.",
    footIcon: "task_alt",
    foot: "Priorización, no especulación",
  },
  {
    icon: "medication",
    tone: "secondary",
    title: "Sin Medicación Automática",
    body: "Cero fármacos sugeridos, ni por nombre ni por categoría. Solo brindamos pautas seguras de hidratación, reposo y medidas no invasivas de alivio.",
    footIcon: "block",
    foot: "Prevención de automedicación",
  },
  {
    icon: "fmd_bad",
    tone: "error",
    title: "Detección de Alarmas",
    body: "Reglas deterministas revisan tu texto antes del modelo. Si un síntoma refleja riesgo vital, te derivamos a emergencias sin rodeos.",
    footIcon: "warning",
    foot: "Filtro estricto de banderas rojas",
  },
  {
    icon: "enhanced_encryption",
    tone: "secondary",
    title: "Sin Cuenta, Sin Rastro",
    body: "Consulta libre y privada: sin cuenta no guardamos el texto de tus síntomas. Regístrate solo si quieres conservar tu historial.",
    footIcon: "verified",
    foot: "Privacidad por diseño",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Expresión en Lenguaje Natural",
    body: "Describe lo que sientes tal y como se lo contarías a tu médico de cabecera o a un familiar cercano.",
    icon: "mic_none",
    foot: "Texto o dictado por voz",
  },
  {
    n: "02",
    title: "Revisión de Señales de Alarma",
    body: "Reglas clínicas deterministas revisan tu descripción antes del modelo de IA, y un validador de seguridad revisa su respuesta.",
    icon: "checklist",
    foot: "Doble control de seguridad",
  },
  {
    n: "03",
    title: "Recomendación de Nivel Asistencial",
    body: "Obtén una orientación clara: urgencias ahora, atención en horas, cita en días o cuidados en casa.",
    icon: "print",
    foot: "Imprimible para tu médico",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [duration, setDuration] = useState<Duration | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "offline" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dictation = useSpeechDictation((transcript) =>
    setText((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${transcript}`.slice(0, MAX_LENGTH))
  );

  // "Reevaluar" desde la pantalla de resultado vuelve acá con el texto ya cargado.
  useEffect(() => {
    const prefill = (location.state as { prefill?: string } | null)?.prefill;
    if (prefill) setText(prefill.slice(0, MAX_LENGTH));
  }, [location.state]);

  async function submit(symptoms: string) {
    const trimmed = symptoms.trim();
    if (!trimmed || status === "loading") return;
    const payload = duration ? `${trimmed}. Duración: ${duration.toLowerCase()}.` : trimmed;
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await requestTriage(payload);
      navigate("/resultado", { state: { result, symptoms: payload, duration, submittedAt: Date.now() } });
    } catch (error) {
      if (error instanceof TriageApiError && error.status === 0) {
        setStatus("offline");
        return;
      }
      if (error instanceof TriageApiError && error.status >= 500) {
        navigate("/500");
        return;
      }
      setErrorMessage(error instanceof TriageApiError ? error.message : "Ocurrió un error inesperado. Intenta de nuevo.");
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(text);
  }

  function focusForm() {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const isLoading = status === "loading";

  return (
    <PageShell>
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/40 to-surface pb-space-xl">
          <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-secondary-fixed/20 blur-3xl" />
          <div className="pointer-events-none absolute top-72 -left-20 h-80 w-80 rounded-full bg-primary-fixed/25 blur-3xl" />
          <div className="relative mx-auto w-full max-w-[1280px] px-margin md:px-margin-tablet lg:px-margin-desktop pt-space-lg md:pt-space-xl">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-1 bg-surface-container-lowest text-primary shadow-sm rounded-full">
                <span className="inline-flex h-2 w-2 rounded-full bg-secondary animate-ping motion-reduce:animate-none" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Triaje Clínico Activo</span>
                <span className="text-outline-variant">•</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Reglas de seguridad clínicas + IA</span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">verified_user</span>
                <span>Sin registro obligatorio • 100% Anónimo</span>
              </div>
            </div>

            <div className="max-w-3xl mb-space-lg">
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight mb-space-sm">
                ¿Cómo te sientes hoy? Cuéntanos qué molestias tienes
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
                Respuestas claras y orientación médica responsable para saber si debes descansar en casa, agendar cita o
                acudir de inmediato a urgencias.
              </p>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg lg:p-space-xl shadow-[0_12px_36px_-6px_rgba(15,81,68,0.08)] relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary-fixed via-primary-container to-secondary rounded-t-3xl" />
              <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between flex-wrap gap-space-xs">
                  <label className="font-label-lg text-label-lg text-primary flex items-center gap-space-xs" htmlFor="symptom-input">
                    <span aria-hidden="true" className="material-symbols-outlined text-secondary">edit_note</span>
                    Describe tus síntomas en tus propias palabras
                  </label>
                  <span className="font-label-sm text-label-sm text-on-surface-variant" id="char-counter" aria-live="polite">
                    {text.length} / {MAX_LENGTH} caracteres
                  </span>
                </div>

                <div className="relative w-full rounded-2xl bg-surface-container-low transition-all duration-200 focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_3px_rgba(15,81,68,0.18)]">
                  <textarea
                    ref={textareaRef}
                    aria-describedby="char-counter symptom-hint"
                    className="w-full bg-transparent p-space-md md:p-space-lg font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none leading-relaxed"
                    id="symptom-input"
                    maxLength={MAX_LENGTH}
                    placeholder="Ejemplo: Llevo 2 días con dolor de cabeza punzante en el lado derecho, ligero mareo al levantarme y sin fiebre..."
                    rows={4}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between px-space-md pb-space-sm pt-space-xs text-on-surface-variant">
                    <div className="flex items-center gap-space-xs text-on-surface-variant" id="symptom-hint">
                      <span aria-hidden="true" className="material-symbols-outlined text-sm text-secondary">lock</span>
                      <span className="font-label-sm text-label-sm">
                        {isAuthenticated ? "Se guardará en tu historial privado" : "Sin cuenta, no guardamos tu texto"}
                      </span>
                    </div>
                    {dictation.supported && (
                      <button
                        className={`inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                          dictation.listening
                            ? "bg-error-container text-on-error-container"
                            : "bg-surface-container text-on-surface hover:bg-surface-variant"
                        }`}
                        title="Dictar síntomas por voz"
                        type="button"
                        onClick={dictation.toggle}
                        disabled={isLoading}
                        aria-pressed={dictation.listening}
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-primary">
                          {dictation.listening ? "stop_circle" : "mic"}
                        </span>
                        <span>{dictation.listening ? "Detener" : "Hablar"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs sm:gap-space-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1" id="duration-label">
                      <span aria-hidden="true" className="material-symbols-outlined text-base">schedule</span>
                      ¿Desde cuándo?
                    </span>
                    <div className="inline-flex p-1 bg-surface-container-low rounded-full gap-1" role="radiogroup" aria-labelledby="duration-label">
                      {DURATIONS.map((option) => {
                        const selected = duration === option;
                        return (
                          <button
                            key={option}
                            role="radio"
                            aria-checked={selected}
                            type="button"
                            onClick={() => setDuration(selected ? null : option)}
                            className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all ${
                              selected
                                ? "bg-surface-container-lowest text-primary shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-space-sm px-space-xl py-3.5 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_8px_20px_rgba(15,81,68,0.22)] flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                    type="submit"
                    disabled={isLoading || !text.trim()}
                  >
                    <span>{isLoading ? "Analizando…" : "Iniciar Evaluación de Síntomas"}</span>
                    <span aria-hidden="true" className={`material-symbols-outlined text-headline-sm ${isLoading ? "animate-spin" : ""}`}>
                      {isLoading ? "progress_activity" : "arrow_forward"}
                    </span>
                  </button>
                </div>

                <div className="pt-space-sm">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-space-xs">
                    O selecciona un motivo frecuente para autocompletar:
                  </p>
                  <div className="flex flex-wrap gap-space-xs">
                    {QUICK_FILLS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setText(chip.text);
                          textareaRef.current?.focus();
                        }}
                        className={
                          chip.urgent
                            ? "px-space-md py-space-xs bg-error-container text-on-error-container hover:bg-error hover:text-on-error rounded-full font-label-md text-label-md transition-colors flex items-center gap-1.5"
                            : "px-space-md py-space-xs bg-surface-container-low hover:bg-secondary-fixed/20 text-on-surface hover:text-primary rounded-full font-label-md text-label-md transition-colors flex items-center gap-1.5"
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${chip.urgent ? "bg-error animate-pulse motion-reduce:animate-none" : "bg-secondary"}`} />
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {isLoading && (
                <div className="mt-space-md p-space-md bg-secondary-fixed/15 rounded-2xl" role="status" aria-live="polite">
                  <div className="flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                      <span aria-hidden="true" className="material-symbols-outlined animate-spin">sync</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-label-lg text-label-lg text-primary">Analizando tus síntomas…</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Revisando señales de alarma y clasificando la prioridad. Puede tardar hasta 35 segundos. Si tus
                        síntomas son graves, no esperes: llama al 112 / 911.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div role="alert" className="mt-space-md p-space-md bg-error-container text-on-error-container rounded-2xl flex items-start gap-space-sm">
                  <span aria-hidden="true" className="material-symbols-outlined">error</span>
                  <p className="font-body-md text-body-md">{errorMessage}</p>
                </div>
              )}
            </div>

            {status === "offline" && (
              <div className="mt-space-lg">
                <OfflinePanel onRetry={() => submit(text)} isRetrying={false} />
              </div>
            )}

            <div className="mt-space-lg rounded-2xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(186,26,26,0.18)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-headline-md">e911_emergency</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-error" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Protocolo Inmediato de Emergencias</h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Si presentas dolor torácico irradiado al brazo, asfixia aguda, pérdida repentina del habla o pérdida de
                    consciencia, no esperes la evaluación digital.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs flex-shrink-0 w-full md:w-auto">
                <a className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-full bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all" href="tel:112">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">call</span>
                  Llamar al 112 (EU)
                </a>
                <a className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md hover:bg-error hover:text-on-error active:scale-95 transition-all" href="tel:911">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">call</span>
                  Llamar al 911 (América)
                </a>
              </div>
            </div>
          </div>
        </div>

        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Marco Clínico Riguroso</span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-space-xs">
              Garantía de Orientación Médica Ética y Responsable
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Diseñado para evitar el alarmismo infundado y proteger las decisiones oportunas de salud.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {PILLARS.map((pillar, index) => {
              const tone = pillar.tone === "error" ? "text-error" : "text-secondary";
              return (
                <div key={pillar.title} className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-space-md ${pillar.tone === "error" ? "text-error" : "text-primary"}`}>
                      <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">{pillar.icon}</span>
                    </div>
                    <span className={`font-label-sm text-label-sm uppercase font-bold ${tone}`}>Pilar 0{index + 1}</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-space-xs">{pillar.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{pillar.body}</p>
                  </div>
                  <div className={`mt-space-md pt-space-xs flex items-center gap-1.5 font-label-sm text-label-sm ${tone}`}>
                    <span aria-hidden="true" className="material-symbols-outlined text-base">{pillar.footIcon}</span>
                    {pillar.foot}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="w-full bg-surface-container-low py-space-xl">
          <div className="max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <div className="inline-flex items-center gap-space-xs text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">psychology</span>
                  <span>Salud Mental y Cibercondría</span>
                </div>
                <blockquote className="font-headline-md text-headline-md text-primary leading-snug tracking-tight">
                  "Buscar síntomas en internet suele provocar pánico innecesario o conclusiones erróneas. HealthGuide AI
                  busca ser un filtro sereno que calma la incertidumbre y te enfoca en el nivel de atención adecuado."
                </blockquote>
                <div className="flex items-center gap-space-md pt-space-xs">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-sm bg-surface-container-lowest flex items-center justify-center">
                    <img alt="" className="w-full h-full object-contain" src="/stitch/logo.jpg" />
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface">Equipo HealthGuide AI</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Makers Fellowship • AI Product Design</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-sm">
                  <div className="p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center gap-1.5 text-error font-label-sm text-label-sm uppercase mb-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                      Búsqueda en Buscadores Abiertos
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sobrecarga de foros, anuncios de tratamientos milagrosos y resultados alarmistas descontextualizados.
                    </p>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm uppercase mb-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base">check</span>
                      Orientación HealthGuide AI
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Triaje escalonado que evalúa duración, intensidad y banderas rojas con empatía.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-lg h-[420px] w-full">
                  <img alt="" className="w-full h-full object-cover" src="/stitch/inicio-persona-sofa.jpg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-space-md bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <div>
                        <p className="font-headline-sm text-headline-sm text-primary">Una sola respuesta clara</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          En vez de decenas de resultados contradictorios, una orientación con el siguiente paso.
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined">trending_down</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Flujo Transparente</span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">Tres pasos guiados en menos de 2 minutos</h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Sin cuestionarios infinitos ni términos incomprensibles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-surface-container-low p-space-lg rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-display-lg-mobile font-display-lg text-secondary-fixed-dim/60 font-bold">{step.n}</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary mt-space-xs mb-space-xs">{step.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{step.body}</p>
                </div>
                <div className="mt-space-lg flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-secondary">{step.icon}</span>
                  <span>{step.foot}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pb-space-xl">
          <div className="bg-primary-container text-on-primary rounded-3xl p-space-lg md:p-space-xl relative overflow-hidden shadow-lg">
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-secondary-container/10 blur-2xl" />
            <div className="max-w-2xl relative z-10">
              <span className="px-space-md py-1 bg-surface-container-lowest/10 rounded-full font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed">
                Atención Gratuita &amp; Confidencial
              </span>
              <h2 className="font-headline-lg text-headline-lg tracking-tight mt-space-md mb-space-xs text-on-primary">
                No te quedes con la duda ni alimentes la preocupación
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container mb-space-lg leading-relaxed">
                Toma una decisión informada sobre tu salud en menos de dos minutos. Sin formularios de registro previos.
              </p>
              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  className="inline-flex items-center gap-space-xs px-space-xl py-3 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline-sm text-headline-sm shadow-md hover:bg-secondary-fixed-dim active:scale-95 transition-all"
                  type="button"
                  onClick={focusForm}
                >
                  <span>Escribir mis síntomas ahora</span>
                  <span aria-hidden="true" className="material-symbols-outlined">north_east</span>
                </button>
                {!isAuthenticated && (
                  <Link className="font-label-lg text-label-lg text-secondary-fixed underline-offset-4 hover:underline" to="/signup">
                    o crea una cuenta para guardar tu historial
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
