import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { useAuth } from "./context/AuthContext";

vi.mock("./context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderRoute(path: string, isAuthenticated = false) {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("rutas", () => {
  it.each([
    ["/", /cómo te sientes hoy/i],
    ["/login", /tu salud, tus datos/i],
    ["/terminos", /marco legal/i],
    ["/protocolo", /protocolo crítico/i],
    ["/500", /interrupción temporal/i],
    ["/no-existe", /no encontramos la página/i],
  ])("%s es accesible sin cuenta", (path, heading) => {
    renderRoute(path);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
  });

  it.each(["/historial", "/perfil"])("%s exige sesión", (path) => {
    renderRoute(path);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/tu salud, tus datos/i);
  });
});
