import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { renderAt } from "../test/utils";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

function setAuth(value: { isAuthenticated: boolean; status: "loading" | "ready" }) {
  vi.mocked(useAuth).mockReturnValue(value as unknown as ReturnType<typeof useAuth>);
}

const page = (
  <ProtectedRoute>
    <p>Contenido privado</p>
  </ProtectedRoute>
);

describe("ProtectedRoute", () => {
  it("sin sesión redirige a /login", () => {
    setAuth({ isAuthenticated: false, status: "ready" });
    renderAt(page, { path: "/historial", route: "/historial" });

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("mientras verifica la sesión no muestra nada (ni expulsa)", () => {
    setAuth({ isAuthenticated: false, status: "loading" });
    renderAt(page, { path: "/historial", route: "/historial" });

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/historial");
  });

  it("con sesión muestra la página", () => {
    setAuth({ isAuthenticated: true, status: "ready" });
    renderAt(page, { path: "/historial", route: "/historial" });

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });
});
