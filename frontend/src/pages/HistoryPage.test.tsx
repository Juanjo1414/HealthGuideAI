import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HistoryPage from "./HistoryPage";
import { renderAt } from "../test/utils";
import { getTriageHistory } from "../api/triageApi";
import { useAuth } from "../context/AuthContext";
import type { HistoryEntry } from "../api/types";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../api/triageApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/triageApi")>()),
  getTriageHistory: vi.fn(),
}));

function entry(overrides: Partial<HistoryEntry>): HistoryEntry {
  return {
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    prioridad: "MEDIA",
    requiere_revision: false,
    validation_passed: true,
    detalle_disponible: true,
    sintomas_texto: "Tengo fiebre desde ayer",
    resumen: "Fiebre moderada de un día.",
    sintomas_detectados: ["fiebre"],
    posibles_causas: ["infección viral"],
    alertas: [],
    recomendacion: "Hidrátate y consulta si persiste.",
    confianza: 0.6,
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: null } as unknown as ReturnType<typeof useAuth>);
});

describe("HistoryPage", () => {
  it("estado vacío claro, no una lista en blanco", async () => {
    vi.mocked(getTriageHistory).mockResolvedValue([]);
    renderAt(<HistoryPage />);

    expect(await screen.findByText(/todavía no tienes consultas guardadas/i)).toBeInTheDocument();
  });

  it("cuenta, filtra y muestra el detalle al expandir", async () => {
    vi.mocked(getTriageHistory).mockResolvedValue([
      entry({ prioridad: "EMERGENCIA", requiere_revision: true, sintomas_detectados: ["dolor en el pecho"] }),
      entry({ prioridad: "BAJA", sintomas_detectados: ["tos leve"] }),
    ]);
    renderAt(<HistoryPage />);

    expect(await screen.findByRole("tab", { name: "Todos (2)" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("tab", { name: "Emergencias (1)" }));
    expect(screen.getByText("Dolor en el pecho")).toBeInTheDocument();
    expect(screen.queryByText("Tos leve")).not.toBeInTheDocument();

    const card = screen.getByText("Dolor en el pecho").closest("article")!;
    await userEvent.click(within(card).getByRole("button", { name: /ver hoja de resumen/i }));
    expect(within(card).getByText("Hidrátate y consulta si persiste.")).toBeInTheDocument();
  });

  it("lista las causas con su porqué y tolera las viejas sin explicación", async () => {
    vi.mocked(getTriageHistory).mockResolvedValue([
      entry({ posibles_causas: ["infeccion viral de vias respiratorias: fiebre de un dia sin otros sintomas", "cansancio"] }),
    ]);
    renderAt(<HistoryPage />);

    const card = (await screen.findByText("Fiebre")).closest("article")!;
    await userEvent.click(within(card).getByRole("button", { name: /ver hoja de resumen/i }));
    expect(within(card).getByText("infeccion viral de vias respiratorias")).toBeInTheDocument();
    expect(within(card).getByText(/fiebre de un dia sin otros sintomas/)).toBeInTheDocument();
    expect(within(card).getByText("cansancio")).toBeInTheDocument();
  });

  it("es honesto con consultas viejas sin contenido guardado", async () => {
    vi.mocked(getTriageHistory).mockResolvedValue([
      entry({ detalle_disponible: false, resumen: null, sintomas_texto: null, sintomas_detectados: null }),
    ]);
    renderAt(<HistoryPage />);

    expect(await screen.findByText(/solo se conserva su fecha y prioridad/i)).toBeInTheDocument();
  });
});
