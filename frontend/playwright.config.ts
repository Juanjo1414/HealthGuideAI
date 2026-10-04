import { defineConfig, devices } from "@playwright/test";

/**
 * E2E (Sesión 12) contra el stack real levantado con docker compose:
 * frontend en :8080, backend en :8000, Postgres y Redis reales. Auth va
 * contra el backend de verdad; las respuestas de triage se simulan a nivel
 * de red en cada test (ver e2e/fixtures.ts) para probar las 4 prioridades,
 * el 429 y el 502 de forma determinista y sin gastar cuota de NVIDIA.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // En local, con un worker por núcleo (6 en el equipo de desarrollo) los tests
  // de cuenta y axe vencían sus timeouts de forma intermitente; con 3 pasan
  // estables y más rápido. CI conserva el valor por defecto de Playwright.
  workers: process.env.CI ? undefined : 3,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /desktop-only\.spec\.ts/ },
  ],
});
