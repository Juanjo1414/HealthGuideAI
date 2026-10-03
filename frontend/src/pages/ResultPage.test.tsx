import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultPage from "./ResultPage";
import { renderAt, triageResponse } from "../test/utils";
import { useAuth } from "../context/AuthContext";
import type { TriageResponse } from "../api/types";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

function setAuth(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated, user: null } as unknown as ReturnType<typeof useAuth>);
}

function renderResult(result: TriageResponse, symptoms = "Tengo dolor de garganta y fiebre leve desde ayer por la tarde") {
  return renderAt(<ResultPage />, {
    path: "/resultado",
    route: "/resultado",
    state: { result, symptoms, duration: null, submittedAt: Date.now() },
  });
}

beforeEach(() => setAuth(false));

describe("ResultPage", () => {
  it("sin resultado (recarga o acceso directo) vuelve al inicio", () => {
    renderAt(<ResultPage />, { path: "/resultado", route: "/resultado" });

    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("muestra la acción esperada de la prioridad, nunca un diagnóstico como título", () => {
    renderResult(triageResponse({ prioridad: "MEDIA" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Te recomendamos agendar una cita médica");
    expect(screen.getByText(/no calibrada clínicamente/i)).toBeInTheDocument();
    expect(screen.getByText(/no calibrada clínicamente/i)).toHaveTextContent(/puede equivocarse/i);
  });

  it("EMERGENCIA cambia a la alerta roja con los teléfonos", () => {
    renderResult(triageResponse({ prioridad: "EMERGENCIA", alertas: ["dolor en el pecho"], requires_human_review: true }));

    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(/señal de alarma detectada/i);
    expect(screen.getAllByRole("alert")[0]).toHaveTextContent("dolor en el pecho");
    expect(screen.getByRole("link", { name: /llamar 123/i })).toHaveAttribute("href", "tel:123");
  });

  it("con texto muy corto pide más datos en vez de presentar una clasificación con confianza", () => {
    renderResult(triageResponse({ prioridad: "BAJA" }), "me siento raro");

    expect(screen.getByText(/necesitamos más datos/i)).toBeInTheDocument();
  });

  it("no pide más datos si la prioridad ya es alta (no frena una urgencia)", () => {
    renderResult(triageResponse({ prioridad: "ALTA" }), "dolor muy fuerte");

    expect(screen.queryByText(/necesitamos más datos/i)).not.toBeInTheDocument();
  });

  it("anónimo: ofrece crear cuenta y aclara que esta consulta no se guardó", () => {
    renderResult(triageResponse());

    expect(screen.getByRole("link", { name: /continuar con correo/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByText(/esta consulta anónima no se guardó/i)).toBeInTheDocument();
  });

  it("con cuenta: confirma que quedó en el historial", () => {
    setAuth(true);
    renderResult(triageResponse());

    expect(screen.getByRole("link", { name: /ver mi historial/i })).toHaveAttribute("href", "/historial");
  });

  it("el texto del modelo se muestra como texto, nunca como HTML", () => {
    const { container } = renderResult(triageResponse({ resumen: '<img src=x onerror="alert(1)">' }));

    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });
});

describe("ResultPage — reevaluar con más datos", () => {
  it("reenvía el texto original más los detalles y muestra el nuevo resultado", async () => {
    const spy = vi.spyOn(await import("../api/triageApi"), "requestTriage");
    spy.mockResolvedValue(triageResponse({ prioridad: "MEDIA", resumen: "Nuevo resumen con más datos." }));
    renderResult(triageResponse({ prioridad: "BAJA" }), "me siento raro");

    await userEvent.type(screen.getByLabelText(/agrega detalles/i), "dolor abdominal desde hace 4 horas");
    await userEvent.click(screen.getByRole("button", { name: /reevaluar triaje/i }));

    expect(spy).toHaveBeenCalledWith("me siento raro dolor abdominal desde hace 4 horas");
    expect(await screen.findByText("Nuevo resumen con más datos.")).toBeInTheDocument();
  });
});
