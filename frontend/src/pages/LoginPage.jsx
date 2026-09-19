import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { AuthApiError } from "../api/authApi";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  async function handleSubmit(email, password) {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await login(email, password);
    } catch (error) {
      setErrorMessage(
        error instanceof AuthApiError ? error.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-mark auth-card__brand">
          <span className="brand-mark__symbol">+</span>
          <span>
            <strong>Healthguide</strong>
            <small>AI HEALTH SYSTEM</small>
          </span>
        </div>
        <h1 className="auth-card__title">Inicia sesión</h1>
        <p className="auth-card__subtitle">
          Ingresa con tu cuenta para acceder a la evaluación de síntomas.
        </p>
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
