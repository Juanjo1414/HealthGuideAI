import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors whitespace-nowrap ${
    isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
  }`;

/**
 * Header de Stitch (idéntico en las 10 pantallas). El pill de urgencias es
 * un tel: real y no depende de sesión ni de backend.
 */
export default function SiteHeader() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <div className="h-16 w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm flex-shrink-0">
          <Link className="flex items-center gap-2.5 group focus:outline-none" to="/">
            <img alt="HealthGuide AI" className="h-8 w-auto object-contain" src="/stitch/logo.jpg" />
            <div className="flex flex-col">
              <span className="font-headline-sm text-[18px] leading-tight text-primary font-bold tracking-tight">
                HealthGuide AI
              </span>
              <span className="font-label-sm text-[10px] text-secondary tracking-wider uppercase hidden sm:inline-block font-semibold">
                Orientación médica inteligente &amp; ética
              </span>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navegación principal">
          <NavLink className={navClass} to="/" end>
            Triaje Rápido
          </NavLink>
          <a className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap" href="/#como-funciona">
            Cómo Funciona
          </a>
          <NavLink className={navClass} to="/historial">
            Mi Historial
          </NavLink>
          <NavLink className={navClass} to="/perfil">
            Mi Perfil / Ajustes
          </NavLink>
          <a
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error hover:bg-error hover:text-on-error font-label-sm text-xs font-semibold transition-all shadow-sm"
            href="tel:112"
            title="Llamar a Urgencias"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse motion-reduce:animate-none" />
            <span className="tracking-tight font-bold">Urgencias 24/7: 112 / 911</span>
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            className="md:hidden inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-error font-label-sm text-xs font-bold"
            href="tel:112"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-error" />
            112 / 911
          </a>
          <div className="h-5 w-px bg-outline-variant/40 hidden md:block" />
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                className="hidden lg:inline-flex items-center justify-center px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-xs font-semibold rounded-full transition-colors max-w-[220px] truncate"
                to="/perfil"
              >
                {user?.email}
              </Link>
            ) : (
              <Link
                className="hidden lg:inline-flex items-center justify-center px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-xs font-semibold rounded-full transition-colors"
                to="/login"
              >
                Iniciar Sesión / Registrarse
              </Link>
            )}
            <Link
              aria-label={isAuthenticated ? "Mi perfil" : "Iniciar sesión"}
              className="relative flex items-center justify-center rounded-full ring-2 ring-primary-container/20 hover:ring-primary-container transition-all"
              to={isAuthenticated ? "/perfil" : "/login"}
            >
              <img alt="" className="w-8 h-8 rounded-full object-cover" src="/stitch/avatar-usuario.jpg" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Stitch no trae menú móvil (oculta el nav bajo md) — esto lo cubre con sus mismos tokens. */
export function MobileTabBar() {
  const item = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-4 py-1 font-label-sm text-label-sm ${
      isActive ? "text-primary" : "text-on-surface-variant"
    }`;
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-outline-variant/30 bg-white/95 backdrop-blur-md py-1.5"
      aria-label="Navegación móvil"
    >
      <NavLink to="/" end className={item}>
        <span aria-hidden="true" className="material-symbols-outlined">stethoscope</span>
        Triaje
      </NavLink>
      <NavLink to="/historial" className={item}>
        <span aria-hidden="true" className="material-symbols-outlined">history</span>
        Historial
      </NavLink>
      <NavLink to="/perfil" className={item}>
        <span aria-hidden="true" className="material-symbols-outlined">person</span>
        Perfil
      </NavLink>
    </nav>
  );
}
