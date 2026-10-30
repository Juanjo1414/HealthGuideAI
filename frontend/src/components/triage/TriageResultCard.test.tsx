import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import TriageResultCard, { type TriageResultCardData } from "./TriageResultCard";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function result(overrides: Partial<TriageResultCardData> = {}): TriageResultCardData {
  return {
    resumen: "Dolor de garganta con fiebre leve desde ayer.",
    sintomas_detectados: ["dolor de garganta", "fiebre"],
    prioridad: "MEDIA",
    posibles_causas: ["infección viral de vías respiratorias: síntomas de inicio reciente"],
    alertas: ["fiebre que dura más de tres días"],
    recomendacion: "Mantente hidratado. Consulta a un profesional de la salud si empeora.",
    requiere_revision: false,
    confianza: 0.6,
    ...overrides,
  };
}

afterEach(() => vi.clearAllMocks());

describe("TriageResultCard", () => {
  it.each([
    ["BAJA", /puedes monitorear tus síntomas en casa/i],
    ["MEDIA", /te recomendamos agendar una cita médica/i],
    ["ALTA", /busca atención médica en las próximas horas/i],
  ] as const)("prioridad %s: el título es la acción a seguir, nunca un diagnóstico", (prioridad, headline) => {
    render(<TriageResultCard result={result({ prioridad })} symptoms="Me duele la garganta" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(headline);
  });

  it("EMERGENCIA reemplaza todo por el panel rojo con el teléfono", () => {
    render(<TriageResultCard result={result({ prioridad: "EMERGENCIA", alertas: ["dolor en el pecho"] })} symptoms="Dolor de pecho" />);

    expect(screen.getByRole("alert")).toHaveTextContent(/señal de alarma detectada/i);
    expect(screen.getAllByRole("link", { name: /llamar 123/i })[0]).toHaveAttribute("href", "tel:123");
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("muestra las causas como categorías con su porqué y el aviso de que puede equivocarse", () => {
    render(<TriageResultCard result={result()} symptoms="x" />);

    expect(screen.getByRole("heading", { name: /qué podría estar pasando/i })).toBeInTheDocument();
    expect(screen.getAllByText(/infección viral de vías respiratorias/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/síntomas de inicio reciente/i)).toBeInTheDocument();
    expect(screen.getByText(/no calibrada clínicamente: 60%/i)).toHaveTextContent(/puede equivocarse/i);
  });

  it("indica si se recomienda revisión humana", () => {
    const { rerender } = render(<TriageResultCard result={result({ requiere_revision: true })} symptoms="x" />);
    expect(screen.getByText("Recomendada")).toBeInTheDocument();

    rerender(<TriageResultCard result={result({ requiere_revision: false })} symptoms="x" />);
    expect(screen.getByText("No necesaria")).toBeInTheDocument();
  });

  it("el texto del modelo nunca se interpreta como HTML", () => {
    const { container } = render(
      <TriageResultCard result={result({ resumen: '<img src=x onerror="alert(1)"> Dolor leve' })} symptoms="x" />
    );

    expect(container.querySelector("img[src='x']")).toBeNull();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
  });

  it("copiar el resumen avisa con un toast", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
    render(<TriageResultCard result={result()} symptoms="Me duele la garganta" />);

    await userEvent.click(screen.getAllByRole("button", { name: /copiar/i })[0]);

    await vi.waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("si copiar falla, lo dice en vez de fingir que funcionó", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockRejectedValue(new Error("denegado")) }, configurable: true });
    render(<TriageResultCard result={result()} symptoms="Me duele la garganta" />);

    await userEvent.click(screen.getAllByRole("button", { name: /copiar/i })[0]);

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith("No se pudo copiar."));
  });
});
