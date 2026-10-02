import type { User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

interface AuthRequestOptions {
  method?: string;
  body?: Record<string, unknown>;
}

/**
 * Unico punto de contacto con el backend para auth. Mismo patron que
 * triageApi.ts (AbortController con timeout, clase de error propia), mas
 * `credentials: "include"` en cada llamada — sin eso el navegador no manda
 * ni guarda la cookie de sesion en requests cross-origin (frontend en
 * :5173/:8080, backend en :8000).
 */
async function authRequest<T>(path: string, { method = "POST", body }: AuthRequestOptions = {}): Promise<T | null> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === "AbortError") {
      throw new AuthApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0);
    }
    throw new AuthApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new AuthApiError(
      errorBody?.detail || "Ocurrió un error al procesar la solicitud.",
      response.status
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export function signup(email: string, password: string): Promise<User | null> {
  return authRequest<User>("/auth/signup", { body: { email, password } });
}

export function login(email: string, password: string): Promise<User | null> {
  return authRequest<User>("/auth/login", { body: { email, password } });
}

export function logout(): Promise<null> {
  return authRequest<null>("/auth/logout");
}

export function getCurrentUser(): Promise<User | null> {
  return authRequest<User>("/auth/me", { method: "GET" });
}
