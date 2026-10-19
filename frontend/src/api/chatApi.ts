import type {
  AnonymousChatMessageResponse,
  AnonymousChatTurn,
  ChatMessageResponse,
  ConversationDetail,
  ConversationSummary,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// routes_chat solo se monta bajo /api/v1 (es un endpoint nuevo, ver
// backend/app/main.py) — a diferencia de triage/auth, no existe un alias
// sin version para el chat. Si API_BASE_URL ya trae su propio /v1 (porque
// el deployment lo configuro asi), esto terminaria en /v1/v1; eso es
// intencional de postergar hasta que el frontend migre por completo
// (ver nota de deprecacion en main.py).
const CHAT_BASE_URL = `${API_BASE_URL}/v1/chat`;

export class ChatApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

/**
 * Unico punto de contacto con el backend para el chat conversacional. El
 * resto del frontend no sabe que existe fetch ni la forma de la URL — si
 * el endpoint cambia, cambia este archivo, no los componentes.
 */

/** Crea una conversación nueva y vacía para el usuario autenticado. */
export async function createConversation(): Promise<ConversationDetail> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${CHAT_BASE_URL}/conversations`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new ChatApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0);
    }
    throw new ChatApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(
      body?.detail || "No se pudo crear la conversación.",
      response.status
    );
  }

  return response.json();
}

/** Lista las conversaciones del usuario autenticado, mas reciente primero. */
export async function listConversations(): Promise<ConversationSummary[]> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${CHAT_BASE_URL}/conversations`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new ChatApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0);
    }
    throw new ChatApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(
      body?.detail || "No se pudo cargar la lista de conversaciones.",
      response.status
    );
  }

  return response.json();
}

/** Obtiene una conversación con su historial completo en orden cronológico. */
export async function getConversation(id: string): Promise<ConversationDetail> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${CHAT_BASE_URL}/conversations/${encodeURIComponent(id)}`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new ChatApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0);
    }
    throw new ChatApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(
      body?.detail || "No se pudo cargar la conversación.",
      response.status
    );
  }

  return response.json();
}

/**
 * Envía un mensaje nuevo dentro de una conversación existente y devuelve
 * la respuesta del asistente. El backend persiste ambos mensajes antes de
 * responder (ver design.md, Property 2).
 */
export async function sendMessage(id: string, content: string): Promise<ChatMessageResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 35000);
  try {
    response = await fetch(`${CHAT_BASE_URL}/conversations/${encodeURIComponent(id)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new ChatApiError(
        "La respuesta tardó demasiado. No esperes esta respuesta si tus síntomas son urgentes.",
        0
      );
    }
    throw new ChatApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(
      body?.detail || "Ocurrio un error al enviar tu mensaje.",
      response.status
    );
  }

  return response.json();
}

/**
 * Envía un mensaje del flujo anónimo (sin sesión, sin persistencia en el
 * servidor). El cliente manda su propio historial acumulado en cada
 * llamada — a diferencia de sendMessage(), acá no hay conversation_id que
 * el backend pueda usar para recordar turnos anteriores.
 */
export async function sendAnonymousMessage(
  content: string,
  history: AnonymousChatTurn[],
  alreadyEmergency: boolean
): Promise<AnonymousChatMessageResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 35000);
  try {
    response = await fetch(`${CHAT_BASE_URL}/anonymous/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, history, already_emergency: alreadyEmergency }),
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new ChatApiError(
        "La respuesta tardó demasiado. No esperes esta respuesta si tus síntomas son urgentes.",
        0
      );
    }
    throw new ChatApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(
      body?.detail || "Ocurrio un error al enviar tu mensaje.",
      response.status
    );
  }

  return response.json();
}

/** Borra una conversación completa del usuario autenticado. */
export async function deleteConversation(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${CHAT_BASE_URL}/conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw new ChatApiError("No se pudo conectar con el servidor.", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatApiError(body?.detail || "No se pudo borrar la conversación.", response.status);
  }
}
