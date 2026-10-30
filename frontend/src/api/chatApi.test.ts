import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ChatApiError,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendAnonymousMessage,
  sendMessage,
} from "./chatApi";

function mockFetch(impl: (...args: Parameters<typeof fetch>) => Promise<Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(impl);
}

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

const path = (url: unknown) => String(url).replace(/.*\/api/, "");

afterEach(() => vi.restoreAllMocks());

describe("chatApi — conversaciones con sesión", () => {
  it("crear, listar y leer van a /v1/chat/conversations con la cookie de sesión", async () => {
    const fetchSpy = mockFetch(() => json({ id: "c1" }));

    await createConversation();
    await listConversations();
    await getConversation("c1");

    expect(fetchSpy.mock.calls.map(([url, init]) => [path(url), init?.method, init?.credentials])).toEqual([
      ["/v1/chat/conversations", "POST", "include"],
      ["/v1/chat/conversations", "GET", "include"],
      ["/v1/chat/conversations/c1", "GET", "include"],
    ]);
  });

  it("escapa el id de la conversación en la URL", async () => {
    const fetchSpy = mockFetch(() => json({}));

    await getConversation("a/b?c");

    expect(path(fetchSpy.mock.calls[0][0])).toBe("/v1/chat/conversations/a%2Fb%3Fc");
  });

  it("sendMessage manda solo el contenido", async () => {
    const fetchSpy = mockFetch(() => json({ prioridad: "BAJA" }));

    await sendMessage("c1", "Me duele la cabeza");

    const [url, init] = fetchSpy.mock.calls[0];
    expect(path(url)).toBe("/v1/chat/conversations/c1/messages");
    expect(JSON.parse(String(init?.body))).toEqual({ content: "Me duele la cabeza" });
  });

  it.each([
    ["crear", () => createConversation(), "No se pudo crear la conversación."],
    ["listar", () => listConversations(), "No se pudo cargar la lista de conversaciones."],
    ["leer", () => getConversation("c1"), "No se pudo cargar la conversación."],
    ["enviar", () => sendMessage("c1", "x"), "Ocurrio un error al enviar tu mensaje."],
    ["borrar", () => deleteConversation("c1"), "No se pudo borrar la conversación."],
  ])("%s: sin `detail` en el error usa un mensaje propio y conserva el status", async (_name, call, fallback) => {
    mockFetch(() => Promise.resolve(new Response("no es json", { status: 500 })));

    await expect(call()).rejects.toMatchObject({ message: fallback, status: 500 });
  });

  it("muestra el `detail` del backend (401, 404, 409, 429)", async () => {
    for (const status of [401, 404, 409, 429]) {
      mockFetch(() => json({ detail: `error ${status}` }, status));
      await expect(sendMessage("c1", "x")).rejects.toMatchObject({ status, message: `error ${status}` });
    }
  });

  it("un fallo de red queda con status 0 (lo usa la vista offline)", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));

    for (const call of [
      () => createConversation(),
      () => listConversations(),
      () => getConversation("c1"),
      () => sendMessage("c1", "x"),
      () => deleteConversation("c1"),
    ]) {
      const error = await call().catch((e) => e);
      expect(error).toBeInstanceOf(ChatApiError);
      expect(error.status).toBe(0);
    }
  });

  it("un timeout en el envío avisa que no hay que esperar si los síntomas son urgentes", async () => {
    mockFetch(() => Promise.reject(new DOMException("aborted", "AbortError")));

    await expect(sendMessage("c1", "x")).rejects.toThrow(/síntomas son urgentes/);
    await expect(createConversation()).rejects.toMatchObject({ status: 0 });
    await expect(listConversations()).rejects.toThrow(/tardó demasiado/);
    await expect(getConversation("c1")).rejects.toThrow(/tardó demasiado/);
  });

  it("borrar responde sin cuerpo cuando sale bien", async () => {
    const fetchSpy = mockFetch(() => Promise.resolve(new Response(null, { status: 204 })));

    await expect(deleteConversation("c1")).resolves.toBeUndefined();

    expect(fetchSpy.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

describe("chatApi — chat anónimo", () => {
  it("manda el historial y el aviso de emergencia, sin cookie de sesión", async () => {
    const fetchSpy = mockFetch(() => json({ prioridad: "BAJA" }));
    const history = [{ role: "user" as const, content: "Hola" }];

    await sendAnonymousMessage("Sigo igual", history, true);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(path(url)).toBe("/v1/chat/anonymous/messages");
    expect(init?.credentials).toBeUndefined();
    expect(JSON.parse(String(init?.body))).toEqual({ content: "Sigo igual", history, already_emergency: true });
  });

  it("propaga el `detail` y el status del backend", async () => {
    mockFetch(() => json({ detail: "Demasiados mensajes." }, 429));

    await expect(sendAnonymousMessage("x", [], false)).rejects.toMatchObject({ status: 429, message: "Demasiados mensajes." });
  });

  it("un fallo de red y un timeout quedan con status 0", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(sendAnonymousMessage("x", [], false)).rejects.toMatchObject({ status: 0 });

    mockFetch(() => Promise.reject(new DOMException("aborted", "AbortError")));
    await expect(sendAnonymousMessage("x", [], false)).rejects.toThrow(/síntomas son urgentes/);
  });
});
