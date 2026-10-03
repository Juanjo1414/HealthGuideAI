import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./ProfilePage";
import { renderAt, USER } from "../test/utils";
import { deleteTriageHistory, getTriageHistory } from "../api/triageApi";
import { useAuth } from "../context/AuthContext";
import { loadAlias, loadCountry } from "../lib/preferences";
import { toast } from "sonner";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("../api/triageApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/triageApi")>()),
  getTriageHistory: vi.fn(),
  deleteTriageHistory: vi.fn(),
}));

const logout = vi.fn();

beforeEach(() => {
  logout.mockReset();
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: USER, logout } as unknown as ReturnType<typeof useAuth>);
});

describe("ProfilePage", () => {
  it("muestra la cuenta real y guarda alias y país en el navegador", async () => {
    renderAt(<ProfilePage />);

    expect(screen.getByLabelText(/correo de la cuenta/i)).toHaveValue(USER.email);
    expect(screen.getByText(/#HG-0007/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/alias o nombre preferido/i), "Elena");
    await userEvent.selectOptions(screen.getByLabelText(/país y número de emergencias/i), "MX");
    expect(screen.getByText(/marcado rápido/i)).toHaveTextContent("911");
    await userEvent.click(screen.getByRole("button", { name: /guardar datos básicos/i }));

    expect(loadAlias()).toBe("Elena");
    expect(loadCountry()).toBe("MX");
  });

  it("cerrar sesión llama al logout real", async () => {
    renderAt(<ProfilePage />);

    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalled();
  });

  it("si el logout falla lo avisa en vez de fingir que cerró la sesión", async () => {
    logout.mockRejectedValue(new Error("sin red"));
    renderAt(<ProfilePage />);

    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/no se pudo cerrar la sesión/i)));
  });

  it("borrar el historial exige confirmación", async () => {
    vi.mocked(deleteTriageHistory).mockResolvedValue();
    renderAt(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /privacidad y datos/i }));

    await userEvent.click(screen.getByRole("button", { name: /purgar historial completo/i }));
    expect(deleteTriageHistory).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /sí, borrar todo/i }));

    await waitFor(() => expect(deleteTriageHistory).toHaveBeenCalledTimes(1));
  });

  it("exporta el historial como JSON descargable", async () => {
    vi.mocked(getTriageHistory).mockResolvedValue([]);
    const createUrl = vi.fn(() => "blob:fake");
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderAt(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /privacidad y datos/i }));

    await userEvent.click(screen.getByRole("button", { name: /formato json/i }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(createUrl).toHaveBeenCalled();
  });

  it("aplica escala de letra y reducción de movimiento; lo no disponible está deshabilitado", async () => {
    renderAt(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /accesibilidad visual/i }));

    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    await userEvent.click(screen.getByRole("switch", { name: /reducción de movimiento/i }));
    await userEvent.click(screen.getByRole("button", { name: /guardar accesibilidad/i }));

    expect(document.documentElement.style.fontSize).toBe("20px");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
    expect(screen.getByRole("switch", { name: /alto contraste/i })).toBeDisabled();
  });

  it("notificaciones aparece como próximamente, sin controles activos", async () => {
    renderAt(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /notificaciones y seguimiento/i }));

    expect(screen.getByRole("note")).toHaveTextContent(/próximamente/i);
    for (const box of screen.getAllByRole("checkbox")) expect(box).toBeDisabled();
  });
});
