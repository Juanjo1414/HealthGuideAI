import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConversationListPage from "./ConversationListPage";
import { renderAt } from "../test/utils";
import { ChatApiError, deleteConversation, listConversations } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";
import type { ConversationSummary } from "../api/types";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("../api/chatApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/chatApi")>()),
  listConversations: vi.fn(),
  deleteConversation: vi.fn(),
}));

function summary(overrides: Partial<ConversationSummary> = {}): ConversationSummary {
  return {
    id: crypto.randomUUID(),
    last_activity_at: new Date().toISOString(),
    message_count: 4,
    locked_emergency: false,
    preview: "Tengo fiebre desde ayer",
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: null } as unknown as ReturnType<typeof useAuth>);
  vi.mocked(listConversations).mockReset();
  vi.mocked(deleteConversation).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("ConversationListPage", () => {
  it("muestra el esqueleto accesible mientras carga", () => {
    vi.mocked(listConversations).mockReturnValue(new Promise(() => {}));
    renderAt(<ConversationListPage />);

    expect(screen.getByRole("status", { name: /cargando conversaciones/i })).toBeInTheDocument();
  });

  it("estado vacío claro, no una lista en blanco", async () => {
    vi.mocked(listConversations).mockResolvedValue([]);
    renderAt(<ConversationListPage />);

    expect(await screen.findByText(/todavía no tienes conversaciones/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar una conversación/i })).toHaveAttribute("href", "/");
  });

  it("cada conversación enlaza a la pantalla de inicio con su id, y marca las de emergencia", async () => {
    const urgent = summary({ locked_emergency: true, preview: "Dolor de pecho", message_count: 1 });
    const calm = summary({ preview: "Tos leve" });
    vi.mocked(listConversations).mockResolvedValue([urgent, calm]);
    renderAt(<ConversationListPage />);

    const urgentLink = await screen.findByRole("link", { name: /dolor de pecho/i });
    expect(urgentLink).toHaveAttribute("href", `/?conversationId=${urgent.id}`);
    expect(urgentLink).toHaveTextContent(/emergencia/i);
    expect(urgentLink).toHaveTextContent("1 mensaje");
    expect(screen.getByRole("link", { name: /tos leve/i })).toHaveTextContent("4 mensajes");
    expect(screen.getByRole("link", { name: /tos leve/i })).not.toHaveTextContent(/emergencia/i);
  });

  it("una conversación sin mensajes se muestra como tal", async () => {
    vi.mocked(listConversations).mockResolvedValue([summary({ preview: "", message_count: 0 })]);
    renderAt(<ConversationListPage />);

    expect(await screen.findByText(/conversación sin mensajes todavía/i)).toBeInTheDocument();
  });

  it("sin sesión (401) lo dice en una alerta en vez de redirigir sin explicación", async () => {
    vi.mocked(listConversations).mockRejectedValue(new ChatApiError("Inicia sesión para continuar.", 401));
    renderAt(<ConversationListPage />, { path: "/historial", route: "/historial" });

    expect(await screen.findByRole("alert")).toHaveTextContent(/inicia sesión/i);
    expect(screen.getByTestId("location")).toHaveTextContent("/historial");
  });

  it("otro error se informa con role=alert en vez de mostrar una lista vacía", async () => {
    vi.mocked(listConversations).mockRejectedValue(new ChatApiError("No se pudo conectar.", 0));
    renderAt(<ConversationListPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar.");
    expect(screen.queryByText(/todavía no tienes conversaciones/i)).not.toBeInTheDocument();
  });

  it("borrar pide confirmación y no borra si se cancela", async () => {
    vi.mocked(listConversations).mockResolvedValue([summary()]);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderAt(<ConversationListPage />);

    await userEvent.click(await screen.findByRole("button", { name: /borrar conversación/i }));

    expect(deleteConversation).not.toHaveBeenCalled();
    expect(screen.getByText("Tengo fiebre desde ayer")).toBeInTheDocument();
  });

  it("al confirmar, borra la conversación y la quita de la lista", async () => {
    const target = summary();
    vi.mocked(listConversations).mockResolvedValue([target, summary({ preview: "Otra consulta" })]);
    vi.mocked(deleteConversation).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderAt(<ConversationListPage />);

    await userEvent.click((await screen.findAllByRole("button", { name: /borrar conversación/i }))[0]);

    await waitFor(() => expect(screen.queryByText("Tengo fiebre desde ayer")).not.toBeInTheDocument());
    expect(deleteConversation).toHaveBeenCalledWith(target.id);
    expect(screen.getByText("Otra consulta")).toBeInTheDocument();
  });

  it("si el borrado falla, avisa en esa conversación y la deja en la lista", async () => {
    vi.mocked(listConversations).mockResolvedValue([summary()]);
    vi.mocked(deleteConversation).mockRejectedValue(new ChatApiError("No se pudo borrar la conversación.", 500));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderAt(<ConversationListPage />);

    await userEvent.click(await screen.findByRole("button", { name: /borrar conversación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo borrar la conversación.");
    expect(screen.getByText("Tengo fiebre desde ayer")).toBeInTheDocument();
  });

  it("si la sesión expira al borrar (401), lo avisa en esa conversación", async () => {
    vi.mocked(listConversations).mockResolvedValue([summary()]);
    vi.mocked(deleteConversation).mockRejectedValue(new ChatApiError("Inicia sesión para continuar.", 401));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderAt(<ConversationListPage />, { path: "/historial", route: "/historial" });

    await userEvent.click(await screen.findByRole("button", { name: /borrar conversación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/inicia sesión/i);
    expect(screen.getByTestId("location")).toHaveTextContent("/historial");
  });
});
