import { expect, test } from "@playwright/test";
import { mockTriage, submitSymptoms, triageBody, type Priority } from "./fixtures";

const LONG_TEXT = "Tengo tos seca y congestión desde hace dos días, sin fiebre ni otros síntomas.";

const EXPECTED: Record<Priority, RegExp> = {
  BAJA: /puedes monitorear tus síntomas en casa/i,
  MEDIA: /te recomendamos agendar una cita médica/i,
  ALTA: /busca atención médica en las próximas horas/i,
  EMERGENCIA: /señal de alarma detectada/i,
};

test.describe("triaje sin cuenta", () => {
  for (const priority of ["BAJA", "MEDIA", "ALTA"] as const) {
    test(`prioridad ${priority}: muestra la acción esperada, nunca un diagnóstico`, async ({ page }) => {
      await mockTriage(page, 200, triageBody(priority));
      await page.goto("/");

      await submitSymptoms(page, LONG_TEXT);

      await expect(page).toHaveURL(/\/resultado$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED[priority]);
      await expect(page.getByText(/no calibrada clínicamente/i)).toContainText(/puede equivocarse/i);
      await expect(page.getByText(/esta consulta anónima no se guardó/i)).toBeVisible();
    });
  }

  test("prioridad EMERGENCIA: alerta roja con teléfonos", async ({ page }) => {
    await mockTriage(page, 200, triageBody("EMERGENCIA"));
    await page.goto("/");

    await submitSymptoms(page, "Tengo dolor opresivo en el pecho y me falta el aire desde hace 10 minutos.");

    await expect(page.getByRole("alert").first()).toContainText(EXPECTED.EMERGENCIA);
    await expect(page.getByRole("link", { name: /llamar 123/i })).toHaveAttribute("href", "tel:123");
  });

  test("texto vago: pide más datos y reevalúa con el detalle agregado", async ({ page }) => {
    let lastBody = "";
    await page.route("**/api/triage", async (route) => {
      lastBody = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(triageBody("BAJA")) });
    });
    await page.goto("/");

    await submitSymptoms(page, "me siento raro");
    await expect(page.getByText(/necesitamos más datos/i)).toBeVisible();
    await page.getByLabel(/agrega detalles/i).fill("dolor abdominal desde hace 4 horas");
    await page.getByRole("button", { name: /reevaluar triaje/i }).click();

    await expect.poll(() => JSON.parse(lastBody || "{}").symptoms_text).toBe("me siento raro dolor abdominal desde hace 4 horas");
  });

  test("límite de solicitudes alcanzado (429): mensaje claro, sin salir de la pantalla", async ({ page }) => {
    await mockTriage(page, 429, { detail: "Demasiadas solicitudes. Espera un momento.", error: { code: "rate_limited" } });
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByRole("alert")).toContainText(/demasiadas solicitudes/i);
    await expect(page).toHaveURL(/\/$/);
  });

  test("error del proveedor (502): pantalla de contingencia con protocolo de urgencias", async ({ page }) => {
    await mockTriage(page, 502, { detail: "El modelo no pudo procesar la solicitud.", error: { code: "bad_gateway" } });
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page).toHaveURL(/\/500$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/interrupción temporal/i);
    await expect(page.getByText(/no esperes a que el sistema se restablezca/i)).toBeVisible();
  });

  test("sin conexión con el backend: panel offline con líneas telefónicas", async ({ page }) => {
    await page.route("**/api/triage", (route) => route.abort("internetdisconnected"));
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByText(/servidor inaccesible o sin conexión/i)).toBeVisible();
  });

  test("el resultado no queda en el almacenamiento del navegador", async ({ page, browser }) => {
    await mockTriage(page, 200, triageBody("MEDIA"));
    await page.goto("/");
    await submitSymptoms(page, LONG_TEXT);
    await expect(page).toHaveURL(/\/resultado$/);

    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
    expect(stored).not.toContain("Molestia descrita");

    // Acceso directo desde otra pestaña / dispositivo: no hay resultado que mostrar.
    const fresh = await (await browser.newContext()).newPage();
    await fresh.goto("/resultado");
    await expect(fresh).toHaveURL(/\/$/);
  });
});
