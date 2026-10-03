import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export type Priority = "BAJA" | "MEDIA" | "ALTA" | "EMERGENCIA";

export function triageBody(prioridad: Priority, overrides: Record<string, unknown> = {}) {
  const emergency = prioridad === "EMERGENCIA";
  return {
    resumen: emergency ? "Dolor opresivo en el pecho con falta de aire." : "Molestia descrita por el usuario.",
    sintomas_detectados: emergency ? ["dolor en el pecho", "falta de aire"] : ["tos"],
    prioridad,
    posibles_causas: ["causa general"],
    alertas: emergency ? ["dolor en el pecho"] : [],
    recomendacion: "Mantente hidratado. Consulta a un profesional de la salud si empeora.",
    requiere_revision: emergency || prioridad === "ALTA",
    confianza: 0.6,
    validation: { passed: true, checks: {}, reasons: [] },
    requires_human_review: emergency || prioridad === "ALTA",
    request_id: crypto.randomUUID(),
    ...overrides,
  };
}

/** Simula la respuesta de POST /triage (el resto del backend sigue siendo real). */
export async function mockTriage(page: Page, status: number, body: unknown) {
  await page.route("**/api/triage", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) })
      : route.fallback()
  );
}

export async function submitSymptoms(page: Page, text: string) {
  await page.getByLabel(/describe tus síntomas/i).fill(text);
  await page.getByRole("button", { name: /iniciar evaluación de síntomas/i }).click();
}

export function uniqueEmail() {
  return `e2e.${crypto.randomUUID()}@example.com`;
}

export async function signupViaUi(page: Page, email = uniqueEmail(), password = "claveSegura123") {
  await page.goto("/signup");
  await page.getByLabel(/correo electrónico de contacto/i).fill(email);
  await page.getByLabel(/contraseña segura/i).fill(password);
  await page.getByRole("checkbox", { name: /acepto los términos/i }).check();
  await page.getByRole("checkbox", { name: /inteligencia artificial/i }).check();
  await page.getByRole("button", { name: /crear cuenta segura/i }).click();
  // El hash de la contraseña es caro a propósito; con varios workers en
  // paralelo el registro puede pasar de los 5 s por defecto.
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  return { email, password };
}

/** Mismo backend al que habla el bundle del stack de compose (VITE_API_BASE_URL). */
const API_URL = process.env.E2E_API_URL ?? "http://localhost:8000/api";

/**
 * Crea la cuenta por API para los tests que necesitan sesión pero no prueban
 * el registro: por la UI, con varios workers, el hash de la contraseña volvía
 * intermitentes los timeouts. La cookie queda en el contexto del navegador.
 */
export async function signupViaApi(page: Page, email = uniqueEmail(), password = "claveSegura123") {
  const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:8080";
  const response = await page.request.post(`${API_URL}/auth/signup`, {
    data: { email, password },
    headers: { Origin: baseURL },
  });
  expect(response.status(), await response.text()).toBe(201);
  await page.goto("/");
  // La app recupera la sesión con /auth/me al arrancar; sin esperar, un test
  // que borra cookies justo después corre contra un estado a medio cargar.
  // (en móvil el aviso existe pero va oculto, por eso toBeAttached).
  await expect(page.getByText(/sesión iniciada/i)).toBeAttached();
  return { email, password };
}

/** CONSTRAINTS.md: cero violaciones critical/serious de axe. */
export async function expectNoSeriousA11yViolations(page: Page) {
  // Las animaciones de entrada pueden dejar contraste intermedio: se espera
  // a que la fuente de íconos y el layout estén estables antes de auditar.
  await page.evaluate(() => document.fonts.ready);
  // Auditar la página ya cargada, no el skeleton (lo que el usuario usa de verdad).
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(
    serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")})`)
  ).toEqual([]);
}

/** Responsive: nada se sale del ancho de la pantalla. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
