import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ConversationListPage from "./pages/ConversationListPage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import ProtocolPage from "./pages/ProtocolPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Rutas (Sesión 10/11, diseño de Stitch — ver docs/DESIGN_STITCH.md).
 * Triaje es público: se puede consultar sin cuenta, y ahora el chat
 * multi-turno vive en la misma pantalla "/" (ver triage-conversational-chat).
 * Solo historial y perfil exigen sesión, porque para eso existe la cuenta.
 */
export default function App() {
  const location = useLocation();

  // Cada navegación arranca arriba, salvo los anclas (#como-funciona).
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/recuperar" element={<AuthPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/protocolo" element={<ProtocolPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <ConversationListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
