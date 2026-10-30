import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { renderAt, triageResponse } from "../test/utils";
import { sendAnonymousMessage, sendMessage, createConversation, getConversation, ChatApiError } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../api/chatApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/chatApi")>()),
  sendAnonymousMessage: vi.fn(),
  sendMessage: vi.fn(),
  createConversation: vi.fn(),
  getConversation: vi.fn(),
}));

const mockedSendAnonymous = vi.mocked(sendAnonymousMessage);
const mockedSendMessage = vi.mocked(sendMessage);
const mockedCreateConversation = vi.mocked(createConversation);
const mockedGetConversation = vi.mocked(getConversation);

beforeEach(() => {
  localStorage.clear();
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
});

function anonymousResult(overrides: Parameters<typeof triageResponse>[0] = {}) {
  const { request_id, requires_human_review, ...rest } = triageResponse(overrides);
  void request_id;
  void requires_human_review;
  return rest;
}

describe("HomePage — triaje sin cuenta, fusionado con el chat", () => {
  it("se puede evaluar sin iniciar sesión y el botón exige texto", async () => {
    renderAt(<HomePage />);
    const submit = screen.getByRole("button", { name: /iniciar evaluación de síntomas/i });

    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Tengo tos seca");
    expect(submit).toBeEnabled();
    expect(screen.getByText(/sin cuenta, no guardamos tu texto/i)).toBeInTheDocument();
  });

  it("el autocompletado llena el campo, la duración se agrega al texto enviado y se muestra el resultado en la misma pantalla", async () => {
    mockedSendAnonymous.mockResolvedValue(anonymousResult());
    renderAt(<HomePage />);

    await userEvent.click(screen.getByRole("button", { name: /fiebre y dolor de garganta/i }));
    await userEvent.click(screen.getByRole("radio", { name: "1 a 3 días" }));
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await waitFor(() =>
      expect(mockedSendAnonymous).toHaveBeenCalledWith(
        "Tengo fiebre y dolor de garganta. Duración: 1 a 3 días.",
        [],
        false
      )
    );
    // El resultado se muestra en la misma pantalla (sin navegar a /resultado).
    expect(await screen.findByText(/por lo que me cuentas/i)).toBeInTheDocument();
    // La evaluación estructurada queda plegada hasta que la persona la abre.
    expect(screen.queryByText(/dolor de garganta con fiebre leve desde ayer/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /ver evaluación completa/i }));
    expect(screen.getByText(/dolor de garganta con fiebre leve desde ayer/i)).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    // El formulario inicial se oculta una vez que hay una conversación en curso.
    expect(screen.queryByLabelText(/describe tus síntomas/i)).not.toBeInTheDocument();
    // El composer de chat queda disponible para continuar la conversación.
    expect(screen.getByRole("button", { name: /^enviar$/i })).toBeInTheDocument();
  });

  it("continuar la conversación manda el historial acumulado al endpoint anónimo", async () => {
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ respuesta: "Primer resumen." }));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Primer resumen.");

    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ respuesta: "Segundo resumen." }));
    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "También tengo náuseas");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() =>
      expect(mockedSendAnonymous).toHaveBeenLastCalledWith(
        "También tengo náuseas",
        [{ role: "user", content: "Me duele la cabeza" }, { role: "assistant", content: expect.stringContaining("Primer resumen.") }],
        false
      )
    );
    expect(await screen.findByText(/segundo resumen\./i)).toBeInTheDocument();
  });

  it("sin conexión muestra el panel offline con los teléfonos, no un error genérico", async () => {
    mockedSendAnonymous.mockRejectedValue(new ChatApiError("sin red", 0));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByText(/servidor inaccesible o sin conexión/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /llamar 123/i })[0]).toHaveAttribute("href", "tel:123");
  });

  it("un error 5xx no navega fuera de la pantalla si ya hay turnos previos (no se pierde el contexto)", async () => {
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ respuesta: "Primer resumen." }));
    renderAt(<HomePage />);
    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Primer resumen.");

    mockedSendAnonymous.mockRejectedValueOnce(new ChatApiError("El modelo no pudo procesar la solicitud.", 502));
    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "Sigo mal");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El modelo no pudo procesar la solicitud.");
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    expect(screen.getByText("Primer resumen.")).toBeInTheDocument();
  });

  it("un 429 se muestra como alerta con el mensaje del backend", async () => {
    mockedSendAnonymous.mockRejectedValue(new ChatApiError("Demasiadas solicitudes, espera un momento.", 429));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Demasiadas solicitudes");
  });

  it("llega con texto precargado desde 'Reevaluar'", () => {
    renderAt(<HomePage />, { state: { prefill: "Dolor lumbar desde hace una semana" } });

    expect(screen.getByLabelText(/describe tus síntomas/i)).toHaveValue("Dolor lumbar desde hace una semana");
  });

  it("restaura la conversación anónima guardada en localStorage al recargar", () => {
    localStorage.setItem(
      "healthguide_anonymous_chat",
      JSON.stringify({
        turns: [
          { role: "user", content: "Dolor de cabeza" },
          { role: "assistant", content: "Resumen restaurado.", result: anonymousResult({ resumen: "Resumen restaurado." }) },
        ],
        alreadyEmergency: false,
      })
    );
    renderAt(<HomePage />);

    expect(screen.getByText("Resumen restaurado.")).toBeInTheDocument();
  });
});

describe("HomePage — triaje con cuenta", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
  });

  it("crea una conversación en el primer mensaje y reutiliza su id en los siguientes", async () => {
    mockedCreateConversation.mockResolvedValue({
      id: "conv-1",
      created_at: "2026-01-01T00:00:00Z",
      last_activity_at: "2026-01-01T00:00:00Z",
      locked_emergency: false,
      turn_limit_reached: false,
      messages: [],
    });
    mockedSendMessage.mockResolvedValueOnce({
      ...triageResponse({ respuesta: "Resumen autenticado." }),
      conversation_id: "conv-1",
      message_id: "msg-1",
    });
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await screen.findByText("Resumen autenticado.");
    expect(mockedCreateConversation).toHaveBeenCalledTimes(1);

    mockedSendMessage.mockResolvedValueOnce({
      ...triageResponse({ respuesta: "Segundo resumen autenticado." }),
      conversation_id: "conv-1",
      message_id: "msg-2",
    });
    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "Sigo con dolor");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() => expect(mockedSendMessage).toHaveBeenLastCalledWith("conv-1", "Sigo con dolor"));
    expect(mockedCreateConversation).toHaveBeenCalledTimes(1);
  });
});

describe("HomePage — accesibilidad y reglas de la conversación", () => {
  it("el foco pasa al resultado cuando llega el primero (lectores de pantalla)", async () => {
    mockedSendAnonymous.mockResolvedValue(anonymousResult({ respuesta: "Primer resumen." }));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Primer resumen.");

    await waitFor(() => expect(document.activeElement).toHaveAttribute("aria-live", "polite"));
    expect(document.activeElement).toContainElement(screen.getByText("Primer resumen."));
  });

  it("una respuesta de EMERGENCIA deja la conversación marcada y el siguiente mensaje lo avisa al servidor", async () => {
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ prioridad: "EMERGENCIA", alertas: ["dolor en el pecho"] }));
    renderAt(<HomePage />);
    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Dolor de pecho fuerte");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByText(/esta conversación fue marcada como emergencia/i)).toBeInTheDocument();

    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ prioridad: "BAJA", respuesta: "Ya mejor." }));
    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "Ya me siento mejor");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() => expect(mockedSendAnonymous).toHaveBeenLastCalledWith("Ya me siento mejor", expect.any(Array), true));
    expect(screen.getByText(/esta conversación fue marcada como emergencia/i)).toBeInTheDocument();
  });

  it("el límite de turnos (409) pide iniciar una nueva evaluación", async () => {
    mockedSendAnonymous.mockRejectedValue(new ChatApiError("límite", 409));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/límite de mensajes/i);
  });

  it("con sesión no escribe la conversación en localStorage (ya la guarda el backend)", async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
    mockedCreateConversation.mockResolvedValue({
      id: "conv-1",
      created_at: "2026-01-01T00:00:00Z",
      last_activity_at: "2026-01-01T00:00:00Z",
      locked_emergency: false,
      turn_limit_reached: false,
      messages: [],
    });
    mockedSendMessage.mockResolvedValue({ ...triageResponse({ respuesta: "Con cuenta." }), conversation_id: "conv-1", message_id: "m1" });
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Con cuenta.");

    expect(localStorage.getItem("healthguide_anonymous_chat")).toBeNull();
  });

  it("abre una conversación del historial con ?conversationId y permite seguir escribiendo", async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
    mockedGetConversation.mockResolvedValue({
      id: "conv-9",
      created_at: "2026-01-01T00:00:00Z",
      last_activity_at: "2026-01-01T00:00:00Z",
      locked_emergency: true,
      turn_limit_reached: false,
      messages: [
        { id: "1", role: "user", content: "Dolor de pecho", created_at: "2026-01-01T00:00:00Z", prioridad: null, requiere_revision: null, evaluacion: null },
        { id: "2", role: "assistant", content: "Busca atención ya.", created_at: "2026-01-01T00:00:01Z", prioridad: "EMERGENCIA", requiere_revision: true, evaluacion: null },
      ],
    });
    mockedSendMessage.mockResolvedValue({ ...triageResponse({ respuesta: "Seguimos." }), conversation_id: "conv-9", message_id: "m3" });
    renderAt(<HomePage />, { search: "?conversationId=conv-9" });

    expect(await screen.findByText(/busca atención ya\./i)).toBeInTheDocument();
    expect(screen.getByText(/esta conversación fue marcada como emergencia/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "Sigue igual");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() => expect(mockedSendMessage).toHaveBeenCalledWith("conv-9", "Sigue igual"));
  });

  it("si la conversación del historial ya no existe, queda el formulario normal", async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
    mockedGetConversation.mockRejectedValue(new ChatApiError("Conversación no encontrada.", 404));
    renderAt(<HomePage />, { search: "?conversationId=borrada" });

    expect(await screen.findByLabelText(/describe tus síntomas/i)).toBeInTheDocument();
  });
});

async function startAnonymousConversation(overrides: Parameters<typeof anonymousResult>[0] = {}) {
  mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ respuesta: "Primer resumen.", ...overrides }));
  renderAt(<HomePage />);
  await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
  await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
  // En EMERGENCIA el panel rojo reemplaza al resumen: se espera el botón de salida.
  await screen.findByRole("button", { name: /nueva evaluación/i });
}

describe("HomePage — nueva evaluación", () => {
  it("el botón aparece solo cuando hay una conversación en curso", async () => {
    renderAt(<HomePage />);
    expect(screen.queryByRole("button", { name: /nueva evaluación/i })).not.toBeInTheDocument();
  });

  it("sin cuenta pide confirmación, y si se cancela la conversación sigue ahí", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await startAnonymousConversation();

    await userEvent.click(screen.getByRole("button", { name: /nueva evaluación/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText("Primer resumen.")).toBeInTheDocument();
    expect(localStorage.getItem("healthguide_anonymous_chat")).not.toBeNull();
  });

  it("sin cuenta, al confirmar vuelve al formulario y borra la conversación del navegador", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await startAnonymousConversation();

    await userEvent.click(screen.getByRole("button", { name: /nueva evaluación/i }));

    expect(await screen.findByLabelText(/describe tus síntomas/i)).toHaveValue("");
    expect(screen.queryByText("Primer resumen.")).not.toBeInTheDocument();
    expect(localStorage.getItem("healthguide_anonymous_chat")).toBeNull();
  });

  it("la nueva evaluación no hereda la emergencia ni el historial de la anterior", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await startAnonymousConversation({ prioridad: "EMERGENCIA", alertas: ["dolor en el pecho"] });
    expect(screen.getByText(/esta conversación fue marcada como emergencia/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /nueva evaluación/i }));
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ prioridad: "BAJA", respuesta: "Otro caso." }));
    await userEvent.type(await screen.findByLabelText(/describe tus síntomas/i), "Tengo tos leve");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await screen.findByText("Otro caso.");
    expect(mockedSendAnonymous).toHaveBeenLastCalledWith("Tengo tos leve", [], false);
    expect(screen.queryByText(/esta conversación fue marcada como emergencia/i)).not.toBeInTheDocument();
  });

  it("con cuenta no pide confirmación (la conversación queda en el historial) y la siguiente crea otra", async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
    const confirmSpy = vi.spyOn(window, "confirm");
    mockedCreateConversation
      .mockResolvedValueOnce({ id: "conv-1", created_at: "", last_activity_at: "", locked_emergency: false, turn_limit_reached: false, messages: [] })
      .mockResolvedValueOnce({ id: "conv-2", created_at: "", last_activity_at: "", locked_emergency: false, turn_limit_reached: false, messages: [] });
    mockedSendMessage.mockResolvedValue({ ...triageResponse({ respuesta: "Con cuenta." }), conversation_id: "x", message_id: "m" });
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Con cuenta.");
    await userEvent.click(screen.getByRole("button", { name: /nueva evaluación/i }));
    await userEvent.type(await screen.findByLabelText(/describe tus síntomas/i), "Ahora me duele la rodilla");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await waitFor(() => expect(mockedSendMessage).toHaveBeenLastCalledWith("conv-2", "Ahora me duele la rodilla"));
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("sale también de una conversación abierta desde el historial (?conversationId)", async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, status: "ready", user: null } as unknown as ReturnType<typeof useAuth>);
    mockedGetConversation.mockResolvedValue({
      id: "conv-9",
      created_at: "",
      last_activity_at: "",
      locked_emergency: false,
      turn_limit_reached: false,
      messages: [
        { id: "1", role: "user", content: "Dolor de cabeza", created_at: "", prioridad: null, requiere_revision: null, evaluacion: null },
        { id: "2", role: "assistant", content: "Descansa e hidrátate.", created_at: "", prioridad: "BAJA", requiere_revision: false, evaluacion: null },
      ],
    });
    renderAt(<HomePage />, { search: "?conversationId=conv-9" });
    await screen.findByText(/descansa e hidrátate/i);

    await userEvent.click(screen.getByRole("button", { name: /nueva evaluación/i }));

    expect(await screen.findByLabelText(/describe tus síntomas/i)).toBeInTheDocument();
  });
});

describe("HomePage — dictado por voz", () => {
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  });

  it("si el micrófono falla, el usuario ve el motivo y el botón vuelve a 'Hablar'", async () => {
    class FakeRecognition {
      static last: FakeRecognition | null = null;
      listeners: Record<string, Array<(e?: unknown) => void>> = {};
      lang = "";
      continuous = false;
      interimResults = false;
      start = vi.fn();
      stop = vi.fn();
      constructor() {
        FakeRecognition.last = this;
      }
      addEventListener(type: string, listener: (e?: unknown) => void) {
        (this.listeners[type] ??= []).push(listener);
      }
    }
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
    renderAt(<HomePage />);

    await userEvent.click(screen.getByRole("button", { name: /hablar/i }));
    expect(screen.getByRole("button", { name: /detener/i })).toBeInTheDocument();

    act(() => {
      FakeRecognition.last!.listeners.error.forEach((l) => l({ error: "not-allowed" }));
      FakeRecognition.last!.listeners.end?.forEach((l) => l());
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(/permiso para usar el micrófono/i);
    expect(screen.getByRole("button", { name: /hablar/i })).toBeInTheDocument();
  });
});
