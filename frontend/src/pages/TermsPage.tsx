import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell";

const SECTIONS = [
  ["seccion-1", "1. Naturaleza no diagnóstica"],
  ["seccion-2", "2. Restricción de medicación"],
  ["seccion-3", "3. Protocolo de urgencias"],
  ["seccion-4", "4. Tus datos"],
  ["seccion-5", "5. Consentimiento y contacto"],
];

const RED_FLAGS = [
  ["cardiology", "Dolor torácico opresivo", "Opresión en el pecho, sobre todo si se irradia al brazo, la mandíbula o la espalda, o viene con sudoración fría."],
  ["air", "Dificultad súbita para respirar", "Falta de aire aguda o incapacidad repentina para pronunciar frases completas."],
  ["neurology", "Signos neurológicos", "Pérdida súbita de fuerza en un lado del cuerpo, cara caída, dificultad brusca para hablar."],
  ["bloodtype", "Hemorragias, desmayos o convulsiones", "Pérdida de conciencia, sangrado que no se controla con presión o convulsiones."],
];

/**
 * Términos (Stitch: "términos, restricciones médicas y marco legal"). Se
 * quitaron las certificaciones, auditorías, leyes españolas y correos de
 * contacto del original: ninguno existe para este proyecto. Lo que queda son
 * las reglas reales del producto (CLAUDE.md sección 2).
 */
export default function TermsPage() {
  const [progress, setProgress] = useState(0);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PageShell>
      <div className="sticky top-16 left-0 right-0 w-full z-40 bg-surface/80 backdrop-blur-md print:hidden" aria-hidden="true">
        <div className="w-full h-1 bg-surface-container-high">
          <div className="h-full bg-primary-container transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="w-full max-w-[1400px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pt-8 pb-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mb-4 tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>VERSIÓN 2026 • REGLAS CLÍNICAS DEL PRODUCTO</span>
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight font-bold mb-4">
              Marco Legal, Condiciones de Uso y Restricciones Médicas
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Definimos con transparencia los límites de nuestro algoritmo, la naturaleza orientativa del triaje y cómo
              tratamos tu información.
            </p>
          </div>
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 print:hidden">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">school</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Naturaleza del proyecto</div>
                <div className="font-label-md text-label-md text-on-surface">Académico · Makers Fellowship</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all active:scale-95 shadow-sm"
            >
              <span aria-hidden="true" className="material-symbols-outlined">download</span>
              <span>Descargar / imprimir en PDF</span>
            </button>
          </div>
        </div>
      </section>

      <nav className="sticky top-[68px] z-30 w-full bg-surface-container-low shadow-sm print:hidden" aria-label="Secciones del documento">
        <div className="max-w-[1400px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
            {SECTIONS.map(([id, label]) => (
              <a key={id} className="px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary transition-colors shadow-sm" href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="w-full max-w-[1400px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-12 flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <h4 className="font-headline-sm text-headline-sm text-primary">Resumen rápido</h4>
            <div className="flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant">
              {[
                ["check_circle", "text-secondary", "Orientación de prioridad, no diagnóstico."],
                ["cancel", "text-error", "Cero recomendación de medicamentos, ni por nombre ni por categoría."],
                ["lock", "text-secondary", "Sin cuenta no guardamos tu texto; con cuenta, lo puedes borrar en un clic."],
              ].map(([icon, tone, text]) => (
                <div key={text} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className={`material-symbols-outlined icon-filled text-base mt-0.5 ${tone}`}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container p-6 rounded-2xl flex flex-col gap-3">
            <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Supervisión clínica</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              Las reglas de seguridad y los casos de evaluación se revisan con el equipo; la validación clínica de todos los
              casos sigue en curso. Por eso el sistema siempre recomienda consultar a un profesional.
            </p>
          </div>
          <div className="bg-error-container text-on-error-container p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 font-label-lg text-label-lg font-bold">
              <span aria-hidden="true" className="material-symbols-outlined">fmd_bad</span>
              <span>¿Tienes una urgencia?</span>
            </div>
            <p className="font-body-sm text-body-sm mb-4 leading-relaxed">No leas términos si presentas síntomas incapacitantes.</p>
            <a className="w-full py-2.5 px-4 bg-error text-on-error rounded-full font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity" href="tel:112">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">call</span>
              <span>Llamada directa 112 / 911</span>
            </a>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-12 max-w-4xl">
          <Article id="seccion-1" tag="Cláusula primaria" article="Artículo 1">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold mb-4">1. Naturaleza no diagnóstica ni asistencial</h2>
            <div className="p-5 md:p-6 rounded-xl bg-surface-container-low text-primary flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="p-3 bg-surface-container-lowest rounded-xl flex-shrink-0 text-primary">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-md">stethoscope</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">HealthGuide AI NO es un médico ni da diagnósticos</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Es un asistente que clasifica la prioridad de atención a partir de los síntomas que describes, y puede equivocarse.
                </p>
              </div>
            </div>
            <div className="font-body-md text-body-md text-on-surface flex flex-col gap-4 leading-relaxed">
              <p>HealthGuide AI no constituye la práctica de la medicina, la enfermería ni otra profesión sanitaria regulada.</p>
              <p>
                El sistema analiza tu descripción con el único propósito de <em>estimar la prioridad</em> de buscar atención
                (baja, media, alta o emergencia) y sugerir un siguiente paso. No sustituye el examen físico, las pruebas
                complementarias ni el criterio de un profesional de la salud. La decisión final siempre es tuya, junto con un profesional.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-surface-container">
                <div className="flex items-center gap-2 text-primary font-label-lg text-label-lg mb-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-secondary">check_circle</span>
                  <span>Lo que sí proporciona el sistema</span>
                </div>
                <ul className="font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-2">
                  <li>• Un nivel de prioridad orientativo y el siguiente paso sugerido.</li>
                  <li>• Un resumen de los síntomas que describiste.</li>
                  <li>• Posibles causas generales, nunca como afirmación cerrada.</li>
                  <li>• Medidas generales no farmacológicas de autocuidado.</li>
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-high">
                <div className="flex items-center gap-2 text-error font-label-lg text-label-lg mb-2">
                  <span aria-hidden="true" className="material-symbols-outlined">do_not_disturb_on</span>
                  <span>Lo que NO proporciona bajo ningún caso</span>
                </div>
                <ul className="font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-2">
                  <li>• Diagnóstico médico de una enfermedad específica.</li>
                  <li>• Cambios a tratamientos que ya tengas.</li>
                  <li>• Recetas, certificados o incapacidades.</li>
                  <li>• Atención de emergencias: para eso, llama al 112 / 911 / 123.</li>
                </ul>
              </div>
            </div>
          </Article>

          <Article id="seccion-2" tag="Medicación" article="Artículo 2">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold mb-4">2. Prohibición de recomendar medicamentos</h2>
            <p className="font-body-md text-body-md text-on-surface mb-6 leading-relaxed">
              El sistema nunca recomienda medicamentos, dosis ni posologías. Un validador de seguridad revisa cada respuesta
              y, si detecta una recomendación de medicación, la reemplaza por una respuesta segura antes de mostrártela.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-error-container/40 flex items-start gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-error text-2xl flex-shrink-0 mt-0.5">medication_liquid</span>
                <div>
                  <h4 className="font-label-lg text-label-lg text-error font-bold mb-1">Medicamentos con receta</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Nunca menciona ni ajusta antibióticos, ansiolíticos, corticoides ni anticoagulantes.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-error-container/40 flex items-start gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-error text-2xl flex-shrink-0 mt-0.5">pill</span>
                <div>
                  <h4 className="font-label-lg text-label-lg text-error font-bold mb-1">Venta libre</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tampoco analgésicos ni antiinflamatorios (p. ej. paracetamol o ibuprofeno), ni siquiera por categoría.</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex items-center gap-2 text-primary font-label-lg text-label-lg mb-2">
                <span aria-hidden="true" className="material-symbols-outlined text-secondary">eco</span>
                <span>Límite: medidas generales de autocuidado</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Las sugerencias se limitan a pautas de confort: hidratación, reposo, compresas tibias o frías y medidas de postura.
              </p>
            </div>
          </Article>

          <Article id="seccion-3" tag="Emergencia crítica" article="Artículo 3" danger>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-error font-bold mb-4">3. Protocolo de urgencias vitales (señales de alarma)</h2>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed mb-6">
              Si tu descripción incluye una señal de alarma, reglas deterministas escalan la prioridad a{" "}
              <strong>EMERGENCIA</strong> y marcan revisión humana, antes de que el modelo de IA intervenga. Si vives alguna
              de estas situaciones, <em>no esperes la respuesta del sistema</em>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
              {RED_FLAGS.map(([icon, title, body]) => (
                <div key={title} className="p-4 rounded-xl bg-surface-container flex items-start gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-error text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold block mb-1">{title}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{body}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-xl bg-error-container text-on-error-container flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-headline-md flex-shrink-0">emergency</span>
                <p className="font-label-md text-label-md">Si sospechas alguna de estas condiciones, deja de navegar y llama.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <a className="flex-1 sm:flex-none px-6 py-2.5 bg-error text-on-error rounded-full font-label-md text-label-md text-center shadow-md hover:opacity-90" href="tel:112">Llamar al 112</a>
                <a className="flex-1 sm:flex-none px-6 py-2.5 bg-on-error-container text-on-primary rounded-full font-label-md text-label-md text-center shadow-md hover:opacity-90" href="tel:911">Llamar al 911</a>
              </div>
            </div>
          </Article>

          <Article id="seccion-4" tag="Privacidad" article="Artículo 4">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold mb-4">4. Tus datos y cómo los tratamos</h2>
            <p className="font-body-md text-body-md text-on-surface mb-6 leading-relaxed">
              Los datos de salud son sensibles. Esto es exactamente lo que hace el sistema hoy, sin adornos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                ["A", "Sin cuenta, sin texto", "Las consultas anónimas no guardan lo que escribiste: solo un registro técnico mínimo (fecha y prioridad) para auditar la seguridad del sistema."],
                ["B", "Cero comercialización", "No vendemos, cedemos ni monetizamos tu información con aseguradoras, laboratorios ni anunciantes."],
                ["C", "Derecho al olvido", "Con cuenta, tu texto y tus orientaciones se guardan en tu historial, y puedes borrarlo completo en un clic desde tu perfil."],
              ].map(([letter, title, body]) => (
                <div key={letter} className="p-5 rounded-xl bg-surface-container flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-sm text-label-sm">{letter}</div>
                  <h4 className="font-label-lg text-label-lg text-primary font-bold">{title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-xl bg-surface-container-low flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary text-2xl">security</span>
              <div>
                <div className="font-label-md text-label-md text-on-surface font-bold">Protecciones técnicas activas</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Contraseñas con hash bcrypt, sesión en cookie HttpOnly, protección CSRF por origen y límite de solicitudes.
                  Este proyecto no cuenta con certificaciones regulatorias externas.
                </div>
              </div>
            </div>
          </Article>

          <Article id="seccion-5" tag="Compromiso ético" article="Artículo 5">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold mb-4">5. Consentimiento y contacto</h2>
            <p className="font-body-md text-body-md text-on-surface mb-6 leading-relaxed">
              Al usar HealthGuide AI confirmas que entiendes la diferencia entre una orientación automática y la atención
              médica humana.
            </p>
            <div className="p-6 rounded-2xl bg-surface-container mb-8">
              <label className="flex items-start gap-4 cursor-pointer select-none">
                <input className="w-6 h-6 rounded-md accent-primary-container mt-0.5 cursor-pointer" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span className="flex-1">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold block mb-1">Declaración de entendimiento</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed block">
                    Entiendo que HealthGuide AI es un sistema de priorización no diagnóstica, que no prescribe fármacos y que
                    puede equivocarse, y me comprometo a acudir a urgencias ante cualquier señal de alarma.
                  </span>
                </span>
              </label>
              {accepted && (
                <div className="mt-4 pt-4 flex items-center gap-2 text-secondary font-label-md text-label-md" role="status">
                  <span aria-hidden="true" className="material-symbols-outlined icon-filled text-lg">check_circle</span>
                  <span>Gracias. Puedes seguir usando el triaje con tranquilidad.</span>
                </div>
              )}
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-4">Equipo responsable</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2 text-primary font-label-lg text-label-lg mb-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">groups</span>
                  <span>Autores del proyecto</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cristian Camilo Cabarcas y Juan José Jaramillo Mora — Makers Fellowship, AI Product Design.</p>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2 text-primary font-label-lg text-label-lg mb-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">privacy_tip</span>
                  <span>Tus datos</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Exporta o borra tu historial cuando quieras desde tu perfil.</p>
                <Link className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1" to="/perfil">
                  <span>Ir a Privacidad</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </Article>
        </div>
      </div>
    </PageShell>
  );
}

function Article({ id, tag, article, danger, children }: { id: string; tag: string; article: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <article className="scroll-mt-36 flex flex-col gap-6" id={id}>
      <div className="bg-surface-container-lowest p-6 md:p-10 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase ${danger ? "bg-error-container text-on-error-container font-bold" : "bg-surface-container-high text-primary"}`}>{tag}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{article}</span>
        </div>
        {children}
      </div>
    </article>
  );
}
