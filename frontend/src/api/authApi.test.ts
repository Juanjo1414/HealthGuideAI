import { describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, logout, signup } from "./authApi";
import { checkReady } from "./healthApi";

function respond(body: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    Promise.resolve(new Response(body === null ? null : JSON.stringify(body), { status }))
  );
}

describe("authApi", () => {
  it("login y signup mandan credenciales con la cookie", async () => {
    const spy = respond({ id: 1 });

    await login("a@b.co", "clave1");
    await signup("c@d.co", "clave2");

    const calls = spy.mock.calls.map(([url, init]) => [String(url).replace(/.*\/api/, ""), init?.credentials, JSON.parse(String(init?.body))]);
    expect(calls).toEqual([
      ["/auth/login", "include", { email: "a@b.co", password: "clave1" }],
      ["/auth/signup", "include", { email: "c@d.co", password: "clave2" }],
    ]);
  });

  it("logout tolera el 204 sin cuerpo", async () => {
    respond(null, 204);
    await expect(logout()).resolves.toBeNull();
  });

  it("propaga el `detail` y el status de un error", async () => {
    respond({ detail: "Ese correo ya está registrado." }, 409);
    await expect(signup("a@b.co", "x")).rejects.toMatchObject({ status: 409, message: "Ese correo ya está registrado." });
  });

  it("un fallo de red y un timeout dan mensajes distintos", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(getCurrentUser()).rejects.toThrow(/No se pudo conectar/);
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new DOMException("x", "AbortError"));
    await expect(getCurrentUser()).rejects.toThrow(/tardó demasiado/);
  });
});

describe("healthApi", () => {
  it("consulta /ready en la raíz del backend, sin el prefijo /api", async () => {
    const spy = respond({ status: "ok", checks: {} });

    await checkReady();

    expect(String(spy.mock.calls[0][0])).toMatch(/:\d+\/ready$/);
  });

  it("nunca lanza: sin red devuelve null", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await expect(checkReady()).resolves.toBeNull();
  });
});
