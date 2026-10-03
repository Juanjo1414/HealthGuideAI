/**
 * /health y /ready viven en la raíz del backend, sin prefijo /api (ver
 * backend/app/api/routes_health.py) — por eso este cliente deriva su propia
 * base URL en vez de reutilizar API_BASE_URL de triageApi.ts/authApi.ts.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export interface ReadyStatus {
  status: "ok" | "not_ready";
  checks: {
    nvidia_configured: boolean;
    postgres: boolean;
    redis: boolean;
  };
}

/**
 * Nunca lanza: una falla de red acá no debe tumbar el dashboard de triage,
 * solo reflejarse como "no verificado" en las stat cards.
 */
export async function checkReady(): Promise<ReadyStatus | null> {
  try {
    const response = await fetch(`${ROOT_URL}/ready`, { credentials: "include" });
    return (await response.json()) as ReadyStatus;
  } catch {
    return null;
  }
}
