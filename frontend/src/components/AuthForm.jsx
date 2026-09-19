import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { IconLoader } from "./icons";

/**
 * Formulario compartido por LoginPage y SignupPage — misma estructura que
 * SymptomForm.jsx (useId para labels accesibles, useState local, no sabe
 * de fetch, delega a onSubmit). mode decide copy y validaciones minimas.
 */
export default function AuthForm({ mode, onSubmit, isLoading, errorMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailId = useId();
  const passwordId = useId();
  const isSignup = mode === "signup";

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || isLoading) return;
    onSubmit(trimmedEmail, password);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__field">
        <label htmlFor={emailId} className="symptom-form__label">
          Correo electrónico
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          className="symptom-form__textarea auth-form__input"
          placeholder="tu@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor={passwordId} className="symptom-form__label">
          Contraseña
        </label>
        <input
          id={passwordId}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="symptom-form__textarea auth-form__input"
          placeholder="••••••••"
          value={password}
          minLength={isSignup ? 6 : undefined}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      {errorMessage && (
        <div className="error-banner" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="symptom-form__footer">
        <p className="symptom-form__hint">
          {isSignup ? (
            <>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </>
          ) : (
            <>
              ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
            </>
          )}
        </p>
        <button
          type="submit"
          className="button button--primary"
          disabled={isLoading || !email.trim() || !password}
        >
          {isLoading ? (
            <>
              <IconLoader width={18} height={18} />
              {isSignup ? "Creando cuenta…" : "Ingresando…"}
            </>
          ) : isSignup ? (
            "Crear cuenta"
          ) : (
            "Ingresar"
          )}
        </button>
      </div>
    </form>
  );
}
