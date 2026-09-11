import { useRef, useState } from "react";
import DisclaimerBanner from "./components/DisclaimerBanner";
import SymptomForm from "./components/SymptomForm";
import ResultCard from "./components/ResultCard";
import { requestTriage, TriageApiError } from "./api/triageApi";
import "./App.css";

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
      <header className="app-header">
        <h1>HealthGuide AI</h1>
        <p className="app-header__subtitle">
          Orientación conservadora sobre prioridad de atención médica.
        </p>
      </header>

      <DisclaimerBanner />

      <main className="app-main">
        <SymptomForm onSubmit={handleSubmit} isLoading={status === "loading"} />

        {status === "error" && (
          <div className="error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {status === "success" && result && (
          <div ref={resultRef}>
            <ResultCard result={result} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>HealthGuide AI — Makers Fellowship, AI Product Design.</p>
      </footer>
    </div>
  );
}
