import { describe, expect, it, vi } from "vitest";
import { deleteTriageHistory, getTriageHistory, requestTriage, TriageApiError } from "./triageApi";

function mockFetch(impl: (...args: Parameters<typeof fetch>) => Promise<Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(impl);
}

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

describe("triageApi", () => {
  it("manda el texto y la cookie de sesión", async () => {
    const fetchSpy = mockFetch(() => json({ prioridad: "BAJA" }));

    await requestTriage("Tengo tos seca");

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toMatch(/\/triage$/);
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toEqual({ symptoms_text: "Tengo tos seca" });
  });

  it("muestra el `detail` del backend en un error HTTP", async () => {
    mockFetch(() => json({ detail: "Demasiadas solicitudes" }, 429));

    await expect(requestTriage("x")).rejects.toMatchObject({ status: 429, message: "Demasiadas solicitudes" });
  });

  it("un fallo de red queda con status 0 (lo usa la vista offline)", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));

    const error = await requestTriage("x").catch((e) => e);
    expect(error).toBeInstanceOf(TriageApiError);
    expect(error.status).toBe(0);
  });

  it("un timeout avisa que no hay que esperar si los síntomas son urgentes", async () => {
    mockFetch(() => Promise.reject(new DOMException("aborted", "AbortError")));

    await expect(requestTriage("x")).rejects.toThrow(/síntomas son urgentes/);
  });

  it("historial y borrado van al mismo endpoint con la cookie", async () => {
    const fetchSpy = mockFetch((_url, init) => (init?.method === "DELETE" ? Promise.resolve(new Response(null, { status: 204 })) : json([])));

    await expect(getTriageHistory()).resolves.toEqual([]);
    await expect(deleteTriageHistory()).resolves.toBeUndefined();

    expect(fetchSpy.mock.calls.map(([url, init]) => [String(url).replace(/.*\/api/, ""), init?.method])).toEqual([
      ["/triage/history", "GET"],
      ["/triage/history", "DELETE"],
    ]);
  });

  it("el historial sin sesión propaga el 401", async () => {
    mockFetch(() => json({ detail: "Inicia sesión para continuar." }, 401));

    await expect(getTriageHistory()).rejects.toMatchObject({ status: 401 });
  });
});
