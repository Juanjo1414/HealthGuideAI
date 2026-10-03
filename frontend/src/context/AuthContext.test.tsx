import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import * as authApi from "../api/authApi";
import { USER } from "../test/utils";

vi.mock("../api/authApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/authApi")>()),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext", () => {
  it("recupera la sesión existente al arrancar", async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.user).toEqual(USER);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("sin sesión queda anónimo, y login/logout actualizan el estado", async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(new authApi.AuthApiError("no", 401));
    vi.mocked(authApi.login).mockResolvedValue(USER);
    vi.mocked(authApi.logout).mockResolvedValue(null);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.isAuthenticated).toBe(false);

    await act(() => result.current.login(USER.email, "x").then(() => undefined));
    expect(result.current.user).toEqual(USER);

    await act(() => result.current.logout());
    expect(result.current.user).toBeNull();
  });

  it("si el backend no confirma el logout, NO finge haber cerrado la sesión", async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(USER);
    vi.mocked(authApi.logout).mockRejectedValue(new authApi.AuthApiError("sin red", 0));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(() => expect(result.current.logout()).rejects.toThrow("sin red"));

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("useAuth fuera del provider falla con un mensaje claro", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
