import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./AuthPage";
import { renderAt, USER } from "../test/utils";
import { AuthApiError } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { loadAlias } from "../lib/preferences";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

const login = vi.fn();
const signup = vi.fn();

beforeEach(() => {
  login.mockReset();
  signup.mockReset();
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, login, signup } as unknown as ReturnType<typeof useAuth>);
});

describe("AuthPage", () => {
  it("login envía correo y contraseña", async () => {
    login.mockResolvedValue(USER);
    renderAt(<AuthPage />, { path: "/login", route: "/login" });

    await userEvent.type(screen.getByLabelText(/^correo electrónico/i), "paciente@example.com");
    await userEvent.type(screen.getByLabelText(/^contraseña/i), "claveSegura123");
    await userEvent.click(screen.getByRole("button", { name: /acceder a mi historial/i }));

    expect(login).toHaveBeenCalledWith("paciente@example.com", "claveSegura123");
  });

  it("muestra el error del backend sin decir cuál campo falló", async () => {
    login.mockRejectedValue(new AuthApiError("Correo o contraseña incorrectos.", 401));
    renderAt(<AuthPage />, { path: "/login", route: "/login" });

    await userEvent.type(screen.getByLabelText(/^correo electrónico/i), "a@b.co");
    await userEvent.type(screen.getByLabelText(/^contraseña/i), "mala");
    await userEvent.click(screen.getByRole("button", { name: /acceder a mi historial/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
  });

  it("registro exige los dos consentimientos antes de llamar al backend", async () => {
    signup.mockResolvedValue(USER);
    renderAt(<AuthPage />, { path: "/signup", route: "/signup" });

    await userEvent.type(screen.getByLabelText(/correo electrónico de contacto/i), "nuevo@example.com");
    await userEvent.type(screen.getByLabelText(/contraseña segura/i), "claveSegura123");
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta segura/i }));

    expect(signup).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/aceptar ambos consentimientos/i);

    await userEvent.click(screen.getByRole("checkbox", { name: /acepto los términos/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /inteligencia artificial/i }));
    await userEvent.type(screen.getByLabelText(/alias/i), "Ale");
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta segura/i }));

    await waitFor(() => expect(signup).toHaveBeenCalledWith("nuevo@example.com", "claveSegura123"));
    expect(loadAlias()).toBe("Ale");
  });

  it("indica la fortaleza de la contraseña", async () => {
    renderAt(<AuthPage />, { path: "/signup", route: "/signup" });
    const strength = screen.getByText("Muy débil");

    await userEvent.type(screen.getByLabelText(/contraseña segura/i), "Clave-Muy-Larga-123");

    expect(strength).toHaveTextContent("Fuerte");
  });

  it("recuperar contraseña es honesto: no simula un correo enviado", async () => {
    renderAt(<AuthPage />, { path: "/recuperar", route: "/recuperar" });

    await userEvent.type(screen.getByLabelText(/correo asociado/i), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/no se envió ningún mensaje/i);
  });

  it("con sesión iniciada redirige a donde el usuario quería ir", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuth>);
    renderAt(<AuthPage />, { path: "/login", route: "/login", state: { from: "/historial" } });

    expect(screen.getByTestId("location")).toHaveTextContent("/historial");
  });
});
