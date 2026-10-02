import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Redirige a /login si no hay sesión, recordando a dónde quería ir el
 * usuario para devolverlo ahí tras iniciar sesión. Mientras se verifica la
 * sesión existente no renderiza nada, para no mostrar la página y expulsar.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return null;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
