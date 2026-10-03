import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotFoundPage from "./NotFoundPage";
import ProtocolPage from "./ProtocolPage";
import ServerErrorPage from "./ServerErrorPage";
import TermsPage from "./TermsPage";
import { renderAt } from "../test/utils";
import { checkReady } from "../api/healthApi";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../api/healthApi", () => ({ checkReady: vi.fn() }));

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as unknown as ReturnType<typeof useAuth>);
});

describe("pantallas informativas", () => {
  it("todas mantienen el aviso médico y los teléfonos de emergencia", () => {
    for (const page of [<NotFoundPage key="404" />, <TermsPage key="t" />, <ProtocolPage key="p" />, <ServerErrorPage key="500" />]) {
      const { unmount } = renderAt(page);
      expect(screen.getByText(/aviso médico legal y ético permanente/i)).toBeInTheDocument();
      expect(screen.getAllByRole("link", { name: /llamar 112/i }).length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("404 explica y ofrece volver al triaje", () => {
    renderAt(<NotFoundPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/no encontramos la página/i);
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });

  it("términos: no reclama certificaciones que el proyecto no tiene", () => {
    renderAt(<TermsPage />);

    expect(screen.queryByText(/ISO|SOC2|HIPAA/)).not.toBeInTheDocument();
    expect(screen.getByText(/no cuenta con certificaciones regulatorias externas/i)).toBeInTheDocument();
  });

  it("protocolo: cambia entre los tres escenarios", async () => {
    renderAt(<ProtocolPage />);

    expect(screen.getByText(/señal de alarma detectada/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /entrada insuficiente/i }));
    expect(screen.getByText(/necesitamos más datos/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /modo offline/i }));
    expect(screen.getByText(/servidor inaccesible/i)).toBeInTheDocument();
  });

  it("500: muestra el estado real del sistema y vuelve al inicio si ya está sano", async () => {
    vi.mocked(checkReady).mockResolvedValueOnce({
      status: "not_ready",
      checks: { nvidia_configured: true, postgres: false, redis: true },
    });
    renderAt(<ServerErrorPage />, { path: "/500", route: "/500" });

    await userEvent.click(screen.getByRole("button", { name: /comprobar estado del sistema/i }));
    expect(await screen.findByText("Con problemas")).toBeInTheDocument();
    expect(screen.getByText("Base de datos").nextSibling).toHaveTextContent("Falla");

    vi.mocked(checkReady).mockResolvedValueOnce({ status: "ok", checks: { nvidia_configured: true, postgres: true, redis: true } });
    await userEvent.click(screen.getByRole("button", { name: /reintentar conexión/i }));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/));
  });
});
