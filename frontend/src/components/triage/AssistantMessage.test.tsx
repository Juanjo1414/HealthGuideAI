import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AssistantMessage from "./AssistantMessage";
import type { TriageResultCardData } from "./TriageResultCard";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function result(overrides: Partial<TriageResultCardData> = {}): TriageResultCardData {
  return {
    resumen: "Dolor de garganta con fiebre leve desde ayer.",
    sintomas_detectados: ["dolor de garganta", "fiebre"],
    prioridad: "MEDIA",
    posibles_causas: ["infección viral de vías respiratorias: síntomas de inicio reciente"],
    alertas: [],
    recomendacion: "Mantente hidratado. Consulta a un profesional de la salud si empeora.",
    requiere_revision: false,
    confianza: 0.6,
    ...overrides,
  };
}

const TOGGLE_NAME = /(ver|ocultar) evaluación completa/i;

describe("AssistantMessage", () => {
  it("sin evaluación muestra solo la burbuja, sin el desplegable", () => {
    render(<AssistantMessage content="Hola, cuéntame más." symptoms="Me duele la cabeza" />);

    expect(screen.getByText("Hola, cuéntame más.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TOGGLE_NAME })).not.toBeInTheDocument();
  });

  it("con evaluación normal empieza plegada y el botón la abre y la cierra", async () => {
    render(<AssistantMessage content="Conviene que te revisen esta semana." result={result()} symptoms="Dolor de garganta" />);

    expect(screen.getByText("Conviene que te revisen esta semana.")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Ver evaluación completa" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/dolor de garganta con fiebre leve desde ayer/i)).not.toBeInTheDocument();

    await userEvent.click(toggle);
    const open = screen.getByRole("button", { name: "Ocultar evaluación completa" });
    expect(open).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/dolor de garganta con fiebre leve desde ayer/i)).toBeInTheDocument();

    await userEvent.click(open);
    expect(screen.getByRole("button", { name: "Ver evaluación completa" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/dolor de garganta con fiebre leve desde ayer/i)).not.toBeInTheDocument();
  });

  it("aria-controls apunta al id real del panel expandido", async () => {
    render(<AssistantMessage content="Respuesta." result={result()} symptoms="Dolor de garganta" />);

    await userEvent.click(screen.getByRole("button", { name: TOGGLE_NAME }));

    const panelId = screen.getByRole("button", { name: TOGGLE_NAME }).getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId as string);
    expect(panel).not.toBeNull();
    expect(panel).toHaveTextContent(/dolor de garganta con fiebre leve desde ayer/i);
  });

  it("en EMERGENCIA muestra la tarjeta completa, sin burbuja ni botón de plegar", () => {
    render(
      <AssistantMessage
        content="Texto de chat que no debe esconder la urgencia."
        result={result({ prioridad: "EMERGENCIA", alertas: ["dolor en el pecho"], requiere_revision: true })}
        symptoms="Dolor en el pecho"
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TOGGLE_NAME })).not.toBeInTheDocument();
    expect(screen.queryByText("Texto de chat que no debe esconder la urgencia.")).not.toBeInTheDocument();
  });
});
