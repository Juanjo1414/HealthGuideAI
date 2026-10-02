import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { TriageResponse, User } from "../api/types";

export const USER: User = { id: 7, email: "paciente@example.com", role: "user", created_at: "2026-09-01T12:00:00+00:00" };

export function triageResponse(overrides: Partial<TriageResponse> = {}): TriageResponse {
  return {
    resumen: "Dolor de garganta con fiebre leve desde ayer.",
    sintomas_detectados: ["dolor de garganta", "fiebre"],
    prioridad: "MEDIA",
    posibles_causas: ["infección viral común"],
    alertas: [],
    recomendacion: "Mantente hidratado. Consulta a un médico si empeora.",
    requiere_revision: false,
    confianza: 0.6,
    validation: { passed: true, checks: {}, reasons: [] },
    requires_human_review: false,
    request_id: "9f1c2e7a-4b3d-4e8f-8a1b-2c3d4e5f6a7b",
    ...overrides,
  };
}

/** Muestra la ruta actual para poder afirmar redirecciones. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

export function renderAt(ui: ReactElement, { path = "/", route = "/", state }: { path?: string; route?: string; state?: unknown } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={null} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}
