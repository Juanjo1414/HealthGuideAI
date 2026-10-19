import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { renderAt, triageResponse } from "../test/utils";
import { sendAnonymousMessage, sendMessage, createConversation, ChatApiError } from "../api/chatApi";
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
    expect(await screen.findByText(/dolor de garganta con fiebre leve desde ayer/i)).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    // El formulario inicial se oculta una vez que hay una conversación en curso.
    expect(screen.queryByLabelText(/describe tus síntomas/i)).not.toBeInTheDocument();
    // El composer de chat queda disponible para continuar la conversación.
    expect(screen.getByRole("button", { name: /^enviar$/i })).toBeInTheDocument();
  });

  it("continuar la conversación manda el historial acumulado al endpoint anónimo", async () => {
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ resumen: "Primer resumen." }));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));
    await screen.findByText("Primer resumen.");

    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ resumen: "Segundo resumen." }));
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
    mockedSendAnonymous.mockResolvedValueOnce(anonymousResult({ resumen: "Primer resumen." }));
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
      ...triageResponse({ resumen: "Resumen autenticado." }),
      conversation_id: "conv-1",
      message_id: "msg-1",
    });
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await screen.findByText("Resumen autenticado.");
    expect(mockedCreateConversation).toHaveBeenCalledTimes(1);

    mockedSendMessage.mockResolvedValueOnce({
      ...triageResponse({ resumen: "Segundo resumen autenticado." }),
      conversation_id: "conv-1",
      message_id: "msg-2",
    });
    await userEvent.type(screen.getByLabelText(/escribe tu mensaje/i), "Sigo con dolor");
    await userEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() => expect(mockedSendMessage).toHaveBeenLastCalledWith("conv-1", "Sigo con dolor"));
    expect(mockedCreateConversation).toHaveBeenCalledTimes(1);
  });
});
