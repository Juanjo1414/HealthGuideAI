import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, expectNoSeriousA11yViolations, mockTriage, signupViaUi, submitSymptoms, triageBody } from "./fixtures";

const PUBLIC_PAGES = ["/", "/login", "/signup", "/recuperar", "/terminos", "/protocolo", "/500", "/ruta-que-no-existe"];

test.describe("accesibilidad (axe) y responsive", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path}: sin violaciones critical/serious y sin scroll horizontal`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      await expectNoSeriousA11yViolations(page);
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const priority of ["MEDIA", "EMERGENCIA"] as const) {
    test(`resultado ${priority}: accesible y sin desbordes`, async ({ page }) => {
      await mockTriage(page, 200, triageBody(priority));
      await page.goto("/");
      await submitSymptoms(page, "Tengo tos seca y congestión desde hace dos días, sin fiebre ni otros síntomas.");
      await expect(page).toHaveURL(/\/resultado$/);

      await expectNoSeriousA11yViolations(page);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("historial y perfil (con sesión): accesibles y sin desbordes", async ({ page }) => {
    await signupViaUi(page);
    for (const path of ["/historial", "/perfil"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoSeriousA11yViolations(page);
      await expectNoHorizontalOverflow(page);
    }
  });
});
