import type { HistoryEntry, TriageResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export class TriageApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TriageApiError";
    this.status = status;
  }
}

/**
 * Unico punto de contacto con el backend. El resto del frontend no sabe
 * que existe fetch ni la forma de la URL — si el endpoint cambia, cambia
 * este archivo, no los componentes.
 */
export async function requestTriage(symptomsText: string): Promise<TriageResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 35000);
  try {
    response = await fetch(`${API_BASE_URL}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms_text: symptomsText }),
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new TriageApiError(
        "La evaluación tardó demasiado. No esperes esta respuesta si tus síntomas son urgentes.",
        0
      );
    }
    throw new TriageApiError(
      "No se pudo conectar con el servidor. Verifica tu conexion e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new TriageApiError(
      body?.detail || "Ocurrio un error al procesar tu consulta.",
      response.status
    );
  }

  return response.json();
}

/** Borra todo el historial del usuario autenticado (derecho al olvido). */
export async function deleteTriageHistory(): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/triage/history`, { method: "DELETE", credentials: "include" });
  } catch {
    throw new TriageApiError("No se pudo conectar con el servidor.", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new TriageApiError(body?.detail || "No se pudo borrar el historial.", response.status);
  }
}

/**
 * Historial del usuario autenticado — el backend ya filtra por user_id,
 * este cliente no manda ni necesita mandar ningun identificador de usuario.
 */
export async function getTriageHistory(): Promise<HistoryEntry[]> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${API_BASE_URL}/triage/history`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new TriageApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0);
    }
    throw new TriageApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new TriageApiError(
      body?.detail || "No se pudo cargar el historial.",
      response.status
    );
  }

  return response.json();
}
