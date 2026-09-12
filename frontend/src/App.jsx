import { useRef, useState } from "react";
import DisclaimerBanner from "./components/DisclaimerBanner";
import SymptomForm from "./components/SymptomForm";
import ResultCard from "./components/ResultCard";
import { requestTriage, TriageApiError } from "./api/triageApi";
import "./App.css";

const todayLabel = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const resultRef = useRef(null);

  async function handleSubmit(symptomsText) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const data = await requestTriage(symptomsText);
      setResult(data);
      setStatus("success");
      // Mueve el foco al resultado para lectores de pantalla y para que
      // el usuario no tenga que hacer scroll manual a ciegas.
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (error) {
      const message =
        error instanceof TriageApiError
          ? error.message
          : "Ocurrió un error inesperado. Intenta de nuevo.";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-mark">
          <span className="brand-mark__symbol">+</span>
          <span>
            <strong>Healthguide</strong>
            <small>AI HEALTH SYSTEM</small>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <a className="sidebar-nav__item sidebar-nav__item--active" href="#triage">
            <span className="sidebar-nav__icon">▦</span>
            Nueva evaluación
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer__status">
            <span className="status-dot" />
            <span>
              <strong>Sistema operativo</strong>
              <small>Motor de triage conectado</small>
            </span>
          </div>
          <p>HealthGuide AI - Makers Fellowship, AI Product Design</p>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-header" id="overview">
          <div>
            <p className="app-header__eyebrow">CENTRO DE ATENCIÓN INTELIGENTE</p>
            <h1>HealthGuide AI</h1>
            <p className="app-header__subtitle">
              Orientación clara para priorizar el siguiente paso de atención.
            </p>
          </div>
          <div className="app-header__date">
            <span>FECHA DE OPERACIÓN</span>
            <strong>{todayLabel}</strong>
          </div>
        </header>

        <main className="app-main">
          <section className="dashboard-stats" aria-label="Resumen del sistema">
            <article className="stat-card stat-card--accent">
              <span className="stat-card__label">Estado del sistema</span>
              <strong>Operativo</strong>
              <small>Respuesta disponible</small>
              <span className="stat-card__signal" />
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Nivel de orientación</span>
              <strong>Conservador</strong>
              <small>Priorización responsable</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Revisión humana</span>
              <strong>Siempre activa</strong>
              <small>Para casos que lo requieren</small>
            </article>
          </section>

          <DisclaimerBanner />

          <section className="triage-workspace" id="triage">
            <div className="workspace-heading">
              <div>
                <span className="section-kicker">01 / NUEVA CONSULTA</span>
                <h2>Evaluación de síntomas</h2>
              </div>
              <span className="workspace-badge">ANÁLISIS SEGURO</span>
            </div>
            <p className="workspace-intro">
              Describe lo que está ocurriendo para recibir una orientación inicial sobre la
              prioridad de atención.
            </p>
            <SymptomForm onSubmit={handleSubmit} isLoading={status === "loading"} />
          </section>

          {status === "error" && (
            <div className="error-banner" role="alert">
              {errorMessage}
            </div>
          )}

          {status === "success" && result && (
            <section className="results-workspace" id="results" ref={resultRef}>
              <div className="workspace-heading">
                <div>
                  <span className="section-kicker">02 / RESULTADO</span>
                  <h2>Orientación generada</h2>
                </div>
                <span className="workspace-badge workspace-badge--mint">LISTO</span>
              </div>
              <ResultCard result={result} />
            </section>
          )}
        </main>

        <footer className="app-footer">
          <p>HealthGuide AI — Orientación educativa, no diagnóstico médico.</p>
          <span>Privacidad · Seguridad · Revisión humana</span>
        </footer>
      </div>
    </div>
  );
}
