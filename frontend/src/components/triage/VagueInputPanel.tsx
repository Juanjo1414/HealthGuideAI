import { useId, useState, type FormEvent } from "react";

const QUICK_ADDS = [
  "Fiebre alta persistente",
  "Dolor abdominal agudo",
  "Dolor de cabeza severo",
  "Mareo o desvanecimiento",
  "Reacción en la piel / urticaria",
];

interface VagueInputPanelProps {
  originalText: string;
  onResubmit: (text: string) => void;
  isLoading?: boolean;
}

/**
 * Vista "Entrada insuficiente" del protocolo de Stitch. Refleja una regla
 * real del sistema (CLAUDE.md sección 2: con input vago se pide más
 * información en vez de clasificar con confianza inventada).
 */
export default function VagueInputPanel({ originalText, onResubmit, isLoading }: VagueInputPanelProps) {
  const [details, setDetails] = useState("");
  const inputId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    const extra = details.trim();
    if (!extra || isLoading) return;
    onResubmit(`${originalText.trim()} ${extra}`);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      <div className="lg:col-span-8 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-2xl shadow-sm flex flex-col gap-space-md">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm w-fit">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">psychology_alt</span>
            Aclaración clínica necesaria
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Necesitamos más datos para orientarte con seguridad
          </h2>
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Tu mensaje:</span>
            <p className="font-body-lg text-body-lg text-on-surface italic">“{originalText}”</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Por principios éticos,{" "}
            <strong className="text-on-surface font-semibold">HealthGuide AI no adivina ni genera listas de enfermedades al azar</strong>{" "}
            ante descripciones imprecisas. Hacerlo genera alarma innecesaria o descuida riesgos reales.
          </p>
          <div className="pt-space-xs flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface">
              Para orientarte de forma segura, indícanos al menos dos de estos factores:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              {[
                ["my_location", "1. Localización", "¿En qué parte del cuerpo? (Cabeza, abdomen, articulaciones, pecho)."],
                ["timer", "2. Temporalidad", "¿Comenzó súbitamente o lleva semanas? ¿Es constante o intermitente?"],
                ["speed", "3. Intensidad", "En escala del 1 al 10, ¿cuánto limita tus actividades habituales?"],
              ].map(([icon, title, body]) => (
                <div key={title} className="p-space-sm rounded-xl bg-surface-container flex flex-col gap-space-xs">
                  <div className="flex items-center gap-1 text-primary">
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{icon}</span>
                    <span className="font-label-md text-label-md">{title}</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{body}</span>
                </div>
              ))}
            </div>
          </div>
          <form className="flex flex-col gap-space-xs pt-space-sm" onSubmit={submit}>
            <label className="font-label-md text-label-md text-on-surface" htmlFor={inputId}>
              Agrega detalles a tu consulta:
            </label>
            <div className="flex flex-col sm:flex-row gap-space-xs">
              <input
                className="flex-1 px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container"
                id={inputId}
                placeholder="Ej: dolor punzante en el costado derecho desde hace 4 horas, con náuseas"
                type="text"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !details.trim()}
                className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center gap-space-xs disabled:opacity-50"
              >
                <span>{isLoading ? "Reevaluando…" : "Reevaluar triaje"}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="lg:col-span-4 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Selección rápida guiada</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            ¿Se relaciona tu malestar con alguno de estos motivos frecuentes?
          </p>
          <div className="flex flex-wrap gap-space-xs">
            {QUICK_ADDS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDetails((prev) => (prev ? `${prev}, ${item.toLowerCase()}` : item))}
                className="px-space-sm py-2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors"
              >
                + {item}
              </button>
            ))}
          </div>
          <div className="p-space-sm rounded-xl bg-surface-container-high text-on-surface flex items-start gap-space-xs mt-space-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Si la descripción es insuficiente, el sistema prefiere pedirte más datos antes que clasificar con una
              confianza inventada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
