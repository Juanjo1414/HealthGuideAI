import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guarda de ruta: redirige a /login si no hay sesion. Mientras se verifica
 * la sesion existente (status === "loading") no renderiza nada todavia,
 * para no mostrar el triage un instante y luego expulsar al usuario.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
