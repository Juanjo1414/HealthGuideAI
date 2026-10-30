import { expect, test } from "@playwright/test";
import { mockChat, sendFollowUp, submitSymptoms, triageBody, type Priority } from "./fixtures";

const LONG_TEXT = "Tengo tos seca y congestión desde hace dos días, sin fiebre ni otros síntomas.";
const ANONYMOUS_ENDPOINT = "**/api/v1/chat/anonymous/messages";

const EXPECTED: Record<Priority, RegExp> = {
  BAJA: /puedes monitorear tus síntomas en casa/i,
  MEDIA: /te recomendamos agendar una cita médica/i,
  ALTA: /busca atención médica en las próximas horas/i,
  EMERGENCIA: /señal de alarma detectada/i,
};

test.describe("triaje sin cuenta (chat anónimo)", () => {
  for (const priority of ["BAJA", "MEDIA", "ALTA"] as const) {
    test(`prioridad ${priority}: muestra la acción esperada en la misma pantalla, nunca un diagnóstico`, async ({ page }) => {
      await mockChat(page, 200, triageBody(priority));
      await page.goto("/");

      await submitSymptoms(page, LONG_TEXT);

      await expect(page).toHaveURL(/\/$/);
      // El chat contesta primero; la evaluación completa está plegada hasta abrirla.
      await expect(page.getByText(/por lo que me cuentas/i)).toBeVisible();
      await page.getByRole("button", { name: /ver evaluación completa/i }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED[priority]);
      await expect(page.getByText(/no calibrada clínicamente/i)).toContainText(/puede equivocarse/i);
    });
  }

  test("prioridad EMERGENCIA: alerta roja con teléfonos y la conversación queda marcada", async ({ page }) => {
    await mockChat(page, 200, triageBody("EMERGENCIA"));
    await page.goto("/");

    await submitSymptoms(page, "Tengo dolor opresivo en el pecho y me falta el aire desde hace 10 minutos.");

    await expect(page.getByRole("alert").first()).toContainText(EXPECTED.EMERGENCIA);
    await expect(page.getByRole("link", { name: /llamar 123/i }).first()).toHaveAttribute("href", "tel:123");
    await expect(page.getByText(/esta conversación fue marcada como emergencia/i)).toBeVisible();
  });

  test("seguimiento: el segundo mensaje manda el historial y el aviso de emergencia ya marcado", async ({ page }) => {
    const bodies: Array<Record<string, unknown>> = [];
    await page.route(ANONYMOUS_ENDPOINT, async (route) => {
      bodies.push(JSON.parse(route.request().postData() ?? "{}"));
      const priority = bodies.length === 1 ? "EMERGENCIA" : "BAJA";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(triageBody(priority)) });
    });
    await page.goto("/");

    await submitSymptoms(page, "Tengo dolor opresivo en el pecho y me falta el aire desde hace 10 minutos.");
    await expect(page.getByRole("alert").first()).toContainText(EXPECTED.EMERGENCIA);
    await sendFollowUp(page, "Ahora siento un poco de náuseas también.");

    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[0]).toMatchObject({ history: [], already_emergency: false });
    expect(bodies[1].content).toBe("Ahora siento un poco de náuseas también.");
    expect(bodies[1].already_emergency).toBe(true);
    expect(bodies[1].history).toHaveLength(2);
  });

  test("límite de solicitudes alcanzado (429): mensaje claro, sin salir de la pantalla", async ({ page }) => {
    await mockChat(page, 429, { detail: "Demasiados mensajes. Espera un momento.", error: { code: "rate_limited" } });
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByRole("alert")).toContainText(/demasiados mensajes/i);
    await expect(page).toHaveURL(/\/$/);
  });

  test("límite de turnos (409): pide iniciar una nueva evaluación", async ({ page }) => {
    await mockChat(page, 409, { detail: "Esta conversación llegó a su límite de mensajes.", error: { code: "conflict" } });
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByRole("alert")).toContainText(/límite de mensajes/i);
  });

  test("error del proveedor (502): aviso en línea, sin perder lo escrito", async ({ page }) => {
    await mockChat(page, 502, { detail: "El modelo no pudo procesar la solicitud.", error: { code: "bad_gateway" } });
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByRole("alert")).toContainText(/el modelo no pudo procesar la solicitud/i);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel(/describe tus síntomas/i)).toHaveValue(LONG_TEXT);
  });

  test("sin conexión con el backend: panel offline con líneas telefónicas", async ({ page }) => {
    await page.route(ANONYMOUS_ENDPOINT, (route) => route.abort("internetdisconnected"));
    await page.goto("/");

    await submitSymptoms(page, LONG_TEXT);

    await expect(page.getByText(/servidor inaccesible o sin conexión/i)).toBeVisible();
  });

  // Decisión del chat anónimo (routes_chat.py): el servidor no guarda nada,
  // pero el navegador sí conserva la conversación para poder seguirla tras
  // recargar. Esta prueba fija ese contrato: vive solo en este navegador.
  test("la conversación anónima se conserva en este navegador y no aparece en otro contexto", async ({ page, browser }) => {
    await mockChat(page, 200, triageBody("MEDIA"));
    await page.goto("/");
    await submitSymptoms(page, LONG_TEXT);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED.MEDIA);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED.MEDIA);

    const fresh = await (await browser.newContext()).newPage();
    await fresh.goto("/");
    await expect(fresh.getByLabel(/describe tus síntomas/i)).toBeVisible();
  });

  test("nueva evaluación: sale de la conversación y arranca limpia, sin heredar la emergencia", async ({ page }) => {
    const bodies: Array<Record<string, unknown>> = [];
    await page.route(ANONYMOUS_ENDPOINT, async (route) => {
      bodies.push(JSON.parse(route.request().postData() ?? "{}"));
      const priority = bodies.length === 1 ? "EMERGENCIA" : "BAJA";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(triageBody(priority)) });
    });
    await page.goto("/");
    await submitSymptoms(page, "Tengo dolor opresivo en el pecho y me falta el aire desde hace 10 minutos.");
    await expect(page.getByText(/esta conversación fue marcada como emergencia/i)).toBeVisible();

    // Sin cuenta la conversación solo vive en el navegador: pide confirmar antes de borrarla.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /nueva evaluación/i }).click();

    await expect(page.getByLabel(/describe tus síntomas/i)).toHaveValue("");
    await expect(page.getByRole("button", { name: /nueva evaluación/i })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("healthguide_anonymous_chat"))).toBeNull();

    await submitSymptoms(page, LONG_TEXT);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED.BAJA);
    expect(bodies[1]).toMatchObject({ history: [], already_emergency: false });
    await expect(page.getByText(/esta conversación fue marcada como emergencia/i)).toHaveCount(0);
  });

  test("nueva evaluación: si se cancela la confirmación, la conversación se conserva", async ({ page }) => {
    await mockChat(page, 200, triageBody("MEDIA"));
    await page.goto("/");
    await submitSymptoms(page, LONG_TEXT);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED.MEDIA);

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /nueva evaluación/i }).click();

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(EXPECTED.MEDIA);
  });
});
