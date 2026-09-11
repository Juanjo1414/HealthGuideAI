const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export class TriageApiError extends Error {
  constructor(message, status) {
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
export async function requestTriage(symptomsText) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms_text: symptomsText }),
    });
  } catch (networkError) {
    throw new TriageApiError(
      "No se pudo conectar con el servidor. Verifica tu conexion e intenta de nuevo.",
      0
    );
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
