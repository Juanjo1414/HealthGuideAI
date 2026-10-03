import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "../components/layout/PageShell";
import GoogleIcon from "../components/GoogleIcon";
import { AuthApiError } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { saveAlias } from "../lib/preferences";

type Mode = "login" | "signup" | "recover";

const INPUT =
  "w-full h-[52px] pl-11 pr-4 bg-surface-container-lowest rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 shadow-[0_1px_3px_rgba(15,81,68,0.06)] ring-1 ring-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all disabled:opacity-60";

function modeFromPath(pathname: string): Mode {
  if (pathname.startsWith("/signup")) return "signup";
  if (pathname.startsWith("/recuperar")) return "recover";
  return "login";
}

function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  // Todos ≥ 4.5:1 sobre blanco (el naranja de Stitch daba 2.02:1).
  const colors = ["text-on-surface-variant", "text-error", "text-tertiary-container", "text-secondary", "text-secondary"];
  return { score, label: labels[score], color: colors[score] };
}

function comingSoon(feature: string) {
  toast.info(`${feature} llega en una próxima versión. Por ahora, usa correo y contraseña.`);
}

export default function AuthPage() {
  const location = useLocation();
  const mode = modeFromPath(location.pathname);
  const { login, signup, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptAi, setAcceptAi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  if (isAuthenticated && mode !== "recover") {
    const from = (location.state as { from?: string } | null)?.from || "/";
    return <Navigate to={from} replace />;
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || isLoading) return;
    if (mode === "signup" && (!acceptTerms || !acceptAi)) {
      setErrorMessage("Debes aceptar ambos consentimientos para crear tu cuenta.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (mode === "signup") {
        await signup(trimmedEmail, password);
        if (alias.trim()) saveAlias(alias.trim());
      } else {
        await login(trimmedEmail, password);
      }
    } catch (error) {
      setErrorMessage(error instanceof AuthApiError ? error.message : "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  const strength = passwordStrength(password);

  return (
    <PageShell>
      <div className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg lg:py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-desktop items-start">
          <section className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-xs self-start px-space-md py-1 bg-surface-container-high rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">Portal Seguro</span>
              </div>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold">
                Tu Salud, Tus Datos, Bajo Tu Control
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Accede a tu historial de evaluaciones de triaje y a tu seguimiento. Recuerda: puedes consultar sin cuenta;
                la cuenta solo sirve para guardar tus consultas.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_24px_-4px_rgba(15,81,68,0.06),0_1px_8px_-1px_rgba(15,81,68,0.03)] p-space-md sm:p-space-lg flex flex-col gap-space-lg">
              <nav className="flex p-1.5 bg-surface-container-low rounded-xl gap-1" aria-label="Tipo de acceso">
                <TabLink to="/login" active={mode === "login"} icon="login" label="Iniciar Sesión" />
                <TabLink to="/signup" active={mode === "signup"} icon="person_add" label="Crear Cuenta" />
                <TabLink to="/recuperar" active={mode === "recover"} icon="key" label="Recuperar" />
              </nav>

              {mode !== "recover" && (
                <div className="flex flex-col gap-space-md">
                  {mode === "login" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                        <button
                          className="w-full h-[50px] px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-sm transition-all active:scale-[0.98]"
                          type="button"
                          onClick={() => comingSoon("El acceso con Google")}
                        >
                          <GoogleIcon />
                          <span>Acceder con Google</span>
                        </button>
                        <button
                          className="w-full h-[50px] px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-space-sm transition-all active:scale-[0.98]"
                          type="button"
                          onClick={() => comingSoon("El acceso con enlace mágico")}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-secondary">auto_fix_high</span>
                          <span>Magic Link sin clave</span>
                        </button>
                      </div>
                      <div className="relative flex items-center justify-center my-space-xs">
                        <div className="w-full h-px bg-surface-variant" />
                        <span className="absolute px-space-sm bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant uppercase">o con credenciales</span>
                      </div>
                    </>
                  )}

                  {mode === "signup" && (
                    <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center gap-space-sm text-on-surface-variant">
                      <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0">shield_person</span>
                      <p className="font-body-sm text-body-sm">
                        No requerimos tu nombre real. El alias es opcional y solo se guarda en este navegador.
                      </p>
                    </div>
                  )}

                  <form className="flex flex-col gap-space-md" onSubmit={handleAuth} noValidate={false}>
                    {mode === "signup" && (
                      <Field id="reg-name" label="Alias (opcional)" icon="badge">
                        <input
                          className={INPUT}
                          id="reg-name"
                          placeholder="Ej. Alex M. o Paciente-884"
                          type="text"
                          maxLength={40}
                          value={alias}
                          onChange={(event) => setAlias(event.target.value)}
                          disabled={isLoading}
                        />
                      </Field>
                    )}

                    <Field
                      id="auth-email"
                      label={mode === "signup" ? "Correo Electrónico de Contacto" : "Correo Electrónico"}
                      icon={mode === "signup" ? "mail" : "alternate_email"}
                      aside={mode === "login" ? <span className="text-secondary font-label-sm text-label-sm">Privado &amp; protegido</span> : null}
                    >
                      <input
                        className={INPUT}
                        id="auth-email"
                        placeholder="tu.salud@ejemplo.com"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isLoading}
                      />
                    </Field>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface" htmlFor="auth-pass">
                          {mode === "signup" ? "Contraseña Segura" : "Contraseña"}
                        </label>
                        {mode === "login" && (
                          <Link className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" to="/recuperar">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">
                          {mode === "signup" ? "lock_clock" : "lock"}
                        </span>
                        <input
                          className={`${INPUT} pr-12`}
                          id="auth-pass"
                          placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "••••••••••••"}
                          required
                          minLength={mode === "signup" ? 6 : undefined}
                          type={showPassword ? "text" : "password"}
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          aria-describedby={mode === "signup" ? "strength-label" : undefined}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          className="absolute right-3.5 text-on-surface-variant hover:text-primary transition-colors p-1"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {mode === "signup" && (
                        <div className="flex flex-col gap-1 pt-1">
                          <div className="flex items-center justify-between font-label-sm text-label-sm">
                            <span className="text-on-surface-variant">Fortaleza de la contraseña:</span>
                            <span className={`font-bold ${strength.color}`} id="strength-label" aria-live="polite">
                              {strength.label}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden flex gap-0.5" aria-hidden="true">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={`h-full w-1/4 transition-colors duration-300 ${
                                  strength.score >= bar ? (strength.score <= 1 ? "bg-error" : strength.score === 2 ? "bg-on-tertiary-container" : "bg-secondary") : "bg-surface-variant"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {mode === "signup" && (
                      <div className="flex flex-col gap-space-sm pt-space-xs">
                        <label className="flex items-start gap-space-sm cursor-pointer select-none">
                          <input
                            className="mt-1 w-4 h-4 rounded accent-primary-container flex-shrink-0"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(event) => setAcceptTerms(event.target.checked)}
                          />
                          <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                            Acepto los{" "}
                            <Link className="text-on-surface font-semibold underline-offset-2 hover:underline" to="/terminos">
                              Términos y la política de privacidad
                            </Link>{" "}
                            y autorizo que mis consultas se guarden en mi historial privado.
                          </span>
                        </label>
                        <label className="flex items-start gap-space-sm cursor-pointer select-none">
                          <input
                            className="mt-1 w-4 h-4 rounded accent-primary-container flex-shrink-0"
                            type="checkbox"
                            checked={acceptAi}
                            onChange={(event) => setAcceptAi(event.target.checked)}
                          />
                          <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                            Entiendo que esta herramienta usa <strong className="text-on-surface font-semibold">inteligencia artificial</strong> de
                            carácter orientativo, puede equivocarse y no sustituye una consulta médica ni la atención de urgencias.
                          </span>
                        </label>
                      </div>
                    )}

                    {errorMessage && (
                      <div role="alert" className="p-space-sm rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-space-xs">
                        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">error</span>
                        {errorMessage}
                      </div>
                    )}

                    <button
                      className={`w-full h-[52px] rounded-xl text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-all active:scale-[0.99] mt-space-xs disabled:opacity-50 disabled:pointer-events-none ${
                        mode === "signup"
                          ? "bg-secondary hover:bg-primary shadow-[0_4px_16px_rgba(0,108,73,0.2)]"
                          : "bg-primary-container hover:bg-primary shadow-[0_4px_16px_rgba(15,81,68,0.2)]"
                      }`}
                      type="submit"
                      disabled={isLoading || !email.trim() || !password}
                    >
                      {isLoading ? (
                        <>
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                          {mode === "signup" ? "Creando cuenta…" : "Ingresando…"}
                        </>
                      ) : mode === "signup" ? (
                        <>
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">lock</span>
                          <span>Crear Cuenta Segura</span>
                        </>
                      ) : (
                        <>
                          <span>Acceder a mi Historial</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {mode === "recover" && (
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-start gap-space-md p-space-md bg-surface-container-high/60 rounded-xl">
                    <span aria-hidden="true" className="material-symbols-outlined text-tertiary-container text-[28px] flex-shrink-0">mark_email_read</span>
                    <div className="flex flex-col">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Restablecer contraseña</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Ingresa tu correo y te enviaremos un enlace de recuperación seguro.
                      </p>
                    </div>
                  </div>
                  {recoverySent ? (
                    <div role="status" className="p-space-md bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-start gap-space-sm">
                      <span aria-hidden="true" className="material-symbols-outlined text-[24px]">construction</span>
                      <p className="font-body-sm text-body-sm">
                        La recuperación por correo todavía no está disponible en esta versión — no se envió ningún mensaje. Si
                        perdiste el acceso, crea una cuenta nueva o contacta al equipo.
                      </p>
                    </div>
                  ) : (
                    <form
                      className="flex flex-col gap-space-md"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setRecoverySent(true);
                      }}
                    >
                      <Field id="recovery-email" label="Correo asociado a tu cuenta" icon="alternate_email">
                        <input
                          className={INPUT}
                          id="recovery-email"
                          placeholder="nombre@correo.com"
                          required
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </Field>
                      <button
                        className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-[0_4px_16px_rgba(15,81,68,0.2)] transition-all active:scale-[0.99]"
                        type="submit"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">outgoing_mail</span>
                        <span>Enviar enlace de recuperación</span>
                      </button>
                    </form>
                  )}
                  <div className="text-center pt-space-xs">
                    <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors inline-flex items-center gap-1" to="/login">
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Volver al formulario de inicio</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-primary-container text-on-primary rounded-2xl p-space-md sm:p-space-lg shadow-[0_12px_32px_-4px_rgba(15,81,68,0.18)] flex flex-col gap-space-lg relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary-fixed/10 pointer-events-none blur-2xl" />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-surface-container/5 pointer-events-none blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-secondary-fixed text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold tracking-tight">Compromiso Ético</h3>
                    <p className="font-label-sm text-label-sm text-on-primary-container">Reglas que no se negocian</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">Siempre activas</span>
              </div>

              <div className="bg-primary/40 p-space-md rounded-xl backdrop-blur-sm relative z-10 flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-primary">Flujo de seguridad en cada consulta</span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed">Doble control</span>
                </div>
                <div className="w-full py-1">
                  <svg className="w-full h-16 text-on-primary-container" fill="none" viewBox="0 0 340 50" aria-hidden="true">
                    <circle cx="30" cy="25" fill="currentColor" fillOpacity="0.2" r="16" />
                    <text fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="9" fontWeight="600" textAnchor="middle" x="30" y="28">Tu texto</text>
                    <path d="M50 25H90" stroke="currentColor" strokeDasharray="3 3" />
                    <circle cx="70" cy="25" fill="#6CF8BB" r="4" />
                    <rect fill="#006C49" height="30" rx="6" width="70" x="94" y="10" />
                    <text fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="9" fontWeight="600" textAnchor="middle" x="129" y="28">Reglas de alarma</text>
                    <path d="M168 25H210" stroke="currentColor" />
                    <rect fill="currentColor" fillOpacity="0.2" height="30" rx="6" width="100" x="214" y="10" />
                    <text fill="#B1EFDD" fontFamily="Plus Jakarta Sans" fontSize="9" fontWeight="600" textAnchor="middle" x="264" y="28">IA + validador</text>
                  </svg>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                  Reglas deterministas revisan tu descripción antes del modelo, y un validador revisa la respuesta: nunca
                  diagnostica, nunca receta, y ante una señal de alarma escala a emergencia.
                </p>
              </div>

              <div className="flex flex-col gap-space-sm relative z-10">
                {[
                  ["lock", "Contraseñas resguardadas con bcrypt", "Nunca guardamos tu contraseña en texto plano; tu sesión viaja en una cookie que el navegador no expone a scripts."],
                  ["incognito", "Consulta sin cuenta", "Puedes evaluar tus síntomas sin registrarte. Sin cuenta, no guardamos el texto de tu consulta."],
                  ["policy", "Derecho al olvido en 1 clic", "Desde tu perfil puedes borrar todo tu historial de consultas de forma definitiva."],
                ].map(([icon, title, body]) => (
                  <div key={title} className="flex items-start gap-space-sm p-space-sm bg-on-primary/5 rounded-xl hover:bg-on-primary/10 transition-colors">
                    <span aria-hidden="true" className="material-symbols-outlined text-secondary-fixed text-[22px] flex-shrink-0 mt-0.5">{icon}</span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg font-bold">{title}</span>
                      <span className="font-body-sm text-body-sm text-primary-fixed-dim">{body}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 pt-space-xs border-t border-on-primary/10 flex items-center gap-space-sm">
                <img className="w-10 h-10 rounded-full object-contain bg-surface-container-lowest flex-shrink-0" alt="" src="/stitch/logo.jpg" />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-primary">Equipo HealthGuide AI</span>
                  <span className="font-label-sm text-label-sm text-on-primary-container">Proyecto académico · Makers Fellowship</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_2px_12px_rgba(15,81,68,0.04)] flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">crisis_alert</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-on-surface">¿Emergencia en curso?</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">No necesitas iniciar sesión para llamar.</span>
                </div>
              </div>
              <a className="px-space-md py-space-xs bg-error text-on-error rounded-full font-label-md text-label-md font-bold hover:opacity-90 transition-opacity flex-shrink-0" href="tel:112">
                Llamar 112
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-space-xl pt-space-lg flex flex-wrap items-center justify-center gap-space-lg opacity-80">
          {[
            ["cookie", "Cookies HttpOnly"],
            ["key", "Hash bcrypt"],
            ["fact_check", "Validador de seguridad"],
            ["block", "Sin venta de datos"],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px]">{icon}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function TabLink({ to, active, icon, label }: { to: string; active: boolean; icon: string; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex-1 py-space-xs px-space-sm rounded-lg font-label-md text-label-md text-center transition-all flex items-center justify-center gap-1.5 ${
        active ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
      }`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function Field({ id, label, icon, aside, children }: { id: string; label: string; icon: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor={id}>
        <span>{label}</span>
        {aside}
      </label>
      <div className="relative flex items-center">
        <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">{icon}</span>
        {children}
      </div>
    </div>
  );
}
