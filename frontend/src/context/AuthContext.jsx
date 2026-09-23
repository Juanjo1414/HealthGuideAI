import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

/**
 * Estado global de sesion. El proyecto no tenia ningun state manager (solo
 * useState local por componente) — esto es lo minimo necesario para que
 * el usuario autenticado sea visible desde cualquier parte del arbol
 * (navbar, ProtectedRoute) sin pasarlo por props manualmente.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" mientras se verifica si ya hay una sesion valida (cookie
  // existente de una visita anterior) antes de decidir a donde navegar.
  const [status, setStatus] = useState("loading"); // loading | ready

  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setStatus("ready"));
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await authApi.signup(email, password);
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  const value = { user, status, isAuthenticated: Boolean(user), signup, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
}
